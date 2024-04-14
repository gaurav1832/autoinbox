import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { setupGoogleAuthRoutes, setupOutlookAuthRoutes } from "./authRoutes";
import { emailTaskQueue } from "./bullmq";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sessionsecret122",
    resave: false,
    saveUninitialized: false,
  })
);

// Authentication Routes
setupGoogleAuthRoutes(app);
setupOutlookAuthRoutes(app);

app.listen(PORT, async () => {
  // Clear and reset task queue on server start
  await emailTaskQueue.clean(0, 1000);
  await emailTaskQueue.drain();
  await emailTaskQueue.obliterate({ force: true });
  console.log(`Server running on http://localhost:${PORT}`);
});
