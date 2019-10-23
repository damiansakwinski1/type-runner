module.exports = db => {
  return {
    async getHighScores() {
      try {
        const { rows } = await db.query(
          `SELECT name, score FROM "HighScores" ORDER BY SCORE ASC LIMIT 10`
        );
        return rows.map(({ name, score }) => ({ name, score }));
      } catch (err) {
        console.log(err.stack);
      }
    },
    async addHighScore(name, score) {
      try {
        const query = {
          text: `INSERT INTO "HighScores"(name, score) VALUES($1, $2)`,
          values: [name, score]
        };

        db.query(query);
      } catch (err) {
        console.log(err.stack);
      }
    }
  };
};
