const config = require("../config/db.static");
const { Pool } = require("pg");
const pool = new Pool({
  ...config,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const db = pool.connect().then(client => client);

module.exports = db;
