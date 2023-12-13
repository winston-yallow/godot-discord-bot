const { SlashCommandStringOption } = require('discord.js');
const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');


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
	'3': '3.5',
	'4': 'stable',
};

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
		.setRequired(true))
	.setCallback(async interaction => {
		const version = interaction.options.getString('version');
		const className = interaction.options.getString('class');
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