import * as secretManager from './secret_manager';
import logger from '../logger/winston_logger';

interface ISecret {
  [key: string]: string | undefined;
}
const store: ISecret = {};

export async function syncSecrets() {
  for (const [key, value] of Object.entries(process.env)) {
    if (value?.startsWith('secretManager://')) {
      const secretKeyName = value.replace('secretManager://', '');
      const secretName = secretKeyName.split(':')[0];
      const secretKey = secretKeyName.split(':')[1];
      logger.info('Fetching secret', {secretName, secretKey});
      store[key] = await secretManager.getSecretsKey(secretName, secretKey);
    } else {
      store[key] = value;
    }
  }
}

export function getSecret(secretKey: string) {
  if (store[secretKey]) {
    return store[secretKey] || '';
  }
  throw new Error('Secret Not Found ' + secretKey);
}
