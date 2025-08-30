const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const embedRepost = new GodotEmbedBuilder()
    .setTitle('Learning GDScript')
    .setDescription(
        'To get started with learning GDScript, you should '
        + 'take a look at the official documentation: '
        + 'https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_basics.html.\n\n'
        + 'Another good resource for learning would be https://gdquest.github.io/learn-gdscript/'
    )
;

const unit = new Unit();

unit.createCommand()
    .setName('gdscript')
    .setRateLimit(10)
    .setDescription('Provides resources for learning GDScript')
    .setCallback(async interaction => {
        await interaction.reply({ embeds: [embedRepost] })
    })
;

module.exports = unit;