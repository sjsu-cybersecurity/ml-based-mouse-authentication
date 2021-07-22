const fs = require('fs');
const path = require('path');

const createEnvironmentVariables = () => {
    const JPEG_TRAINING_DATA_DEST_DIR = path.join(__dirname, '../dist/training_files/jpeg');
    const TRAINING_DATA_DIR = path.join(__dirname, '../data/Mouse-Dynamics-Challenge/training_files');
    const TRAINING_DATA_USER_DIR = fs.readdirSync(TRAINING_DATA_DIR).map(user => ({
        user,
        pathToDir: path.join(TRAINING_DATA_DIR, user),
    }));
    const TRAINING_DATA_USER_SESSION_FILES = [];
    for (const { user, pathToDir } of TRAINING_DATA_USER_DIR) {
        for (const session of fs.readdirSync(pathToDir)) {
            TRAINING_DATA_USER_SESSION_FILES.push({
                user,
                session,
                pathToFile: path.join(pathToDir, session)
            });
        }
    }

    return {
        NUMBER_OF_OPERATIONS: process.env.NUMBER_OF_OPERATIONS || 100,
        TRAINING_DATA_DIR,
        TRAINING_DATA_USER_DIR,
        TRAINING_DATA_USER_SESSION_FILES,
        JPEG_TRAINING_DATA_DEST_DIR,
    };
};

module.exports = createEnvironmentVariables();