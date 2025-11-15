const {
	Client,
	Collection,
	Events,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	GatewayIntentBits,
	Partials,
	ChannelType,
	REST,
	Routes,
	MessageFlags,
} = require('discord.js');
const classFetch = require('../utils/fetch-godot-classes');
const { Unit, RateLimitError } = require('./units.js');
const path = require('node:path');
const cron = require('cron');
const fs = require('node:fs')
const { createReport } = require('../utils/waiting-for-godot');

/**
 * @typedef {object} GuildConfig
 * Configuration for a specific guild
 * @property {string} modChannel - ID of the moderation channel for the guild
 * @property {string} modRole - ID of the moderation role for the guild
 * @property {string} waitingForGodotChannel - ID of the channel to post "Waiting for Godot" update messages in
 */

/**
 * @typedef ModularClientConfig
 * Configuration data for a ModularClient
 * @property {string} token Discord API token
 * @property {string[]} admins List of user IDs that are allowed to administrate the bot
 * @property {{[key:string]: {displayName: string, urlFragment: string}}} docVersions
 * @property {string} clientId ID of the Discord application
 * @property {{[key:string]: GuildConfig}} [guildConfigs] Guild configurations
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
	static MSG_RATE_LIMIT = 'This command was already used recently, please wait a bit before using it again in this channel.';

	/** @type {ModularClientConfig} */
	#config;

	/** @type {Collection<string, import('./units.js').SlashCallbackBuilder>} */
	#slashCommands = new Collection();
	/** @type {Collection<string, import('./units.js').ContextMenuCallbackBuilder>} */
	#contextCommands = new Collection();

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
			let waitingForGodotJob = new cron.CronJob('0 0 * * *', async () => {
				for (const guildId of Object.keys(config.guildConfigs)) {
					console.log(`Running WfG at ${new Date().toLocaleString()}`);
					const guild = this.guilds.cache.get(guildId);
					const channel = guild.channels.cache.get(config.guildConfigs[guildId].waitingForGodotChannel);
					
					const reportChunks = await createReport();
					for (const chunk of reportChunks) {
						channel.send(chunk);
					}
				}
			});
			waitingForGodotJob.start();
			console.log(`Ready! Logged in as ${c.user.tag}`);
		});

		// Load units
		const searchdir = path.resolve(path.join(__dirname, '../units'));
		fs.readdir(searchdir, (err, files) => {
			files.forEach(file => {
				const filename = file.toLowerCase();
				if (!filename.endsWith('.js')) return;
				const unitPath = path.join(searchdir, file);
				const unit = require(unitPath);
				if (!(unit instanceof Unit)) {
					console.warn(ModularClient.WARN_NOT_A_UNIT, unitPath);
					return;
				}
				this.registerUnit(unit);
			});
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
	 * Registers all interactions for a unit.
	 * @param {Unit} unit Unit to register
	 */
	registerUnit(unit) {
		for (const cmd of unit.slashCommands) {
			if (this.#slashCommands.has(cmd.name)) {
				console.warn(ModularClient.WARN_OVERRIDE_SLASH, cmd.name);
			}
			console.log('command registered: ', cmd.name);
			this.#slashCommands.set(cmd.name, cmd);
		}
		for (const cmd of unit.contextCommands) {
			if (this.#contextCommands.has(cmd.name)) {
				console.warn(ModularClient.WARN_OVERRIDE_CONTEXT, cmd.name);
			}
			console.log('command registered: ', cmd.name);
			this.#contextCommands.set(cmd.name, cmd);
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
		else if (interaction instanceof ContextMenuCommandInteraction) {
			await this.#onContextMenuInteraction(interaction);
		}
	}

	/**
	 * Private method that is called every time a command is issued
	 * @param {ChatInputCommandInteraction} interaction Command coming from a user
	 */
	async #onCommandInteraction(interaction) {
		const cmd = this.#slashCommands.get(interaction.commandName);
		if (!cmd) {
			console.error(ModularClient.ERR_INVALID_CMD, interaction.commandName);
			await interaction.reply({ content: ModularClient.MSG_SERVER_ERROR, flags: MessageFlags.Ephemeral });
			return;
		}

		try {
			await cmd.execute(interaction);
		}
		catch (error) {
			let msg = '';
			if (error instanceof RateLimitError) {
				msg = ModularClient.MSG_RATE_LIMIT;
			}
			else {
				console.error(error);
				msg = ModularClient.MSG_SERVER_ERROR;
			}
			// Send the message using either a follow up or a reply
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral });
			}
			else {
				await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
			}
		}
	}

	/**
	 * Private method that is called every time a context menu command is issued
	 * @param {ContextMenuCommandInteraction} interaction Command coming from a user
	 */
	async #onContextMenuInteraction(interaction) {
		const cmd = this.#contextCommands.get(interaction.commandName);
		if (!cmd) {
			console.error(ModularClient.ERR_INVALID_CMD, interaction.commandName);
			await interaction.reply({ content: ModularClient.MSG_SERVER_ERROR, flags: MessageFlags.Ephemeral });
			return;
		}

		try {
			await cmd.execute(interaction);
		}
		catch (error) {
			let msg = '';
			if (error instanceof RateLimitError) {
				msg = ModularClient.MSG_RATE_LIMIT;
			}
			else {
				console.error(error);
				msg = ModularClient.MSG_SERVER_ERROR;
			}
			// Send the message using either a follow up or a reply
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral });
			}
			else {
				await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
			}
		}
	}

	/**
	 * Private method that is called every time a message is created.
	 * This is only used to allow refreshing command registration
	 * @param {import('discord.js').Message} msg Message send by a user
	 */
	async #onMessageCreate(msg) {
		const allowedCommands = ['refresh commands', 'fetch classes']; // Add more commands as needed
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
		else if (!allowedCommands.includes(msg.content)) {
			await msg.reply({ content: 'unknown command' });
			return;
		}

		if (msg.content === 'refresh commands') {

			for (const guildId of Object.keys(this.#config.guildConfigs)) {

				const route = Routes.applicationGuildCommands(this.#config.clientId, guildId);
				const payload = [];
				this.#slashCommands.forEach(cmd => payload.push(cmd.toJSON()));
				this.#contextCommands.forEach(cmd => payload.push(cmd.toJSON()));
				const options = { body: payload };
				const rest = new REST().setToken(this.#config.token);
				try {
					await rest.put(route, options);
					await msg.reply({ content: `refreshed all commands for guild ${guildId}` });
				}
				catch (error) {
					console.error(error);
				}
			}
		}
		else if (msg.content === 'fetch classes') {
			classFetch.fetchAndParse();
			await msg.reply({ content: `pulled all classes into the csv!` });
		}
	}
}

module.exports = { ModularClient };