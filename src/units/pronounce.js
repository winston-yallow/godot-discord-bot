const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const embed = new GodotEmbedBuilder()
	.setTitle('Pronunciation')
	.setDescription(
		'While the name stems from the play "Waiting for Godot", at this point everyone '
		+ 'pronounces the engine name differently — including the Foundation team. Because '
		+ "we think that's beautiful, we don't police any pronounciation anymore."
	)
;

const unit = new Unit();

unit.createCommand()
	.setName('pronounce')
	.setRateLimit(10)
	.setDescription('Explains how Godot is usually pronounced')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [embed] });
	})
;

module.exports = unit;
