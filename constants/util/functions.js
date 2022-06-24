function getRandomNumber(max, round = true) {
  const num = Math.random() * max + 1;
  return round ? Math.floor(num) : Number(num.toFixed(2));
}

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

function badName(name) {
  const split = name.trim().split("")
  let str = ""
  for(const letter of split) {
    if(letter.trim() !== "") str += letter.trim()
  }
  
  return str.length <= 5
}

module.exports = { getRandomNumber, sleep, badName };
