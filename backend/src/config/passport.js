const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Googe Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/api/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // If user exsts but was created with diff provider, link them or just log in
                if (!user.oauthProvider) {
                    user.oauthProvider = 'google';
                    user.providerId = profile.id;
                    if (!user.profilePicture) user.profilePicture = profile.photos[0].value;
                    await user.save();
                }
                return done(null, user);
            }

            // New user
            user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                oauthProvider: 'google',
                providerId: profile.id,
                role: 'student', // Default role, user can change later or we prompt before auth? 
                // Requirement says "After successful OAuth... Check if user exists... If new -> create... Store role"
                // This implies we might need a state param or a redirect to role selection if strict.
                // For now defaulting to student, but will allow role update if 'none'.
                verificationStatus: 'none',
                isVerified: false,
                profilePicture: profile.photos[0].value
            });

            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
));

passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/api/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile'],
}, async function (accessToken, refreshToken, profile, done) {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            if (!user.oauthProvider) {
                user.oauthProvider = 'linkedin';
                user.providerId = profile.id;
                if (!user.profilePicture) user.profilePicture = profile.photos[0].value;
                await user.save();
            }
            return done(null, user);
        }

        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            oauthProvider: 'linkedin',
            providerId: profile.id,
            role: 'student', // Default
            verificationStatus: 'none',
            isVerified: false,
            profilePicture: profile.photos[0].value
        });

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

module.exports = passport;
