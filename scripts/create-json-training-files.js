const fs = require('fs');
const path = require('path');
const csvToJson = require('csvtojson');

const main = async () => {
    try {
        const distDir = path.join(__dirname, '../dist');
        const baseDir = path.join(__dirname, '../data/Mouse-Dynamics-Challenge/training_files');
        const users = fs.readdirSync(baseDir);
        for (const user of users) {
            const userDir = path.join(baseDir, user);
            const distUserDir = path.join(distDir, 'data/training_files', user);
            const sessions = fs.readdirSync(userDir);
            fs.mkdirSync(distUserDir, { recursive: true });
            for (const session of sessions) {
                const sessionFile = path.join(userDir, session);
                const sessionJsonData = await csvToJson().fromFile(sessionFile)
                fs.writeFileSync(path.join(distDir, 'data/training_files', user, `${session}.json`), JSON.stringify(sessionJsonData));
            }
        }
    } catch (err) {
        console.error(err);
    }
};

main();