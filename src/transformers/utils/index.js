function isNumber(value) {
    return !isNaN(value);
}

function hasValue(value) {
    return value && value !== '';
}

function getQuality(quality) {
    if (!quality) {
        return -1;
    }

    let value = parseInt(quality);

    if (value > 100) {
        return 100;
    }

    if (value < 1) {
        return 1;
    }

    return value;
}

function getBlur(blur) {
    if (!blur) {
        return -1;
    }

    let value = parseFloat(blur);

    if (value > 1000) {
        return 1000;
    }

    if (value < 0.3) {
        return 0.3;
    }

    return value;
}

module.exports = {
    isNumber,
    hasValue,
    getQuality,
    getBlur, 
};