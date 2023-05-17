import client from 'prom-client';
import responseTime from 'response-time';

export const responseTimeHistogram = new client.Histogram({
  name: 'request_latencies_ms',
  help: 'REST API response time in milli seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 400, 600, 800, 1000, 2000, 3000, 5000],
});

export const databaseResponseTimeHistogram = new client.Histogram({
  name: 'db_latencies_ms',
  help: 'Database response time in mili seconds',
  labelNames: ['operation', 'success'],
  buckets: [5, 10, 20, 40, 60, 80, 100, 200, 300, 500],
});

export function monitor(label: string) {
  return responseTime((req, res, time: number) => {
    if (req) {
      const data = {
        method: req.method,
        route: label,
        status_code: res.statusCode,
      };
      responseTimeHistogram.observe(data, time * 1);
    }
  });
}
