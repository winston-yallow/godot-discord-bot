const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const embedRepost = new GodotEmbedBuilder()
    .setTitle('Asking in multiple channels')
    .setDescription(
        'Please don\'t post the same question or message multiple times. '
        + 'This avoids wasting volunteer\'s time on questions that were already answered. Thank you. '
    )
    ;

const unit = new Unit();

unit.createCommand()
    .setName('repost')
    .setRateLimit(10)
    .setDescription('Explains to not ask in multiple channels')
    .setCallback(async interaction => {
        await interaction.reply({ embeds: [embedRepost] })
    })
    ;

module.exports = unit;