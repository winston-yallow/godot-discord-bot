# Godot Discord Server Bot

A small discord bot written in JavaScript. It provides informational commands related
to the Godot server. It is primarly developed for the official godot discord server,
but can be used for other servers too.


## Setup

### Obtaining a Token
Please follow the [discord.js Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
for creating an application and getting a token.

### Configuring the Bot
Create a JSON file at `./src/bot-config.json` with the following content:
```json
{
    "clientId": "YOUR_CLIENT_ID",
    "token": "YOUR_TOKEN",
    "admins": []
}
```
Replace `YOUR_CLIENT_ID` and `TOKEN` with the correct values. The `"admins"` field is
a list of user IDs as strings. These users will have permission to refresh the slash
commands registered for the discord application. At the very least this list should
contain your own user ID.


## Running the Bot

### Node
If you have node and npm already on your system, you can install the needed packages
using `npm install`. After that you can run `node .` to start the bot.

You can also use nodemon to automatically restart the bot when you change the source
files. You don't need to install nodemon globally, instead just run the "dev" lifecycle
script: `npm run dev`

### Docker/Podman
Example for building and running the container:
```bash
podman build --tag godot-discord-bot .
podman run -it godot-discord-bot
```


## Usage

### Registering Commands
On the first run and whenver you add or remove commands (or their arguments), you need
to tell discord about these changes. To do so, send a private message "refresh commands"
to the bot. It will then run the update procedure.

### Using Commands
Type `/` into a message prompt on a server with the bot. It will show you a list of
all available commands with a small description each.