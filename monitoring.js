const express = require("express");
const app = express();

const si = require("systeminformation");
require("dotenv").config();
app.get("/", async (req, res) => {
    try {
        if (!req.headers["auth"] || req.headers["auth"] != process.env.password) {
            return res.status(404).send("Not Found");
        }
        const newEvent = {
            type: "global",
            mysql: { enable: false, connection: false, query: false },
            redis: { enable: false, connection: false, query: false },
            time: si.time(),
            mem: null,
            currentLoad: null,
            fsSize: null,
            networkStats: null,
            timezone: getSystemTimeZone(),
        };

        const [mem, currentLoad, fsSize, networkStats, redis, mysql] = await Promise.all([
            si.mem(),
            si.currentLoad(),
            si.fsSize(),
            si.networkStats(),
            +req.query.redis == 1 ? await checkRedisHealth() : null,
            +req.query.mysql == 1 ? await checkMysqlHealth() : null,
        ]);

        newEvent.mem = mem;
        newEvent.currentLoad = currentLoad;
        newEvent.fsSize = fsSize;
        newEvent.networkStats = networkStats;
        if (mysql) {
            newEvent.mysql = mysql;
        }

        if (redis) {
            newEvent.redis = redis;
        }
        console.log(req.query);
        res.send(newEvent);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
const https = require("https");
const checkMysqlHealth = require("./mysqlHealthCheck");
const checkRedisHealth = require("./redisHealthCheck");
const { getSystemTimeZone } = require("./timezone");
const port = process.env.port || 6837;
app.listen(port, () => {
    https
        .get("https://api.ipify.org", (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                console.log(`Server listening on ${data}:${port}`);
            });
        })
        .on("error", (err) => {
            console.error(`Error getting IP address: port:${port}`);
        });
});
