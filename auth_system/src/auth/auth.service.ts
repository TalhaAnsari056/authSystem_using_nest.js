import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    /**
     * Generate both access and refresh tokens
     * @param userId - User ID
     * @param username - Username
     * @param role - User role
     * @returns Object with access and refresh tokens
     */
    private async generateTokens(userId: string, username: string, role: string) {
        const payload = { sub: userId, username, role };
        
        // Access token expires in 15 minutes
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
        });

        // Refresh token expires in 7 days
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
        });

        return { accessToken, refreshToken };
    }

    async registerUser(registerUserDto: RegisterDto) {
        console.log("user Dto:", registerUserDto);

        const saltRounds = 10;
        const hash = await bcrypt.hash(registerUserDto.password, saltRounds)

        const user = await this.userService.createUser({ ...registerUserDto, password: hash });
        
        // Generate tokens
        const { accessToken, refreshToken } = await this.generateTokens(
            user._id.toString(),
            user.username,
            user.role
        );

        // Store refresh token in database
        await this.userService.updateRefreshToken(user._id.toString(), refreshToken);

        console.log("Generated JWT token:", accessToken);
        return { access_token: accessToken, refresh_token: refreshToken };
    }

    async login(loginDto: LoginDto) {
        console.log("Login attempt for:", loginDto.email);

        // Find user by email
        const user = await this.userService.getUserByEmail(loginDto.email);
        
        if (!user) {
            console.log("User not found with email:", loginDto.email);
            throw new UnauthorizedException('Invalid email or password');
        }

        // Compare provided password with hashed password in DB
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        
        if (!isPasswordValid) {
            console.log("Password mismatch for user:", loginDto.email);
            throw new UnauthorizedException('Invalid email or password');
        }

        // Generate tokens
        const { accessToken, refreshToken } = await this.generateTokens(
            user._id.toString(),
            user.username,
            user.role
        );

        // Store refresh token in database
        await this.userService.updateRefreshToken(user._id.toString(), refreshToken);

        console.log("User logged in successfully:", user.username);
        return { access_token: accessToken, refresh_token: refreshToken };
    }

    /**
     * Refresh access token using refresh token
     * @param refreshToken - Refresh token from client
     * @returns New access token and refresh token
     */
    async refreshAccessToken(refreshToken: string) {
        try {
            // Verify refresh token
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_SECRET,
            });

            // Find user in database
            const user = await this.userService.getUserById(payload.sub);

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Verify refresh token matches stored token
            if (user.refreshToken !== refreshToken) {
                throw new UnauthorizedException('Refresh token does not match');
            }

            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
                user._id.toString(),
                user.username,
                user.role
            );

            // Store new refresh token in database
            await this.userService.updateRefreshToken(user._id.toString(), newRefreshToken);

            return { access_token: accessToken, refresh_token: newRefreshToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    /**
     * Promote a user to admin role (Admin only)
     * @param targetUserId - User ID to promote
     */
    async promoteUserToAdmin(targetUserId: string) {
        // Validate user exists
        const user = await this.userService.getUserById(targetUserId);
        
        if (!user) {
            throw new NotFoundException(`User with ID "${targetUserId}" not found`);
        }

        if (user.role === 'admin') {
            throw new BadRequestException(`User "${user.username}" is already an admin`);
        }

        const updatedUser = await this.userService.promoteToAdmin(targetUserId);
        
        console.log(`User "${user.username}" promoted to admin by another admin`);
        return {
            message: `User "${updatedUser.username}" has been promoted to admin role`,
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        };
    }
}