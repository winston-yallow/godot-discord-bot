const { SlashCommandStringOption, MessageFlags } = require('discord.js');
const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');
const fs = require('fs');
const config = require('../../instance/config');


const base_url = 'https://docs.godotengine.org/en/';

const version_selection = new SlashCommandStringOption()
	.setName('version')
	.setDescription('Version used for the documentation link')
	.addChoices(
		{ name: 'Godot 3 (LTS)', value: '3' },
		{ name: 'Godot 4 (stable)', value: '4' },
	)
	.setRequired(true);

/** @type {{[key: string]: string}} */
const version_mapping = {
	'3': '3.6',
	'4': 'stable',
};

// caching of classes for /class command
const classList = {};
for (const key in config.docVersions) {
	classList[config.docVersions[key].urlFragment] = { lastModified: 0, classes: [] };
}

const unit = new Unit();


unit.createCommand()
	.setName('docs')
	.setRateLimit(5)
	.setDescription('Shows a link to the documentation')
	.addStringOption(version_selection)
	.setCallback(async interaction => {
		const version = interaction.options.getString('version');
		const path = version_mapping[version];
		await interaction.reply({ embeds: [
			new GodotEmbedBuilder()
				.setTitle(`Documentation (Godot ${version})`)
				.setURL(new URL(path, base_url).href)
				.setDescription(
					'Official documentation of Godot, a free and open source '
					+ 'community-driven 2D and 3D game engine!',
				),
		] });
	})
;


unit.createCommand()
	.setName('step')
	.setRateLimit(5)
	.setDescription('Shows a link to the step by step guide')
	.addStringOption(version_selection)
	.setCallback(async interaction => {
		const version = interaction.options.getString('version');
		const path = `${version_mapping[version]}/getting_started/step_by_step`;
		await interaction.reply({ embeds: [
			new GodotEmbedBuilder()
				.setTitle(`Step by Step (Godot ${version})`)
				.setURL(new URL(path, base_url).href)
				.setDescription(
					'Learn about nodes and scenes, code your first classes with GDScript, '
					+ 'use signals to make nodes communicate with one another, and more!',
				),
		] });
	})
;


unit.createCommand()
	.setName('class')
	.setRateLimit(5)
	.setDescription('Generates a link to the docs for a specific class')
	.addStringOption(version_selection)
	.addStringOption(option => option
		.setName('class')
		.setDescription('Name of the class you want to link')
		.setRequired(true)
		.setAutocomplete(true))
	.setCallback(async interaction => {
		const version = interaction.options.getString('version');
		const className = interaction.options.getString('class');
		if (!classList[config.docVersions[version].urlFragment].classes.includes(className)) {
			await interaction.reply({
				flags: MessageFlags.Ephemeral, 
				content: `There is no ${className} class in your selected version of Godot`,
			});
			return;
		}
		const classNameLower = className.toLowerCase();
		const path = `${version_mapping[version]}/classes/class_${classNameLower}.html`;
		await interaction.reply({ embeds: [
			new GodotEmbedBuilder()
				.setTitle(`${className} Documentation (Godot ${version})`)
				.setURL(new URL(path, base_url).href)
				.setDescription(
					`Online API Reference for ${className}. You can also use the offline `
					+ 'documentation by pressing F1 in Godot and searching for a class name.',
				),
		] });
	})
	.setAutocompleteCallback(async interaction => {
		const options = interaction.options._hoistedOptions;
		const input = interaction.options.getFocused().toLowerCase();
		// don't autocomplete when there is no version selected
		if (options[0].name != 'version') {
			return;
		}
		const version = config.docVersions[options[0].value];
		try {
			const stats = fs.statSync(`instance/global-class-list-${version.urlFragment}.csv`);
			const lastModified = stats.mtime.getTime();
			if (lastModified > classList[version.urlFragment].lastModified) {
				classList[version.urlFragment].lastModified = lastModified;
				const file = fs.readFileSync(`instance/global-class-list-${version.urlFragment}.csv`, 'utf8');
				classList[version.urlFragment].classes = file.split('\n');
			}
		}
		catch (error) {
			console.error('Error reading file: ', error);
		}
		const classes = classList[version.urlFragment].classes;
		const filtered = classes.filter(Class => Class.toLowerCase().startsWith(input));
		await interaction.respond(
			filtered.slice(0, 25).map(Class => ({ name: Class, value: Class })),
		);
	})
;


unit.createCommand()
	.setName('tutorials')
	.setRateLimit(5)
	.setDescription('Shows a link to the "Tutorials & Resources" page')
	.addStringOption(version_selection)
	.setCallback(async interaction => {
		const version = interaction.options.getString('version');
		const path = `${version_mapping[version]}/community/tutorials.html`;
		await interaction.reply({ embeds: [
			new GodotEmbedBuilder()
				.setTitle(`Tutorials & Resources (Godot ${version})`)
				.setURL(new URL(path, base_url).href)
				.setDescription(
					'A list of third-party tutorials and resources created by the Godot community',
				),
		] });
	})
;


module.exports = unit;