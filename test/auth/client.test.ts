import jwt, { Algorithm } from 'jsonwebtoken';
import fs from 'fs';

import Client, {
  IncorrectAlgorithmError,
  InvalidTokenError,
  VerificationFailedError,
} from '@src/auth/client';
import { TestKeyEngine } from '@src/auth/keyEngine';

const getToken = ({
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

test('authorizes', async () => {
  const encryptionKey = await fs.promises.readFile(
    './test/auth/rsa.pem',
    'utf8'
  );
  const keyEngine = new TestKeyEngine({
    keys: { 'test-key-id': encryptionKey },
  });
  const client = new Client({
    audience: 'test-audience',
    issuer: 'test-issuer',
    keyEngine,
  });
  const token = getToken({
    algorithm: 'RS256',
    audience: 'test-audience',
    encryptionKey,
    issuer: 'test-issuer',
    keyId: 'test-key-id',
    scope: 'test-scope',
    userId: 'test-user-id',
  });
  const { scope, userId } = await client.authorize({ token });
  expect(scope).toBe('test-scope');
  expect(userId).toBe('test-user-id');
});

test('throws IncorrectAlgorithmError if token was not signed with RS256', async () => {
  const keyEngine = new TestKeyEngine({
    keys: { 'test-key-id': 'test-encryption-key' },
  });
  const client = new Client({
    audience: 'test-audience',
    issuer: 'test-issuer',
    keyEngine,
  });
  const token = getToken({
    algorithm: 'HS256',
    encryptionKey: 'test-encryption-key',
    keyId: 'test-key-id',
  });
  await expect(() => client.authorize({ token })).rejects.toThrow(
    IncorrectAlgorithmError
  );
});

test('throws InvalidTokenError if token could not be decoded', async () => {
  const keyEngine = new TestKeyEngine();
  const client = new Client({
    audience: 'test-audience',
    issuer: 'test-issuer',
    keyEngine,
  });
  await expect(() =>
    client.authorize({ token: 'blah blah blah' })
  ).rejects.toThrow(InvalidTokenError);
});

test('throws VerificationFailedError if token was invalid', async () => {
  const encryptionKey = await fs.promises.readFile(
    './test/auth/rsa.pem',
    'utf8'
  );
  const otherEncryptionKey = await fs.promises.readFile(
    './test/auth/other-rsa.pem',
    'utf8'
  );
  const keyEngine = new TestKeyEngine({
    keys: { 'test-key-id': encryptionKey },
  });
  const client = new Client({
    audience: 'test-audience',
    issuer: 'test-issuer',
    keyEngine,
  });
  const token = getToken({
    encryptionKey: otherEncryptionKey,
    keyId: 'test-key-id',
  });
  await expect(() => client.authorize({ token })).rejects.toThrow(
    VerificationFailedError
  );
});

test('throws InvalidTokenError if token does not have scope', async () => {
  const encryptionKey = await fs.promises.readFile(
    './test/auth/rsa.pem',
    'utf8'
  );
  const keyEngine = new TestKeyEngine({
    keys: {
      'test-key-id': encryptionKey,
    },
  });
  const client = new Client({
    audience: 'test-audience',
    issuer: 'test-issuer',
    keyEngine,
  });
  const token = getToken({
    encryptionKey,
    keyId: 'test-key-id',
    scope: null,
  });
  await expect(() => client.authorize({ token })).rejects.toThrow(
    InvalidTokenError
  );
});

test('throws InvalidTokenError if token does not have userId', async () => {
  const encryptionKey = await fs.promises.readFile(
    './test/auth/rsa.pem',
    'utf8'
  );
  const keyEngine = new TestKeyEngine({
    keys: {
      'test-key-id': encryptionKey,
    },
  });
  const client = new Client({
    audience: 'test-audience',
    issuer: 'test-issuer',
    keyEngine,
  });
  const token = getToken({
    encryptionKey,
    keyId: 'test-key-id',
    userId: null,
  });
  await expect(() => client.authorize({ token })).rejects.toThrow(
    InvalidTokenError
  );
});

test('throws VerificationFailedError if token has incorrect audience', async () => {
  const encryptionKey = await fs.promises.readFile(
    './test/auth/rsa.pem',
    'utf8'
  );
  const keyEngine = new TestKeyEngine({
    keys: {
      'test-key-id': encryptionKey,
    },
  });
  const client = new Client({
    audience: 'test-audience',
    issuer: 'test-issuer',
    keyEngine,
  });
  const token = getToken({
    audience: 'other-audience',
    encryptionKey,
    keyId: 'test-key-id',
  });
  await expect(() => client.authorize({ token })).rejects.toThrow(
    VerificationFailedError
  );
});

test('throws VerificationFailedError if token has incorrect issuer', async () => {
  const encryptionKey = await fs.promises.readFile(
    './test/auth/rsa.pem',
    'utf8'
  );
  const keyEngine = new TestKeyEngine({
    keys: {
      'test-key-id': encryptionKey,
    },
  });
  const client = new Client({
    audience: 'test-audience',
    issuer: 'test-issuer',
    keyEngine,
  });
  const token = getToken({
    encryptionKey,
    issuer: 'other-issuer',
    keyId: 'test-key-id',
  });
  await expect(() => client.authorize({ token })).rejects.toThrow(
    VerificationFailedError
  );
});
