const utilService = require('./util.service')

module.exports = {
    execute
}

function execute(task) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) resolve(parseInt(Math.random() * 100))
      else {
        const errors = [
          'High Temparture',
          'Server busy',
          'Server under maintanence',
          'Requested resource is no longer available',
          'Gateway timeout',
        ]
        const rand = utilService.getRandomInt(0, errors.length-1)
        const randomError = errors[rand]
        reject(randomError)
      }
    }, 5000)
  })
}
