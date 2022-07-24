import buildJwks from 'jwks-rsa';

export interface IKeyEngine {
  getSigningKey: (input: { id: string }) => Promise<{ key: string }>;
}

class KeyEngine implements IKeyEngine {
  readonly jwks: IJwks;

  constructor({
    jwks = buildJwks({
      cache: true,
      jwksRequestsPerMinute: 10,
      jwksUri: 'test',
      rateLimit: true,
    }),
  }: {
    jwks: IJwks;
  }) {
    this.jwks = jwks;
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

  constructor({ keys }: { keys: Record<string, string> }) {
    this.keys = keys;
  }

  getSigningKey = async ({ id }) => ({ key: this.keys[id] });
}

export default KeyEngine;
