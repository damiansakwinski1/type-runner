const { singleTargetMessage } = require('../../message/socket-message')

class HighscoresHandler {
  constructor(games, messagesToSocketStream$) {
    this.games = games
    this.messagesToSocketStream$ = messagesToSocketStream$
  }

  handle(message) {
    this.messagesToSocketStream$.next(singleTargetMessage(message.socketId, 'highscores', {
      scores: this.games.getHighscores()
    }))
  }
}

module.exports = HighscoresHandler