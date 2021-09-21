import { Store } from './store';
import { Identity } from './types';

class RedisStore implements Store {
  public store: any;

  private readonly nameSpacedKeyPrefix: string = 'redis-store-id::';

  public constructor(redisStoreInstance: unknown) {
    this.store = redisStoreInstance;
  }

  public setForIdentity(
    identity: Identity,
    timestamps: readonly number[],
    windowMs?: number
  ): Promise<void> {
    return new Promise<void>((res, rej): void => {
      const expiry = windowMs
        ? ['EX', Math.ceil((Date.now() + windowMs) / 1000)]
        : [];
      this.store.set(
        [
          this.generateNamedSpacedKey(identity),
          JSON.stringify([...timestamps]),
          ...expiry,
        ],
        (err: Error | null): void => {
          if (err) return rej(err);
          return res();
        }
      );
    });
  }

  public async getForIdentity(identity: Identity): Promise<readonly number[]> {
    return new Promise<readonly number[]>((res, rej): void => {
      this.store.get(
        this.generateNamedSpacedKey(identity),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: Error | null, obj: any): void => {
          if (err) {
            return rej(err);
          }
          return res(obj ? JSON.parse(obj) : []);
        }
      );
    });
  }

  private readonly generateNamedSpacedKey = (identity: Identity): string => {
    return `${this.nameSpacedKeyPrefix}${identity.contextIdentity}:${identity.fieldIdentity}`;
  };
}

export { RedisStore };
