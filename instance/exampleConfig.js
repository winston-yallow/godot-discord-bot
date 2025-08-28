// Example Configuration file for godot bot. Copy this file or change it's name to config.js to use it.
// Remember to edit the files CLIENT_ID, TOKEN, GUILD_ID, etc.
// admins should have at least your own user ID.
/** @type {import('./lib/client').ModularClientConfig} */
const config = {
	clientId: 'CLIENT_ID',
	token: 'TOKEN',
	admins: [],
	docVersions: {
		'3': { displayName: 'Godot 3 (LTS)', urlFragment: '3.6' },
		'4': { displayName: 'Godot 4 (stable)', urlFragment: 'stable' },
	},
	guildConfigs: {
		'GUILD_ID': { modChannel: 'CHANNEL_ID', modRole: 'ROLE_ID' },
	},
};

module.exports = config;