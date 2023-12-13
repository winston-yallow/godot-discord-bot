const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

// TODO: Are there better ways to have multi-line strings in JS?
const embed = new GodotEmbedBuilder()
	.setTitle('Embedding code in discord messages')
	.addFields([
		{
			name: 'Inline Code',
			value: 'When you surround some words with single backticks like '
			+ '\\`this\\`, it will be formatted as `code`.',
		},
		{
			name: 'Code Blocks',
			value: 'You can also include code blocks by surrounding the code '
			+ 'with three backticks. If you add "swift" then you will also get '
			+ 'basic syntax highlighting:\n'
			+ '\\```swift\n'
			+ 'print("hello world")\n'
			+ '\\```\n'
			+ 'Discord will then show it as a code block like this:\n'
			+ '```swift\n'
			+ 'print("hello world")\n'
			+ '```',
		},
		{
			name: 'Upload',
			value: 'If your code snippet is rather long, you can upload it to '
			+ 'a text paste site. One option that supports syntax highlighting '
			+ 'for GDScript is https://bpa.st/',
		},
	])
;

const unit = new Unit();

unit.createCommand()
	.setName('code')
	.setRateLimit(10)
	.setDescription('Explains how to embed code in discord messages')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [embed] });
	});

module.exports = unit;