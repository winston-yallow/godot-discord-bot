const { MessageFlags } = require('discord.js');
const { Unit } = require('../lib/units.js');

const unit = new Unit();

unit.createCommand()
	.setName('ping')
	.setDescription('Ping Pong')
	.setCallback(async interaction => {
		await interaction.reply({ content: 'pong', flags: MessageFlags.Ephemeral });
	})
;

module.exports = unit;