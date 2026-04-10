import { Injectable, UnauthorizedException } from '@nestjs/common';
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

    async registerUser(registerUserDto: RegisterDto) {
        console.log("user Dto:", registerUserDto);

        const saltRounds = 10;
        const hash = await bcrypt.hash(registerUserDto.password, saltRounds)

        const user = await this.userService.createUser({ ...registerUserDto, password: hash, });
        // console.log("Created user:", user);
        // Include role in payload for RolesGuard to verify permissions
        const payload = { sub: user._id, username: user.username, role: user.role };
        const token = await this.jwtService.signAsync(payload);
        console.log("Generated JWT token:", token);
        // return user;
        return { access_token: token };
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

        // Generate JWT token
        // Include role in payload so RolesGuard can check user permissions without DB queries
        const payload = { sub: user._id, username: user.username, role: user.role };
        const token = await this.jwtService.signAsync(payload);

        console.log("User logged in successfully:", user.username);
        return { access_token: token };
    }
}