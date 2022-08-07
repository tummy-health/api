import buildJwks from 'jwks-rsa';

import Logger from '@src/logging/logger';
import ILogger from '@src/logging/loggerType';

export interface IKeyEngine {
  getSigningKey: (input: { id: string }) => Promise<{ key: string }>;
}

class KeyEngine implements IKeyEngine {
  private readonly jwks: IJwks;

  private readonly logger: ILogger;

  constructor({
    jwks,
    jwksUri,
    logger = new Logger(),
  }: {
    jwks?: IJwks;
    jwksUri?: string;
    logger?: ILogger;
  }) {
    if (!jwks)
      this.jwks = buildJwks({
        cache: true,
        jwksRequestsPerMinute: 10,
        jwksUri,
        rateLimit: true,
      });
    else this.jwks = jwks;
    this.logger = logger;
  }

  getSigningKey = async ({ id }) => {
    const { publicKey, rsaPublicKey } = await this.jwks.getSigningKey(id);
    return { key: publicKey || rsaPublicKey };
  };
}

interface IJwks {
  getSigningKey: (input: string) => Promise<Key>;
}

interface Key {
  publicKey?: string;
  rsaPublicKey?: string;
}

export class TestKeyEngine implements IKeyEngine {
  readonly keys: Record<string, string>;

  constructor({ keys = {} }: { keys?: Record<string, string> } = {}) {
    this.keys = keys;
  }

  getSigningKey = async ({ id }) => ({ key: this.keys[id] });
}

export default KeyEngine;
