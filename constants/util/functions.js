function getRandomNumber(min, max, round = true) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return round ? Math.floor(num) : Number(num.toFixed(2));
}

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

function badName(name) {
  const split = name.trim().split("");
  let str = "";
  for (const letter of split) {
    if (letter.trim() !== "") str += letter.trim();
  }

  return str.length < 5;
}

function titleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

module.exports = { getRandomNumber, sleep, badName, titleCase };
