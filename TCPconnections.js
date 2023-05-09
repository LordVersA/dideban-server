const { promisify } = require("util");
const { exec } = require("child_process");

const checkTCPConnections = async () => {
    const message = { enable: true, netstats_installed: false, established_count: null };

    try {
        const tcpPing = promisify(exec)("netstat -ant | grep -i 'established' | grep ':80 |:443 ' | wc -l");
        const { stdout, stderr, error } = await tcpPing;
        return { stdout, stderr, error };
        if ((error = error + stderr)) {
            if (!error.includes("command not found")) {
                message.netstats_installed = true;
            } else {
                return message;
            }
        }
        message.established_count = stdout;

        return message;
    } catch (error) {
        return message;
    }
};

module.exports = checkTCPConnections;
