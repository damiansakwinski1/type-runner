const { multiTargetMessage } = require("../../message/socket-message");

class LeaveGameHandler {
  constructor(games, messagesToSocketStream$) {
    this.games = games;
    this.messagesToSocketStream$ = messagesToSocketStream$;
  }

  handle(message) {
    const removedPlayers = this.games.removePlayerFromOpenGames(
      message.socketId
    );
    removedPlayers.forEach(removedPlayer => {
      const game = this.games.getOpenGameById(removedPlayer.gameId);

      this.messagesToSocketStream$.next(
        multiTargetMessage(
          game.getPlayers().map(player => player.getId()),
          "left-game",
          {
            gameId: game.getId(),
            playerId: message.socketId,
            stopCountdown: !game.hasEnoughPlayers()
          }
        )
      );
    });
  }
}

LeaveGameHandler.TYPE = "leave-game";

module.exports = LeaveGameHandler;
