import { z } from "zod";

export default class InvalidQueryError extends Error {
  zodError: z.ZodError

  constructor(error: z.ZodError) {
    super();
    this.zodError = error
  }
}