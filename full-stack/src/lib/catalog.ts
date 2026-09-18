export type Status = "pass" | "fail" | "partial" | "untested";
export type Severity = "HIGH" | "MED" | "LOW";

export type ProbeSpec = {
  id: string;
  category: string;
  title: string;
  method: string;
  path: string;
  severity: Severity;
  expected: string;
};

export type ProbeResult = ProbeSpec & {
  pass: boolean;
  got: string;
  request: string;
  response: string;
  note: string;
};

export type ScanEvent =
  | { type: "start"; runId: string }
  | { type: "result"; result: ProbeResult; requests: number }
  | { type: "done"; requests: number }
  | { type: "error"; message: string };

export type CategoryInfo = {
  id: string;
  title: string;
  question: string;
  attack: string;
};

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "API1",
    title: "Broken Object Level Auth",
    question: "Can one customer read another customer's data?",
    attack:
      "Sign in as customer B, then ask the server for customer A's profile and order history — carrying B's perfectly valid token the whole way. This is the single most common API breach, and scanners can't find it: only the app knows which cart belongs to whom.",
  },
  {
    id: "API2",
    title: "Broken Authentication",
    question: "Can someone forge their way in without a password?",
    attack:
      "Four ways in without credentials: no token at all, a token with its signature stripped off, one signed with the default secret printed in the setup docs, and a real token with the user id quietly rewritten to somebody else's.",
  },
  {
    id: "API3",
    title: "Broken Object Property Auth",
    question: "Can someone quietly promote themselves to admin?",
    attack:
      "Send an ordinary profile update, but smuggle in two fields the API never advertised — role: admin and isVerified: true — and see whether they survive the trip to the database.",
  },
  {
    id: "API4",
    title: "Unrestricted Resource Consumption",
    question: "Can someone guess passwords until one works?",
    attack:
      "Fire seven logins at one account as fast as the server will take them. Then do it again, changing the client id header on every single request, to see whether the throttle can be walked around.",
  },
  {
    id: "API5",
    title: "Broken Function Level Auth",
    question: "Can an ordinary shopper delete the whole catalogue?",
    attack:
      "Sign in as a plain customer — nothing admin about them — and call the endpoints that delete products and categories. Being logged in should not be the same thing as being allowed.",
  },
  {
    id: "API6",
    title: "Unrestricted Access to Sensitive Flows",
    question: "Can a bot create accounts in bulk?",
    attack:
      "Register five accounts back to back with no pause between them, and see whether anything at all — a captcha, an email confirmation, a signup throttle — gets in the way.",
  },
  {
    id: "API7",
    title: "Server Side Request Forgery",
    question: "Can the server be tricked into fetching its own cloud keys?",
    attack:
      "Hand the API an internal AWS metadata URL where it expects a shipping address and a product image link. If the server ever fetches a URL a user hands it, that URL can point somewhere private.",
  },
  {
    id: "API8",
    title: "Security Misconfiguration",
    question: "Does the server give away its own internals?",
    attack:
      "Send it deliberately broken JSON, ask for a route that doesn't exist, knock on the door from an untrusted origin, and read what the response headers volunteer about the stack underneath.",
  },
  {
    id: "API9",
    title: "Improper Inventory Management",
    question: "Are there forgotten admin endpoints still live?",
    attack:
      "Go looking for the things that get left behind: the gateway's debug session routes, a guessable session id, and an old /api/v1 path from a previous life — all with no token at all.",
  },
  {
    id: "API10",
    title: "Unsafe Consumption of APIs",
    question: "Does it trust data from third parties blindly?",
    attack:
      "Nothing to test here yet. This backend doesn't call any third-party APIs, so there's no incoming data to mistrust. Marked untested rather than passed — an empty category isn't a clean bill of health.",
  },
];

export type Endpoint = { m: string; p: string; pub?: boolean };

export const ENDPOINT_GROUPS: { area: string; items: Endpoint[] }[] = [
  {
    area: "Accounts",
    items: [
      { m: "POST", p: "/auth/register", pub: true },
      { m: "POST", p: "/auth/login", pub: true },
      { m: "GET", p: "/auth/google/callback", pub: true },
      { m: "POST", p: "/auth/logout" },
      { m: "GET", p: "/auth/users/:userId" },
      { m: "PUT", p: "/auth/users/:userId" },
      { m: "DELETE", p: "/auth/users/:userId" },
      { m: "PUT", p: "/auth/reset-password/:userId" },
    ],
  },
  {
    area: "Products",
    items: [
      { m: "GET", p: "/products", pub: true },
      { m: "GET", p: "/products/:id", pub: true },
      { m: "POST", p: "/products" },
      { m: "PUT", p: "/products/:id" },
      { m: "DELETE", p: "/products/:id" },
    ],
  },
  {
    area: "Categories",
    items: [
      { m: "GET", p: "/categories", pub: true },
      { m: "GET", p: "/categories/:id", pub: true },
      { m: "POST", p: "/categories" },
      { m: "PUT", p: "/categories/:id" },
      { m: "DELETE", p: "/categories/:id" },
    ],
  },
  {
    area: "Cart",
    items: [
      { m: "GET", p: "/cart" },
      { m: "POST", p: "/cart" },
      { m: "POST", p: "/cart/items" },
      { m: "PUT", p: "/cart/items/:itemId" },
      { m: "DELETE", p: "/cart/items/:itemId" },
    ],
  },
  {
    area: "Orders",
    items: [
      { m: "POST", p: "/orders" },
      { m: "GET", p: "/orders/:orderId" },
      { m: "GET", p: "/orders/user/:userId" },
      { m: "PUT", p: "/orders/:orderId" },
      { m: "DELETE", p: "/orders/:orderId" },
    ],
  },
  {
    area: "Payments",
    items: [
      { m: "POST", p: "/payments" },
      { m: "GET", p: "/payments/:paymentId" },
      { m: "POST", p: "/payments/refund" },
    ],
  },
  {
    area: "Reviews",
    items: [
      { m: "GET", p: "/reviews/:productId", pub: true },
      { m: "POST", p: "/reviews/:productId" },
      { m: "DELETE", p: "/reviews/:reviewId" },
    ],
  },
  {
    area: "Shipping",
    items: [
      { m: "GET", p: "/shipping/methods", pub: true },
      { m: "POST", p: "/shipping/estimate", pub: true },
    ],
  },
  {
    area: "Health",
    items: [{ m: "GET", p: "/health", pub: true }],
  },
];

export const ENDPOINT_COUNT = ENDPOINT_GROUPS.reduce((n, g) => n + g.items.length, 0);

export const PROBES: ProbeSpec[] = [
  { id: "bola-read-profile", category: "API1", title: "Read another account's profile", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "403" },
  { id: "bola-edit-profile", category: "API1", title: "Edit another account's profile", method: "PUT", path: "/auth/users/:userId", severity: "HIGH", expected: "403" },
  { id: "bola-list-orders", category: "API1", title: "List another account's orders", method: "GET", path: "/orders/user/:userId", severity: "HIGH", expected: "403" },

  { id: "auth-no-token", category: "API2", title: "Call a protected route with no token", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "401" },
  { id: "auth-alg-none", category: "API2", title: "Unsigned token (alg: none)", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "401" },
  { id: "auth-default-secret", category: "API2", title: "Token signed with the documented default secret", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "401" },
  { id: "auth-tampered-sub", category: "API2", title: "Real token with its user id swapped", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "401" },

  { id: "prop-mass-assign", category: "API3", title: "Smuggle a role field into a profile update", method: "PUT", path: "/auth/users/:userId", severity: "HIGH", expected: "400" },
  { id: "prop-password-leak", category: "API3", title: "Password hash in profile response", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "no password field" },

  { id: "rate-login-burst", category: "API4", title: "Password guessing burst", method: "POST", path: "/auth/login ×7", severity: "MED", expected: "429" },
  { id: "rate-rotated-key", category: "API4", title: "Burst with a new x-user-id on every request", method: "POST", path: "/auth/login ×7", severity: "MED", expected: "429" },

  { id: "rbac-delete-product", category: "API5", title: "Delete a product from an ordinary account", method: "DELETE", path: "/products/:id", severity: "HIGH", expected: "403" },
  { id: "rbac-delete-category", category: "API5", title: "Delete a category from an ordinary account", method: "DELETE", path: "/categories/:id", severity: "HIGH", expected: "403" },

  { id: "flow-burst-register", category: "API6", title: "Register 5 accounts back-to-back, no verification gate", method: "POST", path: "/auth/register ×5", severity: "MED", expected: "throttled or blocked" },

  { id: "ssrf-shipping-destination", category: "API7", title: "Shipping estimate with a cloud-metadata URL as destination", method: "POST", path: "/shipping/estimate", severity: "MED", expected: "rejected before reaching business logic" },
  { id: "ssrf-image-url", category: "API7", title: "Product image URL pointing at an internal/metadata address", method: "POST", path: "/products", severity: "LOW", expected: "stored verbatim, never fetched" },

  { id: "misconf-headers", category: "API8", title: "Security response headers", method: "GET", path: "/health", severity: "LOW", expected: "nosniff, no x-powered-by" },
  { id: "misconf-cors", category: "API8", title: "CORS for an untrusted origin", method: "GET", path: "/health", severity: "MED", expected: "origin not allowed" },
  { id: "misconf-swagger", category: "API8", title: "API schema reachable without a token", method: "GET", path: "/api-json", severity: "LOW", expected: "404" },
  { id: "misconf-malformed-json", category: "API8", title: "Malformed JSON body doesn't leak a stack trace", method: "POST", path: "/auth/login", severity: "LOW", expected: "generic 400, no stack or file paths" },
  { id: "misconf-unknown-route", category: "API8", title: "Unknown route returns a clean 404", method: "GET", path: "/this-route-does-not-exist", severity: "LOW", expected: "json 404, not an html error page" },

  { id: "inventory-sessions-list", category: "API9", title: "Session list without a token", method: "GET", path: "/gateway/_sessions", severity: "HIGH", expected: "401" },
  { id: "inventory-session-lookup", category: "API9", title: "Inspect a specific session by guessed ID, no token", method: "GET", path: "/gateway/_sessions/:sessionId", severity: "HIGH", expected: "401" },
  { id: "inventory-legacy-path", category: "API9", title: "Request a legacy/shadow API version path", method: "GET", path: "/api/v1/products", severity: "LOW", expected: "404" },
];
