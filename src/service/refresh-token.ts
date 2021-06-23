import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ServiceResources } from 'polymetis-node';
import RefreshTokenModel, { IRefreshTokenExternal, IRefreshTokenStatus } from '../model/RefreshToken';
import Errors from '../submodule/errors';

export default class RefreshTokenService {
  private readonly TOKEN_SECRET: string;
  private model: RefreshTokenModel;

  constructor(
    public resources: ServiceResources,
  ) {
    this.TOKEN_SECRET = process.env.TOKEN_SECRET;
    this.model = new RefreshTokenModel(resources);
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(16)
      .toString('hex');

    const refreshToken: IRefreshTokenExternal | null = await this.model.create({
      token,
      userId,
      id: null,
      status: IRefreshTokenStatus.active,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    return this.toPublic(refreshToken);
  }

  async deleteByUserIdAndToken(userId: string, token: string): Promise<void> {
    await this.model.deleteByUserIdAndToken(userId, token);
  }

  async getByUserIdAndToken(userId: string, token: string): Promise<string> {
    const refreshToken = await this.model.getByUserIdAndToken(userId, token);
    return this.toPublic(refreshToken);
  }

  // eslint-disable-next-line class-methods-use-this
  private toPublic(refreshToken: IRefreshTokenExternal): string {
    return refreshToken.token;
  }
}
