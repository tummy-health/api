import jwt, { Algorithm } from 'jsonwebtoken';

export const getToken = ({
  algorithm = 'RS256',
  audience = 'test-audience',
  encryptionKey = 'test-encryption-key',
  issuer = 'test-issuer',
  keyId = 'test-key-id',
  scope = 'test-scope',
  userId = 'test-user-id',
}: {
  algorithm?: Algorithm;
  audience?: string;
  encryptionKey?: string;
  issuer?: string;
  keyId?: string;
  scope?: string;
  userId?: string;
} = {}) =>
  jwt.sign({ scope, sub: userId }, encryptionKey, {
    algorithm,
    audience,
    issuer,
    keyid: keyId,
  });

export default {};
