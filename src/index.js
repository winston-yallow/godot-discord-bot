const { ModularClient } = require('./lib/client');
const path = require('node:path');

const config = require('./config');

// TODO: Config file should also specify the units to load
const client = new ModularClient(config);
client.loadAllUnits(path.join(__dirname, 'units'));
client.login();