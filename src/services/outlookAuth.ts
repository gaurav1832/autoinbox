import express from "express";
import { emailTaskQueue } from "../bullmq";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.BASE_URL}/auth/callback/outlook`;
console.log("REDIRECT_URI outlook = ", REDIRECT_URI);
interface TokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

export function initiateOutlookAuth(req, res) {
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams(
    {
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: "openid email User.Read Mail.ReadWrite Mail.Send",
      response_mode: "query",
      prompt: "login",
    }
  ).toString()}`;
  res.redirect(authUrl);
}

export async function handleOutlookCallback(
  req: express.Request,
  res: express.Response
) {
  const { code } = req.query;
  if (typeof code !== "string") {
    return res
      .status(400)
      .send("Authentication failed: No authorization code provided.");
  }

  try {
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      }
    );

    const tokens: TokenResponse = await tokenResponse.json();
    if (tokenResponse.status !== 200) {
      throw new Error(
        `Failed to retrieve access token: ${
          tokens.error_description || tokens.error
        }`
      );
    }

    emailTaskQueue.add(
      "processOutlookEmail",
      { accessToken: tokens.access_token, provider: "outlook" },
      { repeat: { every: 10000 }, removeOnComplete: true, removeOnFail: true }
    );

    res.send("Outlook email processing started...");
  } catch (error) {
    console.error("Error during Outlook authentication:", error);
    res.status(500).send("Authentication process failed.");
  }
}
