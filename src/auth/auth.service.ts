import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { serialize } from 'cookie';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const match = await bcrypt.compare(password, user.password);
    if (match) return user;
    return null;
  }

  async login(user: any, res: Response) {
    const payload = { username: user.username, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    res.setHeader(
      'Set-Cookie',
      serialize('Authorization', `Bearer ${accessToken}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      }),
    );
    return res.status(201).json({ access_token: accessToken });
  }
}
