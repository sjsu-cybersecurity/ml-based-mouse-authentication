/*
 * Returns a memory being used in MB
 */
const getMemoryUsage = () => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    return Math.round(used * 100) / 100;
};

module.exports = {
    getMemoryUsage,
};