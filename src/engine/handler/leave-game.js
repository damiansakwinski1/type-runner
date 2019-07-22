const { multiTargetMessage } = require('../../message/socket-message')

class LeaveGameHandler {
  constructor(games, messagesToSocketStream$) {
    this.games = games
    this.messagesToSocketStream$ = messagesToSocketStream$
  }

  handle(message) {
    const removedPlayers = this.games.removePlayerFromOpenGames(message.socketId)

    const players = removedPlayers.map(
      removedPlayer => this.games.getOpenGameById(removedPlayer.gameId).getPlayers()
      ).flat().map(player => player.getId())

    this.messagesToSocketStream$.next(
      multiTargetMessage(
        players,
        'left-game',
        {
          playerId: message.socketId
        }
      )
    )
  }
}

module.exports = LeaveGameHandler