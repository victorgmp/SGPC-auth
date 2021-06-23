/* eslint-disable class-methods-use-this */
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ServiceResources } from 'polymetis-node';
import AuthModel, { IAuthExternal, IAuth, IAuthStatus } from '../model/Auth';
import Errors from '../submodule/errors';

export default class AuthService {
  private readonly TOKEN_SECRET: string;
  private model: AuthModel;

  constructor(
    public resources: ServiceResources,
  ) {
    this.TOKEN_SECRET = process.env.TOKEN_SECRET;
    this.model = new AuthModel(resources);
  }

  async authenticate(userId: string, password: string): Promise<IAuth> {
    const auth: IAuthExternal | null = await this.model.getByUserId(userId);

    if (!auth) {
      throw new Error(Errors.AUTH.USER_NOT_FOUND);
    }

    const passwordHash = this.hashPassword(password, auth.salt);

    if (auth.passwordHash !== passwordHash) {
      throw new Error(Errors.AUTH.INVALID_PASSWORD);
    }

    return this.toPublic(auth);
  }

  async register(userId: string, password: string): Promise<IAuth> {
    const auth: IAuthExternal | null = await this.model.getByUserId(userId);

    if (auth) {
      throw new Error(Errors.AUTH.USER_ALREADY_EXISTS);
    }

    if (!this.isPasswordValid(password)) {
      throw new Error(Errors.AUTH.INVALID_PASSWORD);
    }

    const salt = crypto.randomBytes(16)
      .toString('hex')
      .slice(0, 16);
    const passwordHash = this.hashPassword(password, salt);

    let newAuth: IAuthExternal = {
      userId,
      salt,
      passwordHash,
      id: null,
      status: IAuthStatus.active,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    newAuth = await this.model.create(newAuth);
    return this.toPublic(newAuth);
  }

  async signIn(userId: string, password: string): Promise<{ token: string, auth: IAuth }> {
    const auth = await this.authenticate(userId, password);
    return {
      auth,
      token: this.generateAccessToken(auth),
    };
  }

  async signUp(userId: string, password: string): Promise<{ token: string, auth: IAuth }> {
    const auth = await this.register(userId, password);
    return {
      auth,
      token: this.generateAccessToken(auth),
    };
  }

  async delete(id: string): Promise<void> {
    await this.model.delete(id);
  }

  async deleteByUserId(id: string): Promise<void> {
    await this.model.deleteByUserId(id);
  }

  async getByUserIds(userIds: string[]): Promise<IAuth[]> {
    const auths = await this.model.getByUserIds(userIds);
    return auths.map(this.toPublic);
  }

  /**
  * Above you can see the expression for validating a
  * strong password. Let’s break down what it is doing.
  * - The string must contain at least 1 lowercase alphabetical character
  * - The string must contain at least 1 uppercase alphabetical character
  * - The string must contain at least 1 numeric character
  * - The string must contain at least one special character, but we
  *   are escaping reserved RegEx characters to avoid conflict
  * - The string must be eight characters or longer
  */
  isPasswordValid(password: string): boolean {
    // eslint-disable-next-line no-useless-escape
    const regEx = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
    return (
      password
      && typeof password === 'string'
      && regEx.test(password)
    );
  }

  generateAccessToken(auth: IAuth, expiresIn = 3600): string {
    const authJson: IAuth = {
      userId: auth.userId,
    };
    return jwt.sign(authJson, this.TOKEN_SECRET, { expiresIn });
  }

  verifyAccessToken(token: string): IAuth {
    try {
      const authJson: any = jwt.verify(token, this.TOKEN_SECRET);

      if (!authJson) {
        throw new Error();
      }
      if (!authJson.userId || typeof authJson.userId !== 'string') {
        throw new Error();
      }
      const auth: IAuth = {
        userId: authJson.userId,
      };

      return auth;
    } catch (err) {
      throw new Error(Errors.AUTH.INVALID_ACCESS_TOKEN);
    }
  }

  hashPassword(password: string, salt: string): string {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);

    return hash.digest('hex');
  }

  private toPublic(auth: IAuthExternal): IAuth {
    return {
      userId: auth.userId,
    };
  }
}
