const { ModularClient } = require('./lib/client');

const config = require('./config');

const client = new ModularClient(config);
client.login();
