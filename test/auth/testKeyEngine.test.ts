import { TestKeyEngine } from '@src/auth/keyEngine';

test('returns key', async () => {
  const engine = new TestKeyEngine({
    keys: {
      'test-key-id': 'test-key',
    },
  });
  const { key } = await engine.getSigningKey({ id: 'test-key-id' });
  expect(key).toBe('test-key');
});
