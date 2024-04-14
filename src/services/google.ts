import { google, gmail_v1 } from "googleapis";
import emailAnalysis from "../emailAnalysis";

const sendGoogleReply = async (gmail, message, replyMail) => {
  try {
    const messageId = message.id ?? "";
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "metadata",
      metadataHeaders: ["Subject", "From"],
    });
    const from =
      res.data.payload?.headers?.find((header) => header.name === "From")
        ?.value || "";
    const replyTo = from.match(/<(.*)>/)?.[1] || "";
    const replySubject = replyMail.subject;
    const replyBody = replyMail.body.split(".").join("\n");

    const rawMessage = [
      `From: me`,
      `To: ${replyTo}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${messageId}`,
      `References: ${messageId}`,
      ``,
      replyBody,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });
  } catch (error) {
    console.error("Error sending reply email:", error);
    throw error;
  }
};

const getGmailLabelId = async (gmail, labelName) => {
  const labels = await gmail.users.labels.list({ userId: "me" });
  let label = labels.data.labels.find((label) => label.name === labelName);
  if (!label) {
    label = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
  }
  return label.data.id;
};

const processGoogleMails = async (oauth2Client: any): Promise<any> => {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const messagesResult = ((await gmail.users.messages.list) as any)({
    userId: "me",
    maxResults: 1,
    q: "is:unread",
    orderBy: "date desc",
  });

  if (!messagesResult.data.messages) {
    return { message: "No new emails", emails: [] };
  }

  for (const message of messagesResult.data.messages) {
    const messageData = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });

    const subject = messageData.data.payload.headers.find(
      (header) => header.name === "Subject"
    )?.value;
    const content = Buffer.from(
      messageData.data.payload.body.data,
      "base64"
    ).toString("utf-8");
    const body = `${subject} ${content}`;
    const analyzedResponse = await emailAnalysis(body);
    const response = JSON.parse(analyzedResponse);

    if (response.replyMail.body) {
      await sendGoogleReply(gmail, messageData.data, response.replyMail);
    }

    const labelId = await getGmailLabelId(gmail, response.label);
    await (gmail.users.messages.modify as any)({
      userId: "me",
      id: message.id,
      addLabelIds: [labelId],
      removeLabelIds: ["UNREAD"],
    });
  }

  return {
    message: "Emails processed",
    emails: messagesResult.data.messages.map((m) => m.id),
  };
};

export { processGoogleMails, sendGoogleReply, getGmailLabelId };
