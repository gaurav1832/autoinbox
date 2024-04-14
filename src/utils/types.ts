interface ReplyType {
  subject: string;
  body: string;
}

interface GPTResponseType {
  label: string;
  extractedMailContent: string;
  replyMail: ReplyType;
}

export { ReplyType, GPTResponseType };
