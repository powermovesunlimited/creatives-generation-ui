import { Database } from "@/types/supabase";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { streamToString } from "@/lib/utils";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.NODE_ENV === 'production'
  ? process.env.STRIPE_SECRET_KEY
  : process.env.STRIPE_SECRET_TEST_KEY;

const endpointSecret = process.env.NODE_ENV === 'production'
  ? process.env.STRIPE_WEBHOOK_SECRET
  : process.env.STRIPE_WEBHOOK_TEST_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
}

if (!supabaseServiceRoleKey) {
  throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!");
}

const creditsPerPriceId: {
  [key: string]: number;
} = {
  // Live price IDs
  [process.env.STRIPE_PRICE_ID_25_CREDIT as string]: 25,
  [process.env.STRIPE_PRICE_ID_50_CREDITS as string]: 50,
  [process.env.STRIPE_PRICE_ID_100_CREDITS as string]: 100,
  [process.env.STRIPE_PRICE_ID_500_CREDITS as string]: 500,
  // Test price IDs
  [process.env.STRIPE_PRICE_TEST_ID_25_CREDITS as string]: 25,
  [process.env.STRIPE_PRICE_TEST_ID_50_CREDITS as string]: 50,
  [process.env.STRIPE_PRICE_TEST_ID_100_CREDITS as string]: 100,
  [process.env.STRIPE_PRICE_TEST_ID_500_CREDITS as string]: 500,
};

console.log('Stripe Price IDs and Credits:', creditsPerPriceId);

type CreditsRow = Database['public']['Tables']['credits']['Row'];
type CreditsInsert = Database['public']['Tables']['credits']['Insert'];
type CreditsUpdate = Database['public']['Tables']['credits']['Update'];

export async function POST(request: Request) {
  console.log("Webhook received from: ", request.url);
  const headersObj = headers();
  const sig = headersObj.get("stripe-signature");

  if (!stripeSecretKey) {
    console.error("Missing Stripe secret key");
    return NextResponse.json({ message: "Missing Stripe secret key" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-08-16",
    typescript: true,
  });

  if (!sig) {
    console.error("Missing Stripe signature");
    return NextResponse.json({ message: "Missing Stripe signature" }, { status: 400 });
  }

  if (!request.body) {
    console.error("Missing request body");
    return NextResponse.json({ message: "Missing request body" }, { status: 400 });
  }

  const rawBody = await streamToString(request.body);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret!);
  } catch (err) {
    const error = err as Error;
    console.error("Error verifying webhook signature:", error.message);
    return NextResponse.json({ message: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutSessionCompleted(event, stripe, supabase);
    case "charge.succeeded":
    case "charge.updated":
    case "payment_intent.succeeded":
    case "payment_intent.created":
      console.log(`Received ${event.type} event:`, event.id);
      return NextResponse.json({ received: true }, { status: 200 });
    default:
      console.log(`Unhandled event type ${event.type}`);
      return NextResponse.json({ message: `Unhandled event type ${event.type}` }, { status: 200 });
  }
}

async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: ReturnType<typeof createClient<Database>>
) {
  const checkoutSessionCompleted = event.data.object as Stripe.Checkout.Session;
  console.log("Processing checkout.session.completed event:", checkoutSessionCompleted.id);

  // Verify payment status
  if (checkoutSessionCompleted.payment_status !== 'paid') {
    console.error("Payment not completed:", checkoutSessionCompleted.id);
    return NextResponse.json({ message: "Payment not completed" }, { status: 400 });
  }

  const userId = checkoutSessionCompleted.client_reference_id;
  if (!userId) {
    console.error("Missing client_reference_id:", checkoutSessionCompleted.id);
    return NextResponse.json({ message: "Missing client_reference_id" }, { status: 400 });
  }

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(checkoutSessionCompleted.id);
    console.log("Line items:", JSON.stringify(lineItems, null, 2));
    const quantity = lineItems.data[0].quantity ?? 0;
    const priceId = lineItems.data[0].price!.id;

    console.log("Price ID:", priceId);


    const creditsPerUnit = creditsPerPriceId[priceId];
    console.log("Credits per unit:", creditsPerUnit);
    if (creditsPerUnit === undefined) {
      console.error(`Unable to determine credits for price ID: ${priceId}`);
      return NextResponse.json({ message: "Unable to determine credits for the purchased item" }, { status: 400 });
    }

    const totalCreditsPurchased = quantity * creditsPerUnit;

    console.log("Credits calculation:", {
      sessionId: checkoutSessionCompleted.id,
      userId,
      quantity,
      priceId,
      creditsPerUnit,
      totalCreditsPurchased,
    });

    if (totalCreditsPurchased <= 0) {
      console.error("Invalid credits calculation:", checkoutSessionCompleted.id);
      return NextResponse.json({
        message: "Invalid credits calculation",
        details: { priceId, creditsPerUnit, quantity, totalCreditsPurchased }
      }, { status: 400 });
    }

    const { data: existingCredits, error: fetchError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .single();
    // if error is PGRST116 then create a new row with the user_id and credits value set to the level of credits purchased

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Create a new row with the user_id and credits value set to the level of credits purchased
        const insertData: CreditsInsert = { user_id: userId, credits: totalCreditsPurchased };
        const { error: insertError } = await supabase
          .from("credits")
          .insert(insertData);

        if (insertError) {
          console.error("Error creating credits:", insertError);
          return NextResponse.json({ message: "Error creating credits" }, { status: 500 });
        }

        console.log("Credits successfully created for user:", userId);
        return NextResponse.json({ message: "Credits created successfully" }, { status: 200 });

      } else {
        console.error("Error fetching existing credits:", fetchError);
        return NextResponse.json({ message: "Error fetching existing credits" }, { status: 500 });
      }
    }

    if (existingCredits) {
      const newCredits = (existingCredits as CreditsRow).credits + totalCreditsPurchased;
      const updateData: CreditsUpdate = { credits: newCredits };
      const { error: updateError } = await supabase
        .from("credits")
        .update(updateData)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating credits:", updateError);
        return NextResponse.json({ message: "Error updating credits" }, { status: 500 });
      }

      console.log("Credits successfully updated for user:", userId);
      return NextResponse.json({ message: "Credits updated successfully" }, { status: 200 });
    }

    // This part technically won't be reached as fetchError would have exited the function if no credits are found.
    console.error("Error: Unexpected logic flow");
    return NextResponse.json({ message: "Unhandled error" }, { status: 500 });
  } catch (error) {
    console.error("Error processing checkout session:", error);
    return NextResponse.json({ message: "Error processing checkout session", error: JSON.stringify(error) }, { status: 500 });
  }
}