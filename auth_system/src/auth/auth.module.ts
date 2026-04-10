import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { jwtConstants } from './constants';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    JwtModule.register({
      global: true,
      // secret: process.env.JWT_SECRET || jwtConstants.secret,
      secret: process.env.JWT_SECRET ,
      signOptions: { expiresIn: '80s' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { };
