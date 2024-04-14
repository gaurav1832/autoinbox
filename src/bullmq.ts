import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

import { google } from "googleapis";
import { Client } from "@microsoft/microsoft-graph-client";
import { processGoogleMails } from "./services/google";
import { processOutlookMails } from "./services/outlook";

const redisConnection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});
const emailTaskQueue = new Queue("emailTaskQueue", {
  connection: redisConnection,
});

const worker = new Worker(
  "emailTaskQueue",
  async (job) => {
    const { provider } = job.data;
    if (provider === "google") {
      const { accessToken } = job.data;
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      if (oauth2Client) {
        const res = await processGoogleMails(oauth2Client);
        console.log(res);
      }
    } else {
      const { accessToken } = job.data;
      const graph = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });
      const res = await processOutlookMails(graph);
      console.log(res);
    }
  },
  {
    connection: redisConnection,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job.id} failed. error: ${error}`);
});

export { emailTaskQueue };
