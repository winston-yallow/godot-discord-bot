const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const embed = new GodotEmbedBuilder()
	.setTitle('Downloads')
	.setDescription('You can download Godot from the following websites and platforms:')
	.addFields([
		{ name: 'Official Website', value: 'https://godotengine.org/download/' },
		{ name: 'Tuxfamily', value: 'https://downloads.tuxfamily.org/godotengine/' },
		{ name: 'GitHub', value: 'https://github.com/godotengine/godot/releases' },
		{ name: 'Itch', value: 'https://godotengine.itch.io/godot' },
		{ name: 'Steam', value: 'https://store.steampowered.com/app/404790/Godot_Engine/' },
	])
;

const unit = new Unit();

unit.createCommand()
	.setName('downloads')
	.setRateLimit(10)
	.setDescription('Provides links to all websites and platforms to download Godot from')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [embed] });
	})
;

module.exports = unit;