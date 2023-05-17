import {
  SecretsManagerClient,
  GetSecretValueCommand,
  GetSecretValueCommandInput,
} from '@aws-sdk/client-secrets-manager';
import logger from '../logger/winston_logger';

interface ISecret {
  [key: string]: {
    [key: string]: string;
  };
}
const store: ISecret = {};

const client = new SecretsManagerClient({
  credentials:
    process.env.NODE_ENV === 'test'
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_KEY!,
        }
      : undefined,
  region: process.env.AWS_REGION,
});

export async function getSecrets(secret_name: string) {
  if (store[secret_name]) return store[secret_name];
  logger.info('Syncing Secret', secret_name);
  const input: GetSecretValueCommandInput = {
    SecretId: secret_name,
  };
  const command = new GetSecretValueCommand(input);
  const jwt = await client.send(command);
  if (jwt.SecretString) {
    store[secret_name] = JSON.parse(jwt.SecretString);
    return store[secret_name];
  }
  return null;
}
export async function getSecretsKey(secret_name: string, secret_key: string) {
  const secretJson = await getSecrets(secret_name);
  if (secretJson && secretJson[secret_key]) {
    logger.info('Fetched Secret Successfully', {secret_name, secret_key});
    return secretJson[secret_key];
  }
  logger.error('Secret Not Found', {secret_name, secret_key});
  throw new Error(`Secret Not Found :- ${secret_name}:${secret_key}`);
}
