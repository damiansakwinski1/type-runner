const config = require("../config/db.static");
const { Client } = require("pg");
const db = new Client(config);

module.exports = db;
