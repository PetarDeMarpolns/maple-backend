import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ access_token: string }> {
    try {
      const { username, password } = createUserDto;
  
      const existingUser = await this.userModel.findOne({ username });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new this.userModel({
        username,
        password: hashedPassword,
        roles: ['USER'],
      });
      await user.save();
  
      const payload = { sub: user._id, roles: user.roles };
  
      // 여기서 JWT_SECRET 출력해 확인
      console.log('JWT_SECRET:', process.env.JWT_SECRET);
  
      const access_token = this.jwtService.sign(payload);
  
      return { access_token };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async validateUser(username: string, password: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const user = await this.validateUser(username, password);

    const payload = { sub: user._id, roles: user.roles };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}