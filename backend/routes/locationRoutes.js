const express = require('express');
const {
  searchLocation,
  reverseAddress
} = require('../controllers/locationController');

const router = express.Router();

router.get('/search', searchLocation);
router.get('/reverse-address', reverseAddress);

module.exports = router;
