const _ = require('lodash');
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
    NUMBER_OF_TRAINING_DATA,
    NUMBER_OF_TEST_DATA,
    IGNORE_RATIO,
} = require('../config/environment-variables');
const { getMemoryUsage } = require('./utils');

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

const createDataSet = (pathToDirectory = JPEG_TRAINING_DATA_DEST_DIR, dataSize) => {
    const users = fs.readdirSync(JPEG_TRAINING_DATA_DEST_DIR);
    if (!users.includes(LEGAL_USER)) {
        throw new Error('invalid user');
    }

    let userImageTupleList = [];

    for (const user of users) {
        const images = fs.readdirSync(path.join(pathToDirectory, user))
        for (const image of images) {
            const relativePath = `${user}/${image}`;
            userImageTupleList.push([
                relativePath,
                LEGAL_USER === user ? 0 : 1,
            ]);
        }
    }

    userImageTupleList = _.shuffle(userImageTupleList)

    if (dataSize && userImageTupleList.length < 2 * dataSize) {
        throw Error('images are less than the provided dataSize');
    }

    let countOfLegalUsers = 0;
    let countOfIllegalUsers = 0;
    const data = [];
    const labels = [];

    while (userImageTupleList.length > 0) {
        const [imagePath, label] = userImageTupleList.pop();
        if (dataSize && countOfLegalUsers >= dataSize && countOfIllegalUsers >= dataSize) {
            break;
        }
        if (dataSize && label === 0 && countOfLegalUsers >= dataSize) {
            continue;
        }
        if (dataSize && label === 1 && countOfIllegalUsers >= dataSize) {
            continue;
        }
        const imageBuffer = fs.readFileSync(`${pathToDirectory}/${imagePath}`);
        data.push(tf.node.decodeJpeg(imageBuffer));
        labels.push(label);
        label === 0 ? countOfLegalUsers++ : countOfIllegalUsers++;
    }

    const xs = tf.stack(data);
    const yx = tf.oneHot(tf.tensor1d(labels, 'int32'), 2);

    console.log(`
_________________________________________________________________
Data Set Dir: ${pathToDirectory}
Legal User: ${LEGAL_USER}
Size of Legal Users: ${countOfLegalUsers}
Size of Illegal Users: ${countOfIllegalUsers}
Memory Usage: ${getMemoryUsage()}MB
_________________________________________________________________
    `);
    return [
        xs,
        yx,
    ];
};

const train = async (model) => {
    const trainDataSize = IGNORE_RATIO ? undefined : NUMBER_OF_TRAINING_DATA;
    const testDataSize = IGNORE_RATIO ? undefined : NUMBER_OF_TEST_DATA;
    // Returns T0 and T1 where T0 + T1 = 30,600
    const [trainXs, trainYs] = createDataSet(JPEG_TRAINING_DATA_DEST_DIR, trainDataSize);
    // Returns T0' and T1' where T0' + T1' = 5,400
    const [testXs, testYs] = createDataSet(JPEG_TEST_DATA_DEST_DIR, testDataSize);
    console.log('Start model training');
    await model.fit(trainXs, trainYs, {
        validationData: [testXs, testYs],
        batchSize: BATCH_SIZE,
        epochs: 10,
        // shuffle: true,
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