import jwt from 'jsonwebtoken';

/**
 * Sign a JWT token with userId and role, valid for 7 days.
 */
export const signToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
