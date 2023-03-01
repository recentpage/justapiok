import initStripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "./supabase";

const stripe = new initStripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

export default async function stripecheckoutsheet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { amount, userid } = req.body;

    let customerid = "";
    if (userid) {
      const { data, error } = await supabase
        .from("profiles")
        .select("stripeid")
        .eq("id", userid)
        .select();
      console.log("data:", data);
      if (error) throw error;
      if (data) {
        const stripeid = data[0]?.stripeid;
        if (stripeid) {
          customerid = stripeid;
          console.log("old customerid:", customerid);
        } else {
          const customer = await stripe.customers.create();
          customerid = customer.id;
          console.log("new customerid:", customerid);
          await updateStripeId(userid, customerid);
        }
      }
    }

    if (!customerid) {
      const customer = await stripe.customers.create();
      customerid = customer.id;
      console.log("new customerid: 2", customerid);
      await updateStripeId(userid, customerid);
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerid },
      { apiVersion: "2022-11-15" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: customerid,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { userid: userid },
    });

    res.status(200).json({
      ephemeralKey: ephemeralKey.secret,
      customer: customerid,
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

const updateStripeId = async (userid: string, stripeid: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ stripeid })
    .eq("id", userid)
    .select();
  console.log("data:", data);
  if (error) throw error;
};
