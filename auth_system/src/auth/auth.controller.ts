import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PromoteUserDto } from './dto/promote-user.dto';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '../../schemas/user.types';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService) { }

  /**
   * Register new user (default role: user)
   * @param registerUserDto - User registration data
   * @returns Access and refresh tokens
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterDto) {
    const tokens = await this.authService.registerUser(registerUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: tokens,
    };
  }

  /**
   * Login user
   * @param loginDto - User login credentials
   * @returns Access and refresh tokens
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User logged in successfully',
      data: tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   * @public endpoint
   * @param refreshTokenDto - Refresh token
   * @returns New access and refresh tokens
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
    return {
      statusCode: HttpStatus.OK,
      message: 'Token refreshed successfully',
      data: tokens,
    };
  }

  /**
   * Get authenticated user profile
   * @requires Authentication
   */
  @UseGuards(AuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req) {
    const userID = req.user.sub;
    const user = await this.userService.getUserById(userID);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved successfully',
      data: {
        id: user?._id,
        username: user?.username,
        email: user?.email,
        role: user?.role,
      },
    };
  }

  /**
   * Promote a user to admin role
   * @requires Admin role
   * @param promoteUserDto - Target user ID to promote
   * @returns Updated user with admin role
   */
  @Post('promote-to-admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async promoteToAdmin(@Body() promoteUserDto: PromoteUserDto) {
    const result = await this.authService.promoteUserToAdmin(promoteUserDto.userId);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.user,
    };
  }
}
