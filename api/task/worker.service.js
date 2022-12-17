const taskService = require('./task.service.js')

var isWorkerOn = true

runWorker()

function toggleWorker() {
    isWorkerOn = !isWorkerOn
    return isWorkerOn
}

async function runWorker() {
  // The isWorkerOn is toggled by the button: "Start/Stop Task Worker"
  if (!isWorkerOn) return
  var delay = 3000
  try {
    const task = await _getNextTask()
    if (task) {
      try {
        await taskService.perform(task)
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
  const tasks = await taskService.query()
  const filteredTasks = tasks.filter(task => (
    task.triesCount < 5 &&
    task.status !== 'done' &&
    task.status !== 'running'
  ))
  filteredTasks.sort((taskA, taskB) => {
    if (taskA.importance > taskB.importance) return -1
    else if (taskA.importance < taskB.importance) return 1
    else return taskA.triesCount > taskB.triesCount ? 1 : -1
  })

  return filteredTasks[0]
}

module.exports = {
    toggleWorker
}
