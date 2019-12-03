const OpenGame = require("./games/open-game");
const PracticeGame = require("./games/practice-game");

class Games {
  constructor(config, highScoresRepository) {
    this.openGames = {};
    this.runningGames = {};
    this.practiceGames = {};
    this.spectators = [];
    this.highScoresRepository = highScoresRepository;
    this.config = config;
  }

  newOpenGame() {
    const game = new OpenGame(
      {
        MINIMUM_PLAYERS: this.config.MINIMUM_PLAYERS,
        MAXIMUM_PLAYERS: this.config.MAXIMUM_PLAYERS,
        LOCK_COUNTDOWN: this.config.LOCK_COUNTDOWN,
        PRE_LOCK_COUNTDOWN: this.config.PRE_LOCK_COUNTDOWN,
        GAME_TICK: this.config.GAME_TICK,
        MAX_GAME_TICKS: this.config.MAX_GAME_TICKS
      },
      this.highScoresRepository
    );

    this.openGames[game.getId()] = game;

    return game;
  }

  newPracticeGame() {
    const game = new PracticeGame({
      GAME_TICK: this.config.GAME_TICK,
      MAX_GAME_TICKS: this.config.MAX_GAME_TICKS,
      LOCK_COUNTDOWN: this.config.LOCK_COUNTDOWN,
      MINIMUM_PLAYERS: 1,
      MAXIMUM_PLAYERS: 1
    });

    this.practiceGames[game.getId()] = game;
    return game;
  }

  run(game) {
    const id = game.getId();

    switch (game.constructor) {
      case OpenGame:
        this.runningGames[id] = this.openGames[id];
        delete this.openGames[id];
        break;
      case PracticeGame:
        this.runningGames[id] = this.practiceGames[id];
        delete this.practiceGames[id];
        break;
      default:
        throw new Error("Invalid game type");
    }

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
    }, this.config.GAME_REMOVE_TIME);
  }

  async finishGame(id) {
    const score = await this.runningGames[id].finish();
    delete this.runningGames[id];

    return score;
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
}

module.exports = Games;
