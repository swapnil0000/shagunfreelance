import { validationResult } from 'express-validator';

/**
 * Runs the express-validator validation chain and returns 400
 * with field-level errors if any validations fail.
 *
 * Usage: router.post('/register', [...validationRules], validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const fieldErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: fieldErrors,
    });
  }

  next();
};

export default validate;
