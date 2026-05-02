const {Pool} = require("pg");

const pool = new Pool({
  connectionString : process.env.DATABASE_URL,
  ssl: {rejectUnauthorized : false}
});

pool.connect()
.then(() => console.log("Db connected"))
.catch(err => console.error("not connected POSTGRES",err.message));

module.exports  = pool;

