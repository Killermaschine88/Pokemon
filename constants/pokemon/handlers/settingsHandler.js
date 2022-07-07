function settingsHandler(Game, id) {
  if (id === "showOtherPlayers") {
    Game.profile.settings.showOtherPlayers ? (Game.profile.settings.showOtherPlayers = false) : (Game.profile.settings.showOtherPlayers = true);
    return Game.profile.settings.showOtherPlayers ? "on" : "off";
  }
}

module.exports = { settingsHandler };
