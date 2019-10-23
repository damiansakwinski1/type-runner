module.exports = db => {
  const highScores = [];
  return {
    test() {
      db.connect();
      db.query("SELECT $1::text as message", ["Hello world!"], (err, res) => {
        console.log(err ? err.stack : res.rows[0].message); // Hello World!
        db.end();
      });
    },
    getHighScores() {
      return Promise.resolve(highScores);
    },
    addHighScore(name, score) {
      highScores.push({ name, score });
    }
  };
};
