import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET || 'resumeroastaccesssecretkey';

// Verifies the JWT (HttpOnly cookie or Authorization header) and loads the owner
// from MongoDB. Every private route relies on this for authentication + ownership.
export const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET());
    const userId = decoded.id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Not authorized, token expired'
        : 'Not authorized, token failed';
    return res.status(401).json({ message });
  }
};

export default protect;
