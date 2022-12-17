const ObjectId = require('mongodb').ObjectId
const taskService = require('./task.service.js')

var isWorkerOn = true

function toggleWorker() {
    isWorkerOn = !isWorkerOn
    return isWorkerOn
}

async function runWorker() {
  // The isWorkerOn is toggled by the button: "Start/Stop Task Worker"
  if (!isWorkerOn) return
  var delay = 5000
  try {
    const task = await _getNextTask()
    if (task) {
      try {
        await perform(task)
      } catch (err) {
        console.log(`Failed Task`, err)
      } finally {
        delay = 1
      }
    } else {
      console.log('Snoozing... no tasks to perform')
    }
  } catch (err) {
    console.log(`Failed getting next task to execute`, err)
  } finally {
    setTimeout(runWorker, delay)
  }
}

async function _getNextTask() {
  const tasks = await query()

  console.log('tasks', tasks)
  return tasks[0]
}

module.exports = {
    toggleWorker
}
