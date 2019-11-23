class SpectateHandler {
  constructor(games, messagesToSocketStream$) {
    this.games = games;
    this.messagesToSocketStream$ = messagesToSocketStream$;
  }

  handle(message) {
    this.games.addSpectator(message.socketId);
  }
}

SpectateHandler.TYPE = "spectate";

module.exports = SpectateHandler;
