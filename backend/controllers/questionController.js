const Question = require('../models/Question');

// Get questions for a product
const getProductQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ product: req.params.productId })
      .populate('user', 'name')
      .populate('answeredBy', 'name')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a question
const createQuestion = async (req, res) => {
  try {
    const { productId, question } = req.body;
    if (!productId || !question?.trim()) {
      return res.status(400).json({ error: 'Product and question are required' });
    }

    const newQuestion = new Question({
      product: productId,
      user: req.user.id,
      question: question.trim()
    });

    await newQuestion.save();
    await newQuestion.populate('user', 'name');
    res.status(201).json({ message: 'Question submitted successfully', question: newQuestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Answer a question (Admin or Seller only)
const answerQuestion = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Only admins or sellers can answer questions' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    question.answer = req.body.answer?.trim() || '';
    question.answeredBy = req.user.id;
    question.answeredAt = new Date();
    await question.save();
    await question.populate('user', 'name');
    await question.populate('answeredBy', 'name');

    res.json({ message: 'Answer saved successfully', question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProductQuestions,
  createQuestion,
  answerQuestion
};
