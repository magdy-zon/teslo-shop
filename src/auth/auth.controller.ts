import { Body, Controller, Get, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dtos';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/get-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { Auth, RoleProtected } from './decorators';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards( AuthGuard(), UserRoleGuard )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeaders() headers: string[]
  ) {

    return {
      ok: true,
      message: 'pRIVATE',
      user,
      userEmail,
      headers,
    }
  }

  @Get('private2')
  // @SetMetadata('roles',['admin', 'superadmin'])
  @RoleProtected(ValidRoles.superAdmin, ValidRoles.admin)
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeaders() headers: string[]
  ) {

    return {
      ok: true,
      message: 'pRIVATE',
      user,
      userEmail,
      headers,
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeaders() headers: string[]
  ) {

    return {
      ok: true,
      message: 'pRIVATE',
      user,
      userEmail,
      headers,
    }
  }
}
