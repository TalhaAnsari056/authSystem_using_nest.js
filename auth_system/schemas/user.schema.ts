
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from './user.types';

export type UserDocument = HydratedDocument<User>;

@Schema({ 
  timestamps: true })
export class User {
  @Prop({ required: true })
  username!: string;

  @Prop({ required: true ,unique: true})
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({default: Role.User})
  role!: string;

  @Prop({ nullable: true })
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
