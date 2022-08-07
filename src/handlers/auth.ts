import AuthClient from '@src/auth/client';
import KeyEngine from '@src/auth/keyEngine';
import Logger from '@src/logging/logger';
import env from '@src/env';

const logger = new Logger();

const handler = async ({ authorizationToken, methodArn }, context) => {
  const keyEngine = new KeyEngine({ jwksUri: env.authJwksUri });
  const authClient = new AuthClient({
    audience: env.authAudience,
    issuer: env.authIssuer,
    keyEngine,
  });
  try {
    const { scope, userId } = await authClient.authorize({
      token: authorizationToken,
    });
    return {
      context: { scope },
      policyDocument: {
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: methodArn,
          },
        ],
        Version: '2012-10-17',
      },
      principalId: userId,
    };
  } catch (error) {
    logger.error(error);
    context.fail(error);
  }
  return undefined;
};

export default handler;
