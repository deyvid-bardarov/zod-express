import { z } from "zod";

export default class InvalidParamsError extends Error {
  zodError: z.ZodError

  constructor(error: z.ZodError) {
    super();
    this.zodError = error
  }
}