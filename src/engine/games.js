const Game = require("./game");

const GAME_REMOVE_TIME = 4 * 60 * 1000;

class Games {
  constructor() {
    this.openGames = {};
    this.runningGames = {};
    this.spectators = [];
    this.highscores = [];
  }

  newGame() {
    const game = new Game();

    this.openGames[game.getId()] = game;

    return game;
  }

  run(id) {
    this.runningGames[id] = this.openGames[id];
    delete this.openGames[id];

    this.runningGames[id].startGameTime();

    this.limitGameLength(id);
  }

  addSpectator(spectatorId) {
    this.spectators.push(spectatorId);
  }

  limitGameLength(gameId) {
    setTimeout(() => {
      if (this.runningGames[gameId]) {
        delete this.runningGames[gameId];
      }
    }, GAME_REMOVE_TIME);
  }

  finishGame(id) {
    this.runningGames[id].removeAllListeners();
    delete this.runningGames[id];
  }

  findOpenGame() {
    const availableGames = Object.values(this.openGames);
    return availableGames.find(game => game.openForPlayers());
  }

  removePlayerFromOpenGames(playerId) {
    const removedPlayers = [];

    Object.values(this.openGames).forEach(game => {
      if (game.hasPlayer(playerId)) {
        game.removePlayer(playerId);

        removedPlayers.push({
          gameId: game.getId(),
          playerId
        });
      }
    });

    return removedPlayers;
  }

  getOpenGameById(gameId) {
    return this.openGames[gameId];
  }

  getGameById(gameId) {
    return this.runningGames[gameId];
  }

  addScore(name, startTime, endTime) {
    const score = (endTime - startTime) / 1000;

    this.highscores.push({
      name,
      score
    });

    this.highscores.sort((a, b) => a.score - b.score);
  }

  getHighscores() {
    return this.highscores.slice(0, 10);
  }
}

module.exports = Games;
