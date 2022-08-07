import KeyEngine from '@src/auth/keyEngine';

test('calls jwks with key and returns public key', async () => {
  const jwks = {
    getSigningKey: jest.fn(async () => ({
      publicKey: 'test-public-key',
    })),
  };
  const engine = new KeyEngine({ jwks });
  const { key } = await engine.getSigningKey({ id: 'test-key-id' });
  expect(jwks.getSigningKey).toHaveBeenCalledWith('test-key-id');
  expect(key).toBe('test-public-key');
});

test('returns rsa public key if public key is not in result', async () => {
  const jwks = {
    getSigningKey: jest.fn(async () => ({
      rsaPublicKey: 'test-public-key',
    })),
  };
  const engine = new KeyEngine({ jwks });
  const { key } = await engine.getSigningKey({ id: 'test-key-id' });
  expect(jwks.getSigningKey).toHaveBeenCalledWith('test-key-id');
  expect(key).toBe('test-public-key');
});
