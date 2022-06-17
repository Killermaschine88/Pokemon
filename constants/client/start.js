function globalStart() {
  require("dotenv").config();
  global.color = require("colorette");

  global.log = function (str, type = "DEFAULT") {
    if (type === "DEFAULT") {
      console.log(`${new Date().toLocaleTimeString()} > ${str}`);
    } else if (type === "ERROR") {
      console.log(`${color.red(`${new Date().toLocaleTimeString()} > ${str}`)}`);
    }
  };
}

module.exports = { globalStart };
