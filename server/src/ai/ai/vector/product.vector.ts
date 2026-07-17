import { index } from "./pinecone";

export const storeProductVector = async (
  product: any,
  embedding: number[]
) => {
  try {
    await index.upsert({
      records: [
        {
          id: String(product.id),

          values: embedding,

          metadata: {
            name: product.name,
            price: product.price,
          },
        },
      ],
    });

    console.log(
      "✅ Product vector stored"
    );
  } catch (error) {
    console.log(
      "❌ Pinecone Error:",
      error
    );
  }
};

// 🔎 SEARCH SIMILAR PRODUCTS
export const searchSimilarProducts =
  async (
    vector: number[]
  ) => {
    const result =
      await index.query({
        vector,

        topK: 5,

        includeMetadata: true,
      });

    return result.matches;
  };