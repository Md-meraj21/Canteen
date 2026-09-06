const HeroSlide = require('../models/HeroSlide');

// Get hero slides
const getHeroSlides = async (req, res) => {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
    const slides = await HeroSlide.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create hero slide (Admin only)
const createHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.create(req.body);
    res.status(201).json({ message: 'Hero slide created successfully', slide });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update hero slide (Admin only)
const updateHeroSlide = async (req, res) => {
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
};

// Delete hero slide (Admin only)
const deleteHeroSlide = async (req, res) => {
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
};

module.exports = {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide
};
