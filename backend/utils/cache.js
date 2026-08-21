const setPublicCache = (
  res,
  { maxAge = 30, edgeMaxAge = 120, staleWhileRevalidate = 300 } = {}
) => {
  res.set(
    'Cache-Control',
    `public, max-age=${maxAge}, s-maxage=${edgeMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
};

module.exports = { setPublicCache };
