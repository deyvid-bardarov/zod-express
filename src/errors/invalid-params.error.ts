import { z } from "zod";

export default class InvalidParamsError extends Error {
  zodError: z.ZodError

  constructor(error: z.ZodError) {
    super("Invalid params");
    this.zodError = error
    Object.setPrototypeOf(this, InvalidParamsError.prototype)
  }
}