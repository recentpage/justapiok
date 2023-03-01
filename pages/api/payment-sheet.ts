import initStripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "./supabase";

const stripe = new initStripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

const stripecheckoutsheet = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  //make payment intent
  const { amount, userid } = req.body;

  const customer = await stripe.customers.create();
  const customerid = customer.id;
  const { error } = await supabase
    .from("profiles")
    .update({ stripeid: customerid })
    .match({ id: userid });
  if (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
  //get profile from db
  if (userid) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userid);
    if (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  // let customerid = "";

  // if (userid) {
  //   //get stripeid from db supabase
  //   const { data, error } = await supabase
  //     .from("profiles")
  //     .select("stripeid")
  //     .eq("id", userid);
  //   if (error) {
  //     console.log(error);
  //     res.status(500).json({ error: error.message });
  //   }
  //   if (data) {
  //     const stripeid = data[0].stripeid;
  //     if (stripeid) {
  //       customerid = stripeid;
  //       console.log("old customerid: ", customerid);
  //     } else {
  //       //create customer
  //       const customer = await stripe.customers.create();
  //       //update customerid
  //       customerid = customer.id;
  //       //update db
  //       console.log("new customerid: ", customerid);
  //       const { error } = await supabase
  //         .from("profiles")
  //         .update({ stripeid: customerid })
  //         .match({ id: userid });
  //       if (error) {
  //         console.log(error);
  //         res.status(500).json({ error: error.message });
  //       }
  //     }
  //   }
  // }

  // if (!customerid) {
  //   const customer = await stripe.customers.create();
  //   customerid = customer.id;
  //   const { error } = await supabase
  //     .from("profiles")
  //     .update({ stripeid: customerid })
  //     .match({ id: userid });
  //   if (error) {
  //     console.log(error);
  //     res.status(500).json({ error: error.message });
  //   }
  // }

  // const ephemeralKey = await stripe.ephemeralKeys.create(
  //   { customer: customerid },
  //   { apiVersion: "2022-11-15" }
  // );
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: Math.round(amount * 100),
  //   currency: "usd",
  //   customer: customerid,
  //   automatic_payment_methods: {
  //     enabled: true,
  //   },
  //   metadata: { userid: userid },
  // });

  // res.status(200).json({
  //   ephemeralKey: ephemeralKey.secret,
  //   customer: customerid,
  //   clientSecret: paymentIntent.client_secret,
  //   publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  // });
};
export default stripecheckoutsheet;
