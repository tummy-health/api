import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import KeyEngine, { IKeyEngine } from '@src/auth/keyEngine';

export interface IAuthClient {
  authorize: (input: {
    token: string;
  }) => Promise<{ scope: string; userId: string }>;
}

class AuthClient implements IAuthClient {
  readonly audience: string;

  readonly issuer: string;

  readonly keyEngine: IKeyEngine;

  constructor({
    audience,
    issuer,
    keyEngine,
  }: {
    audience: string;
    issuer: string;
    keyEngine: IKeyEngine;
  }) {
    this.audience = audience;
    this.issuer = issuer;
    this.keyEngine = keyEngine;
  }

  authorize = async ({ token }) => {
    try {
      const decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken) throw new InvalidTokenError();
      const {
        header: { kid: keyId },
      } = decodedToken;
      const { key } = await this.keyEngine.getSigningKey({ id: keyId });
      const { scope, sub: userId } = jwt.verify(token, key, {
        algorithms: ['RS256'],
        audience: this.audience,
        issuer: this.issuer,
      }) as {
        scope?: string;
        sub?: string;
      };
      if (!scope || !userId) throw new InvalidTokenError();
      return { scope, userId };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        if (error.message === 'invalid algorithm')
          throw new IncorrectAlgorithmError();
        if (error.message === 'invalid signature')
          throw new VerificationFailedError();
        if (error.message.startsWith('jwt audience invalid'))
          throw new VerificationFailedError();
        if (error.message.startsWith('jwt issuer invalid'))
          throw new VerificationFailedError();
      }
      throw error;
    }
  };
}

export class TestAuthClient implements IAuthClient {
  readonly tokens: Tokens;

  constructor({ tokens = {} }: { tokens?: Tokens } = {}) {
    this.tokens = tokens;
  }

  authorize = async ({ token }) => {
    const response = this.tokens[token];
    if (response instanceof AuthorizationError) throw response;
    return response;
  };
}

type Tokens = Record<
  string,
  { scope: string; userId: string } | AuthorizationError
>;

export class AuthorizationError extends Error {
  constructor({
    message = 'failed to authenticate or authorize',
  }: {
    message?: string;
  } = {}) {
    super(message);
  }
}

export class IncorrectAlgorithmError extends AuthorizationError {
  constructor() {
    super({ message: 'the token was not encoded with an expected algorithm' });
  }
}

export class InvalidTokenError extends AuthorizationError {
  constructor() {
    super({ message: 'the token was invalid' });
  }
}

export class VerificationFailedError extends AuthorizationError {
  constructor() {
    super({ message: 'the token could not be verified' });
  }
}

export default AuthClient;
