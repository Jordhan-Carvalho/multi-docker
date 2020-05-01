import keys from "./keys";

// *** Express app Setup
import express from "express";
import cors from "cors";

const app = express();

// Enabling cors for all request in all routes
app.use(cors());
app.use(express.json());

// *** Postgres Client Setup
import { Pool } from "pg";

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgDatabase,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: parseInt(keys.pgPort as string),
});

pgClient.on("error", () => console.log("Lost PG connection"));
// The name of the table will be values and will store  a single column number
pgClient
  .query("CREATE TABLE IF NOT EXISTS values (number INT)")
  .catch((e) => console.log(e));

// *** Redis Client Setup
import redis, { RetryStrategyOptions } from "redis";

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: parseInt(keys.redisPort as string),
  // if fail, try again in 1 second
  retry_strategy: (options: RetryStrategyOptions): number | Error => {
    return 1000;
  },
});
const redisPublisher = redisClient.duplicate();

// *** Express routes handlers

app.get("/", (req, res) => {
  res.send("Hi");
});

// Reach pg
app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");

  res.send(values.rows);
});

// Reach redis
app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (e, values) => {
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  redisClient.hset("values", index, "Nothing yet");
  // wake up the worker process
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

app.listen(5000, (e) => {
  console.log("Listening on port 5000");
});
