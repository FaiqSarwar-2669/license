const jwt = require('jsonwebtoken');
const config = require('../config.json');

class AuthMiddleware {
  static checkAuthorization(req, res, next) {
    // Check if the authorization header is present and correctly formatted
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ') ||
      !req.headers.authorization.split(' ')[1]
    ) {
      return res.status(422).json({ error: true, message: "Please provide the token" });
    }

    const theToken = req.headers.authorization.split(' ')[1]; // Extract the token from the header
    try {
      const decoded = jwt.verify(theToken, config.JWT_SECRET); // Verify and decode the token
      req.decoded = decoded; // Attach decoded user information to the request object
      console.log('Authenticated user', req.decoded); // Log the decoded information after it's attached to req
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      return res.status(401).json({ error: true, message: "Invalid token" }); // Handle token verification errors
    }
  }
}

module.exports = AuthMiddleware;
