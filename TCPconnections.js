const { promisify } = require("util");
const { exec } = require("child_process");

const checkTCPConnections = async () => {
    const message = { enable: true, netstats_installed: false, established_count: null };

    try {
        const tcpPing = promisify(exec)("netstat -ant | grep -i 'established' | grep ':80 |:443 ' | wc -l");
        const { stdout, stderr, error } = await tcpPing;
        if (error || stderr) {
            return message;
        }
        if ((error + stderr + stdout).includes("command not found")) {
            return message;
        } else {
            message.netstats_installed = true;
        }
        message.established_count = +stdout.replace("\n", "");

        return message;
    } catch (error) {
        return message;
    }
};

module.exports = checkTCPConnections;
