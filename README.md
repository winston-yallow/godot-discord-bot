# Godot Discord Server Bot

A small discord bot written in JavaScript. It provides informational commands related
to the Godot server. It is primarly developed for the official godot discord server,
but can be used for other servers too.


## Setup

### Obtaining a Token
Please follow the [discord.js Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
for creating an application and getting a token.

### Configuring the Bot
Create a JavaScript file at `./src/config.js` with the following content:
```js
/** @type {import('./lib/client').ModularClientConfig} */
const config = {
    clientId: 'CLIENT_ID',
    token: 'TOKEN',
    units: '*.js',
    unitsIgnore: ['ping.js'],
    admins: [],
    guilds: [],
};

module.exports = config;
```
Replace `CLIENT_ID` and `TOKEN` with the correct values. The `"admins"` field is
a list of user IDs as strings. These users will have permission to refresh the slash
commands registered for the discord application. At the very least this list should
contain your own user ID.
The `"guilds"` field should list all guild IDs that the commands should be registered
in.


## Running the Bot

### Node
If you have node and npm already on your system, you can install the needed packages
using `npm install`. After that you can run `node .` to start the bot.

You can also use nodemon to automatically restart the bot when you change the source
files. You don't need to install nodemon globally, instead just run the "dev" lifecycle
script: `npm run dev`

### Docker/Podman
The Containerfile uses multiple stages. By default a production build is generated.

You can instead build with `--target bot-dev` to get a container with nodemon to
automatically restart the bot when the source files change.

The development container expects you to mount the host `./src` directory into the
container at `/home/bot/src` so that nodemon can monitor changes.

Example for building and running the dev container:
```bash
podman build --target bot-dev --tag godot-discord-bot .
podman run -v ./src:/home/bot/src -it godot-discord-bot
```

Since the source files are mounted into the container, you don't need to rebuild the
container image often. An explicit rebuild is only needed when the dependencies are
updated.


## Usage

### Registering Commands
On the first run and whenver you add or remove commands (or their arguments), you need
to tell discord about these changes. To do so, send a private message "refresh commands"
to the bot. It will then run the update procedure.

### Using Commands
Type `/` into a message prompt on a server with the bot. It will show you a list of
all available commands with a small description each.


## Contributing

### Code Structure
The code is organized into "Units". A unit is basically a collection of commands that
belong together. Have a look at the files in `./src/units` to get an overview.

These unit files get dynamically loaded by the modular client class. Basically
everything in `.src/lib` is the backbone used for loading and running the unit
files.