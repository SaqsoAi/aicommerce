export const permissions = {
  SUPER_ADMIN: [
    "*",
  ],

  ADMIN: [
    "products",
    "orders",
    "users",
    "analytics",
  ],

  MANAGER: [
    "products",
    "orders",
  ],

  STAFF: [
    "orders",
  ],

  CUSTOMER: [],
};