import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { UserService } from 'src/user/user.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService) { }

  @Post('register')
  async register(@Body() registerUserDto: RegisterDto) {
    const token = await this.authService.registerUser(registerUserDto);
    return token;
  }


  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    return token;
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // receive the token from the request header and verify it and return the user data
    const userID = req.user.sub;
    const user = await this.userService.getUserById(userID);
    console.log("User data from profile route:", user);
    return {
      id: user?._id,
      username: user?.username,
      email: user?.email,
    };

  }
}
