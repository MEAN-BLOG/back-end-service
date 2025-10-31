/**
 * @module modules/users/user.model
 * @description User schema definition for MongoDB using Mongoose
 */

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../shared/interfaces/schema.interface';
import { UserRole } from '../shared/enums/role.enum';

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *           example: "653a17e34b0f33c62b8b4521"
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: John
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: Doe
 *         fullName:
 *           type: string
 *           readOnly: true
 *           description: Virtual field combining first and last name
 *           example: John Doe
 *         email:
 *           type: string
 *           description: User's email address (must be unique)
 *           format: email
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           description: User's password (hashed in database)
 *           writeOnly: true
 *           example: StrongP@ss123
 *         role:
 *           type: string
 *           enum:
 *             - ADMIN
 *             - USER
 *             - GUEST
 *           default: GUEST
 *           description: Role assigned to the user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the user was created
 *           example: 2025-10-21T18:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the user was last updated
 *           example: 2025-10-21T19:00:00.000Z
 */
const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.GUEST,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * Virtual for user's full name
 */
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Pre-save middleware to hash password
 */
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Instance method to compare password
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Static method to find user by email
 */
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Export the User model
 */
export default mongoose.model<IUser>('User', userSchema);
