// Reports the message to specified channel in config.json. Get the channel id by right clicking any channel on discord in developer mode, and copying the id.

const { ApplicationCommandType, MessageFlags, ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { Unit } = require('../lib/units');
const { GodotEmbedBuilder } = require('../lib/helpers');

const unit = new Unit();

unit.createContextMenuCommand()
	.setName('Report Message to Staff')
	.setRateLimit(10)
	.setType(ApplicationCommandType.Message)
	.setCallback(async interaction => {

		if (!interaction.isMessageContextMenuCommand()) return;

		// Create a modal to ask for additional context
		const modal = new ModalBuilder().setCustomId('reportModal').setTitle('Report User');
		const contextInput = new TextInputBuilder()
				.setCustomId('contextInput')
				.setStyle(TextInputStyle.Paragraph)
		const contextLabel = new LabelBuilder()
			.setLabel("Additional context")
			.setDescription('Add any context that may be useful for moderators when they see this message.')
			.setTextInputComponent(contextInput);

		// Show the modal
		modal.addLabelComponents(contextLabel);
		await interaction.showModal(modal);
		const modalResponse = await interaction
			.awaitModalSubmit({ time: 60_000 })


		// Send message to mod channel
		const modChannel = unit.config.guildConfigs[interaction.guildId].modChannel;
		const modRole = unit.config.guildConfigs[interaction.guildId].modRole;
		const channel = interaction.client.channels.cache.get(modChannel);
		const reportedMessage = interaction.targetMessage;
		const embed = new GodotEmbedBuilder()
			.setAuthor({ name: reportedMessage.author.username, iconURL: reportedMessage.author.avatarURL() ?? interaction.user.defaultAvatarURL })
			.setDescription(reportedMessage.content || '-# no content');
		const embeds = [embed];
		const contextResponse = modalResponse.fields.getTextInputValue('contextInput');
		const msg = `<@&${modRole}> New report created by <@${interaction.user.id}>\n\n`
		+ `:link: Link: https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.targetId}\n`
		+ `:bust_in_silhouette: Reported User: <@${reportedMessage.author.id}>\n`
		+ `:notepad_spiral: Additional Context: \n\`\`\`\n${contextResponse}\n\`\`\`\n`
		+ `:speech_balloon: Reported Content:\n`;
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

		await modalResponse.reply({ flags: MessageFlags.Ephemeral, content: 'Message has been reported. A staff member will check soon.' });

	});

module.exports = unit;