import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || 'resumeroastaccesssecretkey', {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'resumeroastrefreshsecretkey', {
    expiresIn: '7d',
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      college: user.college || '',
      branch: user.branch || '',
      graduationYear: user.graduationYear || null,
      linkedin: user.linkedin || '',
      github: user.github || '',
      token: accessToken
    });
  } catch (error) {
    console.error('Register Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      college: user.college || '',
      branch: user.branch || '',
      graduationYear: user.graduationYear || null,
      linkedin: user.linkedin || '',
      github: user.github || '',
      token: accessToken
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

export const logoutUser = async (req, res) => {
  const { refreshToken } = req.cookies || {};
  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: '' });
  }
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
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

    if (user) {
      user.name = req.body.name || user.name;
      user.avatar = req.body.avatar || user.avatar;
      user.college = req.body.college || user.college;
      user.branch = req.body.branch || user.branch;
      user.graduationYear = req.body.graduationYear || user.graduationYear;
      user.linkedin = req.body.linkedin || user.linkedin;
      user.github = req.body.github || user.github;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        college: updatedUser.college,
        branch: updatedUser.branch,
        graduationYear: updatedUser.graduationYear,
        linkedin: updatedUser.linkedin,
        github: updatedUser.github,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
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
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'resumeroastrefreshsecretkey');
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, token mismatch' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, refresh token expired' });
  }
};
