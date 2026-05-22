const express = require('express');

const router = express.Router();

router.get('/reverse-address', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1&zoom=18`,
    {
      headers: {
        'User-Agent': 'CanteenWebsite/1.0',
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Unable to fetch address details' });
  }

  const data = await response.json();
  res.json(data);
});

module.exports = router;
