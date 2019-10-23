exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable("HighScores", {
    id: "id",
    name: { type: "varchar(1000)", notNull: true },
    score: { type: "numeric", notNull: true },
    createdAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });
};

exports.down = pgm => {
  pgm.dropTable("HighScores");
};
