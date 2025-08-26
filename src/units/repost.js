const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const embedRepost = new GodotEmbedBuilder()
    .setTitle('Asking in multiple channels')
    .setDescription(
        'Please don\'t post the same question in multiple channels '
        + '- to avoid that people spend time answering already '
        + 'solved problems. Feel free to move the question by deleting one of them.'
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