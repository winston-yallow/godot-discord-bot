const { ModularClient } = require('./lib/client');
const path = require('node:path');

// TODO: Use js file for constants and include it in type checks
const config = require('./bot-config.json');

// TODO: Config file should also specify the units to load
const client = new ModularClient(config);
client.loadAllUnits(path.join(__dirname, 'units'));
client.login();