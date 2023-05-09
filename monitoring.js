const express = require("express");
const app = express();
const https = require("https");
const checkMysqlHealth = require("./mysqlHealthCheck");
const checkRedisHealth = require("./redisHealthCheck");
const { getSystemTimeZone } = require("./timezone");
const checkTCPConnections = require("./TCPconnections");
const checkFirewallStatus = require("./firewall");
const port = process.env.port || 6837;

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
            firewall: { enable: true, installed: false, active: false },
            tcp: { enable: true, netstats_installed: false, established_count: null },
            time: si.time(),
            mem: null,
            currentLoad: null,
            fsSize: null,
            networkStats: null,
            timezone: getSystemTimeZone(),
        };

        const [mem, currentLoad, fsSize, networkStats, redis, mysql, firewall, tcp] = await Promise.all([
            si.mem(),
            si.currentLoad(),
            si.fsSize(),
            si.networkStats(),
            +req.query.redis == 1 ? await checkRedisHealth() : null,
            +req.query.mysql == 1 ? await checkMysqlHealth() : null,
            +req.query.firewall == 1 ? await checkFirewallStatus() : null,
            +req.query.tcp == 1 ? await checkTCPConnections() : null,
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

        if (firewall) {
            newEvent.firewall = firewall;
        }

        if (tcp) {
            newEvent.tcp = tcp;
        }

        console.log(req.query);
        res.send(newEvent);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.listen(port, async () => {
    console.log(await checkFirewallStatus());

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
