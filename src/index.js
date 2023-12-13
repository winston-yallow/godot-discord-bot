const { ModularClient } = require('./lib/client');

const config = require('./config');

// TODO: Config file should also specify the units to load
const client = new ModularClient(config);
client.login();