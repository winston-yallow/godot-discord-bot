const { Unit } = require('../lib/units.js');
const { GodotEmbedBuilder } = require('../lib/helpers.js');

const embedAsk = new GodotEmbedBuilder()
	.setTitle('Don\'t ask to ask!')
	.setDescription(
		'Just ask your question. We can not know in advance what '
		+ 'questions you have and if we can help you. So just ask '
		+ 'your question, and if someone here knows how to help '
		+ 'you then you\'ll get an answer.',
	)
;

const embedQuestions = new GodotEmbedBuilder()
	.setTitle('How to ask for help')
	.setDescription(
		'Following these tips will increase your chance of getting good answers:',
	)
	.addFields([
		{
			name: 'Include Details',
			value: 'Helpers need to know as much as possible about your problem. '
				+ 'Try answering the following questions:\n'
				+ '- What are you trying to do? (show your node setup / code)\n'
				+ '- What is the expected result?\n'
				+ '- What is happening instead? (include any error messages)\n'
				+ '- What have you tried so far?\n'
				+ '- What type of game is this, 2D or 3D?',
		},
		{
			name: 'Respond to Helpers',
			value: 'Helpers often ask you questions to better understand your problem. '
				+ 'Not answering them or saying "it\'s not relevant" is not helpful. '
				+ 'Even if it is not directly relevant, there is a high chance the answer '
				+ 'will give more context for the people that are helping you.',
		},
		{
			name: 'Don\'t be demanding',
			value: 'Please don\'t expect people to immediately help you. We all do '
				+ 'this in our freetime. It may take some time until someone who can help '
				+ 'you will answer.',
		},
	])
;

const unit = new Unit();

unit.createCommand()
	.setName('ask')
	.setRateLimit(10)
	.setDescription('Explains to directly state the question')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [embedAsk] });
	})
;


unit.createCommand()
	.setName('questions')
	.setRateLimit(10)
	.setDescription('Explains what a good question looks like')
	.setCallback(async interaction => {
		await interaction.reply({ embeds: [embedQuestions] });
	})
;

module.exports = unit;