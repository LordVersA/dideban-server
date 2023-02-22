const { spawn } = require("child_process");
require("dotenv").config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;

const checkMysqlHealth = async () => {
    const message = { enable: true, connection: false, query: false };
    const command = `mysqladmin ping -h ${host} -u ${user} -p${password}`;

    return new Promise((resolve, reject) => {
        const child = spawn(command, { shell: true });
        let output = "";

        child.stdout.on("data", (data) => {
            output += data;
        });

        child.on("exit", (code) => {
            if (code !== 0) {
                console.log(`child process exited with code ${code}`);
                resolve(message);
            } else {
                const response = output.trim();
                console.log(response);
                if (response.includes("mysqld is alive")) {
                    message.connection = true;
                    message.query = true;
                    resolve(message);
                } else {
                    message.connection = true;
                    resolve(message);
                }
            }
        });
    });
};
module.exports = checkMysqlHealth;
