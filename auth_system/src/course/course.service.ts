import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './schemas/course.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}

  /**
   * Create a new course
   * @param createCourseDto - Course data from request body
   * @returns Created course document
   * @throws InternalServerErrorException if database error occurs
   */
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      const newCourse = await this.courseModel.create({
        courseName: createCourseDto.courseName.trim(),
        description: createCourseDto.description.trim(),
        level: createCourseDto.level.trim(),
        price: createCourseDto.price,
      });

      return newCourse.toObject();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create course: ${error.message}`,
      );
    }
  }

  /**
   * Get all courses with optional filtering and pagination
   * @returns Array of all courses
   * @throws InternalServerErrorException if database error occurs
   */
  async findAll(): Promise<Course[]> {
    try {
      const courses = await this.courseModel
        .find({})
        .select('-__v') // Exclude Mongoose version field
        .lean(); // Returns plain JavaScript objects instead of Mongoose documents (faster)

      return courses;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch courses: ${error.message}`,
      );
    }
  }

  /**
   * Get a single course by ID
   * @param id - MongoDB ObjectId
   * @returns Course document if found
   * @throws BadRequestException if ID is invalid format
   * @throws NotFoundException if course not found
   */
  async findOne(id: string): Promise<Course> {
    // Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid course ID format: ${id}`);
    }

    try {
      const course = await this.courseModel.findById(id).select('-__v');

      if (!course) {
        throw new NotFoundException(
          `Course with ID "${id}" not found in database`,
        );
      }

      return course.toObject();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch course: ${error.message}`,
      );
    }
  }

  /**
   * Update a course by ID
   * @param id - MongoDB ObjectId
   * @param updateCourseDto - Partial course data to update
   * @returns Updated course document
   * @throws BadRequestException if ID is invalid format
   * @throws NotFoundException if course not found
   * @throws InternalServerErrorException if database error occurs
   */
  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    // Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid course ID format: ${id}`);
    }

    // Build update object - only include provided fields
    const updateData: any = {};
    if (updateCourseDto.courseName)
      updateData.courseName = updateCourseDto.courseName.trim();
    if (updateCourseDto.description)
      updateData.description = updateCourseDto.description.trim();
    if (updateCourseDto.level) updateData.level = updateCourseDto.level.trim();
    if (updateCourseDto.price !== undefined)
      updateData.price = updateCourseDto.price;

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    try {
      const updatedCourse = await this.courseModel
        .findByIdAndUpdate(id, updateData, {
          new: true, // Return updated document
          runValidators: true, // Run schema validators
        })
        .select('-__v');

      if (!updatedCourse) {
        throw new NotFoundException(
          `Course with ID "${id}" not found for update`,
        );
      }

      return updatedCourse.toObject();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update course: ${error.message}`,
      );
    }
  }

  /**
   * Delete a course by ID
   * @param id - MongoDB ObjectId
   * @returns Deleted course document
   * @throws BadRequestException if ID is invalid format
   * @throws NotFoundException if course not found
   * @throws InternalServerErrorException if database error occurs
   */
  async remove(id: string): Promise<{ message: string; deletedCourse: Course }> {
    // Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid course ID format: ${id}`);
    }

    try {
      const deletedCourse = await this.courseModel
        .findByIdAndDelete(id)
        .select('-__v');

      if (!deletedCourse) {
        throw new NotFoundException(
          `Course with ID "${id}" not found for deletion`,
        );
      }

      return {
        message: `Course "${deletedCourse.courseName}" deleted successfully`,
        deletedCourse: deletedCourse.toObject(),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete course: ${error.message}`,
      );
    }
  }
}
