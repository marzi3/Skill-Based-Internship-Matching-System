/**
 * @fileoverview Central Zod validation schemas for all InternMatch forms.
 * Each schema mirrors the corresponding Mongoose model constraints exactly.
 */
import { z } from 'zod';

// ─── Shared Refinements ──────────────────────────────────────────────────────

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .regex(/^\S+@\S+\.\S+$/, 'Please enter a valid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*]/,
    'Password must contain at least one special character (!@#$%^&*)'
  );

// ─── Auth Schemas ────────────────────────────────────────────────────────────

/** Login form — email + password only */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/** Registration form — includes name, role, and password confirmation */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['student', 'employer'], {
      errorMap: () => ({ message: 'Please select a role' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/** Forgot password — email only */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/** Reset password — new password + confirmation */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Employer Schemas ────────────────────────────────────────────────────────

/** Employer profile settings tab */
export const employerProfileSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  positionInCompany: z.string().optional(),
  companyDescription: z.string().optional(),
});

/** Employer change-password tab */
export const employerPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Internship Creation Schemas (per-step) ──────────────────────────────────

/** Step 1 — Basic Information */
export const internshipStep1Schema = z.object({
  position: z
    .string()
    .min(1, 'Position title is required')
    .max(100, 'Position title cannot exceed 100 characters'),
  category: z.string().min(1, 'Domain category is required'),
  locationType: z.enum(['Remote', 'On-site', 'Hybrid'], {
    errorMap: () => ({ message: 'Work environment is required' }),
  }),
  location: z.string().min(1, 'Location is required'),
  duration: z.string().min(1, 'Duration is required'),
  numberOfOpenings: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .int('Must be a whole number')
    .min(1, 'At least 1 opening is required'),
  deadline: z.string().min(1, 'Expiry date is required').refine(
    (val) => {
      const selectedDate = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate > today;
    },
    { message: 'Expiry date must be in the future' }
  ),
});

/** Step 2 — Requirements */
export const internshipStep2Schema = z.object({
  requiredSkills: z
    .array(z.any())
    .min(1, 'At least one required skill is needed'),
  requiredDegreeField: z
    .array(z.string())
    .min(1, 'At least one accepted degree field is required'),
  experienceLevel: z.string().min(1, 'Experience level is required'),
});

/** Step 3 — Details */
export const internshipStep3Schema = z.object({
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters'),
});

// ─── Student Profile Schema ──────────────────────────────────────────────────

/** Student education entry */
export const studentEducationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  degreeLevel: z.enum(['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'CERTIFICATE'], {
    errorMap: () => ({ message: 'Please select a degree level' }),
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  isCurrentlyStudying: z.boolean().default(false),
}).refine((data) => {
  if (data.isCurrentlyStudying) return true;
  if (!data.endDate) return false;
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

/** Student skill entry */
export const studentSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'], {
    errorMap: () => ({ message: 'Please select a proficiency level' }),
  }),
});

/** Student personal info + profile fields */
export const studentProfileSchema = z.object({
  fullName: z
    .string()
    .max(100, 'Full name cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please use a valid phone number (E.164 format)')
    .optional()
    .or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  preferredLocation: z.string().optional().or(z.literal('')),
  gpa: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0.0 && num <= 4.0;
      },
      { message: 'GPA must be between 0.0 and 4.0' }
    ),
  durationPreference: z
    .enum(['', '1-3 months', '3-6 months', '6-12 months', '12+ months'], {
      errorMap: () => ({ message: 'Please select a duration' }),
    })
    .optional(),
  gender: z.enum(['', 'Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  industriesOfInterest: z.array(z.string()).optional(),
});

// ─── Application Schema ──────────────────────────────────────────────────────

/** Internship application form */
export const applicationSchema = z.object({
  coverLetter: z
    .string()
    .min(1, 'Cover letter is required')
    .min(20, 'Cover letter must be at least 20 characters'),
});
