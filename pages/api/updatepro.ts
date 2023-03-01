import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "./supabase";
import initStripe from "stripe";
import { buffer } from "micro";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upgradePro = async (req: NextApiRequest, res: NextApiResponse) => {
  //@ts-ignore
  const stripe = initStripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  const signingSecret = "whsec_ST7rc3GtfhFtld0kLbtkYUWpKXDzFuQ2";
  const buf = await buffer(req);

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, signingSecret);
  } catch (err: any) {
    console.log("Error", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(event.type);
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(paymentIntent);
      const { userid } = paymentIntent.metadata;
      const { data, error } = await supabase
        .from("profiles")
        .update({
          pro: true,
          plan: paymentIntent.metadata.plan,
          prodate: new Date().toISOString(),
        })
        .eq("id", userid);
      if (error) {
        console.log(error);
      }
      console.log(data);
    case "payment_intent.payment_failed":
      const paymentFailed = event.data.object;
      console.log(paymentFailed);
      break;
    case "payment_intent.processing":
      const paymentProcessing = event.data.object;
      console.log(paymentProcessing);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

export default upgradePro;
