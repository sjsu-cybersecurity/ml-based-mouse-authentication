const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');

const mouseOperations = [
    {
        state: "move",
        x: 10,
        y: 10,
    },
    {
        state: "move",
        x: 20,
        y: 40,
    },
    {
        state: "move",
        x: 40,
        y: 234,
    },
    {
        state: "move",
        x: 430,
        y: 337,
    },
    {
        state: "pressed",
        x: 430,
        y: 337
    },
    {
        state: "drag",
        x: 200,
        y: 327
    },
    {
        state: "drag",
        x: 250,
        y: 257
    },
    {
        state: "released",
        x: 430,
        y: 200
    },
    {
        state: "down",
        x: 200,
        y: 200,
    },
    {
        state: "up",
        x: 200,
        y: 250,
    },
    {
        state: "move",
        x: 100,
        y: 100,
    },
    {
        state: "move",
        x: 100,
        y: 100,
    },
    {
        state: "move",
        x: 100,
        y: 100,
    },
    {
        state: "move",
        x: 250,
        y: 100,
    },
    {
        state: "move",
        x: 250,
        y: 100,
    },
    {
        state: "pressed",
        x: 250,
        y: 100
    },
];

const handleMove = (ctx, { x, y }, { x: prevX, y: prevY }) => {
    if (prevX === null || prevY === null) {
        return;
    }
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff0000';
    ctx.stroke();
};

const handleClickAndDrag = (ctx, { state, x, y }, { state: prevState, x: prevX, y: prevY }) => {
    if (x !== prevX || y !== prevY) {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'yellow';
        ctx.stroke();
    }
    if (state === 'pressed' && prevState !== 'pressed') {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.strokeStyle = 'blue';
        return ctx.stroke();
    }
    if (state === 'released') {
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 3;
        return ctx.stroke();
    }
};

const handleScroll = (ctx, { state, x, y }) => {
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    if (state === 'up') {
        ctx.lineTo(x, y - 20);
    } else {
        ctx.lineTo(x, y + 20);
    }
    ctx.lineTo(x - 10, y);
    ctx.fillStyle = '#32a88b';
    ctx.strokeStyle = '#0b261f';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
};

const handleStay = (ctx, { x: prevX, y: prevY, stayTime }) => {
    ctx.fillStyle = 'rgba(255, 145, 253, 0.5)';
    const width = 10 * stayTime;
    ctx.fillRect(prevX - width / 2, prevY - width / 2, width, width);
};

const isStay = ({ state, x, y}, { state: prevState, x: prevX, y: prevY }) =>
    state === prevState && x === prevX && y === prevY;

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
        const { state, x, y } = current;
        if (state === 'move') {
            handleMove(ctx, current, prev);
        } else if (state === 'pressed' || state === 'released' || state === 'drag') {
            handleClickAndDrag(ctx, current, prev);
        } else if (state === 'up' || state === 'down') {
            handleScroll(ctx, current);
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
};

const main = async () => {
    const destDir = path.join(__dirname, '../dist/data/jpeg');
    const numberOfMouseOperations = process.env.OPERATIONS || 1000;
    const chunkedMouseOperations = _.chunk(mouseOperations, numberOfMouseOperations);
    fs.mkdirSync(destDir, { recursive: true });
    for (let i = 0; i < chunkedMouseOperations.length; i++) {
       const mouseOperations = chunkedMouseOperations[i];
       await createJpegImageFromMouseOperations(mouseOperations, path.join(destDir, `image-${i}.jpeg`));
    }
};

main();