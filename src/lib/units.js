const { SlashCommandBuilder } = require('discord.js');


/**
 * A custom error raised when a rate limit is exceeded
 */
class RateLimitError extends Error {}

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

	/** @type {number} */
	#rateLimit = 0;

	/** @type {{[key: import('discord.js').Snowflake]: number}} */
	#lastRunPerChannel = {};

	/**
	 * Defines the callback for this slash command
	 * @param {SlashCallback} callback The function to call when the command is run
	 */
	setCallback(callback) {
		this.callback = callback;
	}

	/**
	 * Defines the rate limit for this slash command
	 * @param {number} seconds Minimum number of seconds between calls in the same channel
	 * @returns {SlashCallbackBuilder} Returns itself so that functions can be chained
	 */
	setRateLimit(seconds) {
		this.#rateLimit = seconds;
		return this;
	}

	/**
	 * Executes the callback for a given interaction if the rate limit allows it
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction Interaction from API
	 */
	async execute(interaction) {
		const lastRun = this.#lastRunPerChannel[interaction.channelId] ?? 0;
		if (Date.now() - lastRun < this.#rateLimit * 1000) {
			throw new RateLimitError();
		}
		this.#lastRunPerChannel[interaction.channelId] = Date.now();
		await this.callback(interaction);
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


module.exports = { Unit, SlashCallbackBuilder, RateLimitError };