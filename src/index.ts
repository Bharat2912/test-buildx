import 'source-map-support/register';
import apm from 'elastic-apm-node';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.LOCAL_RUN)
  apm.start({
    asyncHooks: false,
  });
import express, {Application, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {connectdb, pingdb} from './data/knex';
import {initSQS} from './utilities/sqs_manager';
import routes from './module';
import cors from 'cors';
import * as secretStore from './utilities/secret/secret_store';
import swaggerUi from 'swagger-ui-express';
import logger from './utilities/logger/winston_logger';
import httpLogger from './utilities/logger/morgan_logger';
import swaggerDocument from './utilities/swagger_docs';
import * as cache from './utilities/cache_manager';
import {monitor} from './utilities/metrics/prometheus';
import client from 'prom-client';
import {initElastic} from './utilities/es_manager';
import Globals from './utilities/global_var/globals';

const collectMetrics = client.collectDefaultMetrics;
collectMetrics();
async function app() {
  await secretStore.syncSecrets();
  await cache.initCache();
  await connectdb();
  await Globals.syncAll();
  await initElastic();
  await initSQS();
  const server: Application = express();
  server.use(httpLogger);
  server.use(
    express.json({
      limit: '2mb',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      verify: function (req: any, res, buf) {
        if (
          req.originalUrl === '/core/callback/cashfree/refund' ||
          req.originalUrl === '/core/callback/cashfree/payment'
        ) {
          req.rawBody = buf;
        }
      },
    })
  );
  server.use(bodyParser.urlencoded({extended: true}));
  server.use('/core', express.static('public'));
  server.use(cors());
  server.use(bodyParser.json({limit: '10mb'}));

  server.get('/metrics', monitor('get_metrics'), async (req, res) => {
    res.set('Content-type', client.register.contentType);
    return res.send(await client.register.metrics());
  });

  /**
   * @openapi
   * /health:
   *  get:
   *     tags:
   *     - Healthcheck
   *     description: Responds if the app is up and running
   *     responses:
   *       200:
   *         description: App is up and running
   */
  server.use('/health', async (req: Request, res: Response) => {
    const dbOk = await pingdb();
    if (dbOk) {
      res.status(200).send('#OK');
    } else {
      res.status(500).send('DB Error!!');
    }
  });
  server.use(
    '/core/swagger',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customSiteTitle: 'Core/Food-Swagger',
    })
  );
  server.get('/core/swagger.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  server.use('/', routes);
  server.use('/', (req: Request, res: Response) => {
    res.status(404).send('#Invalid Path');
  });
  const port = process.env.SERVER_PORT || 8080;
  const listener = server.listen(port, () => {
    logger.info(`server starts on port.. ${port}...`);
    logger.info(`Seving API DOC >> http://localhost:${port}/core/swagger`);
  });
  listener.keepAliveTimeout = 60 * 1000 + 1000;
  listener.headersTimeout = 60 * 1000 + 2000;
}
app();
