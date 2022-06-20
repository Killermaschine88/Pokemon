function getRandomNumber(max, round) {
  const num = Math.random() * max + 1;
  return round ? Math.floor(num) : Number(num.toFixed(2));
}

module.exports = { getRandomNumber };
