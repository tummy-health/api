import {
  AuthorizationError,
  IncorrectAlgorithmError,
  InvalidTokenError,
  TestAuthClient,
  VerificationFailedError,
} from '@src/auth/client';

test('returns scope and userId', async () => {
  const client = new TestAuthClient({
    tokens: {
      'test-token': { scope: 'test-scope', userId: 'test-user-id' },
    },
  });
  const token = 'test-token';
  const { scope, userId } = await client.authorize({ token });
  expect(scope).toBe('test-scope');
  expect(userId).toBe('test-user-id');
});

test('throws AuthorizationError', async () => {
  const client = new TestAuthClient({
    tokens: {
      'test-token': new AuthorizationError(),
    },
  });
  const token = 'test-token';
  expect(() => client.authorize({ token })).rejects.toThrow(AuthorizationError);
});

test('throws IncorrectAlgorithmError', async () => {
  const client = new TestAuthClient({
    tokens: {
      'test-token': new IncorrectAlgorithmError(),
    },
  });
  const token = 'test-token';
  expect(() => client.authorize({ token })).rejects.toThrow(
    IncorrectAlgorithmError
  );
});

test('throws InvalidTokenError', async () => {
  const client = new TestAuthClient({
    tokens: {
      'test-token': new InvalidTokenError(),
    },
  });
  const token = 'test-token';
  expect(() => client.authorize({ token })).rejects.toThrow(InvalidTokenError);
});

test('throws VerificationFailedError', async () => {
  const client = new TestAuthClient({
    tokens: {
      'test-token': new VerificationFailedError(),
    },
  });
  const token = 'test-token';
  expect(() => client.authorize({ token })).rejects.toThrow(
    VerificationFailedError
  );
});
