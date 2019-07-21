const { multiTargetMessage } = require('../../message/socket-message')

class PlayerStatusHandler {
  constructor(games, messagesToSocketStream$) {
    this.games = games
    this.messagesToSocketStream$ = messagesToSocketStream$
  }

  handle(message) {
    const game = this.games.getGameById(message.payload.gameId)
    game.updatePlayerStatus(message.payload.playerId, message.payload.currentCharacter)

    const players = game.getPlayers().map(player => player.id);

    this.messagesToSocketStream$.next(multiTargetMessage(players, 'game-status', {
      gameId: game.getId(),
      players: game.getPlayers().map(player => ({
        id: player.getId(),
        currentCharacter: player.currentCharacter,
        winner: player.isWinner()
      }))
    }))

    if (game.hasFinished(message.payload.currentCharacter)) {
      this.games.finishGame(game.getId())
      this.games.addScore(game.getPlayer(message.payload.playerId).name, game.startTime, Date.now())
      this.messagesToSocketStream$.next(multiTargetMessage(players, 'player-finished', {
        gameId: game.getId(),
        playerId: message.payload.playerId,
        winner: true
      }))
      this.messagesToSocketStream$.next(multiTargetMessage(players, 'highscores', {
        scores: this.games.getHighscores()
      }))
    }
  }
}

module.exports = PlayerStatusHandler