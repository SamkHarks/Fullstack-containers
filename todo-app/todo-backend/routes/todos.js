const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.sendStatus(404);
    }
    req.todo = todo;
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.sendStatus(400); // Bad Request for invalid ObjectId
    }
    return res.sendStatus(500);
  }
  next();
};

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  try {
    await req.todo.delete();
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.status(200).send(req.todo);
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const done = req.body.done
  if (done === undefined || typeof done !== 'boolean') return res.sendStatus(400);
  try {
    req.todo.done = done;
    await req.todo.save();
    res.status(200).json({ message: 'Todo updated successfully' });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: 'Error updating todo' });
  }
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
