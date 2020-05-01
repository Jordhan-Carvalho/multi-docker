import keys from "./keys";
import redis, { RetryStrategyOptions } from "redis";

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: parseInt(keys.redisPort as string),
  // if fail, try again in 1 second
  retry_strategy: (options: RetryStrategyOptions): number | Error => {
    return 1000;
  },
});
const sub = redisClient.duplicate();

// FIB recursive solution... We are using it because its very slow, so we have a reason to use redis and a separate worker process
const fib = (index: number): number => {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
};

// everytime we get a new message run this callback function
sub.on("message", (channel, message) => {
  redisClient.hset("values", message, fib(parseInt(message)).toString());
});
sub.subscribe("insert");
