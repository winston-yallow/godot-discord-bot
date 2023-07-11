const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const embed = new GodotEmbedBuilder()
	.setTitle('Pronunciation')
	.setDescription('Godot is usually pronounced "go-dough" (the "t" is silent).')
;

const unit = new Unit();

unit.createCommand()
	.setName('pronounce')
	.setDescription('Explains how Godot is usually pronounced')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [embed] });
	})
;

module.exports = unit;