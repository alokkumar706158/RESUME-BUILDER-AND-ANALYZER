import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check HttpOnly cookies first, then check Authorization header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'resumeroastaccesssecretkey');
    } catch {
      // Decode Supabase JWT or alternative provider tokens
      decoded = jwt.decode(token);
    }

    if (!decoded) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    const userId = decoded.id || decoded.sub;
    let user = null;

    try {
      user = await User.findById(userId).select('-password');
    } catch {
      // User might be a Supabase UUID or not stored in Mongo User table
      user = null;
    }

    if (!user) {
      // Create user context from token claims
      req.user = {
        _id: userId,
        id: userId,
        name: decoded.user_metadata?.full_name || decoded.name || decoded.email?.split('@')[0] || 'User',
        email: decoded.email || ''
      };
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed or expired' });
  }
};
