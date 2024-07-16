const { parse } = require('date-fns');

const formatDateTime = (unknownDateString) => {
    const parsedDate = parse(unknownDateString, 'yyyy-MM-dd HH:mm:ss', new Date());

    if (isNaN(parsedDate.getTime())) {
        console.error('Failed to parse date:', unknownDateString);
        return unknownDateString;
    } else {
        return parsedDate;
    }
}

module.exports = {formatDateTime}