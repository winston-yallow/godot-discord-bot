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
		const embed = new GodotEmbedBuilder()
			.setTitle('Reported Message from ' + interaction.user.username + ':')
			.setDescription(`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.targetId}`);
		channel.send({ content: `<@&${modRole}>`, embeds: [embed] });
		await interaction.reply({ flags: MessageFlags.Ephemeral, content: 'Message has been reported. A staff member will check soon.' });
	});

module.exports = unit;