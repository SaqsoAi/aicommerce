type Product = {
  name: string;
  category: string;
  brand?: string;
  description?: string;
  color?: string;
  size?: string;
  price?: number;
};

type SearchResult = Product & {
  score?: number;
};

const COLORS = [
  "black","white","blue","red","green",
  "yellow","orange","purple","pink",
  "grey","gray","brown"
];

const SIZES = [
  "xs","s","m","l","xl","xxl","xxxl"
];

function extractBudget(query: string) {
  const match =
    query.match(/under\s+(\d+)/i) ||
    query.match(/below\s+(\d+)/i);

  return match ? Number(match[1]) : null;
}

function extractColor(query: string) {
  const q = query.toLowerCase();

  return (
    COLORS.find((c) => q.includes(c)) ||
    null
  );
}

function extractSize(query: string) {
  const q = query.toLowerCase();

  return (
    SIZES.find((s) => q.includes(` ${s} `)) ||
    SIZES.find((s) => q.endsWith(` ${s}`)) ||
    null
  );
}

function parseSearchIntent(
  query: string
) {
  return {
    budget: extractBudget(query),
    color: extractColor(query),
    size: extractSize(query),
    query: query.toLowerCase(),
  };
}

export const smartSearchEngine = {
  search(
    query: string,
    products: Product[]
  ): Product[] {
    const q = query.toLowerCase();

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q)
      );
    });
  },

  smartSearch(
    query: string,
    products: Product[]
  ): SearchResult[] {
    const intent =
      parseSearchIntent(query);

    return products
      .map((product) => {
        let score = 0;

        if (
          product.name
            ?.toLowerCase()
            .includes(intent.query)
        ) {
          score += 5;
        }

        if (
          product.category
            ?.toLowerCase()
            .includes(intent.query)
        ) {
          score += 3;
        }

        if (
          product.brand
            ?.toLowerCase()
            .includes(intent.query)
        ) {
          score += 2;
        }

        if (
          product.description
            ?.toLowerCase()
            .includes(intent.query)
        ) {
          score += 1;
        }

        if (
          intent.color &&
          product.color
            ?.toLowerCase()
            .includes(intent.color)
        ) {
          score += 5;
        }

        if (
          intent.size &&
          product.size
            ?.toLowerCase()
            .includes(intent.size)
        ) {
          score += 4;
        }

        if (
          intent.budget &&
          product.price &&
          product.price <= intent.budget
        ) {
          score += 5;
        }

        return {
          ...product,
          score,
        };
      })
      .filter(
        (product) =>
          (product.score ?? 0) > 0
      )
      .sort(
        (a, b) =>
          (b.score ?? 0) -
          (a.score ?? 0)
      );
  },
};

export const smartSearch = (
  query: string,
  products: Product[]
) => {
  return smartSearchEngine.search(
    query,
    products
  );
};

export const smartSearchAI = (
  query: string,
  products: Product[]
) => {
  return smartSearchEngine.smartSearch(
    query,
    products
  );
};
