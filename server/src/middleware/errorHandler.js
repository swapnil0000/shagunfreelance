const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    const response = {
      status: 'error',
      message: err.message,
    };

    if (process.env.NODE_ENV !== 'production') {
      response.stack = err.stack;
    }

    return res.status(err.statusCode).json(response);
  }

  // Non-operational error (programming error, unexpected)
  console.error('ERROR:', err);

  const response = {
    status: 'error',
    message: 'Internal server error',
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  return res.status(500).json(response);
};

export default errorHandler;
