const { multiTargetMessage } = require("../../message/socket-message");
const { PRACTICE } = require('./../game-types');
const { calculateScore } = require('./../utils/calculateScore');

class PlayerStatusHandler {
  constructor(games, messagesToSocketStream$) {
    this.games = games;
    this.messagesToSocketStream$ = messagesToSocketStream$;
  }

  async handle(message) {
    const game = this.games.getGameById(message.payload.gameId);
    if (game) {
      const wasUpdated = game.updatePlayerStatus(
        message.payload.playerId,
        message.payload.currentCharacter
      );

      if (wasUpdated) {
        const players = game.getPlayers().map(player => player.id);

        this.messagesToSocketStream$.next(
          multiTargetMessage(players, "game-status", {
            gameId: game.getId(),
            players: game.getPlayers().map(player => ({
              id: player.getId(),
              currentCharacter: player.currentCharacter,
              winner: player.isWinner()
            }))
          })
        );

        if (game.hasFinished(message.payload.currentCharacter)) {
          this.games.finishGame(game.getId());
          const score = calculateScore(game.startTime, Date.now());


          this.messagesToSocketStream$.next(
            multiTargetMessage(players, "player-finished", {
              gameId: game.getId(),
              playerId: message.payload.playerId,
              winner: game.isWinner(message.payload.playerId),
              score,
            })
          );

          if(game.getType() !== PRACTICE){
            this.games.addScore(
              game.getPlayer(message.payload.playerId).name,
              score
            );

            this.messagesToSocketStream$.next(
              multiTargetMessage(players, "highscores", {
                scores: await this.games.getHighscores()
              })
            );
          }
        }
      }
    }
  }
}

module.exports = PlayerStatusHandler;
