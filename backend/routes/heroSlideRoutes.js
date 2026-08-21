const express = require('express');
const HeroSlide = require('../models/HeroSlide');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
    const slides = await HeroSlide.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', adminMiddleware, async (req, res) => {
  try {
    const slide = await HeroSlide.create(req.body);
    res.status(201).json({ message: 'Hero slide created successfully', slide });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!slide) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }

    res.json({ message: 'Hero slide updated successfully', slide });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }

    await HeroSlide.deleteOne({ _id: req.params.id });
    res.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
