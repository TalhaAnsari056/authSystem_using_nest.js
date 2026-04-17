import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class PromoteUserDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsMongoId({ message: 'User ID must be a valid MongoDB ID' })
  userId: string;
}
