const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Express middleware to authenticate requests using JSON Web Tokens (JWT).
 *
 * This middleware checks for a JWT in the 'Authorization' header of incoming requests.
 * The header is expected to be in the format 'Bearer <token>'.
 *
 * If the token is present and valid, it decodes the token to extract the user payload
 * and attaches it to the `req.user` property. This makes the user's information
 * accessible to subsequent middleware and route handlers.
 *
 * If the token is missing or invalid (e.g., expired, malformed, or signed with an
 * incorrect secret), the middleware responds with a 401 Unauthorized status.
 * This prevents unauthorized access to protected routes.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 */
const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if token exists
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Check if the token is in the correct 'Bearer <token>' format
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ msg: 'Token is not in the correct format' });
  }

  const token = tokenParts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
