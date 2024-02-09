import { Request, RequestHandler, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { z, ZodEffects, ZodError, ZodSchema, ZodType, ZodTypeDef } from "zod";
import { InvalidBodyError, InvalidParamsError, InvalidQueryError } from "./errors";

type NonReadOnly<T> = { -readonly [P in keyof T]: NonReadOnly<T[P]> };

export function stripReadOnly<T>(readOnlyItem: T): NonReadOnly<T> {
  return readOnlyItem as NonReadOnly<T>;
}

export type Options = {
  /**
   * By setting this to true, the error will be passed to the next middleware, and you can handle it in a custom way
   */
  passErrorToNext?: boolean;
  /**
   * By setting this to true, the error will be thrown and can be handled in error handling middleware
   */
  throwErrors?: boolean;
  /**
   * By passing this function you can override the default error handling
   * `passErrorToNext` must not be `true` for this to work
   * @param errors array of errors
   * @param res express response object
   * @returns
   */
  sendErrors?: (errors: Array<ErrorListItem>, res: Response) => void;
};

export declare type RequestValidation<TParams, TQuery, TBody> = {
  params?: ZodSchema<TParams>;
  query?: ZodSchema<TQuery>;
  body?: ZodSchema<TBody>;
};
export declare type RequestProcessing<TParams, TQuery, TBody> = {
  params?: ZodEffects<any, TParams>;
  query?: ZodEffects<any, TQuery>;
  body?: ZodEffects<any, TBody>;
};

export declare type TypedRequest<
  TParams extends ZodType<any, ZodTypeDef, any>,
  TQuery extends ZodType<any, ZodTypeDef, any>,
  TBody extends ZodType<any, ZodTypeDef, any>
> = Request<z.infer<TParams>, any, z.infer<TBody>, z.infer<TQuery>>;

export declare type TypedRequestBody<TBody extends ZodType<any, ZodTypeDef, any>> = Request<
  ParamsDictionary,
  any,
  z.infer<TBody>,
  any
>;

export declare type TypedRequestParams<TParams extends ZodType<any, ZodTypeDef, any>> = Request<
  z.infer<TParams>,
  any,
  any,
  any
>;
export declare type TypedRequestQuery<TQuery extends ZodType<any, ZodTypeDef, any>> = Request<
  ParamsDictionary,
  any,
  any,
  z.infer<TQuery>
>;

type ErrorListItem = { type: "Query" | "Params" | "Body"; errors: ZodError<any> };

export const sendErrors: (errors: Array<ErrorListItem>, res: Response) => void = (errors, res) => {
  return res.status(400).send(errors.map((error) => ({ type: error.type, errors: error.errors })));
};
export const sendError: (error: ErrorListItem, res: Response) => void = (error, res) => {
  return res.status(400).send({ type: error.type, errors: error.errors });
};

export function processRequestBody<TBody>(
  effects: ZodSchema<TBody>,
  options?: Options
): RequestHandler<ParamsDictionary, any, TBody, any>;
export function processRequestBody<TBody>(
  effects: ZodEffects<any, TBody>,
  options?: Options
): RequestHandler<ParamsDictionary, any, TBody, any>;
export function processRequestBody<TBody>(
  effectsSchema: ZodEffects<any, TBody> | ZodSchema<TBody>,
  options?: Options
): RequestHandler<ParamsDictionary, any, TBody, any> {
  return processRequest({ body: effectsSchema }, options);
}

export function processRequestBodyAsync<TBody>(
  effects: ZodSchema<TBody>,
  options?: Options
): RequestHandler<ParamsDictionary, any, TBody, any>;
export function processRequestBodyAsync<TBody>(
  effects: ZodEffects<any, TBody>,
  options?: Options
): RequestHandler<ParamsDictionary, any, TBody, any>;
export function processRequestBodyAsync<TBody>(
  effectsSchema: ZodEffects<any, TBody> | ZodSchema<TBody>,
  options?: Options
): RequestHandler<ParamsDictionary, any, TBody, any> {
  return processRequestAsync({ body: effectsSchema }, options);
}

export function processRequestParams<TParams>(
  effects: ZodSchema<TParams>,
  options?: Options
): RequestHandler<TParams, any, any, any>;
export function processRequestParams<TParams>(
  effects: ZodEffects<any, TParams>,
  options?: Options
): RequestHandler<TParams, any, any, any>;
export function processRequestParams<TParams>(
  effectsSchema: ZodEffects<any, TParams> | ZodSchema<TParams>,
  options?: Options
): RequestHandler<TParams, any, any, any> {
  return processRequest({ params: effectsSchema }, options);
}

export function processRequestParamsAsync<TParams>(
  effects: ZodSchema<TParams>,
  options?: Options
): RequestHandler<TParams, any, any, any>;
export function processRequestParamsAsync<TParams>(
  effects: ZodEffects<any, TParams>,
  options?: Options
): RequestHandler<TParams, any, any, any>;
export function processRequestParamsAsync<TParams>(
  effectsSchema: ZodEffects<any, TParams> | ZodSchema<TParams>,
  options?: Options
): RequestHandler<TParams, any, any, any> {
  return processRequestAsync({ params: effectsSchema }, options);
}

export function processRequestQuery<TQuery>(
  effects: ZodSchema<TQuery>,
  options?: Options
): RequestHandler<ParamsDictionary, any, any, TQuery>;
export function processRequestQuery<TQuery>(
  effects: ZodEffects<any, TQuery>,
  options?: Options
): RequestHandler<ParamsDictionary, any, any, TQuery>;
export function processRequestQuery<TQuery>(
  effectsSchema: ZodEffects<any, TQuery> | ZodSchema<TQuery>,
  options?: Options
): RequestHandler<ParamsDictionary, any, any, TQuery> {
  return processRequest({ query: effectsSchema }, options);
}

export function processRequestQueryAsync<TQuery>(
  effects: ZodSchema<TQuery>,
  options?: Options
): RequestHandler<ParamsDictionary, any, any, TQuery>;
export function processRequestQueryAsync<TQuery>(
  effects: ZodEffects<any, TQuery>,
  options?: Options
): RequestHandler<ParamsDictionary, any, any, TQuery>;
export function processRequestQueryAsync<TQuery>(
  effectsSchema: ZodEffects<any, TQuery> | ZodSchema<TQuery>,
  options?: Options
): RequestHandler<ParamsDictionary, any, any, TQuery> {
  return processRequestAsync({ query: effectsSchema }, options);
}

export function processRequest<TParams = any, TQuery = any, TBody = any>(
  schemas: RequestProcessing<TParams, TQuery, TBody>,
  options?: Options
): RequestHandler<TParams, any, TBody, TQuery>;
export function processRequest<TParams = any, TQuery = any, TBody = any>(
  schemas: RequestValidation<TParams, TQuery, TBody>,
  options?: Options
): RequestHandler<TParams, any, TBody, TQuery>;
export function processRequest<TParams = any, TQuery = any, TBody = any>(
  schemas: RequestValidation<TParams, TQuery, TBody> | RequestProcessing<TParams, TQuery, TBody>,
  options: Options = {}
): RequestHandler<TParams, any, TBody, TQuery> {
  return (req, res, next) => {
    const errors: Array<ErrorListItem> = [];
    if (schemas.params) {
      const parsed = schemas.params.safeParse(req.params);
      if (parsed.success) {
        req.params = parsed.data;
      } else if (options.throwErrors) {
        throw new InvalidParamsError(parsed.error)
      } else {
        errors.push({ type: "Params", errors: parsed.error });
      }
    }
    if (schemas.query) {
      const parsed = schemas.query.safeParse(req.query);
      if (parsed.success) {
        req.query = parsed.data;
      } else if (options.throwErrors) {
        throw new InvalidQueryError(parsed.error)
      } else {
        errors.push({ type: "Query", errors: parsed.error });
      }
    }
    if (schemas.body) {
      const parsed = schemas.body.safeParse(req.body);
      if (parsed.success) {
        req.body = parsed.data;
      } else if (options.throwErrors) {
        throw new InvalidBodyError(parsed.error)
      } else {
        errors.push({ type: "Body", errors: parsed.error });
      }
    }
    if (errors.length > 0 && options.passErrorToNext) {
      return next(errors);
    }
    if (errors.length > 0) {
      if (options.sendErrors) {
        return sendErrors(errors, res);
      }
      return sendErrors(errors, res);
    }
    return next();
  };
}

export function processRequestAsync<TParams = any, TQuery = any, TBody = any>(
  schemas: RequestProcessing<TParams, TQuery, TBody>,
  options?: Options
): RequestHandler<TParams, any, TBody, TQuery>;
export function processRequestAsync<TParams = any, TQuery = any, TBody = any>(
  schemas: RequestValidation<TParams, TQuery, TBody>,
  options?: Options
): RequestHandler<TParams, any, TBody, TQuery>;
export function processRequestAsync<TParams = any, TQuery = any, TBody = any>(
  schemas: RequestValidation<TParams, TQuery, TBody> | RequestProcessing<TParams, TQuery, TBody>,
  options: Options = {}
): RequestHandler<TParams, any, TBody, TQuery> {
  return async (req, res, next) => {
    const errors: Array<ErrorListItem> = [];
    if (schemas.params) {
      const parsed = await schemas.params.safeParseAsync(req.params);
      if (parsed.success) {
        req.params = parsed.data;
      } else if (options.throwErrors) {
        throw new InvalidParamsError(parsed.error)
      } else {
        errors.push({ type: "Params", errors: parsed.error });
      }
    }
    if (schemas.query) {
      const parsed = await schemas.query.safeParseAsync(req.query);
      if (parsed.success) {
        req.query = parsed.data;
      } else if (options.throwErrors) {
        throw new InvalidQueryError(parsed.error)
      } else {
        errors.push({ type: "Query", errors: parsed.error });
      }
    }
    if (schemas.body) {
      const parsed = await schemas.body.safeParseAsync(req.body);
      if (parsed.success) {
        req.body = parsed.data;
      } else if (options.throwErrors) {
        throw new InvalidBodyError(parsed.error)
      } else {
        errors.push({ type: "Body", errors: parsed.error });
      }
    }
    if (errors.length > 0 && options.passErrorToNext) {
      return next(errors);
    }
    if (errors.length > 0) {
      if (options.sendErrors) {
        return sendErrors(errors, res);
      }
      return sendErrors(errors, res);
    }
    return next();
  };
}

export const validateRequestBody: <TBody>(
  zodSchema: ZodSchema<TBody>,
  options?: Options
) => RequestHandler<ParamsDictionary, any, TBody, any> = (schema, options?: Options) => (req, res, next) => {
  return validateRequest({ body: schema }, options)(req, res, next);
};

export const validateRequestBodyAsync: <TBody>(
  zodSchema: ZodSchema<TBody>,
  options?: Options
) => RequestHandler<ParamsDictionary, any, TBody, any> = (schema, options?: Options) => (req, res, next) => {
  return validateRequestAsync({ body: schema }, options)(req, res, next);
};

export const validateRequestParams: <TParams>(
  zodSchema: ZodSchema<TParams>,
  options?: Options
) => RequestHandler<TParams, any, any, any> = (schema, options?: Options) => (req, res, next) => {
  return validateRequest({ params: schema }, options)(req, res, next);
};

export const validateRequestParamsAsync: <TParams>(
  zodSchema: ZodSchema<TParams>,
  options?: Options
) => RequestHandler<TParams, any, any, any> = (schema, options?: Options) => (req, res, next) => {
  return validateRequestAsync({ params: schema }, options)(req, res, next);
};

export const validateRequestQuery: <TQuery>(
  zodSchema: ZodSchema<TQuery>,
  options?: Options
) => RequestHandler<ParamsDictionary, any, any, TQuery> = (schema, options) => (req, res, next) => {
  return validateRequest({ query: schema }, options)(req, res, next);
};

export const validateRequestQueryAsync: <TQuery>(
  zodSchema: ZodSchema<TQuery>,
  options?: Options
) => RequestHandler<ParamsDictionary, any, any, TQuery> = (schema, options) => (req, res, next) => {
  return validateRequestAsync({ query: schema }, options)(req, res, next);
};



export const validateRequest: <TParams = any, TQuery = any, TBody = any>(
  schemas: RequestValidation<TParams, TQuery, TBody>,
  options?: Options
) => RequestHandler<TParams, any, TBody, TQuery> =
  ({ body, params, query }, options = {}) =>
    (req, res, next) => {
      const errors: Array<ErrorListItem> = [];
      if (params) {
        const parsed = params.safeParse(req.params);
        if (!parsed.success) {
          if (options.throwErrors) {
            throw new InvalidParamsError(parsed.error)
          }

          errors.push({ type: "Params", errors: parsed.error });
        }
      }
      if (query) {
        const parsed = query.safeParse(req.query);
        if (!parsed.success) {
          if (options.throwErrors) {
            throw new InvalidQueryError(parsed.error)
          }

          errors.push({ type: "Query", errors: parsed.error });
        }
      }
      if (body) {
        const parsed = body.safeParse(req.body);
        if (!parsed.success) {
          if (options.throwErrors) {
            throw new InvalidBodyError(parsed.error)
          }

          errors.push({ type: "Body", errors: parsed.error });
        }
      }
      if (errors.length > 0 && options.passErrorToNext) {
        return next(errors);
      }
      if (errors.length > 0) {
        if (options?.sendErrors) {
          return options.sendErrors(errors, res);
        }
        return sendErrors(errors, res);
      }
      return next();
    };

export const validateRequestAsync: <TParams = any, TQuery = any, TBody = any>(
  schemas: RequestValidation<TParams, TQuery, TBody>,
  options?: Options
) => RequestHandler<TParams, any, TBody, TQuery> =
  ({ body, params, query }, options = {}) =>
    async (req, res, next) => {
      const errors: Array<ErrorListItem> = [];
      if (params) {
        const parsed = await params.safeParseAsync(req.params);
        if (!parsed.success) {
          if (options.throwErrors) {
            throw new InvalidParamsError(parsed.error)
          }

          errors.push({ type: "Params", errors: parsed.error });
        }
      }
      if (query) {
        const parsed = await query.safeParseAsync(req.query);
        if (!parsed.success) {
          if (options.throwErrors) {
            throw new InvalidQueryError(parsed.error)
          }

          errors.push({ type: "Query", errors: parsed.error });
        }
      }
      if (body) {
        const parsed = await body.safeParseAsync(req.body);
        if (!parsed.success) {
          if (options.throwErrors) {
            throw new InvalidBodyError(parsed.error)
          }

          errors.push({ type: "Body", errors: parsed.error });
        }
      }
      if (errors.length > 0 && options.passErrorToNext) {
        return next(errors);
      }
      if (errors.length > 0) {
        if (options?.sendErrors) {
          return options.sendErrors(errors, res);
        }
        return sendErrors(errors, res);
      }
      return next();
    };


/**
 * This is constructor for validateRequest. You can pass `options` to it and it will generatre an instance of `validateRequest` with those options.
 * @param options
 * @returns
 */
export function ValidateRequest<TParams = any, TQuery = any, TBody = any>(options?: Options) {
  return (schemas: RequestValidation<TParams, TQuery, TBody>) => {
    return validateRequest(schemas, options);
  };
}

/**
 * This is constructor for validateRequestAsync. You can pass `options` to it and it will generatre an instance of `validateRequestAsync` with those options.
 * @param options
 * @returns
 */
export function ValidateRequestAsync<TParams = any, TQuery = any, TBody = any>(options?: Options) {
  return (schemas: RequestValidation<TParams, TQuery, TBody>) => {
    return validateRequestAsync(schemas, options);
  };
}
