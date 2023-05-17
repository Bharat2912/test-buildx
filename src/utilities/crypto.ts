import crypto from 'crypto';

export function encryptPassword(password: string) {
  const passHash = crypto.createHash('md5').update(password).digest('hex');
  return passHash;
}
