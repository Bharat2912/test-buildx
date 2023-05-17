/* eslint-disable @typescript-eslint/no-explicit-any */
import knex, {Knex} from 'knex';
import * as secretStore from '../utilities/secret/secret_store';
import logger from '../utilities/logger/winston_logger';
import pg from 'pg';
import pgArray from 'postgres-array';

pg.types.setTypeParser(1016, text =>
  pgArray.parse(text, value => {
    return parseInt(value);
  })
);

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
  return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
  return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
  return parseFloat(value);
});
export class DB {
  static write: Knex;
  static read: Knex;
}
export async function pingdb() {
  try {
    await DB.write.raw("SELECT 'db connected' AS status");
    await DB.read.raw("SELECT 'db connected' AS status");
  } catch (error) {
    return false;
  }
  return true;
}

async function seed() {
  const seedConfig = {
    directory: __dirname + '/seeds',
  };
  logger.info('Running seed...');

  await DB.write.seed.run(seedConfig).then((result: {}[][]) => {
    logger.info('Ran Seed', result);
  });
  logger.info('Ran seed: Finish ');
}
async function migrate() {
  const migrationConfig = {
    directory: __dirname + '/migrations',
  };
  logger.info('Running migrations...');
  await DB.write.migrate.latest(migrationConfig).then((result: {}[][]) => {
    const log = result[1];
    if (!log.length) {
      logger.info('Database is already up to date');
    } else {
      logger.info('Ran migrations:>> ');
      for (let i = 0; i < log.length; i++) {
        logger.info(i + 1 + '=> ' + log[i]);
      }
      logger.info('Ran Migration Count: ', result[0]);
    }
  });
  logger.info('Ran migrations: Finish ');
}

export async function connectdb() {
  try {
    logger.info('Database connecting... ');

    const configOptions: Knex.Config = {
      client: 'pg',
      connection: {
        user: secretStore.getSecret('DB_USER'),
        password: secretStore.getSecret('DB_PASSWORD'),
        host: secretStore.getSecret('DB_HOST'),
        port: +secretStore.getSecret('DB_PORT'),
        database: secretStore.getSecret('DB_DATABASE'),
      },
      migrations: {
        directory: './data/migrations',
        schemaName: 'public',
        disableMigrationsListValidation: true,
        extension: 'js',
        loadExtensions: ['.js', '.ts'],
      },
      seeds: {
        directory: './data/seeds',
        extension: 'js',
        loadExtensions: ['.js', '.ts'],
      },
      searchPath: ['knex', 'public'],
    };
    DB.write = knex(configOptions);
    await DB.write.raw("SELECT 'write db connected' AS status");
    logger.info('Write Database connected');

    (configOptions.connection as Knex.PgConnectionConfig).host =
      secretStore.getSecret('DB_READ_HOST');
    DB.read = knex(configOptions);
    await DB.read.raw("SELECT 'readt db connected' AS status");
    logger.info('Read Database connected');
  } catch (error) {
    logger.error('Database Connection Error!!', error);
    throw error;
  }

  try {
    if (process.env.DB_MIGRATE_ON_START?.toLocaleLowerCase() === 'true') {
      await migrate();
    }
  } catch (error) {
    logger.error('Migration Error !!', error);
    throw error;
  }

  try {
    if (process.env.DB_MIGRATE_ON_START?.toLocaleLowerCase() === 'true') {
      await seed();
    }
  } catch (error) {
    logger.error('Error in running seed', error);
    throw error;
  }
  return;
}
export async function stopDB() {
  await DB.write.destroy();
  await DB.read.destroy();
}
export async function getTransaction(): Promise<Knex.Transaction<any, any[]>> {
  const trx: Knex.Transaction = await DB.write.transaction();
  return trx;
}
