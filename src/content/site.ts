// Copy and data for the landing page, taken from the Paper file.

export const HERO_LOGOS = [
  [
    { src: "/logos/a1.webp", alt: "Solana", width: 149, height: 28 },
    { src: "/logos/a2.webp", alt: "Meteora", width: 116, height: 28 },
    { src: "/logos/a3.webp", alt: "Epicbet", width: 119, height: 28 },
    { src: "/logos/a4.webp", alt: "ChainGPT", width: 130, height: 28 },
    { src: "/logos/a5.webp", alt: "Polymarket", width: 151, height: 28 },
    { src: "/logos/a6.webp", alt: "Whale.io", width: 104, height: 28 },
  ],
  [
    { src: "/logos/b1.webp", alt: "JackBit", width: 118, height: 17 },
    { src: "/logos/b2.webp", alt: "FortuneJack", width: 107, height: 28 },
    { src: "/logos/b3.webp", alt: "TIGA.GAME", width: 153, height: 28 },
    { src: "/logos/b4.webp", alt: "BitFortune", width: 130, height: 29 },
    { src: "/logos/b5.webp", alt: "Duelbits", width: 121, height: 28 },
    { src: "/logos/b6.webp", alt: "Talus", width: 109, height: 20 },
  ],
] as const;

export const STATS = [
  { value: "2.5B+", label: "Views generated for customers" },
  { value: "5,000+", label: "Content creators" },
  { value: "150K+", label: "Posts created" },
  { value: "$250K+", label: "Paid out to creators" },
] as const;

export const CAMPAIGN_TYPES = [
  {
    title: "Clipping",
    video: "clipping",
    // Placeholder copy: final descriptions to come.
    description:
      "Clippers cut your long-form content into short clips and post them across TikTok, Reels, Shorts and X.",
  },
  {
    title: "Logo",
    video: "logo",
    description:
      "Creators place your logo on content they already post, so your brand rides along with every view.",
  },
  {
    title: "Music",
    video: "music",
    description:
      "Put your track behind thousands of short-form posts and turn it into the sound people keep hearing.",
  },
  {
    title: "UGC (Coming soon)",
    video: "ugc",
    description:
      "Creators film original content about your product in their own voice, briefed and approved by you.",
  },
] as const;

export const STEPS = [
  {
    title: "Set the brief and the CPM",
    body: "Upload source footage, write content requirements, pick platforms and set your rate per 1,000 views.",
  },
  {
    title: "Clippers post and submit",
    // Placeholder copy: not in the Paper file yet.
    body: "Creators cut and post clips to their own accounts, then submit each post to your campaign for review.",
  },
  {
    title: "Verified, then paid out",
    // Placeholder copy: not in the Paper file yet.
    body: "Views are pulled from the accounts and checked for fraud. You approve, and only clean views are paid.",
  },
] as const;

export const VERIFICATION_FEATURES = [
  {
    icon: "link",
    title: "Pulled from the accounts",
    body: "View counts come straight from connected creator accounts, never from screenshots.",
  },
  {
    icon: "shield",
    title: "Scored for fraud",
    body: "Engagement patterns, account history and audience signals are checked together.",
  },
  {
    icon: "user-check",
    title: "You make the call",
    body: "Nothing pays out until you or your campaign manager approve it against the brief.",
  },
  {
    icon: "receipt",
    title: "Only clean views bill",
    body: "Flagged views are held for review and never count toward spend, payouts or reporting.",
  },
] as const;

export const API_FEATURES = [
  {
    icon: "code",
    title: "Campaigns API",
    body: "Create, fund, pause and top up campaigns from your own product.",
  },
  {
    icon: "chart",
    title: "Verified view data",
    body: "Per-post views, fraud scores and demographics for your BI stack.",
  },
  {
    icon: "webhook",
    title: "Webhooks",
    body: "Events for new submissions, approvals and payouts.",
  },
  {
    icon: "key",
    title: "Keys and usage",
    body: "Scoped API keys and usage history in one dashboard.",
  },
] as const;

export const CASE_STUDIES = [
  {
    logo: { src: "/case-studies/solana.webp", alt: "Solana Foundation", width: 289, height: 47 },
    href: "#",
    body: "Solana is one of the world’s largest and fastest growing blockchains.",
  },
  {
    logo: { src: "/case-studies/jackbit.webp", alt: "JackBit", width: 190, height: 43 },
    href: "/case-studies/jackbit",
    body: "JackBit is a leading crypto casino and sportsbook.",
  },
  {
    logo: { src: "/case-studies/duel.webp", alt: "Duel", width: 131, height: 49 },
    href: "#",
    body: "Duel.com is one of the world’s largest and fastest growing crypto casinos.",
  },
] as const;

export const FAQS = [
  {
    q: "How do I start earning as a creator?",
    // Placeholder copy: only the second answer is in the Paper file.
    a: "Sign up as a creator, connect your TikTok, Instagram, YouTube or X accounts, and join any open campaign. Post clips that follow the brief, submit them, and get paid for every verified view once the brand approves.",
  },
  {
    q: "Why should I use Clipstake?",
    a: "Running a campaign on ClipStake is a fast way to get instant social media attention. Short-form content is one of the most powerful marketing approaches today, but creating content that truly performs takes time and expertise. With ClipStake, you can get your message in front of millions of people with minimal effort, and at a fraction of the cost of traditional ads.",
  },
  {
    q: "Do you offer discounts for annual plans?",
    a: "Yes. Brands that commit to an annual budget get a lower platform fee and a dedicated campaign manager. Book a call and we’ll put together a plan around your goals.",
  },
  {
    q: "Is my data secure on your platform?",
    a: "Yes. Account connections use each platform’s official APIs, data is encrypted in transit and at rest, and we never ask creators for their passwords.",
  },
  {
    q: "Can I change my plan after I’ve subscribed?",
    a: "You can upgrade, downgrade or pause at any time from your dashboard. Changes apply from your next billing period.",
  },
  {
    q: "What happens if I exceed my plan’s usage limits?",
    a: "Your campaigns keep running. We’ll let you know before you hit a limit, and any overage is billed at your plan’s standard rate.",
  },
] as const;

// Routes that exist link to their page; everything else stays "#" until its
// destination is decided.
export const NAV_LINKS = [
  { label: "Brand", href: "/brand" },
  { label: "Creator", href: "/creator" },
  { label: "Marketplace", href: "#" },
  { label: "Customers", href: "/case-studies" },
  { label: "Contact", href: "#" },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Brand", href: "/brand" },
      { label: "Creators", href: "/creator" },
      { label: "Marketplace", href: "#" },
      { label: "FAQs", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact us", href: "#" },
      { label: "Case studies", href: "/case-studies" },
      { label: "Brand assets", href: "#" },
    ],
  },
  {
    title: "Download",
    links: [
      { label: "App Store", href: "#" },
      { label: "Play Store", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Get an API Key", href: "#" },
      { label: "Status", href: "#" },
      { label: "Documentation", href: "#" },
    ],
  },
] as const;
