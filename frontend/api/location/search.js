module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const query = req.query.q?.trim();
  if (!query) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Search query is required' }));
    return;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      {
        headers: {
          'User-Agent': 'CanteenWebsite/1.0',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      res.statusCode = response.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Unable to fetch locations' }));
      return;
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

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(results));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Location search failed' }));
  }
};
