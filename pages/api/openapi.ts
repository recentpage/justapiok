import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { supabase } from "./supabase";

const openApi = async (req: NextApiRequest, res: NextApiResponse) => {
  const { message, userid } = req.body;
  console.log(message, userid);
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);
  const prompt = `Welcome to JustAIChat!. How can I assist you today? You: ${message}`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 100,
    temperature: 0.7,
  });

  if (response.data.choices == null) {
    res.status(200).json({ text: "Sorry, I don't understand" });
    return;
  }

  if (response.status != 200) {
    res.status(200).json({ text: "Sorry, I don't understand" });
    return;
  }

  console.log(message, userid, response.data.choices[0].text);

  const text: any = response.data.choices[0].text;
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
