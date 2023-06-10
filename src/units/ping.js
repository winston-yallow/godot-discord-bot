const { Unit } = require('../lib/units.js');

const unit = new Unit();

unit.createCommand()
	.setName('ping')
	.setDescription('Ping Pong')
	.setCallback(async interaction => {
		await interaction.reply({ content: 'pong', ephemeral: true });
	})
;

module.exports = unit;