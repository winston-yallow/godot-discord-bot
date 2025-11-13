const { Unit } = require('../lib/units.js');
const { MessageFlags } = require('discord.js');
const unit = new Unit();

const PROPOSALS_REPO = 'godotengine/godot-proposals';
const ISSUES_REPO = 'godotengine/godot';

const MAX_PAGES = 1;
const MAX_ISSUES = 10;

// TODO: Use previous day (check for new stuff etc)
// TODO: Split post into multiple parts as necessary(?)
// TODO: Use all 4.* instead of just 4.x milestone

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
    let output = "";

    let labelList = { "core": "", "documentation":"", "editor":"", "gui":"", "input":"", "audio":"", 
                "rendering":"", "shaders":"", "3d":"", "2d":"", "particles":"", "vfx":"", "animation":"",  
                "physics":"", "codestyle":"", "gdscript":"", "dotnet":"", "visualscript":"",  "navigation":"", "multiplayer":"", "network":"", "xr":"", 
                "plugin":"", "gdextension":"",
                "buildsystem":"", "export": "", "import":"", "porting":"", "tests":"", "thirdparty":"" }

    const specialCategoryNames = {
        "gui": "GUI",
        "3d": "3D",
        "2d": "2D",
        "vfx": "VFX",
        "gdscript": "GDScript",
        "dotnet": ".NET",
        "visualscript": "VisualScript",
        "xr": "XR",
        "gdextension": "GDExtension",
        "thirdparty": "Third-Party"
    };

    let issuesCollected = new Set();

    for (let i = 0; i < MAX_PAGES + 1; i++) {
        // TODO: add time filter

        const url = new URL(`https://api.github.com/search/issues`);
        url.search = new URLSearchParams({
            q: `repo:${repo} is:${type} milestone:${milestone} state:${state}`,
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
                let prefix = '';

                if ('pull_request' in s && !reason) {
                    if (s.pull_request.merged_at) {
                        prefix = ':purple_circle: [M][PR]';
                    } else {
                        prefix = ':red_circle: [C][PR]';
                    }
                } else {
                    if (reason == 'completed') {
                        prefix = ':purple_circle: [C]';
                    } else if (reason == 'not_planned') {
                        prefix = ':red_circle: [N]';
                    } else if (reason == 'reopened') {
                        prefix = ':green_circle: [R]';
                    } else if (reason == 'duplicate') {
                        prefix = ':black_circle: [D]';
                    }
                }

                // Prevent double-display of issues
                if (issuesCollected.has(s.number)) {
                    continue;
                }
                issuesCollected.add(s.number);

                let c = `${prefix} [#${s.number}](<${s.html_url}>): ${s.title}\n`;
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

                if (labelList.hasOwnProperty(t)) {
                    labelList[t] += c;
                } else {
                    labelList[t] = c;
                }

                countIssues += 1;
            }
        }
    }

    if (countIssues <= 0) {
        return null;
    }

    for (const l of Object.keys(labelList)) {
        if (labelList[l].trim().length > 0) {
            output += `__**`;
            output += `${l in specialCategoryNames ? specialCategoryNames[l] : (l.charAt(0).toUpperCase() + l.slice(1))}`;
            output += `**__\n${labelList[l].trim()}\n\n`;
        }
    }

    return `**${title}${countIssues > 1 ? 's' : ''} (${countIssues}):**\n${output}\n\n`;
}
async function getAllIssuesReport(milestone, repo, title, timefilter, state, stateReason = null, event = null) {
    let tmp = "";

    let c = await getIssuesReport(milestone, repo, 'pull-request', `${state} Pull Request`, timefilter, state, stateReason, event);
    if (c) {
        tmp += `${c}~~----------------------------------------------------~~\n\n`;
    }

    c = await getIssuesReport(milestone, repo, 'issue', title, timefilter, state, stateReason, event);
    if (c) {
        tmp += c;
    }

    return tmp;
}

async function getMilestonesReport(repo, header, title, filter = '^4.x') {
    const response = await fetch(`https://api.github.com/repos/${repo}/milestones`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TOKEN}`
        }
    });
    const data = await response.json();
    let tmp = "";
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

        let contentExisted = false;
        let t = "";

        // Reopened Proposals
        let c = await getAllIssuesReport(item.title, repo, `Reopened ${title}`, 'updated', 'open', 'reopened', 'reopened');
        if (c.length > 0) {
            contentExisted = true;
            t += `${c}\n\n`
        }

        t = t.trim();
        t += '\n\n\n';

        // Closed Proposals
        c = await getAllIssuesReport(item.title, repo, `Closed ${title}`, 'closed', 'closed');
        if (c.length > 0) {
            contentExisted = true;
            t += `${c}\n\n`;
        }

        t = t.trim();

        if (contentExisted) {
            tmp += `\n**${header} ${item.title}:** ${complete_percent}% complete `;
            tmp += `(${num_open_issues} open / ${num_closed_issues} closed)\n`;
            tmp += t;
        }
    }

    tmp = tmp.trim();
    tmp += '\n\n';
    return tmp;
}

async function createReport() {
    let text = createHeader();

    // Proposals
    text += await getMilestonesReport(PROPOSALS_REPO, 'Proposals', 'Proposal');

    // Issues
    text += await getMilestonesReport(ISSUES_REPO, 'Milestones', 'Issue');

    // Footer
    text += createFooter();

    console.log('THE BIG ENCHILADA:');
    console.log(text);
    console.log('END OF LARGE ENCHILADA');

    console.log('PRECISE SIZE OF ENCHILADA:', text.length);
    return text;
}

unit.createCommand()
	.setName('waiting-for-godot')
	.setRateLimit(10)
	.setDescription('Explains how Godot is usually pronounced')
	.setCallback(async interaction => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		await interaction.editReply({ content: await createReport() });
	});

module.exports = unit;