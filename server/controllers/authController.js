import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import jwt from 'jsonwebtoken';
import {
  isGoogleConfigured,
  generateOAuthState,
  getGoogleAuthUrl,
  exchangeCodeForProfile,
  getGoogleCallbackUrl
} from '../services/googleOAuth.js';

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET || 'resumeroastaccesssecretkey';
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'resumeroastrefreshsecretkey';

const generateAccessToken = (id) => {
  return jwt.sign({ id }, ACCESS_SECRET(), { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, REFRESH_SECRET(), { expiresIn: '7d' });
};

const isProd = () => process.env.NODE_ENV === 'production';

// Shared cookie configuration. Same-site 'lax' works for local dev and same-site deployments.
const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: isProd() ? 'none' : 'lax',
  maxAge
});

const setAuthCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie(
    'refreshToken',
    refreshToken,
    cookieOptions(rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)
  );
};

const clearAuthCookies = (res) => {
  const base = { httpOnly: true, secure: isProd(), sameSite: isProd() ? 'none' : 'lax' };
  res.clearCookie('accessToken', base);
  res.clearCookie('refreshToken', base);
};

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  req.ip ||
  '';

const getUserAgent = (req) => req.headers['user-agent'] || '';

const buildUserResponse = (user, accessToken) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  college: user.college || '',
  branch: user.branch || '',
  graduationYear: user.graduationYear || null,
  linkedin: user.linkedin || '',
  github: user.github || '',
  provider: user.provider,
  lastLogin: user.lastLogin || null,
  loginCount: user.loginCount || 0,
  token: accessToken
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).toLowerCase().trim();

  if (!cleanName) {
    return res.status(400).json({ message: 'Please provide a valid name' });
  }
  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      if (!userExists.password && userExists.googleId) {
        return res.status(400).json({
          message: 'An account with this email was created via Google. Please sign in with Google.'
        });
      }
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({
      name: cleanName,
      email: cleanEmail,
      password,
      provider: 'local',
      emailVerified: true
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const clientIp = getClientIp(req);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.loginCount = 1;
    user.lastLoginIp = clientIp;
    await user.save();

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      provider: 'local',
      ip: clientIp,
      userAgent: getUserAgent(req),
      loginTime: new Date(),
      status: 'success'
    }).catch(err => console.warn('LoginLog save warning:', err.message));

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json(buildUserResponse(user, accessToken));
  } catch (error) {
    console.error('Register Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    const clientIp = getClientIp(req);
    const userAgent = getUserAgent(req);

    if (!user) {
      await LoginLog.create({
        email: cleanEmail,
        provider: 'local',
        ip: clientIp,
        userAgent,
        loginTime: new Date(),
        status: 'failed',
        failureReason: 'User not found'
      }).catch(() => {});
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({
        message: 'This account was created with Google. Please continue with Google to sign in.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await LoginLog.create({
        userId: user._id,
        email: cleanEmail,
        provider: 'local',
        ip: clientIp,
        userAgent,
        loginTime: new Date(),
        status: 'failed',
        failureReason: 'Password mismatch'
      }).catch(() => {});
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLoginIp = clientIp;
    await user.save();

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      provider: 'local',
      ip: clientIp,
      userAgent,
      loginTime: new Date(),
      status: 'success'
    }).catch(err => console.warn('LoginLog save warning:', err.message));

    setAuthCookies(res, accessToken, refreshToken, Boolean(rememberMe));
    res.json(buildUserResponse(user, accessToken));
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies || {};
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: '' });
    }
  } catch (error) {
    console.warn('Logout cleanup warning:', error.message);
  }
  clearAuthCookies(res);
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fields = ['name', 'avatar', 'college', 'branch', 'graduationYear', 'linkedin', 'github'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.password) {
      if (String(req.body.password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json(buildUserResponse(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies || {};
  if (!refreshToken) {
    return res.status(401).json({ message: 'Not authorized, no refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET());
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, token mismatch' });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.cookie('accessToken', newAccessToken, cookieOptions(15 * 60 * 1000));
    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, refresh token expired' });
  }
};

/**
 * Redirects the browser to Google's consent screen.
 */
export const googleAuthRedirect = (req, res) => {
  if (!isGoogleConfigured()) {
    return res.status(503).json({
      message: 'Google login is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
    });
  }

  const callbackUrl = getGoogleCallbackUrl(req);
  const state = generateOAuthState();
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000
  });

  res.cookie('oauth_redirect_uri', callbackUrl, {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000
  });

  res.redirect(getGoogleAuthUrl(state, callbackUrl));
};

/**
 * Handles the Google OAuth callback, finds/creates the MongoDB user,
 * issues JWTs, then redirects back to the frontend callback page.
 */
export const googleAuthCallback = async (req, res) => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const fail = (reason) => res.redirect(`${clientUrl}/login?error=${encodeURIComponent(reason)}`);

  try {
    if (!isGoogleConfigured()) {
      return fail('Google login is not configured');
    }

    const { code, state, error } = req.query;
    if (error) {
      return fail(String(error));
    }

    const savedState = req.cookies?.oauth_state;
    const savedRedirectUri = req.cookies?.oauth_redirect_uri || getGoogleCallbackUrl(req);
    res.clearCookie('oauth_state');
    res.clearCookie('oauth_redirect_uri');
    if (!code || !state || !savedState || state !== savedState) {
      return fail('Invalid or expired OAuth state');
    }

    const profile = await exchangeCodeForProfile(code, savedRedirectUri);

    let user = await User.findOne({ googleId: profile.googleId });
    if (!user) {
      user = await User.findOne({ email: profile.email });
    }

    if (!user) {
      user = new User({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        provider: 'google',
        emailVerified: true,
        avatar: profile.picture
      });
    } else {
      if (!user.googleId) user.googleId = profile.googleId;
      if (!user.avatar) user.avatar = profile.picture;
      user.emailVerified = true;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const clientIp = getClientIp(req);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLoginIp = clientIp;
    await user.save();

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      provider: 'google',
      ip: clientIp,
      userAgent: getUserAgent(req),
      loginTime: new Date(),
      status: 'success'
    }).catch(err => console.warn('LoginLog save warning:', err.message));

    setAuthCookies(res, accessToken, refreshToken);

    // Also pass the token in the hash so the SPA can store it for bearer fallback.
    res.redirect(`${clientUrl}/auth/callback#token=${accessToken}`);
  } catch (err) {
    console.error('Google OAuth Error:', err);
    return fail('Google authentication failed');
  }
};

/**
 * Returns recent login history for the authenticated user from MongoDB.
 */
export const getLoginLogs = async (req, res) => {
  try {
    const logs = await LoginLog.find({ userId: req.user._id })
      .sort({ loginTime: -1 })
      .limit(20);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
