// Store-wide settings: change the name or links here, nowhere else.
export const STORE = {
  name: "ShopSphere",
  tagline: "Gadgets and everyday style, delivered across India.",
  supportEmail: "support@shopsphere.example",
  repos: {
    frontend: "https://github.com/iyogisharma001/mern-ecommerce-frontend",
    backend: "https://github.com/iyogisharma001/mern-ecommerce-backend",
  },
};

// Must match the server's pricing rules (backend controllers/payment.ts)
export const PRICING = {
  taxRate: 0.18,
  freeShippingAbove: 1000,
  shippingCharge: 200,
};
