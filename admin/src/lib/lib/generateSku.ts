export const generateSKU = (
  category: string
) => {
  const random =
    Math.floor(
      1000 + Math.random() * 9000
    );

  return `${category}-${random}`;
};