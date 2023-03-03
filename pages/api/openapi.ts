import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { supabase } from "./supabase";

const openApi = async (req: NextApiRequest, res: NextApiResponse) => {
  const { message, userid } = req.body;
  //form data is x-www-form-urlencoded
  // console.log(message, userid);
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);
  const prompt = `Welcome to JustAIChat!. You: ${message}`;

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.5,
    top_p: 1,
    presence_penalty: 0.5,
    frequency_penalty: 0.5,
  });

  if (response.data.choices == null) {
    res.status(200).json({ text: "Sorry, I don't understand" });
    return;
  }

  if (response.status != 200) {
    res.status(200).json({ text: "Sorry, I don't understand" });
    return;
  }

  const text: any = response.data.choices[0].message?.content;
  const aitext = text.replace(/^\n\n/, "");
  const totaltokens = response.data.usage?.total_tokens;

  //make supabase call to save the conversation

  const { error } = await supabase.from("openai").insert({
    userid: userid,
    prompt: message,
    aitext: aitext,
    usedtokens: totaltokens,
  });

  if (error) {
    console.log(error);
  }

  res.status(200).json({ text: aitext });
};

export default openApi;
