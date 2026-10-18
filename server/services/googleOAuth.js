import crypto from 'crypto';

/**
 * Minimal Google OAuth 2.0 helper (authorization code flow).
 * Uses the global fetch available in Node 18+ so no extra dependency is required.
 */

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const TOKENINFO_ENDPOINT = 'https://oauth2.googleapis.com/tokeninfo';

export const isGoogleConfigured = () => {
  const id = process.env.GOOGLE_CLIENT_ID || '';
  const secret = process.env.GOOGLE_CLIENT_SECRET || '';
  return Boolean(
    id &&
    secret &&
    !id.startsWith('your_') &&
    !secret.startsWith('your_') &&
    id.endsWith('.apps.googleusercontent.com')
  );
};

export const getGoogleCallbackUrl = (req) => {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL.trim();
  }
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
    return `${proto}://${host}/api/auth/google/callback`;
  }
  return 'http://localhost:5000/api/auth/google/callback';
};

export const generateOAuthState = () => crypto.randomBytes(24).toString('hex');

export const getGoogleAuthUrl = (state, customRedirectUri) => {
  const redirect_uri = customRedirectUri || getGoogleCallbackUrl();
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    include_granted_scopes: 'true',
    prompt: 'select_account',
    state
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
};

/**
 * Exchange the authorization code for tokens and return a verified Google profile.
 * The id_token is validated against Google's tokeninfo endpoint and the configured client id.
 */
export const exchangeCodeForProfile = async (code, customRedirectUri) => {
  const redirect_uri = customRedirectUri || getGoogleCallbackUrl();
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri,
    grant_type: 'authorization_code'
  });

  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => '');
    throw new Error(`Google token exchange failed: ${detail || tokenRes.status}`);
  }

  const tokens = await tokenRes.json();
  if (!tokens.id_token) {
    throw new Error('Google did not return an id_token');
  }

  const infoRes = await fetch(`${TOKENINFO_ENDPOINT}?id_token=${encodeURIComponent(tokens.id_token)}`);
  if (!infoRes.ok) {
    throw new Error('Failed to verify Google id_token');
  }

  const profile = await infoRes.json();

  // Ensure the token was issued for our client to prevent token substitution.
  if (profile.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google token audience mismatch');
  }
  if (!profile.sub || !profile.email) {
    throw new Error('Google profile is missing required fields');
  }

  return {
    googleId: profile.sub,
    email: String(profile.email).toLowerCase(),
    emailVerified: profile.email_verified === true || profile.email_verified === 'true',
    name: profile.name || String(profile.email).split('@')[0],
    picture: profile.picture || ''
  };
};
