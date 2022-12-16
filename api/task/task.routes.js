const express = require('express')
const { log } = require('../../middlewares/logger.middleware')
const { getTasks, getTaskById, addTask, updateTask, removeTask, performTask, addTaskMsg, removeTaskMsg, generateTasks } = require('./task.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getTasks)
router.get('/:id', getTaskById)
router.post('/generate', generateTasks)
router.post('/', addTask)
router.put('/:id', updateTask)
router.delete('/:id', removeTask)
router.put('/:id/start', performTask)

router.post('/:id/msg', addTaskMsg)
router.delete('/:id/msg/:msgId', removeTaskMsg)

module.exports = router