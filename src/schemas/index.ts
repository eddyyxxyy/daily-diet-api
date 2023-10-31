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
    .min(6, {
      message: 'Passwords must be at least 6 and at max 32 characters long',
    })
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
    .min(1, 'E-mail is required'),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(6, { message: 'Passwords must be at least 6 characters long' }),
});

export const createMealBodySchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(1, 'Name is required')
    .max(60, "Meal's names must be at max 60 characters long"),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string',
    })
    .min(1, 'Description is required')
    .max(255, "Meal's descriptions must be at max 255 characters long"),
  date: z
    .string({
      required_error: 'Date is required',
      invalid_type_error: 'Date must be a string',
    })
    .min(1, 'Date is required'),
  hour: z
    .string({
      required_error: 'Hour is required',
      invalid_type_error: 'Hour must be a string',
    })
    .min(1, 'Hour is required'),
  isOnTheDiet: z.boolean({
    required_error: 'IsOnTheDiet is required',
    invalid_type_error: 'IsOnTheDiet must be boolean',
  }),
});

export const updateMealBodySchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
    })
    .max(60, "Meal's names must be at max 60 characters long")
    .optional(),
  description: z
    .string({
      invalid_type_error: 'Description must be a string',
    })
    .max(255, "Meal's descriptions must be at max 255 characters long")
    .optional(),
  date: z
    .string({
      invalid_type_error: 'Date must be a string',
    })
    .optional(),
  hour: z
    .string({
      invalid_type_error: 'Hour must be a string',
    })
    .optional(),
  isOnTheDiet: z
    .boolean({
      invalid_type_error: 'IsOnTheDiet must be boolean',
    })
    .optional(),
});
