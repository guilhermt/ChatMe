import z from 'zod';

export const string = (name: string, min = 1) =>
  z.string({ required_error: `${name} is required` }).min(min);

export const coerceString = (name: string, min = 1) =>
  z.coerce.string({ required_error: `${name} is required` }).min(min);

export const email = z.string({ required_error: 'Email is required' }).email();

export const number = (name: string, min = 0) =>
  z.number({ required_error: `${name} is required` }).min(min);

export const boolean = (name: string) =>
  z.boolean({ required_error: `${name} is required` });

export const optional = {
  string: z.string().optional(),
  number: z.number().optional(),
  any: z.any().optional()
};

export const options = (options: [string, ...string[]], name: string) =>
  z.enum(options, { required_error: `${name} is required` });

export const image = z
  .object({
    type: string('Image File Type'),
    content: z.instanceof(Buffer)
  })
  .optional();
