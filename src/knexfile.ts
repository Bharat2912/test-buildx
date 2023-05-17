interface IKnexConfig {
  [key: string]: object;
}
const knexConfig: IKnexConfig = {
  DEV: {
    client: 'pg',
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
    },
    migrations: {
      directory: './data/migrations',
      schemaName: 'public',
    },
    seeds: {directory: './data/seeds'},
    searchPath: ['knex', 'public'],
  },
};
export default knexConfig;
