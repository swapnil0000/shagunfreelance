import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const backendURL = process.env.BACKEND_URL || 'http://localhost:5000';

if (clientID && clientSecret && !clientID.startsWith('your_') && !clientID.startsWith('...')) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: `${backendURL}/api/auth/google/callback`,
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email (link accounts)
        const email = profile.emails[0].value;
        user = await User.findOne({ email });

        if (user) {
          // Link Google ID to existing account
          user.googleId = profile.id;
          if (!user.avatar && profile.photos[0]) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          avatar: profile.photos[0]?.value || '',
          role: 'customer',
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
} else {
  console.log('Google OAuth not configured — skipping Passport Google strategy');
}

export default passport;
