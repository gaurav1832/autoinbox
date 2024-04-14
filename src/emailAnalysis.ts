import OpenAI from "openai";

const emailAnalysis = async (emailContent: string): Promise<string> => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Suppose you are a business owner and you have many clients sending you the mail enquiry and you have to categorise the mails based on the email content and give the label from the three:  “Interested”, “Not Interested”, “More Information” 
          If a client is interested in the product and is looking forward to discuss the further details like pricing, etc. Then categories the mail in “Interested” category.
          If a client mentions that they are not interested in the product or the product is not relevant for them, then categories the mail in “Not Interested” category.
          If a client mentions in the email that they are interested in the product and they need more information about the product like free trial, demonstration, etc, then categories the mail in “More Information” category.
             Give your response in below JSON format: \n
            {
                "label":"",
                "reply":{
                "subject":"",
                "body":""
            }
        }
            email content: \n
            ${emailContent}`,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    return response.choices[0].message.content;
  } catch (error) {
    throw error;
  }
};

export default emailAnalysis;
