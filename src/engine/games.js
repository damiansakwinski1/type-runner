const Game = require('./game')

const MAX_GAME_LENGTH = 3 * 60 * 1000

class Games {
  constructor() {
    this.openGames = {}
    this.runningGames = {}
    this.spectators = []
    this.highscores = []
  }

  newGame() {
    const game = new Game()

    this.openGames[game.getId()] = game

    return game
  }

  run(id) {
    this.runningGames[id] = Object.assign( Object.create( Object.getPrototypeOf(this.openGames[id])), this.openGames[id])
    delete this.openGames[id]

    this.limitGameLength(id)
  }

  addSpectator(spectatorId) {
    this.spectators.push(spectatorId)
  }

  limitGameLength(gameId) {
    setTimeout(() => {
      if (this.runningGames[gameId]) {
        delete this.runningGames[gameId]
      }
    }, MAX_GAME_LENGTH)
  }

  finishGame(id) {
    delete this.runningGames[id]
  }

  findOpenGame() {
    const availableGames = Object.values(this.openGames)
    return availableGames.find(game => game.openForPlayers())
  }

  removePlayerFromOpenGames(playerId) {
    Object.values(this.openGames).forEach(game => {
      if (game.hasPlayer(playerId)) {
        game.removePlayer(playerId)
      }
    })
  }

  getGameById(gameId) {
    return this.runningGames[gameId]
  }
  
  addScore(name, startTime, endTime) {
    const score = (endTime - startTime) / 1000

    this.highscores.push({
      name,
      score
    })

    this.highscores.sort((a, b) => b.score - a.score)
  }

  getHighscores() {
    return this.highscores.slice(0, 10)
  }
}

module.exports = Games