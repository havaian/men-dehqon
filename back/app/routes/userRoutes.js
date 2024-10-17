const express = require('express');
const userController = require('../controllers/userController');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const user = await userController.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    errorHandler(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await userController.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    errorHandler(res, error);
  }
});

router.get('/telegram/:telegramId', async (req, res) => {
  try {
    const user = await userController.getUserByTelegramId(req.params.telegramId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    errorHandler(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await userController.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    errorHandler(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await userController.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    errorHandler(res, error);
  }
});

module.exports = router;