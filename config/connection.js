const { Pool } = require("pg"); // interact with database
require("dotenv").config(); // refers to env configuration

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // host: process.env.HOST,
  database: process.env.DB_NAME,
});

pool
  .connect()
  .then(() => console.log("Connected to the employees_db database"))
  .catch((err) => console.error("Connection error", err.stack));

module.exports = pool;
