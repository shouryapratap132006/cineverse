/**
 * CineVerse GitHub Label Management Utility
 * Automatically configures standard CNCF / Open-Source label set on GitHub.
 *
 * Usage:
 *   node scripts/setup-labels.js
 */

const LABELS = [
  { name: 'good first issue', color: '7057ff', description: 'Good for newcomers and first-time contributors' },
  { name: 'help wanted', color: '008672', description: 'Extra attention or community help needed' },
  { name: 'documentation', color: '0075ca', description: 'Improvements or additions to documentation' },
  { name: 'frontend', color: '1d76db', description: 'React 19, Next.js UI, Tailwind CSS, or component changes' },
  { name: 'backend', color: '5319e7', description: 'Server Actions, Express, Custom Server, or API routes' },
  { name: 'AI', color: 'd93f0b', description: 'Groq LLM gateway, prompts, or intelligence services' },
  { name: 'LangGraph', color: 'e99695', description: 'LangGraph agent graphs, node routing, or state machines' },
  { name: 'RAG', color: 'fef2c0', description: 'Retrieval-Augmented Generation & embedding index' },
  { name: 'Socket.IO', color: '0052cc', description: 'Real-time WebSockets, watch parties, or chat sync' },
  { name: 'Stripe', color: '6772e5', description: 'Billing, subscription tiers, or checkout webhooks' },
  { name: 'Prisma', color: '2d3748', description: 'Database schemas, Prisma ORM queries, or migrations' },
  { name: 'Docker', color: '2496ed', description: 'Docker containers, multi-stage builds, or compose' },
  { name: 'AWS', color: 'ff9900', description: 'Cloud deployment, EC2, Caddy, or GitHub Actions CI/CD' },
  { name: 'bug', color: 'd73a4a', description: "Something isn't working as expected" },
  { name: 'enhancement', color: 'a2eeef', description: 'New feature or request' },
  { name: 'high priority', color: 'b60205', description: 'Critical issue needing immediate focus' },
  { name: 'low priority', color: 'cfd3d7', description: 'Minor tweak or nice-to-have improvement' },
  { name: 'performance', color: 'd4c5f9', description: 'Memory optimization, caching, or latency fixes' },
  { name: 'security', color: 'ee0701', description: 'Security fixes, authentication, or input sanitization' },
  { name: 'UI', color: 'f9d0c4', description: 'User interface layout, styling, or animations' },
  { name: 'UX', color: 'fef2c0', description: 'User experience flow, usability, or interaction design' },
  { name: 'testing', color: 'c2e0c6', description: 'Unit tests, end-to-end testing, or mock services' }
];

console.log("CineVerse Label Set Manifest:");
console.log(JSON.stringify(LABELS, null, 2));
