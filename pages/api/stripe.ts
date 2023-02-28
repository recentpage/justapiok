import initStripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";

const stripe = new initStripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

const stripecheckout = async (req: NextApiRequest, res: NextApiResponse) => {
  //make payment intent
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    payment_method_types: ["card"],
  });
  res.status(200).json({ client_secret: paymentIntent.client_secret });
};

export default stripecheckout;
