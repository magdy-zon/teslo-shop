import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  UnauthorizedException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dtos';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {

    try {
      const { password, ...userData} = createUserDto;
      const user = await this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);

      return {
        ...user,
        token: this.getJwtToken({id: user.id})
      };
    } catch (error) {
      this.handleDBErrors(error);
    }

  };

  async login(loginData: LoginUserDto) {
    const {password, email} = loginData;

    const user = await this.userRepository.findOne({
      where:{email},
      select: {email: true, password: true, id: true}
    });
    if(!user)
    throw new UnauthorizedException('Credentials are not valid');

    if(!bcrypt.compareSync(password, user.password))
    throw new UnauthorizedException('Credentials are not valid');
    
    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;

  }
  private handleDBErrors(error: any): never {
    if( error.code === '23505')
    throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Please check server logs');
  }

}
