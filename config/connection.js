const { Pool } = require("pg"); // interact with database 
require("dotenv").config(); // refers to env configuration


const pool = new Pool(
  {
    user: process.env.DB_NAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: "employees_db",
  },
  console.log("Connected to the employees_db database")
);

pool.connect();

module.exports = pool;
