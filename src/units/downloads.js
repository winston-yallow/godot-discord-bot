const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const unit = new Unit();

unit.createCommand()
	.setName('downloads')
	.setDescription('Provides links to all websites and platforms to download Godot from')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [
			new GodotEmbedBuilder()
				.setTitle('Downloads')
				.setDescription('You can download Godot from the following websites and platforms:')
				.addFields([
					{ name: 'Official Website', value: 'https://godotengine.org/download/' },
					{ name: 'Tuxfamily', value: 'https://downloads.tuxfamily.org/godotengine/' },
					{ name: 'GitHub', value: 'https://github.com/godotengine/godot/releases' },
					{ name: 'Itch', value: 'https://godotengine.itch.io/godot' },
					{ name: 'Steam', value: 'https://store.steampowered.com/app/404790/Godot_Engine/' },
				]),
		] });
	})
;

module.exports = unit;