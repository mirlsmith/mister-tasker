const taskService = require('./task.service.js')
const workerService = require('./worker.service.js')

const logger = require('../../services/logger.service')

async function getTasks(req, res) {
  try {
    logger.debug('Getting Tasks')
    const tasks = await taskService.query(req.query)
    res.json(tasks)
  } catch (err) {
    logger.error('Failed to get tasks', err)
    res.status(500).send({ err: 'Failed to get tasks' })
  }
}

async function getTaskById(req, res) {
  try {
    const taskId = req.params.id
    const task = await taskService.getById(taskId)
    res.json(task)
  } catch (err) {
    logger.error('Failed to get task', err)
    res.status(500).send({ err: 'Failed to get task' })
  }
}

async function addTask(req, res) {
  const { loggedinUser } = req

  try {
    const task = req.body
    const addedTask = await taskService.add(task)
    res.json(addedTask)
  } catch (err) {
    logger.error('Failed to add task', err)
    res.status(500).send({ err: 'Failed to add task' })
  }
}

async function generateTasks(req, res) {
  try {
    const { count } = req.body
    const generatedTasks = await taskService.generateTasks(+count)
    res.json(generatedTasks)
  } catch (err) {
    logger.error('Failed to generate tasks', err)
    res.status(500).send({ err: 'Failed to generate tasks' })
  }
}

async function updateTask(req, res) {
  try {
    const task = req.body
    const updatedTask = await taskService.update(task)
    res.json(updatedTask)
  } catch (err) {
    logger.error('Failed to update task', err)
    res.status(500).send({ err: 'Failed to update task' })
  }
}

async function performTask(req, res) {
  try {
    const task = req.body
    task._id = req.params.id
    const perfomedTask = await taskService.perform(task)
    res.json(perfomedTask)
  } catch (error) {
    logger.error('Failed to perform task', err)
    res.status(500).send({ err: 'Failed to perform task' })
  }
}

function toggleWorker(req, res) {
  try {
    // const task = req.body
    // task._id = req.params.id
    // const perfomedTask = await taskService.runWorker()
    // res.json(perfomedTask)
    console.log('toggling worker');
    const isWorkerOn = workerService.toggleWorker()
    res.json({isWorkerOn})
  } catch (error) {
    logger.error('Failed to toggle the worker', err)
    res.status(500).send({ err: 'Failed to toggle the worker' })
  }
}

async function removeTask(req, res) {
  try {
    const taskId = req.params.id
    const removedId = await taskService.remove(taskId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove task', err)
    res.status(500).send({ err: 'Failed to remove task' })
  }
}

async function removeAllTasks(req, res) {
  try {
    await taskService.removeAll()
    res.end()
  } catch (err) {
    logger.error('Failed to remove tasks', err)
    res.status(500).send({ err: 'Failed to remove tasks' })
  }
}

async function addTaskMsg(req, res) {
  const { loggedinUser } = req
  try {
    const taskId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
    }
    const savedMsg = await taskService.addTaskMsg(taskId, msg)
    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to update task', err)
    res.status(500).send({ err: 'Failed to update task' })
  }
}

async function removeTaskMsg(req, res) {
  const { loggedinUser } = req
  try {
    const taskId = req.params.id
    const { msgId } = req.params

    const removedId = await taskService.removeTaskMsg(taskId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove task msg', err)
    res.status(500).send({ err: 'Failed to remove task msg' })
  }
}

module.exports = {
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  removeTask,
  performTask,
  toggleWorker,
  addTaskMsg,
  removeTaskMsg,
  generateTasks,
  removeAllTasks
}
