import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { RegisterDto } from '../auth/dto/registerUser.dto';
import { Role } from '../../schemas/user.types';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async createUser(registerUserDto: RegisterDto) {

        try {
            return await this.userModel.create({
                username: registerUserDto.username,
                email: registerUserDto.email,
                password: registerUserDto.password,
                role: Role.User, // Default role
            });

        } catch (err: unknown) {
            console.error("Error creating user:", err);

            const e = err as { code?: number };
            const DUPLICATE_KEY_CODE = 11000;

            if (e.code == DUPLICATE_KEY_CODE) {
                throw new ConflictException('Email already exists');
            }
            throw err;
        }
    }

    async getUserById(id: string) {
        return await this.userModel.findById({ _id: id });
    }

    async getUserByEmail(email: string) {
        return await this.userModel.findOne({ email });
    }

    /**
     * Update user's refresh token
     * @param userId - User MongoDB ID
     * @param refreshToken - New refresh token
     */
    async updateRefreshToken(userId: string, refreshToken: string) {
        return await this.userModel.findByIdAndUpdate(
            userId,
            { refreshToken },
            { new: true }
        );
    }

    /**
     * Promote user to admin role
     * @param userId - User MongoDB ID
     */
    async promoteToAdmin(userId: string) {
        return await this.userModel.findByIdAndUpdate(
            userId,
            { role: Role.Admin },
            { new: true }
        );
    }
}


