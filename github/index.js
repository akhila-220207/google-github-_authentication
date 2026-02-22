import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Strategy as GitHubStrategy } from "passport-github2";

dotenv.config();

const app = express();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------
// Session Setup
// ------------------
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// ------------------
// Passport Setup
// ------------------
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// ------------------
// GitHub Strategy
// ------------------
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// ------------------
// Static Files
// ------------------
app.use(express.static(path.join(__dirname, "views")));

// ------------------
// Routes
// ------------------

// Home Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

// GitHub Login
app.get("/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub Callback
app.get("/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.send(`
      <h2>Login Successful 🎉</h2>
      <p><strong>Name:</strong> ${req.user.displayName}</p>
      <p><strong>Username:</strong> ${req.user.username}</p>
      <img src="${req.user.photos[0].value}" width="120" style="border-radius:50%" />
      <br><br>
      <a href="/logout">Logout</a>
    `);
  }
);

// Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// ------------------
app.listen(5000, () => {
  console.log("Server running at http://localhost:5000 🚀");
});
