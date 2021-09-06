const fs = require('fs');
const path = require('path');

const createUserSessionData = (userDir = []) => {
    const result = [];
    if (userDir.length < 1)  {
        return result;
    }
    for (const { user, pathToDir } of userDir) {
        for (const session of fs.readdirSync(pathToDir)) {
            result.push({
                user,
                session,
                pathToFile: path.join(pathToDir, session)
            });
        }
    }
    return result;
};

const createEnvironmentVariables = () => {
    const ML_MODELS_DIR = path.join(__dirname, '../dist/models');
    const JPEG_TRAINING_DATA_DEST_DIR = path.join(__dirname, '../dist/training_files/jpeg');
    const JPEG_TEST_DATA_DEST_DIR = path.join(__dirname, '../dist/test_files/jpeg');
    const TRAINING_DATA_DIR = path.join(__dirname, '../data/Mouse-Dynamics-Challenge/training_files');
    const TEST_DATA_DIR = path.join(__dirname, '../data/Mouse-Dynamics-Challenge/test_files');
    const TRAINING_DATA_USER_DIR = fs.readdirSync(TRAINING_DATA_DIR).map(user => ({
        user,
        pathToDir: path.join(TRAINING_DATA_DIR, user),
    }));
    const TEST_DATA_USER_DIR = fs.readdirSync(TEST_DATA_DIR).map(user => ({
        user,
        pathToDir: path.join(TEST_DATA_DIR, user),
    }));
    const TRAINING_DATA_USER_SESSION_FILES = createUserSessionData(TRAINING_DATA_USER_DIR);
    const TEST_DATA_USER_SESSION_FILES = createUserSessionData(TEST_DATA_USER_DIR)

    const NUMBER_OF_DATA = process.env.NUMBER_OF_DATA || 20000;

    return {
        NUMBER_OF_OPERATIONS: process.env.NUMBER_OF_OPERATIONS || 100,
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
        ML_MODELS_DIR,
        NUMBER_OF_DATA,
        NUMBER_OF_TRAINING_DATA: Math.floor(0.50 * NUMBER_OF_DATA),
        NUMBER_OF_TEST_DATA: Math.floor(0.50 * NUMBER_OF_DATA),
        PROBABILITY_OF_DATA_AUGMENTATION: 0.5,
    };
};

module.exports = createEnvironmentVariables();