import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";

import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces";


@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy) {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService
  ) {

    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    const {id} = payload;
    const user = await this.userRepository.findOneBy({id});

    if(!user)
    throw new UnauthorizedException('Token invalid');

    if(!user.isActive)
    throw new UnauthorizedException('User is inactived');

    return user;
  }
}