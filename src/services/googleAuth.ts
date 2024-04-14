import { google } from "googleapis";
import { emailTaskQueue } from "../bullmq";
import dotenv from "dotenv";

dotenv.config();

console.log(
  "GOOGLE REDIRECT URI = ",
  `${process.env.BASE_URL}/auth/callback/google`
);
export function initiateGoogleAuth(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/auth/callback/google`
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.labels",
    ],
  });
  res.redirect(authUrl);
}

export async function handleGoogleCallback(req, res) {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Authentication failed: No code provided.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/auth/callback/google`
  );
  try {
    const { tokens } = await oauth2Client.getToken(code.toString());
    emailTaskQueue.add("sendEmail", {
      accessToken: tokens.access_token,
      provider: "google",
    });
    res.send("Google email processing started...");
  } catch (error) {
    console.error("Error during Google authentication:", error);
    res.status(500).send("Authentication process failed.");
  }
}
