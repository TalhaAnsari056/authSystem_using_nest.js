import { IsEmail, IsNotEmpty, IsString, isString } from 'class-validator';

export class RegisterDto {
    
    @IsNotEmpty()
    @IsString() 
    username: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}