import prisma from "../config/prisma";

async function main() {
  await prisma.rewardPointRule.deleteMany();
  await prisma.rewardRedemptionRule.deleteMany();

  await prisma.rewardPointRule.createMany({
    data: [
      { title: "Sign Up / Account Registration", ruleType: "SIGNUP", points: 100 },
      { title: "Complete Profile", ruleType: "PROFILE_COMPLETE", points: 50 },
      { title: "First Purchase", ruleType: "FIRST_PURCHASE", points: 200 },
      { title: "Every Tk 100 Spent", ruleType: "SPEND", spendAmount: 100, points: 10 },
      { title: "Product Review", ruleType: "PRODUCT_REVIEW", points: 50 },
      { title: "Product Rating", ruleType: "PRODUCT_RATING", points: 20 },
      { title: "Newsletter Subscription", ruleType: "NEWSLETTER", points: 50 },
      { title: "Download Mobile App", ruleType: "APP_DOWNLOAD", points: 100 },
      { title: "Daily Login", ruleType: "DAILY_LOGIN", points: 5 },
      { title: "Birthday Reward", ruleType: "BIRTHDAY", points: 200 },
      { title: "Refer a Friend", ruleType: "REFERRAL", points: 500 },
      { title: "Friend First Purchase", ruleType: "REFERRAL_PURCHASE", points: 300 },
      { title: "Social Media Follow", ruleType: "SOCIAL_FOLLOW", points: 50 },
      { title: "Share Product on Social Media", ruleType: "SOCIAL_SHARE", points: 25 },
      { title: "Survey Completion", ruleType: "SURVEY", points: 100 },
    ],
  });

  await prisma.rewardRedemptionRule.createMany({
    data: [
      {
        title: "Tk 50 Discount Coupon",
        requiredPoints: 500,
        rewardType: "COUPON_AMOUNT",
        discountAmount: 50,
      },
      {
        title: "Tk 100 Discount Coupon",
        requiredPoints: 1000,
        rewardType: "COUPON_AMOUNT",
        discountAmount: 100,
      },
      {
        title: "Tk 250 Discount Coupon",
        requiredPoints: 2000,
        rewardType: "COUPON_AMOUNT",
        discountAmount: 250,
      },
      {
        title: "Tk 700 Discount Coupon",
        requiredPoints: 5000,
        rewardType: "COUPON_AMOUNT",
        discountAmount: 700,
      },
      {
        title: "Tk 1500 Discount Coupon",
        requiredPoints: 10000,
        rewardType: "COUPON_AMOUNT",
        discountAmount: 1500,
      },
      {
        title: "Free Shipping for 10 Orders",
        requiredPoints: 15000,
        rewardType: "FREE_DELIVERY",
        freeDelivery: true,
      },
      {
        title: "VIP Member Status 3 Months",
        requiredPoints: 20000,
        rewardType: "VIP_STATUS",
      },
      {
        title: "Exclusive Gift Item",
        requiredPoints: 25000,
        rewardType: "GIFT_ITEM",
      },
      {
        title: "Tk 5000 Shopping Voucher",
        requiredPoints: 50000,
        rewardType: "SHOPPING_VOUCHER",
        discountAmount: 5000,
      },
    ],
  });

  console.log("Rewards Seeded Successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
