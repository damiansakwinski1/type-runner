const Player = require("../player");
const {
  singleTargetMessage,
  multiTargetMessage
} = require("../../message/socket-message");

class JoinPracticeHandler {
  constructor(games, messagesToSocketStream$) {
    this.games = games;
    this.messagesToSocketStream$ = messagesToSocketStream$;
  }

  handle(message) {
    const game = this.games
      .newPracticeGame()
      .on("countdown-finished", () => {
        this.games.run(game);
        this.messagesToSocketStream$.next(
          multiTargetMessage(
            game.getPlayers().map(player => player.id),
            "start-game",
            {
              gameId: game.getId(),
              gameType: "practic"
            }
          )
        );
      })
      .on("game-locked", text => {
        this.messagesToSocketStream$.next(
          multiTargetMessage(
            game.getPlayers().map(player => player.id),
            "text-drawn",
            {
              gameId: game.getId(),
              text,
              maxGameLength: game.maxGameLength
            }
          )
        );
      })
      .on("countdown-stopped", () => {
        this.messagesToSocketStream$.next(
          multiTargetMessage(
            game.getPlayers().map(player => player.id),
            "reset-countdown",
            {
              gameId: game.getId()
            }
          )
        );
      })
      .on("countdown-tick", () => {
        this.messagesToSocketStream$.next(
          multiTargetMessage(
            game.getPlayers().map(player => player.id),
            "countdown-tick",
            {
              gameId: game.getId(),
              countdown: game.currentCountdown
            }
          )
        );
      })
      .on("game-time-tick", () => {
        this.messagesToSocketStream$.next(
          multiTargetMessage(
            game.getPlayers().map(player => player.id),
            "game-time-sync",
            {
              gameId: game.getId(),
              gameLength: game.gameLength
            }
          )
        );
      })
      .on("game-time-finished", () => {
        this.messagesToSocketStream$.next(
          multiTargetMessage(
            game.getPlayers().map(player => player.id),
            "game-finished",
            {
              gameId: game.getId()
            }
          )
        );
      });

    const newPlayer = new Player(message.socketId, message.payload.name);

    game.addPlayer(newPlayer);

    this.messagesToSocketStream$.next(
      singleTargetMessage(newPlayer.id, "joined-game", {
        id: game.getId(),
        players: game.getPlayers(),
        countdown: game.currentCountdown
      })
    );

    this.messagesToSocketStream$.next(
      singleTargetMessage(newPlayer.id, "start-countdown", {
        gameId: game.getId(),
        countdown: game.currentCountdown
      })
    );

    game.lock();
  }
}

JoinPracticeHandler.TYPE = "join-practice";

module.exports = JoinPracticeHandler;
