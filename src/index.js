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
  const highscoreRepository = require("./repositories/highscoreRepository")(db);
  const messagesToSocketStream$ = new Subject();

  process.on("unhandledRejection", err => {
    console.log(err);
    process.exit(1);
  });

  process.on("uncaughtException", err => {
    console.log(err);
    process.exit(1);
  });

  const games = new Games(highscoreRepository);

  const handlers = new Handlers({
    "join-game": new JoinGame(games, messagesToSocketStream$),
    "player-status": new PlayerStatus(games, messagesToSocketStream$),
    spectate: new Spectate(games, messagesToSocketStream$),
    highscores: new Highscores(games, messagesToSocketStream$),
    "leave-game": new LeaveGame(games, messagesToSocketStream$),
    "join-practice": new JoinPractice(games, messagesToSocketStream$),
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
        type: "leave-game",
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
