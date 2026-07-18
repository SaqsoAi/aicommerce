import prisma from "../../config/prisma";

type ReviewSummary = {
  totalReviews: number;
  averageRating: number;
  positive: number;
  neutral: number;
  negative: number;
  summary: string;
};

const getSentiment = (
  text: string,
  rating: number
) => {
  const value = text.toLowerCase();

  const positiveWords = [
    "good",
    "great",
    "excellent",
    "perfect",
    "nice",
    "love",
    "best",
    "comfortable",
    "quality",
  ];

  const negativeWords = [
    "bad",
    "poor",
    "worst",
    "disappointed",
    "small",
    "large",
    "late",
    "damaged",
    "not good",
  ];

  if (
    rating >= 4 ||
    positiveWords.some((word) => value.includes(word))
  ) {
    return "positive";
  }

  if (
    rating <= 2 ||
    negativeWords.some((word) => value.includes(word))
  ) {
    return "negative";
  }

  return "neutral";
};

export const summarizeProductReviews = async (
  productId: string
): Promise<ReviewSummary> => {
  if (!productId) {
    throw new Error("Product id is required");
  }

  const reviews = await prisma.review.findMany({
    where: {
      productId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!reviews.length) {
    return {
      totalReviews: 0,
      averageRating: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      summary: "No customer reviews yet.",
    };
  }

  let positive = 0;
  let neutral = 0;
  let negative = 0;

  const ratingTotal = reviews.reduce(
    (sum: number, review: any) =>
      sum + Number(review.rating || 0),
    0
  );

  for (const review of reviews as any[]) {
    const sentiment = getSentiment(
      review.comment || review.content || "",
      Number(review.rating || 0)
    );

    if (sentiment === "positive") positive += 1;
    if (sentiment === "neutral") neutral += 1;
    if (sentiment === "negative") negative += 1;
  }

  const averageRating =
    Math.round((ratingTotal / reviews.length) * 10) / 10;

  const summary =
    positive >= negative
      ? `Most customers are satisfied. Average rating is ${averageRating}/5 based on ${reviews.length} reviews.`
      : `Customer feedback is mixed. Average rating is ${averageRating}/5 based on ${reviews.length} reviews.`;

  return {
    totalReviews: reviews.length,
    averageRating,
    positive,
    neutral,
    negative,
    summary,
  };
};
