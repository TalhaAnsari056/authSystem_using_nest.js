import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { CourseModule } from './course/course.module';

@Module({

  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    MongooseModule.forRoot(process.env.MONGODB_URL as string),
    CourseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
