(async () => {
  const fs = require("fs");
  const path = require("path");
  const app = require("express")();
  const http = require("http").createServer(app);
  const https = require("https").createServer(
    {
      key: fs.readFileSync(path.resolve(__dirname, "..", "server.key"), "utf8"),
      cert: fs.readFileSync(
        path.resolve(__dirname, "..", "server.cert"),
        "utf8"
      ),
      ca: fs.readFileSync(path.resolve(__dirname, "..", "server.ca"), "utf8")
    },
    app
  );

  const io = require("socket.io")(
    process.env.NODE_ENV === "test" ? http : https
  );

  const { Subject } = require("rxjs");
  const Handlers = require("./engine/handlers");
  const JoinGame = require("./engine/handler/join-game");
  const JoinPractice = require("./engine/handler/join-practice");
  const LeaveGame = require("./engine/handler/leave-game");
  const PlayerStatus = require("./engine/handler/player-status");
  const Spectate = require("./engine/handler/spectate");
  const Highscores = require("./engine/handler/highscores");
  const Games = require("./engine/games");
  const db = await require("./connection");
  const highscoresRepository = require("./repositories/highscore-repository")(
    db
  );
  const messagesToSocketStream$ = new Subject();

  process.on("unhandledRejection", err => {
    console.log(err);
    process.exit(1);
  });

  process.on("uncaughtException", err => {
    console.log(err);
    process.exit(1);
  });

  const gamesConfig = {
    GAME_REMOVE_TIME: process.env.GAME_REMOVE_TIME || 4 * 60 * 1000,
    MINIMUM_PLAYERS: process.env.MINIMUM_PLAYERS || 2,
    MAXIMUM_PLAYERS: process.env.MAXIMUM_PLAYERS || 4,
    LOCK_COUNTDOWN: process.env.LOCK_COUNTDOWN || 5000,
    PRE_LOCK_COUNTDOWN: process.env.PRE_LOCK_COUNTDOWN || 10000,
    GAME_TICK: process.env.GAME_TICK || 30000,
    MAX_GAME_TICKS: process.env.MAX_GAME_TICKS || 6
  };

  const games = new Games(gamesConfig, highscoresRepository);

  const handlers = new Handlers({
    [JoinGame.TYPE]: new JoinGame(
      games,
      highscoresRepository,
      messagesToSocketStream$
    ),
    [PlayerStatus.TYPE]: new PlayerStatus(games, messagesToSocketStream$),
    [Spectate.TYPE]: new Spectate(games, messagesToSocketStream$),
    [Highscores.TYPE]: new Highscores(
      highscoresRepository,
      messagesToSocketStream$
    ),
    [LeaveGame.TYPE]: new LeaveGame(games, messagesToSocketStream$),
    [JoinPractice.TYPE]: new JoinPractice(games, messagesToSocketStream$)
  });

  const filterMessages = messages => message => {
    if (messages.find(filteredMessage => filteredMessage === message.type)) {
      return false;
    }

    return true;
  };

  const spectatorMessages = filterMessages(["joined-game"]);

  io.on("connection", socket => {
    socket.on("message", async message => {
      await handlers.handle({
        ...message,
        socketId: socket.id
      });
    });

    socket.on("disconnect", async () => {
      await handlers.handle({
        type: LeaveGame.TYPE,
        socketId: socket.id
      });
    });
  });

  messagesToSocketStream$.subscribe(message => {
    message.target.forEach(id => {
      io.to(id).emit("message", {
        type: message.type,
        payload: message.payload
      });
    });

    if (spectatorMessages(message)) {
      games.spectators.forEach(spectator => {
        io.to(spectator).emit("message", {
          type: message.type,
          payload: message.payload
        });
      });
    }
  });

  if (process.env.NODE_ENV === "test") {
    http.listen(8443, () => {
      console.log("listening on port 8443");
    });
  } else {
    https.listen(8443, () => {
      console.log("listening on port 8443");
    });
  }
})();
