import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  currency: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  createdAt: Date;
}

