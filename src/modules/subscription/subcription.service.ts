import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createCheckoutSession = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    // old customer check
    let stripeCustomerId = user?.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      // new customer creation
      const customer = await stripe.customers.create({
        email: user?.email,
        name: user?.name,
        metadata: {
          userId: user?.id || "",
        },
      });
      stripeCustomerId = customer.id;
    }
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_product_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/premium?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: {
        userId: user?.id || "",
      },
    });
    return session.url;
  });
  return { paymentUrl: transactionResult };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );
  switch (event.type) {
    case "checkout.session.completed":
      // console.log("Checkout session completed.");
      //occurs when the checkout session is completed successfully
      await handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.updated":
      //occurs when the subscription is changed, for example when switching from one plan to another
      break;
    case "customer.subscription.deleted":
      //occurs when the subscription is canceled
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }
};

const getPeriodEnd = (payload: Stripe.Subscription) => {
  const currentPeriodEndInMiliSeconds =
    payload.items.data[0]?.current_period_end!;
  const currentPeriodEnd = new Date(currentPeriodEndInMiliSeconds * 1000);
  return currentPeriodEnd;
};

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;
  if (userId && stripeCustomerId && stripeSubscriptionId) {
    throw new Error("Missing required metadata in the session object.");
  }

  const stripeSubscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const currentPeriodStart =
    stripeSubscription.items.data[0]?.current_period_start;

  const currentPeriodEnd = getPeriodEnd(stripeSubscription);

  if (!userId) {
    throw new Error("Missing userId in the session metadata.");
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      status: "ACTIVE",
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      status: "ACTIVE",
      currentPeriodEnd,
    },
  });
};

const cancelSubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findUniqueOrThrow({
    where: { userId },
  });

  if (subscription.status === "CANCELED") {
    throw new Error("Subscription is already canceled.");
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error("No active Stripe subscription found for this user.");
  }

  // cancel the subscription on Stripe immediately
  await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

  const updatedSubscription = await prisma.subscription.update({
    where: { userId },
    data: { status: "CANCELED" },
  });

  return updatedSubscription;
};

const getSubscriptionStatus = async (userId: string) => {
  const isSubscriptionExits = await prisma.subscription.findUniqueOrThrow({
    where: { userId },
  });
  const isActive =
    isSubscriptionExits.status === "ACTIVE" &&
    isSubscriptionExits.currentPeriodEnd &&
    new Date(isSubscriptionExits.currentPeriodEnd) > new Date();

  return {
    isActive,
    isSubscribed: isActive,
    currentPeriodEnd: isSubscriptionExits.currentPeriodEnd,
  };
};

export const subscriptionServices = {
  createCheckoutSession,
  handleWebhook,
  cancelSubscription,
  getSubscriptionStatus,
};
