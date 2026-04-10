import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from 'schemas/user.types';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  /**
   * Create a new course
   * @requires Admin role
   * @param createCourseDto - Course data
   * @returns Created course with 201 status
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED) // 201
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.courseService.create(createCourseDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Course created successfully',
      data: course,
    };
  }

  /**
   * Get all courses
   * @public endpoint - no authentication required
   * @returns Array of all courses
   */
  @Get()
  @HttpCode(HttpStatus.OK) // 200
  async findAll() {
    const courses = await this.courseService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Courses retrieved successfully',
      data: courses,
      count: courses.length,
    };
  }

  /**
   * Get a single course by ID
   * @public endpoint - no authentication required
   * @param id - Course MongoDB ObjectId
   * @returns Single course document
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK) // 200
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Course retrieved successfully',
      data: course,
    };
  }

  /**
   * Update a course
   * @requires Admin role
   * @param id - Course MongoDB ObjectId
   * @param updateCourseDto - Partial course data to update
   * @returns Updated course
   */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK) // 200
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const updatedCourse = await this.courseService.update(id, updateCourseDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Course updated successfully',
      data: updatedCourse,
    };
  }

  /**
   * Delete a course
   * @requires Admin role
   * @param id - Course MongoDB ObjectId
   * @returns Deleted course and confirmation message
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK) // 200 (could also use 204 NO_CONTENT)
  async remove(@Param('id') id: string) {
    const result = await this.courseService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.deletedCourse,
    };
  }
}
