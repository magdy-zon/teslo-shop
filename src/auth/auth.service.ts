import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dtos';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  async create(createUserDto: CreateUserDto) {

    try {
      const { password, ...userData} = createUserDto;
      const user = await this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }

  };

  async login(loginData: LoginUserDto) {
    const {password, email} = loginData;

    const user = await this.userRepository.findOne({
      where:{email},
      select: {email: true, password: true}
    });

    if(!user)
    throw new UnauthorizedException('Credentials are not valid')

    if(!bcrypt.compareSync(password, user.password))
    throw new UnauthorizedException('Credentials are not valid')
    
    return user;
  }

  private handleDBErrors(error: any): never {
    if( error.code === '23505')
    throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }

}
