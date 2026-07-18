import "dotenv/config";
import prisma from "../config/prisma";

const sizeFitCenterSeed = {
  heroJson: {
    badge: "AI Powered Fit Center",
    title: "Find Your Perfect Fit",
    subtitle:
      "Smart size guide, real customer fit reviews, virtual try-on and expert measurement help in one place.",
    primaryCta: {
      label: "Find My Size",
      href: "#find-size"
    },
    secondaryCta: {
      label: "Try Virtual Try-On",
      href: "/virtual-tryon"
    }
  },
  statsJson: [
    {
      label: "Fit Reviews",
      value: "12,500+",
      icon: "reviews"
    },
    {
      label: "Fit Accuracy",
      value: "98%",
      icon: "accuracy"
    },
    {
      label: "Size Guides",
      value: "250+",
      icon: "guide"
    },
    {
      label: "Happy Customers",
      value: "50K+",
      icon: "customers"
    }
  ],
  menuJson: [
    {
      key: "size-guide",
      label: "Size Guide",
      enabled: true,
      order: 1
    },
    {
      key: "find-size",
      label: "Find Your Size",
      enabled: true,
      order: 2
    },
    {
      key: "fit-guide",
      label: "Fit Guide",
      enabled: true,
      order: 3
    },
    {
      key: "virtual-tryon",
      label: "Virtual Try-On",
      enabled: true,
      order: 4
    },
    {
      key: "reviews",
      label: "Customer Reviews",
      enabled: true,
      order: 5
    },
    {
      key: "measure",
      label: "How To Measure",
      enabled: true,
      order: 6
    },
    {
      key: "guarantee",
      label: "Fit Guarantee",
      enabled: true,
      order: 7
    }
  ],
  sizeGuideJson: {
    title: "Size Guide",
    subtitle: "Compare body measurements with our product size charts.",
    content:
      "Use chest, waist, hip and length measurements to select the most comfortable fit."
  },
  fitGuideJson: {
    title: "Fit Guide",
    subtitle: "Understand slim, regular, relaxed and oversized fits.",
    content:
      "Each product may fit differently by fabric, cut and style. Check customer fit reviews before ordering."
  },
  measurementJson: {
    title: "How To Measure",
    subtitle: "Measure correctly for better size accuracy.",
    steps: [
      "Use a soft measuring tape.",
      "Measure chest, waist and hip without pulling tightly.",
      "Compare with the product-specific size chart.",
      "Check customer fit reviews for your body type."
    ]
  },
  guaranteeJson: {
    title: "Fit Guarantee",
    subtitle: "Shop confidently with our fit support.",
    points: [
      "AI size recommendation support",
      "Real customer fit reviews",
      "Virtual try-on support",
      "Easy size exchange policy"
    ]
  },
  helpJson: {
    title: "Need Help Finding The Perfect Fit?",
    subtitle: "Our fit experts can help you choose the best size.",
    cards: [
      {
        title: "Live Chat",
        text: "Chat with a fit expert.",
        actionLabel: "Start Chat",
        href: "/contact"
      },
      {
        title: "WhatsApp Support",
        text: "Send us your measurements.",
        actionLabel: "WhatsApp",
        href: "https://wa.me/"
      },
      {
        title: "Call Support",
        text: "Talk to our support team.",
        actionLabel: "Call Now",
        href: "tel:+8800000000000"
      }
    ]
  },
  ctaJson: {
    title: "Ready to shop with confidence?",
    subtitle: "Use fit tools before checkout.",
    primary: {
      label: "Shop Now",
      href: "/shop"
    },
    secondary: {
      label: "Try Virtual Try-On",
      href: "/virtual-tryon"
    }
  },
  reviewSettingsJson: {
    requireVerifiedPurchase: true,
    requireApproval: true,
    allowImages: true,
    allowHelpful: true,
    allowShare: true
  },
  layoutJson: {
    style: "enterprise",
    stickyMenu: true,
    darkMode: true,
    lightMode: true
  }
};

async function main() {
  const existing = await prisma.sizeFitCenterSettings.findFirst({
    where: { active: true }
  });

  if (existing) {
    await prisma.sizeFitCenterSettings.update({
      where: { id: existing.id },
      data: sizeFitCenterSeed
    });

    console.log("SizeFitCenterSettings demo data updated:", existing.id);
    return;
  }

  const created = await prisma.sizeFitCenterSettings.create({
    data: sizeFitCenterSeed
  });

  console.log("SizeFitCenterSettings demo data inserted:", created.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
