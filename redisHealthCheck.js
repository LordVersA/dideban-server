const { promisify } = require("util");
const { exec } = require("child_process");

const checkRedisHealth = async () => {
    const message = { enable: true, connection: false, query: false };
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisCliCommand = redisPassword ? `redis-cli -a ${redisPassword} ping` : "redis-cli ping";

    try {
        const redisCliPing = promisify(exec)(redisCliCommand);
        const { stdout } = await redisCliPing;
        message.connection = true;
        if (stdout.trim() === "PONG") {
            message.query = true;
            return message;
        } else {
            return message;
        }
    } catch (error) {
        return error;
    }
};

module.exports = checkRedisHealth;