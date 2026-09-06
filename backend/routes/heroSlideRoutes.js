const express = require('express');
const {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide
} = require('../controllers/heroSlideController');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', getHeroSlides);
router.post('/', adminMiddleware, createHeroSlide);
router.put('/:id', adminMiddleware, updateHeroSlide);
router.delete('/:id', adminMiddleware, deleteHeroSlide);

module.exports = router;
