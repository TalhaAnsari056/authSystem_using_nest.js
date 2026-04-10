import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course, CourseSchema } from './schemas/course.schema';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
 
@Module({
  imports : [MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }])],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
