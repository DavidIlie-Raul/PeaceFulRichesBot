const { Client } = require("pg");
require("dotenv").config();

const dbclient = new Client({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASS,
});
async function connect() {
  try {
    await dbclient.connect();
    console.log("Connected to PostgreSQL DB");
  } catch (err) {
    console.error("An error occurred while connecting to PostgreSQL DB", err);
  }

  dbclient.on("error", (err) => {
    console.error(
      "An error regarding PostgreSQL has occurred, check connection",
      err.stack
    );
  });
}

module.exports = { connect, dbclient };
