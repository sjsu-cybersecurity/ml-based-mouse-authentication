const fs = require('fs');
const sharp = require('sharp');
const {
    NUMBER_OF_TRAINING_DATA,
    NUMBER_OF_TEST_DATA,
    JPEG_TRAINING_DATA_DEST_DIR,
    JPEG_TEST_DATA_DEST_DIR,
    PROBABILITY_OF_DATA_AUGMENTATION,
} = require('../config/environment-variables');

const rotateImageByDegrees = async (imageBuffer, degrees) =>
    await sharp(imageBuffer).rotate(degrees).toBuffer();

const getRandomDegrees = () => {
    const rotateDegrees = [90, 180, 270];
    return rotateDegrees[Math.floor(Math.random() * rotateDegrees.length)]
};

const augmentDataset = async (pathToDir, maxSize) => {
    try {
        const users = fs.readdirSync(pathToDir);
        for (const user of users) {
            const images = fs.readdirSync(`${pathToDir}/${user}`);
            let numberOfDataset = images.length;
            console.log(`
Started augmenting ${user}'s data in ${pathToDir}
- Start size: ${numberOfDataset}
- Target size: ${maxSize}
`);
            if (numberOfDataset >= maxSize) {
                console.log(`Skip augmenting ${user}'s data - already max size.`);
                continue;
            }
            let i = 0;
            while (i < images.length && numberOfDataset < maxSize) {
                const shouldAugment = Math.random() < PROBABILITY_OF_DATA_AUGMENTATION;
                const image = images[i];
                /**
                 * If the dataset size if still less than the max size,
                 * re-iterate the original image set to augment the data further
                 */
                i === images.length - 1 ? i = 0 : i++;
                if (!shouldAugment) {
                    continue;
                }
                const imageBuffer = fs.readFileSync(`${pathToDir}/${user}/${image}`);
                const degrees = getRandomDegrees();
                const rotatedImageBuffer = await rotateImageByDegrees(imageBuffer, degrees);
                const imageName = image.split('.')[0];
                fs.writeFileSync(
                    `${pathToDir}/${user}/${imageName}-aug-${numberOfDataset}.jpeg`,
                    rotatedImageBuffer
                );
                numberOfDataset += 1;
            }
            console.log(`
Completed augmenting ${user}'s data in ${pathToDir}
- Final size: ${numberOfDataset} 
            `);
        }
    } catch (e) {
        console.log(`Failed augmenting data, ${e.message}`);
    }
};

const augmentDatasetByFlipAndFlop = async (pathToDir) => {
    const users = fs.readdirSync(pathToDir);
    for (const user of users) {
        const images = fs.readdirSync(`${pathToDir}/${user}`);
        for (const image of images) {
            const imageName = image.split('.')[0];
            const imageBuffer = fs.readFileSync(`${pathToDir}/${user}/${image}`);
            const flippedImageBuffer = await sharp(imageBuffer).flip().toBuffer();
            fs.writeFileSync(
                `${pathToDir}/${user}/${imageName}-aug-flip.jpeg`,
                flippedImageBuffer,
            );
            const floppedImageBuffer = await sharp(imageBuffer).flop().toBuffer();
            fs.writeFileSync(
                `${pathToDir}/${user}/${imageName}-aug-flop.jpeg`,
                floppedImageBuffer,
            );
        }
    }
};

const main = async () => {
    await Promise.all([
        /*
        augmentDatasetByFlipAndFlop(JPEG_TRAINING_DATA_DEST_DIR),
        augmentDatasetByFlipAndFlop(JPEG_TEST_DATA_DEST_DIR),
         */
        augmentDataset(JPEG_TRAINING_DATA_DEST_DIR, NUMBER_OF_TRAINING_DATA),
        augmentDataset(JPEG_TEST_DATA_DEST_DIR, NUMBER_OF_TEST_DATA),
    ]);
};

main();