function getRandomNumber(max, round = true) {
  const num = Math.random() * max + 1;
  return round ? Math.floor(num) : Number(num.toFixed(2));
}

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

module.exports = { getRandomNumber, sleep };
