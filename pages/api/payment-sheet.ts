import initStripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";

const stripe = new initStripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

const stripecheckoutsheet = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  //make payment intent
  const { amount } = req.body;
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2022-11-15" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.status(200).json({
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    clientSecret: paymentIntent.client_secret,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};
export default stripecheckoutsheet;
