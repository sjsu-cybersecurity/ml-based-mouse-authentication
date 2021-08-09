require('@tensorflow/tfjs-node');
const tf = require('@tensorflow/tfjs');
const {
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

const train = async (model, [trainXs, trainYs, testXs, testYs] = []) => {/* WIP */};

const main = async () => {
    const model = getModel();
    model.summary();
    await train(model);
};

main();