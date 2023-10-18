import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodSchema } from 'zod';

/**
 * Checks the request body using a Zod schema and returns the parsed data or null.
 *
 * @param {ZodSchema<T>} schema - The Zod schema to validate the request body.
 * @returns {(req: FastifyRequest, rep: FastifyReply) => T | null} - Returns a function that takes a FastifyRequest and a FastifyReply.
 * If the schema validation is successful, it returns the parsed data. If the validation fails, it sends an error response with status 400 and returns null.
 *
 * @example
 * // Usage in a Fastify route
 * app.post(
 *   '/',
 *   { preHandler: [ensureReqBodyIsFilled] },
 *   async (req: FastifyRequest, rep: FastifyReply): Promise<void> => {
 *     const userInfo = checkForErrorInRequestBodySchema<{
 *       name: string;
 *       email: string;
 *       password: string;
 *     }>(createUserBodySchema)(req, rep);
 *
 *     if (userInfo === null) {
 *       // Parsing failed, do nothing more
 *       return;
 *     }
 *
 *     const { name, email, password } = userInfo;
 *
 *     // ...
 *   },
 * );
 */
export function handleRequestBodySchema<T>(
  schema: ZodSchema<T>,
): (req: FastifyRequest, rep: FastifyReply) => T | null {
  return (req, rep) => {
    const parsedRequestBody = schema.safeParse(req.body);

    if (!parsedRequestBody.success) {
      const errors = parsedRequestBody.error.issues.map((issue) => ({
        field: issue.path,
        message: issue.message,
      }));

      rep.status(400).send({ errors });
      return null;
    }

    return parsedRequestBody.data;
  };
}
