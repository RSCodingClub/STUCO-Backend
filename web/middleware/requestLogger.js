
const logger = require('winston')

let stream = {
  write: (message, encoding) => {
    logger.verbose(message)
  }
}

module.exports.stream = stream
