const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const socketService = require('../../services/socket.service')
const externalService = require('../../services/external.service')
const ObjectId = require('mongodb').ObjectId


async function query(filterBy = { text: '' }) {
  try {
    const collection = await dbService.getCollection('task')
    let criteria = {}

    if (filterBy.text) {
      criteria = { $text: { $search: filterBy.text }}
    }

    const tasks = await collection.find(criteria).toArray()
    return tasks.map(_mapTask)
  } catch (err) {
    logger.error('cannot find tasks', err)
    throw err
  }
}

async function getById(taskId) {
  try {
    const collection = await dbService.getCollection('task')
    const task = collection.findOne({ _id: ObjectId(taskId) })
    return _mapTask(task)
  } catch (err) {
    logger.error(`while finding task ${taskId}`, err)
    throw err
  }
}

async function remove(taskId) {
  try {
    const collection = await dbService.getCollection('task')
    await collection.deleteOne({ _id: ObjectId(taskId) })
    return taskId
  } catch (err) {
    logger.error(`cannot remove task ${taskId}`, err)
    throw err
  }
}

async function removeAll() {
  try {
    const collection = await dbService.getCollection('task')
    return await collection.deleteMany({})
  } catch (err) {
    logger.error(`cannot remove all task`, err)
    throw err
  }
}

async function add(task) {
  try {
    const collection = await dbService.getCollection('task')
    await collection.insertOne(task)
    return _mapTask(task)
  } catch (err) {
    logger.error('cannot insert task', err)
    throw err
  }
}

async function generateTasks(count) {
  try {
    const tasks = _generateTasks(count)
    const collection = await dbService.getCollection('task')
    await collection.insertMany(tasks)
    return tasks.map(_mapTask)
  } catch (err) {
    logger.error('cannot insert task', err)
    throw err
  }
}

async function update(task) {
  try {
    // const taskToSave = {
    //     ...task
    // title: task.title,
    // importance: task.importance
    // }
    const taskToSave = utilService.deepCopy(task)
    delete taskToSave._id

    const collection = await dbService.getCollection('task')
    await collection.updateOne(
      { _id: ObjectId(task._id) },
      { $set: taskToSave }
    )
    return _mapTask(task)
  } catch (err) {
    logger.error(`cannot update task ${taskId}`, err)
    throw err
  }
}

async function perform(task) {
  try {
    // TODO: update task status to running and save to DB
    task.status = 'running'
    await update(task)
    socketService.broadcast({
      type: socketService.SOCKET_EMIT_WORKER_TASK_STARTED,
      data: task
    })

    // TODO: execute the task using: externalService.execute
    await externalService.execute(task)

    // TODO: update task for success (doneAt, status)
    task.status = 'done'
    task.doneAt = Date.now()
    await update(task)
  } catch (error) {
    // TODO: update task for error: status, errors
    console.log('error from execute', error)
    task.status = 'failed'
    task.errors.push(error)
    await update(task)
  } finally {
    // TODO: update task lastTried, triesCount and save to DB
    task.lastTriedAt = Date.now()
    task.triesCount++
    await update(task)
    socketService.broadcast({
      type: socketService.SOCKET_EMIT_WORKER_TASK_ENDED,
      data: task
    })
    return _mapTask(task)
  }
}

async function addTaskMsg(taskId, msg) {
  try {
    msg.id = utilService.makeId()
    const collection = await dbService.getCollection('task')
    await collection.updateOne(
      { _id: ObjectId(taskId) },
      { $push: { msgs: msg } }
    )
    return msg
  } catch (err) {
    logger.error(`cannot add task msg ${taskId}`, err)
    throw err
  }
}

async function removeTaskMsg(taskId, msgId) {
  try {
    const collection = await dbService.getCollection('task')
    await collection.updateOne(
      { _id: ObjectId(taskId) },
      { $pull: { msgs: { id: msgId } } }
    )
    return msgId
  } catch (err) {
    logger.error(`cannot add task msg ${taskId}`, err)
    throw err
  }
}

function _generateTask() {
  const task = {
    title: utilService.makeLorem(5),
    status: 'new',
    description: utilService.makeLorem(10),
    importance: utilService.getRandomInt(1, 3),
    lastTriedAt: 0,
    triesCount: 0,
    doneAt: 0,
    errors: [],
  }
  return task
}

function _generateTasks(count) {
  return new Array(count).fill(null).map(() => _generateTask())
}

function _mapTask(task) {
  if (!task._id) return task
  return {
    ...task,
    createdAt: ObjectId(task._id).getTimestamp().getTime(),
  }
}


module.exports = {
  remove,
  query,
  getById,
  add,
  update,
  perform,
  addTaskMsg,
  removeTaskMsg,
  generateTasks,
  removeAll,
}
