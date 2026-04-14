const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      req.validated = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map((item) => ({
            path: item.path.join('.'),
            message: item.message
          }))
        });
      }

      return next(error);
    }
  };
}

module.exports = validate;
