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
			.setAuthor({ name: reportedMessage.author.username, iconURL: reportedMessage.author.avatarURL() ?? interaction.user.defaultAvatarURL })
			.setDescription(reportedMessage.content || '-# no content');
		const embeds = [embed];
		const msg = `<@&${modRole}> New report created by <@${interaction.user.id}>\n\n`
		+ `:link: Link: https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.targetId}\n`
		+ `:bust_in_silhouette: Reported User: <@${reportedMessage.author.id}>\n`
		+ ':speech_balloon: Reported Content:\n';
		const files = [];
		const largeFiles = [];
		let uploadLimit = 1024 * 1024 * 8; // 8mb
		switch (interaction.guild.premiumTier) {
			case 2: uploadLimit = 1024 * 1024 * 50; break;
			case 3: uploadLimit = 1024 * 1024 * 100; break;
		}
		uploadLimit = uploadLimit * 0.95; // small buffer
		reportedMessage.attachments.forEach(attachment => {
			if (attachment.size > uploadLimit) {
				largeFiles.push(attachment.url);
			} else {
				files.push(attachment.url);
			}
		});
		if (largeFiles.length > 0) {
			let embedDescription = 'These files were too large to attach to this report:';
			largeFiles.forEach(file => {
				embedDescription += '\n' + file;
			});
			const largeFilesEmbed = new GodotEmbedBuilder()
				.setTitle('Large Files')
				.setDescription(embedDescription);
			embeds.push(largeFilesEmbed);
		}
		channel.send({ content: msg, embeds: embeds, files: files });
		await interaction.reply({ flags: MessageFlags.Ephemeral, content: 'Message has been reported. A staff member will check soon.' });
	});

module.exports = unit;