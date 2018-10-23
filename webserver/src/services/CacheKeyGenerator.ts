'use strict';

class CacheKeyGenerator {
  private baseKeys = {
    userAccountConfig: 'userAccountConfig',
    usersPendingActivation: 'usersPendingActivation',
    sessionTokens: 'sessionTokens',
    passwordsPendingReset: 'passwordsPendingReset',
  };

  public userAccountConfig = (): string => this.baseKeys.userAccountConfig;

  public usersPendingActivation = (args: { email: string }): string =>
    `${this.baseKeys.usersPendingActivation}:${args.email}`

  public sessionTokens = (args: { token: string }): string =>
    `${this.baseKeys.sessionTokens}:${args.token}`

  public passwordsPendingReset = (args: { email: string }): string =>
  `${this.baseKeys.passwordsPendingReset}:${args.email}`
}

const cacheKeyGenerator = new CacheKeyGenerator();
export default cacheKeyGenerator;