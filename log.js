const shouldLog = true;
const log = (message) => {
  shouldLog && console.log(message);
};

module.exports = log;
