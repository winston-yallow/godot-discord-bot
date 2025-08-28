const { SlashCommandBuilder, ContextMenuCommandBuilder } = require('discord.js');
const config = require('../instance/config');
/**
 * A custom error raised when a rate limit is exceeded
 */
class RateLimitError extends Error { }

/**
 * @callback SlashCallback
 * @param interaction {import('discord.js').ChatInputCommandInteraction}
 */

/**
 * @callback ContextMenuCallback
 * @param interaction {import('discord.js').ContextMenuCommandInteraction}
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
 * An extension of ContextMenuCommandBuilder that can also store a callback
 */
class ContextMenuCallbackBuilder extends ContextMenuCommandBuilder {
	/** @type {ContextMenuCallback} */
	callback;

	/** @type {number} */
	#rateLimit = 0;

	/** @type {{[key: import('discord.js').Snowflake]: number}} */
	#lastRunPerChannel = {};

	/**
	 * Defines the callback for this slash command
	 * @param {ContextMenuCallback} callback The function to call when the command is run
	 */
	setCallback(callback) {
		this.callback = callback;
	}

	/**
	 * Defines the rate limit for this slash command
	 * @param {number} seconds Minimum number of seconds between calls in the same channel
	 * @returns {ContextMenuCallbackBuilder} Returns itself so that functions can be chained
	 */
	setRateLimit(seconds) {
		this.#rateLimit = seconds;
		return this;
	}

	/**
	 * Executes the callback for a given interaction if the rate limit allows it
	 * @param {import('discord.js').ContextMenuCommandInteraction} interaction Interaction from API
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

	config = config;
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

	/**
	 * List of all context menu commands
	 * @type {ContextMenuCallbackBuilder[]}
	 */
	contextCommands = [];

	/**
	 * Creates and registers a new command builder for this unit
	 * @returns {ContextMenuCallbackBuilder} An object to construct the command
	 */
	createContextMenuCommand() {
		const cmd = new ContextMenuCallbackBuilder();
		this.contextCommands.push(cmd);
		return cmd;
	}
}


module.exports = { Unit, SlashCallbackBuilder, ContextMenuCallbackBuilder, RateLimitError };