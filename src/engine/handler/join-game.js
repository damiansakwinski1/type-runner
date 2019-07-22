const Player = require('../game/player')
const { singleTargetMessage, multiTargetMessage } = require('../../message/socket-message')

class JoinGameHandler {
  constructor(games, messagesToSocketStream$) {
    this.games = games
    this.messagesToSocketStream$ = messagesToSocketStream$
  }

  handle(message) {
    const game = this.games.findOpenGame() || this.games.newGame()
      .on('countdown-finished', () => {
        this.messagesToSocketStream$.next(multiTargetMessage(game.getPlayers().map(player => player.id), 'start-game', {
          gameId: game.getId()
        }))
      }) 
      .on('game-locked', text => {
        this.games.run(game.getId())
        this.messagesToSocketStream$.next(multiTargetMessage(game.getPlayers().map(player => player.id), 'text-drawn', {
          gameId: game.getId(),
          text
        }))
      })

    const newPlayer = new Player(message.socketId, message.payload.name)

    game.addPlayer(newPlayer)

    const players = game.getPlayers().map(player => player.id);

    this.messagesToSocketStream$.next(singleTargetMessage(newPlayer.id, 'joined-game', {
      id: game.getId(),
      players: game.getPlayers()
    }))

    this.messagesToSocketStream$.next(multiTargetMessage(players.filter(player => player !== newPlayer.id), 'player-joined', {
      gameId: game.getId(),
      player: newPlayer
    }))

    if (game.hasEnoughPlayers()) {
      game.startCountdown()

      this.messagesToSocketStream$.next(multiTargetMessage(players, 'start-countdown', {
        gameId: game.getId(),
        countdown: 10000
      }))
    }
  }
}

module.exports = JoinGameHandler