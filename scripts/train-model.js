const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const {
    ML_MODELS_DIR,
    JPEG_TRAINING_DATA_DEST_DIR,
    JPEG_TEST_DATA_DEST_DIR,
    JPEG_IMAGE_WIDTH,
    JPEG_IMAGE_HEIGHT,
    JPEG_IMAGE_CHANNELS,
    LEGAL_USER,
} = require('../config/environment-variables');

const LEARNING_RATE = 0.01;
const BETA1 = 0.9;
const BETA2 = 0.999;
const EPSILON = 1e-8;
const BATCH_SIZE = 512;

const getModel = () => {
    const model = tf.sequential();
    const optimizer = tf.train.adam(LEARNING_RATE, BETA1, BETA2, EPSILON);
    // 1st conv layer
    model.add(tf.layers.conv2d({
        inputShape: [JPEG_IMAGE_WIDTH, JPEG_IMAGE_HEIGHT, JPEG_IMAGE_CHANNELS],
        kernelSize: 3,
        filters: 32,
        strides: 1,
        activation: 'relu',
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
    // 2nd conv layer
    model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 64,
        strides: 1,
        activation: 'relu',
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
    // 3rd conv layer
    model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 128,
        strides: 1,
        activation: 'relu',
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
    // 4th conv layer
    model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 128,
        strides: 1,
        activation: 'relu',
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    model.add(tf.layers.flatten());

    // 5th fully-connected layer
    model.add(tf.layers.dense({
        units: 1024,
        activation: 'relu',
    }));
    model.add(tf.layers.dropout({
       rate: 0.5,
    }));
    // 6th fully-connected layer
    model.add(tf.layers.dense({
        units: 512,
        activation: 'relu',
    }));
    model.add(tf.layers.dropout({
        rate: 0.5,
    }));
    // 7th fully-connected layer
    model.add(tf.layers.dense({
        units: 2,
        activation: 'relu',
    }));
    model.compile({
        optimizer,
        loss: "binaryCrossentropy",
        metrics: ['accuracy'],
    });
    return model;
};

const createDataSet = (pathToDirectory = JPEG_TRAINING_DATA_DEST_DIR) => {
    const users = fs.readdirSync(JPEG_TRAINING_DATA_DEST_DIR);
    if (!users.includes(LEGAL_USER)) {
        throw new Error('invalid user');
    }
    const data = [];
    const labels = [];
    let legalUserDataCount = 0;
    let illegalUserDataCount = 0;
    for (const user of users) {
        const images = fs.readdirSync(path.join(pathToDirectory, user))
        for (const image of images) {
            const imageBuffer = fs.readFileSync(path.join(pathToDirectory, user, image));
            const label = user === LEGAL_USER ? 0 : 1;
            user === LEGAL_USER ? legalUserDataCount++ : illegalUserDataCount++;
            data.push(tf.node.decodeJpeg(imageBuffer));
            labels.push(label);
        }
    }
    console.log(`
_________________________________________________________________
Data Set Dir: ${pathToDirectory}
Legal User: ${LEGAL_USER}
Size of User Data: ${legalUserDataCount + illegalUserDataCount}
Size of Legal User Data: ${legalUserDataCount}
Size of Illegal User Data: ${illegalUserDataCount}
_________________________________________________________________
    `);
    const xs = tf.stack(data);
    const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), 2);
    return [xs, ys];
};

const train = async (model) => {
    const [trainXs, trainYs] = createDataSet(JPEG_TRAINING_DATA_DEST_DIR);
    const [testXs, testYs] = createDataSet(JPEG_TEST_DATA_DEST_DIR);
    console.log('Start model training');
    await model.fit(trainXs, trainYs, {
        validationData: [testXs, testYs],
        batchSize: BATCH_SIZE,
        epochs: 10,
        shuffle: true,
    });
    fs.mkdirSync(ML_MODELS_DIR, { recursive: true });
    await model.save(`file:///${ML_MODELS_DIR}/${LEGAL_USER}`);
};

const main = async () => {
    const model = getModel();
    model.summary();
    await train(model);
};

main();