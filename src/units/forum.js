const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const urlForum = 'https://forum.godotengine.org/';
const urlTricks = 'https://forum.godotengine.org/c/resources/tips-tricks/22';

const shareEmbed = new GodotEmbedBuilder()
	.setTitle('Spread the Knowledge!')
	.setDescription(
		'Content on discord is not indexed by search engines. It would be awesome if you '
		+ `can post useful tips and tricks on [the forum](${urlForum}) :sparkles:\n\n`
		+ `There even is an extra [category](${urlTricks}) for sharing your favorite tricks!`,
	)
;

const complexEmbed = new GodotEmbedBuilder()
	.setTitle('Ask complex questions on the Forum')
	.setDescription(
		'For long questions, you may get better and more detailed help by asking on '
		+ `[the forum](${urlForum}) :sparkles:\n\nDiscord is great as a chat platform, but since `
		+ 'it is real-time it also means questions get easily overlooked if they '
		+ 'can\'t be answered quickly.',
	)
;

const unit = new Unit();

unit.createCommand()
	.setName('share')
	.setRateLimit(0)
	.setDescription('Suggests to post tips and tricks on the forum')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [shareEmbed] });
	})
;

unit.createCommand()
	.setName('complex')
	.setRateLimit(0)
	.setDescription('Suggests to ask complex questions on the forum')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [complexEmbed] });
	})
;

module.exports = unit;