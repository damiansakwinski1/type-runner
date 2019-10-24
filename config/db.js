module.exports = env => ({
  user: env.POSTGRES_USERNAME,
  host: env.POSTGRES_HOST,
  database: env.POSTGRES_DB,
  password: env.POSTGRES_PASSWORD,
  port: env.POSTGRES_PORT
});
