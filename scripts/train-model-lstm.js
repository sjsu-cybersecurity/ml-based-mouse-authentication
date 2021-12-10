const tf = require("@tensorflow/tfjs-node")

const splitSequence = (sequence, nSteps) => {
    const x = []
    const y = []
    for (let i = 0; i < sequence.length; i++) {
        const endIndex = i + nSteps;
        if (endIndex >= sequence.length) {
            break;
        }
        const seqX = []
        for (let j = i; j < endIndex; j++) {
            seqX.push(sequence[j]);
        }
        x.push(seqX);
        y.push(sequence[endIndex]);
    }
    return [
        tf.reshape(x, [x.length, x[0].length, 1]),
        tf.tensor1d(y)
    ]
};

const getModel = (nSteps) => {
    const model = tf.sequential();
    model.add(tf.layers.lstm({
        activation: "relu",
        inputShape: [nSteps, 1],
        units: 50,
    }))
    model.add(tf.layers.dense({
        units: 1,
        activation: 'relu',
    }));
    model.compile({
        optimizer: "adam",
        loss: tf.metrics.meanSquaredError,
        // loss: "mse",
        metrics: ['accuracy'],
    });
    return model;
};

/**
 * Reference: https://machinelearningmastery.com/how-to-develop-lstm-models-for-time-series-forecasting/
 */
const main = async ()=> {
    const nSteps = 3;
    const rawSeq = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const [trainX, trainY] = splitSequence(rawSeq, nSteps);
    const model = getModel(nSteps);
    await model.fit(trainX, trainY, {
        epochs: 200,
    })
    const rawTestX = [70, 80, 90];
    const testX = tf.reshape(rawTestX, [1, nSteps, 1]);
    const predictedY = await model.predict(testX);
    const result = Array.from(await predictedY.data());
    console.log(result);
};

main();