module.exports = {
  distance: (x1, y1, x2, y2) => (
    Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  ),

  overlap: (x1, y1, x2, y2, radius) => (
    (x1 - x2) ** 2 + (y1 - y2) ** 2 <= (radius) ** 2
  ),

  json: object => JSON.stringify(object),
};
