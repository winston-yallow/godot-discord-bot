const {
	Client,
	Collection,
	Events,
	ChatInputCommandInteraction,
	GatewayIntentBits,
	Partials,
	ChannelType,
	REST,
	Routes,
} = require('discord.js');
const { Unit } = require('./units.js');
const fs = require('node:fs');
const path = require('node:path');

/**
 * @typedef ModularClientConfig
 * Configuration data for a ModularClient
 * @property {string} token Discord API token
 * @property {string[]} admins List of user IDs that are allowed to administrate the bot
 * @property {string} clientId ID of the Discord application
 * @property {string[]} guilds Guilds to register commands in (uses global registration if empty)
 */

/**
 * Client that supports dispatching incoming events into separate units
 */
class ModularClient extends Client {
	// Warnings are used for non critcal log messages on the server
	static WARN_NOT_A_UNIT = '[WARNING] Unit file does not contain a unit:';
	static WARN_OVERRIDE_SLASH = '[WARNING] Overriding previously registered slash command:';
	static WARN_OVERRIDE_CONTEXT = '[WARNING] Overriding previously registered context menu command:';

	// Errors are used for critcal log messages on the server
	static ERR_INVALID_CMD = '[ERROR] Command does not exist on server side:';

	// Messages are send to the user to inform them of issues
	static MSG_SERVER_ERROR = 'There was an error while executing this command. Please notify the moderators.';

	/** @type {ModularClientConfig} */
	#config;

	/** @type {Collection<string, import('./units.js').SlashCallbackBuilder>} */
	#slashCommands = new Collection();

	/**
	 * Creates a new modular client
	 * @param {ModularClientConfig} config Configuration object
	 */
	constructor(config) {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.DirectMessages,
			],
			partials: [Partials.Channel],
		});
		this.#config = config;
		this.on(Events.InteractionCreate, this.#onInteractionCreate);
		this.on(Events.MessageCreate, this.#onMessageCreate);
		this.once(Events.ClientReady, c => {
			console.log(`Ready! Logged in as ${c.user.tag}`);
		});
	}

	/**
	 * Authenticates the client with the discord API
	 * @returns {Promise<string>} Promise for the success of logging in
	 */
	login() {
		return super.login(this.#config.token);
	}

	/**
	 * Loads and registers all unit files from a given directory.
	 * @param {string} unitsPath Directory containing the unit files
	 */
	loadAllUnits(unitsPath) {
		fs.readdirSync(unitsPath)
			.filter(file => file.endsWith('.js'))
			.map(file => this.loadUnit(path.join(unitsPath, file)));
	}

	/**
	 * Loads and registers a single unit file from a given file path.
	 * @param {string} unitPath Path of the unit file
	 */
	loadUnit(unitPath) {
		const unit = require(unitPath);
		if (!(unit instanceof Unit)) {
			console.warn(ModularClient.WARN_NOT_A_UNIT, unitPath);
			return;
		}
		this.registerUnit(unit);
	}

	/**
	 * Registers all interactions for a unit.
	 * @param {Unit} unit Unit to register
	 */
	registerUnit(unit) {
		for (const cmd of unit.slashCommands) {
			if (this.#slashCommands.has(cmd.name)) {
				console.warn(ModularClient.WARN_OVERRIDE_SLASH, cmd.name);
			}
			this.#slashCommands.set(cmd.name, cmd);
		}
	}

	/**
	 * Private method that is called every time an interaction is created.
	 * This then dispatches the interaction to the corresponding handler
	 * based on the interaction type.
	 * @param {import('discord.js').Interaction} interaction Interaction coming from a user
	 */
	async #onInteractionCreate(interaction) {
		if (interaction instanceof ChatInputCommandInteraction) {
			await this.#onCommandInteraction(interaction);
		}
	}

	/**
	 * Private method that is called every time a slash command is issued
	 * @param {ChatInputCommandInteraction} interaction Command coming from a user
	 */
	async #onCommandInteraction(interaction) {
		const cmd = this.#slashCommands.get(interaction.commandName);
		if (!cmd) {
			console.error(ModularClient.ERR_INVALID_CMD, interaction.commandName);
			await interaction.reply({ content: ModularClient.MSG_SERVER_ERROR, ephemeral: true });
			return;
		}

		try {
			await cmd.callback(interaction);
		}
		catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: ModularClient.MSG_SERVER_ERROR, ephemeral: true });
			}
			else {
				await interaction.reply({ content: ModularClient.MSG_SERVER_ERROR, ephemeral: true });
			}
		}
	}

	/**
	 * Private method that is called every time a message is created.
	 * This is only used to allow refreshing command registration
	 * @param {import('discord.js').Message} msg Message send by a user
	 */
	async #onMessageCreate(msg) {
		if (msg.channel.type != ChannelType.DM) {
			// Ignore non-DM messages
			return;
		}
		else if (msg.author.id == this.user.id) {
			// Ignore messages sent by the bot itself
			return;
		}
		else if (!this.#config.admins.includes(msg.author.id)) {
			await msg.reply({ content: 'you are not an administrator' });
			return;
		}
		else if (msg.content != 'refresh commands') {
			await msg.reply({ content: 'unknown command' });
			return;
		}

		for (const guildId of this.#config.guilds) {
			const route = Routes.applicationGuildCommands(this.#config.clientId, guildId);
			const options = { body: this.#slashCommands.map(cmd => cmd.toJSON()) };
			const rest = new REST().setToken(this.#config.token);
			try {
				await rest.put(route, options);
				await msg.reply({ content: 'refreshed all commands' });
			}
			catch (error) {
				console.error(error);
			}
		}
	}
}

module.exports = { ModularClient };