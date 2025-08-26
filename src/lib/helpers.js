const { EmbedBuilder } = require('discord.js');

/**
 * EmbedBuilder subclass with default godot style
 */
class GodotEmbedBuilder extends EmbedBuilder {
	/**
	 * Creates a new embed builder that uses the Godot blue color
	 * and includes a timestamp.
	 */
	constructor() {
		super();
		this.setColor(0x458dc0);
	}
}

module.exports = { GodotEmbedBuilder };