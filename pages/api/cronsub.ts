import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "./supabase";
import moment from "moment";

const expiredSubscriptions = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Get all active subscriptions
  const { data: subscriptions, error } = await supabase
    .from("profiles")
    .select("id, plan, prodate")
    .eq("pro", true);

  if (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("No active subscriptions found");
    return res.status(200).end();
  }

  const now = moment();

  // Loop through each subscription
  subscriptions.forEach(async (subscription) => {
    const purchaseDate = moment(subscription.prodate);
    const interval = getSubscriptionInterval(subscription.plan);
    const expirationDate = purchaseDate.add(interval);

    // Check if the subscription has expired
    if (now.isAfter(expirationDate)) {
      // Mark the subscription as expired
      const { error } = await supabase
        .from("profiles")
        .update({ pro: false, plan: null })
        .eq("id", subscription.id);

      if (error) {
        console.log(
          `Error updating subscription ${subscription.id}: ${error.message}`
        );
      } else {
        console.log(`Subscription ${subscription.id} has expired`);
      }
    }
  });

  return res.status(200).end();
};

// Helper function to get the subscription interval based on the plan
const getSubscriptionInterval = (plan: any) => {
  switch (plan) {
    case "weekly":
      return moment.duration(1, "weeks");
    case "monthly":
      return moment.duration(1, "months");
    case "yearly":
      return moment.duration(1, "years");
    default:
      return null;
  }
};

export default expiredSubscriptions;
