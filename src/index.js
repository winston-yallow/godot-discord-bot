const { ModularClient } = require('./lib/client');

const config = require('./instance/config');

const client = new ModularClient(config);
client.login();
