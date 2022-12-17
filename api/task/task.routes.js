const express = require('express')
const { log } = require('../../middlewares/logger.middleware')
const controller = require('./task.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, controller.getTasks)

router.get('/:id', controller.getTaskById)

router.post('/generate', controller.generateTasks)

router.post('/', controller.addTask)

router.put('/:id', controller.updateTask)

router.delete('/:id', controller.removeTask)

router.delete('/', controller.removeAllTasks)

router.put('/:id/start', controller.performTask)

router.put('/workerToggle', controller.toggleWorker)

router.post('/:id/msg', controller.addTaskMsg)

router.delete('/:id/msg/:msgId', controller.removeTaskMsg)

module.exports = router