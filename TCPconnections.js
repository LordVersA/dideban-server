const { promisify } = require("util");
const { exec } = require("child_process");

const checkTCPConnections = async () => {
    const message = { enable: true, netstats_installed: false, established_count: null };

    try {
        const firewalldPing = promisify(exec)("netstat -ant | grep -i 'established' | grep ':80 |:443 ' | wc -l");
        const { stdout, stderr, error } = await firewalldPing;
        if (error) {
            return error;
        }

        if (stderr) {
            return stderr;
        }
        if (stdout.includes("command not found")) {
            return message;
        } else {
            message.netstats_installed = true;
        }
        message.established_count = stdout;

        return message;
    } catch (error) {
        return error;
    }
};

module.exports = checkTCPConnections;