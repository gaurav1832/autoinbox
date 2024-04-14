import { Router } from "express";
import {
  initiateGoogleAuth,
  handleGoogleCallback,
} from "./services/googleAuth";
import {
  initiateOutlookAuth,
  handleOutlookCallback,
} from "./services/outlookAuth";

export function setupGoogleAuthRoutes(app) {
  const router = Router();

  router.get("/google", initiateGoogleAuth);
  router.get("/callback/google", handleGoogleCallback);
  router.get("/failure", (req, res) =>
    res.send("Google authentication failed")
  );

  app.use("/auth", router);
}

export function setupOutlookAuthRoutes(app) {
  const router = Router();

  router.get("/outlook", initiateOutlookAuth);
  router.get("/callback/outlook", handleOutlookCallback);
  router.get("/failure", (req, res) =>
    res.send("Outlook authentication failed")
  );

  app.use("/auth", router);
}
