import { z } from "zod";

export default class InvalidBodyError extends Error {
  zodError: z.ZodError

  constructor(error: z.ZodError) {
    super("Invalid data");
    this.zodError = error
    Object.setPrototypeOf(this, InvalidBodyError.prototype)
  }
}