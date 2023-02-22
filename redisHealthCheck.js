const { promisify } = require("util");
const { exec } = require("child_process");

const checkRedisHealth = async () => {
    const message = { enable: true, connection: false, query: false };

    try {
        const redisCliPing = promisify(exec)("redis-cli ping");
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
