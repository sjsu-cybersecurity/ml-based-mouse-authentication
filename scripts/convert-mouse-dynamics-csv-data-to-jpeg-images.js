const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const csvParser = require('csv-parser');
const { EventEmitter } = require('events');
const {
    NUMBER_OF_OPERATIONS,
    TRAINING_DATA_USER_SESSION_FILES,
    JPEG_TRAINING_DATA_DEST_DIR,
} = require('../config/environment-variables');

const handleMove = (ctx, { x, y }, { x: prevX, y: prevY }) => {
    if (prevX === null || prevY === null) {
        return;
    }
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ff0000';
    ctx.stroke();
};

const handleClickAndDrag = (ctx, { state, x, y }, { state: prevState, x: prevX, y: prevY }) => {
    if (x !== prevX || y !== prevY) {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'yellow';
        ctx.stroke();
    }
    if (state === 'pressed' && prevState !== 'pressed') {
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.strokeStyle = 'blue';
        return ctx.stroke();
    }
    if (state === 'released') {
        ctx.beginPath();
        ctx.moveTo(x - 15, y - 15);
        ctx.lineTo(x + 15, y + 15);
        ctx.moveTo(x + 15, y - 15);
        ctx.lineTo(x - 15, y + 15);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 7;
        return ctx.stroke();
    }
};

const handleScroll = (ctx, { state, x, y }, { state: prevState, x: prevX, y: prevY }) => {
    if (prevX === 0 && prevY === 0) {
       return;
    }
    ctx.beginPath();
    ctx.moveTo(prevX - 20, prevY);
    ctx.lineTo(prevX + 20, prevY);
    if (state === 'up') {
        ctx.lineTo(prevX, prevY - 35);
    } else {
        ctx.lineTo(prevX, prevY + 35);
    }
    ctx.lineTo(prevX - 20, prevY);
    ctx.fillStyle = '#32a88b';
    ctx.strokeStyle = '#0b261f';
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.stroke();
};

const handleStay = (ctx, { x: prevX, y: prevY, stayTime }) => {
    ctx.fillStyle = 'rgba(255, 145, 253, 0.5)';
    const width = 10 * stayTime;
    ctx.fillRect(prevX - width / 2, prevY - width / 2, width, width);
};

const isStay = ({ state, x, y}, { state: prevState, x: prevX, y: prevY }) =>
    x === prevX && y === prevY;

const getMaxSizeAndHeight = (mouseOperations =[]) => {
    let xMax = 0;
    let yMax = 0;
    for (const { x, y } of mouseOperations) {
        xMax = Math.max(xMax, x);
        yMax = Math.max(yMax, y);
    }
    return { xMax, yMax };
};

const createJpegImageFromMouseOperations = async (mouseOperations = [], destPath) => {
    try {
        const { xMax, yMax } = getMaxSizeAndHeight(mouseOperations);
        const canvas = createCanvas(xMax + 20, yMax + 20);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let prev = {
            state: null,
            x: null,
            y: null,
            stayTime: 0,
        };
        for (const current of mouseOperations) {
            current.state = current.state.toLowerCase();
            current.x = parseInt(current.x);
            current.y = parseInt(current.y);
            const { state, x, y } = current;
            if (state === 'move') {
                handleMove(ctx, current, prev);
            } else if (state === 'pressed' || state === 'released' || state === 'drag') {
                handleClickAndDrag(ctx, current, prev);
            } else if (state === 'up' || state === 'down') {
                handleScroll(ctx, current, prev);
            }
            if (isStay(current, prev)) {
                prev.stayTime += 1;
            } else if (prev.stayTime > 0 && (!isStay(current, prev))) {
                handleStay(ctx, prev);
                prev.stayTime = 0;
            }
            prev.state = state;
            prev.x = x;
            prev.y = y;
        }
        const jpegImageBuffer = canvas.toBuffer('image/jpeg');
        fs.writeFileSync(destPath, jpegImageBuffer);
    } catch (err) {
        console.error(err.message, destPath);
    }
};

const main = async () => {
    const eventEmitter = new EventEmitter();

    eventEmitter.on('create-image', async ({ number, user, session, mouseOperations }) => {
        const imageFileName = `image-${number}.jpeg`;
        const destDir = path.join(JPEG_TRAINING_DATA_DEST_DIR, user, session);
        fs.mkdirSync(destDir, { recursive: true });
        const imgPath = path.join(destDir, imageFileName);
        await createJpegImageFromMouseOperations(mouseOperations, imgPath);
    });

    for (const { user, session, pathToFile } of TRAINING_DATA_USER_SESSION_FILES) {
        let chunkedMouseOperations = [];
        let number = 0;

        const handleCsvDataStream = async data => {
            if (data && chunkedMouseOperations.length < NUMBER_OF_OPERATIONS) {
                return chunkedMouseOperations.push(data);
            }
            eventEmitter.emit('create-image', {
                number,
                user,
                session,
                mouseOperations: chunkedMouseOperations,
            });
            number += 1;
            chunkedMouseOperations = [];
        };
        fs.createReadStream(pathToFile)
            .pipe(csvParser())
            .on('data', handleCsvDataStream)
            .on('end', handleCsvDataStream);
    }
};

main();