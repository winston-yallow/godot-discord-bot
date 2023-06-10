const { SlashCommandBuilder } = require('discord.js');

/**
 * @callback SlashCallback
 * @param interaction {import('discord.js').ChatInputCommandInteraction}
 */


/**
 * An extension of SlashCommandBuilder that can also store a callback
 */
class SlashCallbackBuilder extends SlashCommandBuilder {
	/** @type {SlashCallback} */
	callback;

	/**
	 * Defines the callback for this slash command
	 * @param {SlashCallback} callback The function to call when the command is run
	 */
	setCallback(callback) {
		this.callback = callback;
	}
}


/**
 * Collection of commands and other discord interactions
 */
class Unit {
	/**
	 * List of all slash commands
	 * @type {SlashCallbackBuilder[]}
	 */
	slashCommands = [];

	/**
	 * Creates and registers a new command builder for this unit
	 * @returns {SlashCallbackBuilder} An object to construct the command
	 */
	createCommand() {
		const cmd = new SlashCallbackBuilder();
		this.slashCommands.push(cmd);
		return cmd;
	}
}


module.exports = { Unit, SlashCallbackBuilder };