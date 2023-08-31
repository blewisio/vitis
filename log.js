const shouldLog = true;

const log = (message) => {
  if (shouldLog) {
    console.log(message);
  }
};

module.exports = log;
