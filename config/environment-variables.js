const fs = require('fs');
const path = require('path');

const createEnvironmentVariables = () => {
    const JPEG_TRAINING_DATA_DEST_DIR = path.join(__dirname, '../dist/training_files/jpeg');
    const JPEG_TEST_DATA_DEST_DIR = path.join(__dirname, '../dist/test_files/jpeg');
    const TRAINING_DATA_DIR = path.join(__dirname, '../data/Mouse-Dynamics-Challenge/training_files');
    const TEST_DATA_DIR = path.join(__dirname, '../data/Mouse-Dynamics-Challenge/test_files');
    const TRAINING_DATA_USER_DIR = fs.readdirSync(TRAINING_DATA_DIR).map(user => ({
        user,
        isForTraining: true,
        pathToDir: path.join(TRAINING_DATA_DIR, user),
    }));
    const TEST_DATA_USER_DIR = fs.readdirSync(TEST_DATA_DIR).map(user => ({
        user,
        pathToDir: path.join(TEST_DATA_DIR, user),
    }));
    const TRAINING_DATA_USER_SESSION_FILES = [];
    const TEST_DATA_USER_SESSION_FILES = [];
    for (const { user, isForTraining, pathToDir } of [...TRAINING_DATA_USER_DIR, ...TEST_DATA_USER_DIR]) {
        for (const session of fs.readdirSync(pathToDir)) {
            if (isForTraining) {
                TRAINING_DATA_USER_SESSION_FILES.push({
                    user,
                    session,
                    isForTraining,
                    pathToFile: path.join(pathToDir, session)
                });
            } else {
                TEST_DATA_USER_SESSION_FILES.push({
                    user,
                    session,
                    pathToFile: path.join(pathToDir, session)
                });
            }
        }
    }

    return {
        NUMBER_OF_OPERATIONS: process.env.NUMBER_OF_OPERATIONS || 500,
        JPEG_IMAGE_WIDTH: 100,
        JPEG_IMAGE_HEIGHT: 100,
        JPEG_IMAGE_CHANNELS: 3,
        LEGAL_USER: process.env.LEGAL_USER || 'user7',
        JPEG_TRAINING_DATA_DEST_DIR,
        TRAINING_DATA_DIR,
        TRAINING_DATA_USER_DIR,
        TRAINING_DATA_USER_SESSION_FILES,
        JPEG_TEST_DATA_DEST_DIR,
        TEST_DATA_DIR,
        TEST_DATA_USER_DIR,
        TEST_DATA_USER_SESSION_FILES,
    };
};

module.exports = createEnvironmentVariables();