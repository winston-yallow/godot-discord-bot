// Reports the message to specified channel in config.json. Get the channel id by right clicking any channel on discord in developer mode, and copying the id.

const { ApplicationCommandType, MessageFlags } = require('discord.js');
const { Unit } = require('../lib/units');
const { GodotEmbedBuilder } = require('../lib/helpers');

const unit = new Unit();

unit.createContextMenuCommand()
	.setName('Report Message to Staff')
	.setRateLimit(10)
	.setType(ApplicationCommandType.Message)
	.setCallback(async interaction => {
		const modChannel = unit.config.guildConfigs[interaction.guildId].modChannel;
		const modRole = unit.config.guildConfigs[interaction.guildId].modRole;
		const channel = interaction.client.channels.cache.get(modChannel);
		const reportedMessage = interaction.targetMessage;
		const embed = new GodotEmbedBuilder()
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL })
			.setDescription(reportedMessage.content || 'No content');
		const msg = `<@&${modRole}> New report created by <@${interaction.user.id}>\n`
		+ `:link:Link: https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.targetId}`;
		const files = [];
		reportedMessage.attachments.forEach(attachment => {
			files.push(attachment.url);
		});
		channel.send({ content: msg, embeds: [embed], files: files });
		await interaction.reply({ flags: MessageFlags.Ephemeral, content: 'Message has been reported. A staff member will check soon.' });
	});

module.exports = unit;