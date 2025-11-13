const { Unit } = require('../lib/units.js');
const { MessageFlags } = require('discord.js');
const unit = new Unit();

const PROPOSALS_REPO = 'godotengine/godot-proposals';
const ISSUES_REPO = 'godotengine/godot';

const MAX_PAGES = 2; // 2 in original Python
const MAX_ISSUES = 100; // 100 in original Python

const specialCategoryNames = {
    'gui': 'GUI',
    '3d': '3D',
    '2d': '2D',
    'vfx': 'VFX',
    'gdscript': 'GDScript',
    'dotnet': '.NET',
    'visualscript': 'VisualScript',
    'xr': 'XR',
    'gdextension': 'GDExtension',
    'thirdparty': 'Third-Party'
};

const typeAndStatus = {
    'merged_pr': ':purple_circle: [M][PR]',
    'closed_pr': ':red_circle: [C][PR]',
    'completed_issue': ':purple_circle: [C]',
    'not_planned_issue': ':red_circle: [N]',
    'reopened_issue': ':green_circle: [R]',
    'duplicate_issue': ':black_circle: [D]'
};

// TODO: Use previous day (check for new stuff etc)
// TODO: Add a way to get GitHub token from config file

function createHeader() {
    // TODO: Count the days
    let header = `**Day XXX** :gdcute: \n`;
    header += 'Waiting for **Godot 4.x dev/beta/rc/stable**\n\n';
    return header;
}

function createFooter() {
    let footer = 'For daily merged pull requests, visit [Github Pulse](<https://github.com/godotengine/godot/pulse/daily>).\n';
    footer += 'Based on [source code by Qubrick](<https://github.com/Qubrick/WaitingReport>).\n';
    footer += '\nSincerely, the Godot Bot.';
    return footer;
}

async function getIssuesReport(milestone, repo, type, title, timefilter, state, stateReason = null, event = null) {
    let countIssues = 0;
    const items = {};

    let issuesCollected = new Set();

    for (let i = 0; i < MAX_PAGES + 1; i++) {
        // TODO: add time filter

        const url = new URL(`https://api.github.com/search/issues`);
        url.search = new URLSearchParams({
            q: `repo:${repo} is:${type} milestone:${milestone} state:${state} ${timefilter}:>=${'2025-11-13T01:00:00Z'}`,
            per_page: MAX_ISSUES.toString(),
            page: i.toString(),
            sort: 'updated'
        }).toString();

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });
        const data = await response.json();
        if (!('total_count' in data) || data.total_count <= 0) {
            break; // If it stops here, then there shouldn't be more pages???
        }

        for (const s of data.items) {
            const reason = s.state_reason;
            let foundEvent = true;

            // TODO: Check if event existed after last time
            if ((!stateReason || s.state_reason == stateReason) && foundEvent) {
                let type_status = '';

                if ('pull_request' in s && !reason) {
                    if (s.pull_request.merged_at) {
                        type_status = 'merged_pr';
                    } else {
                        type_status = 'closed_pr';
                    }
                } else {
                    if (reason == 'completed') {
                        type_status = 'completed_issue';
                    } else if (reason == 'not_planned') {
                        type_status = 'not_planned_issue';
                    } else if (reason == 'reopened') {
                        type_status = 'reopened_issue';
                    } else if (reason == 'duplicate') {
                        type_status = 'duplicate_issue';
                    }
                }

                // Prevent double-display of issues
                if (issuesCollected.has(s.number)) {
                    continue;
                }
                issuesCollected.add(s.number);

                let approved = false;
                let t = '';

                for (const l of s.labels) {
                    if (!approved) {
                        if (l.name.includes('topic:') || l.name.includes('documentation')) {
                            t = l.name.replace('topic:', '');
                            approved = true;
                        } else {
                            t = l.name;
                        }
                    }
                }

                const issueItem = {
                    type_status: type_status,
                    number: s.number,
                    url: s.html_url,
                    title: s.title
                };

                if (!items.hasOwnProperty(t)) {
                    items[t] = [];
                }
                items[t].push(issueItem);
                countIssues += 1;
            }
        }
    }

    if (countIssues <= 0) {
        return {};
    }

    return items;
}
async function getAllIssuesReport(milestone, repo, title, timefilter, state, stateReason = null, event = null) {
    let pullRequests = await getIssuesReport(milestone, repo, 'pull-request', `${state} Pull Request`, timefilter, state, stateReason, event);
    let issues = await getIssuesReport(milestone, repo, 'issue', title, timefilter, state, stateReason, event);

    return {pullRequests: pullRequests, issues: issues};
}

async function getMilestonesReport(repo, header, title, filter = '^4\.') {
    const response = await fetch(`https://api.github.com/repos/${repo}/milestones`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TOKEN}`
        }
    });
    const data = await response.json();
    const collection = {};
    for (const item of data) {
        if (item.title.search(filter) < 0) {
            continue;
        }
        // TODO: add check for new

        let num_open_issues = item.open_issues;
        let num_closed_issues = item.closed_issues;
        let complete_percent = 0.0;

        console.log(`${header} ${item.title} - ${num_open_issues} open / ${num_closed_issues} closed`);

        if (num_open_issues == 0 && num_closed_issues == 0) {
            complete_percent = 0.0;
        } else {
            complete_percent = Math.floor(100.0 - ((num_open_issues * 100.0) / (num_open_issues + num_closed_issues)));
        }

        collection[item.title] = {
            reopened: await getAllIssuesReport(item.title, repo, `Reopened ${title}`, 'updated', 'open', 'reopened', 'reopened'),
            closed: await getAllIssuesReport(item.title, repo, `Closed ${title}`, 'closed', 'closed')
        };
    }

    return collection;
}

function prettifyReportResults(report) {
    let output = '';
    for (let version in report) {
        for (let status of ['reopened', 'closed']) {
            for (let itemType of ['pullRequests', 'issues']) {
                if (Object.keys(report[version][status][itemType]).length <= 0) {
                    continue;
                }
                output += `## ${version} ${status} ${itemType == 'pullRequests' ? 'PRs' : itemType}\n`;
                for (let category in report[version][status][itemType]) {
                    output += `### ${category in specialCategoryNames ? specialCategoryNames[category] : (category.charAt(0).toUpperCase() + category.slice(1))}\n`;
                    for (let item of report[version][status][itemType][category]) {
                        output += `${typeAndStatus[item.type_status]} [#${item.number}](<${item.url}>): ${item.title}\n`;
                    }
                }
            }
        }
    }

    return output;
}

function breakStringIntoChunks(bigString) {
    let lines = [];
    let currentString = '';
    let splitString = bigString.split('\n');
    for (let line of splitString) {
        let possibleNewString = currentString + '\n' + line;
        if (possibleNewString.length < 2000) {
            currentString = possibleNewString;
        } else {
            lines.push(currentString);
            currentString = line;
        }
    }

    if (currentString.length > 0) {
        lines.push(currentString);
    }

    return lines;
}
async function createReport() {
    let output = createHeader();

    // Proposals
    let proposals = await getMilestonesReport(PROPOSALS_REPO, 'Proposals', 'Proposal');
    let proposalsText = prettifyReportResults(proposals);
    if (proposalsText.length > 0) {
        output += '# Proposals\n' + proposalsText;
    }

    // Issues
    let issues = await getMilestonesReport(ISSUES_REPO, 'Milestones', 'Issue');
    let issuesText = prettifyReportResults(issues);
    if (issuesText.length > 0) {
        output += '# Issues\n' + issuesText;
    }


    // Footer
    output += '\n';
    output += createFooter();

    let stringInChunks = breakStringIntoChunks(output);
    return stringInChunks;
}

unit.createCommand()
	.setName('waiting-for-godot')
	.setRateLimit(10)
	.setDescription('Explains how Godot is usually pronounced')
	.setCallback(async interaction => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        let reportItems = await createReport();
        for (let i of reportItems) {
            await interaction.followUp({ content: i });
        }
	});

module.exports = unit;