const { singleTargetMessage } = require("../../message/socket-message");

class HighscoresHandler {
  constructor(highscoresRepository, messagesToSocketStream$) {
    this.highscoresRepository = highscoresRepository;
    this.messagesToSocketStream$ = messagesToSocketStream$;
  }

  async handle(message) {
    this.messagesToSocketStream$.next(
      singleTargetMessage(message.socketId, "highscores", {
        scores: await this.highscoresRepository.getHighScores()
      })
    );
  }
}

HighscoresHandler.TYPE = "highscores";

module.exports = HighscoresHandler;
