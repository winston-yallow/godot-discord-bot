const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const embed = new GodotEmbedBuilder()
	.setTitle('Fixing the `Unable to initialize Vulkan video driver` error')
	.addFields([
		{
			name: 'Verify Vulkan is installed',
			value: 'Check whether your [GPU supports Vulkan 1.3](https://vulkan.gpuinfo.org/) '
			+ 'and make sure that you have the latest version of your '
			+ 'graphics driver, or download them from [AMD](https://www.amd.com/en/support) '
			+ 'or [NVIDIA](https://www.nvidia.com/download/index.aspx) respectively.',
		},
		{
			name: 'Make sure the proper GPU is used',
			value: 'Assign your dedicated GPU to be used if you also have an '
			+ 'integrated one.'
			+ ' - Tutorial for [Windows](https://www.intel.com/content/www/us/en/support/articles/000090168/graphics.html)',
		},
		{
			name: 'Collect errors for reporting',
			value: 'Try running Godot from the command line and '
			+ 'check for any error messages. If following the '
			+ 'steps below, make sure to *exclude* '
			+ '`--rendering-driver opengl3` for now, to check '
			+ 'which errors pop up.',
		},
		{
			name: 'Fallback on compatibility mode',
			value: 'If these steps don\'t work, run Godot with the '
			+ 'OpenGL (Compatibility) rendering method. '
			+ '(This has some [drawbacks](https://docs.godotengine.org/en/stable/contributing/development/core_and_modules/internal_rendering_architecture.html#compatibility).)'
			+ 'Find the location you put the Godot executable (make '
			+ 'sure it isn\'t a shortcut file).'
			+ '1. Copy the full path to the executable:'
			+ ' - Windows: Right click the file while holding Shift '
				+ 'and choose Copy as path.'
			+ ' - Linux: Right click the executable and choose copy or '
				+ 'copy location.'
			+ ' - MacOS:'
			+ '2. Open a Terminal and type the following: '
			+ '`<godot path> --rendering-driver opengl3`, where you '
			+ 'replace <godot path> with the full path you copied '
			+ 'previously. Press enter to run the command.',
		},
	])
;

const unit = new Unit();

unit.createCommand()
	.setName('vulkan-error')
	.setRateLimit(10)
	.setDescription('Explains how to debug the `Unable to initialize Vulkan video driver` error')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [embed] });
	});

module.exports = unit;