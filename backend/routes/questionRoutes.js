const express = require('express');
const {
  getProductQuestions,
  createQuestion,
  answerQuestion
} = require('../controllers/questionController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', getProductQuestions);
router.post('/', authMiddleware, createQuestion);
router.put('/:id/answer', authMiddleware, answerQuestion);

module.exports = router;
