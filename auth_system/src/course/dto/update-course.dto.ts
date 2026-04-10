import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';

// UpdateCourseDto makes all fields optional while keeping validation rules
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
