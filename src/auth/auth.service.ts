import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashPassword = await this.hashPassword(registerUserDto.password);
    return await this.userRepository.save({
      ...registerUserDto,
      refreshToken: 'refreshTokenDefault',
      password: hashPassword,
    });
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });
    if (!user) {
      throw new HttpException('Email is not exist', HttpStatus.NOT_FOUND);
    }
    const checkPassword = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!checkPassword) {
      throw new HttpException(
        'Password is not correct',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload = { id: user.id, email: user.email };
    return this.generateToken(payload);
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const verifiedToken: { id: number; email: string } =
        await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.get<string>('SECRET'),
        });
      const checkExistToken = await this.userRepository.findOneBy({
        email: verifiedToken.email,
        refreshToken,
      });
      if (checkExistToken) {
        return this.generateToken({
          id: verifiedToken.id,
          email: verifiedToken.email,
        });
      } else {
        throw new HttpException(
          'Refresh token is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Refresh token is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  private async generateToken(payload: { id: number; email: string }) {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('SECRET'),
      expiresIn: '1d',
    });
    await this.userRepository.update(
      { email: payload.email },
      { refreshToken: refreshToken },
    );
    return {
      accessToken,
      refreshToken,
    };
  }
}
