const { promisify } = require("util");
const { exec } = require("child_process");
const fs = require("node:fs");

const checkFirewallStatus = async () => {
    const message = { enable: true, installed: false, active: false };

    message.installed = fs.existsSync("/usr/sbin/firewalld");

    try {
        const firewalldPing = promisify(exec)("systemctl status firewalld");
        const { stdout, stderr, error } = await firewalldPing;
        if (error) {
            return message;
        }

        if (stderr) {
            return message;
        }

        const isFirewalldRunning = stdout.includes("Active: active");

        if (isFirewalldRunning) {
            message.enable = true;
        }
        return message;
    } catch (error) {
        return message;
    }
};

module.exports = checkFirewallStatus;
