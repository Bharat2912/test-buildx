import dotenv from 'dotenv';
dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});
import * as secretStore from '../../utilities/secret/secret_store';
import * as cache from '../../utilities/cache_manager';
import httpLogger from '../../utilities/logger/morgan_logger';
import express, {Application, Request, Response} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from '../../module';
import {initElastic} from '../../utilities/es_manager';
import Globals from '../../utilities/global_var/globals';
import {createEmptyTestDatabase, loadMockSeedData} from './utils';

export async function initGlobalServices() {
  await secretStore.syncSecrets();
  await cache.initCache();
  await createEmptyTestDatabase();
  await loadMockSeedData('global_var');
  await Globals.syncAll();
  await initElastic();
}
/**
 * createTestServer function creates new server, this server instance is used by supertest to run tests
 * @returns test server instance with all bindings
 */
export async function createTestServer() {
  await initGlobalServices();

  const server: Application = express();
  server.use(httpLogger);
  server.use(bodyParser.urlencoded({extended: true}));
  server.use('/core', express.static('public'));
  server.use(cors());
  server.use(bodyParser.json({limit: '10mb'}));
  server.use('/', routes);
  server.use('/', (req: Request, res: Response) => {
    res.status(404).send('#Invalid Path');
  });
  return server;
}
