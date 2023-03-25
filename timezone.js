const { execSync } = require("child_process");

const getSystemTimeZone = () => {
    if (process.platform === "win32") {
        try {
            const output = execSync('systeminfo | findstr "Time\\ Zone"').toString().trim();
            const timezone = output.replace("Time Zone:", "").trim();
            return timezone;
        } catch (e) {
            return null;
        }
    } else {
        try {
            const output = execSync("timedatectl").toString();
            const match = output.match(/Time zone: ([^\s]+) \(([\+\-\d:]+), ([\+\-\d:]+)\)/);
            if (match) {
                return `${match[1]} (${match[2]}, ${match[3]})`;
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    }
};
module.exports.getSystemTimeZone = getSystemTimeZone;
