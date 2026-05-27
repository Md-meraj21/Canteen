const express = require('express');

const router = express.Router();

const userAgent = 'CanteenWebsite/1.0';

router.get('/search', async (req, res) => {
  const { q } = req.query;
  const query = q?.trim();

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      {
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Unable to fetch locations' });
    }

    const data = await response.json();
    const results = data.map((item) => {
      const address = item.address || {};
      return {
        name: address.city || address.town || address.village || address.county || item.name || item.display_name,
        state: address.state || '',
        country: address.country || '',
        lat: item.lat,
        lon: item.lon,
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Location search failed' });
  }
});

router.get('/reverse-address', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1&zoom=18`,
    {
      headers: {
        'User-Agent': userAgent,
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
