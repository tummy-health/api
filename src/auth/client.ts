import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import { IKeyEngine } from '@src/auth/keyEngine';
import Logger from '@src/logging/logger';
import ILogger from '@src/logging/loggerType';

export interface IAuthClient {
  authorize: (input: {
    token: string;
  }) => Promise<{ scope: string; userId: string }>;
}

class AuthClient implements IAuthClient {
  private readonly audience: string;

  private readonly issuer: string;

  private readonly keyEngine: IKeyEngine;

  private readonly logger: ILogger;

  constructor({
    audience,
    issuer,
    keyEngine,
    logger = new Logger(),
  }: {
    audience: string;
    issuer: string;
    keyEngine: IKeyEngine;
    logger?: ILogger;
  }) {
    this.audience = audience;
    this.issuer = issuer;
    this.keyEngine = keyEngine;
    this.logger = logger;
  }

  authorize = async ({ token }) => {
    try {
      const { token: parsedToken } = parseToken({ token });
      const decodedToken = jwt.decode(parsedToken, { complete: true });
      if (!decodedToken) throw new InvalidTokenError();
      const {
        header: { kid: keyId },
      } = decodedToken;
      const { key } = await this.keyEngine.getSigningKey({ id: keyId });
      const { scope, sub: userId } = jwt.verify(parsedToken, key, {
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
      this.logger.error(error);
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

const parseToken = ({ token }: { token: string }): { token: string } => ({
  token: token.replace('Bearer ', ''),
});

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
