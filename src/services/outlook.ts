import { Client } from "@microsoft/microsoft-graph-client";
import emailAnalysis from "../emailAnalysis";

const sendReplyUsingOutlook = async (client, message, replyMail) => {
  try {
    const replyEmail = {
      message: {
        subject: replyMail.subject,
        body: {
          contentType: "Text",
          content: replyMail.body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: message.sender.emailAddress.address,
            },
          },
        ],
      },
      saveToSentItems: "true",
    };

    await client.api("/me/sendMail").post(replyEmail);
  } catch (error) {
    console.error("Error sending reply email:", error);
    throw error;
  }
};

const addOutlookCategory = async (graph, message, category) => {
  await graph.api(`/me/messages/${message.id}`).patch({
    categories: [category],
  });
};

const processOutlookMails = async (graph) => {
  const messagesResult = await graph
    .api("/me/messages")
    .filter("isRead eq false")
    .get();
  if (!messagesResult.value) {
    return { message: "No new emails", emails: [] };
  }

  for (const message of messagesResult.value) {
    const body = message.body.content;
    const analyzedResponse = await emailAnalysis(body);
    const response = JSON.parse(analyzedResponse);

    if (response.replyMail.body) {
      await sendReplyUsingOutlook(graph, message, response.replyMail);
    }

    await addOutlookCategory(graph, message, response.label);
    await graph.api(`/me/messages/${message.id}`).update({ isRead: true });
  }

  return {
    message: "Emails processed",
    emails: messagesResult.value.map((m) => m.id),
  };
};

export { processOutlookMails, sendReplyUsingOutlook, addOutlookCategory };
