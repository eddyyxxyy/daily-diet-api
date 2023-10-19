import { z } from 'zod';

export const createUserBodySchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(1, 'Name is required'),
  email: z
    .string({
      required_error: 'E-mail is required',
      invalid_type_error: 'E-mail must be a string',
    })
    .email()
    .min(5, 'E-mail is required'),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(6, { message: 'Passwords must be at least 6 characters long' })
    .regex(
      /^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=\D*\d)(?=[^!#@%]*[!#@%])[A-Za-z0-9!#@%]{6,32}$/,
      {
        message:
          "Passwords must have at least one lower-case letter, one upper-case letter, one number and one of the following special characters '!@#%'",
      },
    ),
});

export const createSessionBodySchema = z.object({
  email: z
    .string({
      required_error: 'E-mail is required',
      invalid_type_error: 'E-mail must be a string',
    })
    .email()
    .min(5, 'E-mail is required'),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(6, { message: 'Passwords must be at least 6 characters long' }),
});
