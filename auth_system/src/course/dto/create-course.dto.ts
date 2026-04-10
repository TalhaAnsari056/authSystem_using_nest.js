import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Course name is required' })
  @IsString({ message: 'Course name must be a string' })
  @MinLength(3, { message: 'Course name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Course name cannot exceed 100 characters' })
  courseName: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description: string;

  @IsNotEmpty({ message: 'Level is required' })
  @IsString({ message: 'Level must be a string' })
  @IsIn(['Beginner', 'Intermediate', 'Advanced'], {
    message: 'Level must be one of: Beginner, Intermediate, Advanced',
  })
  level: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  @Max(100000, { message: 'Price cannot exceed 100,000' })
  price: number;
}
