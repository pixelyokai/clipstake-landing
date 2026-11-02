// Copy and data for the Brand, Creator and case study pages, taken from the
// Paper file. Where Paper leaves a gap, the copy comes from the design handoff
// (clipstake-pages/*.dc.html) and is marked below.

export type Faq = { q: string; a: string };
export type ProofStudy = {
  logo: { src: string; alt: string; width: number; height: number } | { wordmark: string };
  format: string;
  value: string;
  caption: string;
  stats: { value: string; label: string }[];
  href: string;
};
export type CaseStudy = {
  slug: string;
  name: string;
  format: "Clipping" | "Logo" | "Music";
  cover: string;
  body: string;
  href: string;
};

export const ROUTES = {
  home: "/",
  brand: "/brand",
  creator: "/creator",
  caseStudies: "/case-studies",
  jackbit: "/case-studies/jackbit",
} as const;

// ——— Shared across pages ———

export const CASE_STUDY_CARDS: CaseStudy[] = [
  {
    slug: "solana",
    name: "Solana Foundation",
    format: "Clipping",
    cover: "/case-studies/covers/solana.webp",
    body: "Solana is one of the world’s largest and fastest growing blockchains.",
    href: "#",
  },
  {
    slug: "jackbit",
    name: "JackBit",
    format: "Logo",
    cover: "/case-studies/covers/jackbit.webp",
    body: "JackBit is a leading crypto casino and sportsbook.",
    href: ROUTES.jackbit,
  },
  {
    slug: "duel",
    name: "Duel.com",
    format: "Logo",
    cover: "/case-studies/covers/duel.webp",
    body: "Duel.com is one of the world’s largest and fastest growing crypto casinos.",
    href: "#",
  },
  {
    slug: "yungblud",
    name: "Yungblud",
    format: "Music",
    cover: "/case-studies/covers/yungblud.webp",
    body: "Yungblud is an upcoming alt-rock artist from the United Kingdom with over 10M monthly listeners on Spotify.",
    href: "#",
  },
];

export const PROOF = {
  title: "Proof, in views that were actually paid for.",
  body: "Three formats, three very different brands. Every number is after bot views were taken out.",
  studies: [
    {
      logo: { src: "/case-studies/jackbit.webp", alt: "JackBit", width: 94, height: 21 },
      format: "Logo",
      value: "145M",
      caption: "views from one logo with a promo code",
      stats: [
        { value: "$0.15", label: "Effective CPM" },
        { value: "863", label: "Creators" },
        { value: "14,241", label: "Clips" },
      ],
      href: ROUTES.jackbit,
    },
    {
      logo: { src: "/case-studies/solana.webp", alt: "Solana Foundation", width: 145, height: 23 },
      format: "Clipping",
      value: "+10K",
      caption: "Instagram followers from clipped interviews",
      stats: [
        { value: "2.8M", label: "Views" },
        { value: "$5,000", label: "Budget" },
        { value: "186", label: "Clips" },
      ],
      href: "#",
    },
    {
      logo: { wordmark: "Yungblud" },
      format: "Music",
      value: "7.1M",
      caption: "views for a new single, from 730 submissions",
      stats: [
        { value: "$1,500", label: "Budget" },
        { value: "225", label: "Creators" },
        { value: "30", label: "Days" },
      ],
      href: "#",
    },
  ] satisfies ProofStudy[],
};

// ——— Brand ———

export const BRAND = {
  hero: {
    eyebrow: "For brands, businesses and agencies",
    title: "Short-form content virality at your finger tips.",
    body: "Distribute your content across thousands of social media pages. You set the rate per 1,000 views, approve every post, and bot views never reach your bill.",
    logosLabel: "Trusted by hundreds of brands and agencies",
  },
  formats: {
    title: "Pick how creators promote you",
    body: "Start from what you already have. Every format pays per 1,000 verified views. The more it asks of creators, the higher the CPM.",
  },
  stats: {
    title: "Over 2.5 billion views generated for customers",
    items: [
      // Paper labels this "Views generated for customers" (a leftover); 5,000+ is the creator count on the landing page.
      { value: "5,000+", label: "Content creators" },
      { value: "150K+", label: "Clips created" },
      { value: "$250K+", label: "Paid out to creators" },
    ],
  },
  controls: {
    title: "Your budget, on your terms",
    body: "Six controls decide what gets paid, and nothing else does.",
    items: [
      { icon: "coin", title: "Your CPM", body: "You set the rate per 1,000 views. No bidding against other advertisers." },
      {
        icon: "banknote",
        title: "Max payout per post",
        body: "Cap what one post can earn, so a single viral clip can't drain the budget.",
      },
      { icon: "eye", title: "Minimum views", body: "Posts below your threshold aren't paid, which keeps tiny accounts out." },
      {
        icon: "check-circle",
        title: "Your approval",
        body: "Nothing is paid until you, or your campaign manager, approve the post.",
      },
      {
        icon: "users",
        title: "Your audience",
        body: "See who watched each post, and pay only for the demographics you want.",
      },
      { icon: "wallet", title: "Your leftovers", body: "Whatever's unspent when the campaign ends goes back to you." },
    ],
  },
  bots: {
    title: ["Bots get caught.", "You don't get billed."],
    body: "63.5M bot views caught across our four published campaigns, and not one of them billed. Every view is checked before it can cost you anything.",
    points: [
      { title: "Counted at the source", body: "Views come from the creator's connected account, never a screenshot." },
      {
        title: "Scored for fraud",
        body: "Engagement patterns, account history and audience signals are checked together.",
      },
      { title: "Held, not billed", body: "Flagged views stay out of your spend, creator payouts and reports." },
    ],
    // One row per published campaign on the rotating arc (Paper's hidden layers).
    examples: [
      {
        logo: { src: "/case-studies/jackbit-lg.webp", alt: "JackBit", width: 206, height: 46 },
        views: "113M Views",
        bots: "32M Bots unbilled",
      },
      {
        logo: { src: "/case-studies/duel.webp", alt: "Duel", width: 121, height: 46 },
        views: "157M Views",
        bots: "31M Bots unbilled",
      },
      {
        logo: { src: "/case-studies/solana.webp", alt: "Solana Foundation", width: 281, height: 46 },
        views: "2.4M Views",
        bots: "400K Bots unbilled",
      },
      { logo: { wordmark: "Yungblud" }, views: "6.95M Views", bots: "150K Bots unbilled" },
    ] as { logo: ProofStudy["logo"]; views: string; bots: string }[],
  },
  faq: {
    title: "Before you launch",
    faqs: [
      {
        q: "How is this different from paying influencers?",
        a: "Influencer deals usually pay a fixed fee per post, however it performs. On Clipstake you pay per verified view, across as many creators as join your campaign, and nothing for posts you don’t approve.",
      },
      // Answers below come from the handoff; Paper only shows the first one open.
      {
        q: "How do I choose a budget and CPM?",
        a: "Campaigns start at $1,000 and you set the CPM. Formats that ask more of creators need a higher rate: music and logo campaigns are the lowest, clipping sits in the middle, and UGC is the highest.",
      },
      {
        q: "Why are X campaigns priced separately?",
        a: "On X, only about 20% of impressions count as unique views. So X runs as its own campaign, with a higher CPM than TikTok, Reels or Shorts.",
      },
      {
        q: "How do I fund a campaign?",
        a: "Every account comes with a built-in Solana wallet. Deposit USDC (other tokens work too), or email invoicing@clipstake.com for a fiat invoice.",
      },
      {
        q: "Can I extend a campaign?",
        a: "Yes. A campaign ends when its budget runs out or its end date passes, and you can add budget or push the end date at any time.",
      },
      {
        q: "How should I write content requirements?",
        a: "Be specific, include examples, and start strict. You can always loosen the rules later. Decline posts only when they clearly miss the brief.",
      },
    ] satisfies Faq[],
  },
};

export const BRAND_CTA = {
  title: ["Set a CPM. Approve the posts.", "Pay only for real views."],
  body: "Launch your first campaign today, or talk it through with our team first.",
};

// ——— Creator ———

export const CREATOR = {
  hero: {
    eyebrow: "$250K+ paid out to creators",
    title: "Get paid to post content for brands.",
    // Paper repeats the brand page's sentence here; this creator version is from the handoff.
    body: "Pick a brand's brief, post it on your own accounts, and earn a set rate for every 1,000 verified views. No follower minimum, no pitching brands, no chasing invoices.",
    logosLabel: "Post for brands like",
  },
  steps: {
    title: "Start earning in four steps",
    // Paper repeats the brand page's formats subtitle here; this line is from the handoff.
    body: "Every campaign works the same way, whoever the brand is.",
    items: [
      {
        image: "/media/pages/step-brief.webp",
        title: "Pick a brief",
        body: "Every campaign in the marketplace shows its rate, rules and platforms before you start.",
      },
      {
        image: "/media/pages/step-submit.webp",
        title: "Post and submit",
        body: "Make the post the way the brief asks, put it on your own account, then submit the link.",
      },
      {
        image: "/media/pages/step-approved.webp",
        title: "Get approved",
        body: "The brand reviews it. Once it's approved, we track your views and refresh them every 6 hours.",
      },
      {
        image: "/media/pages/step-payout.webp",
        title: "Claim payout",
        body: "Pass the campaign's minimum views, verify them, and claim your payout for every 1,000.",
      },
    ],
  },
  calculator: {
    title: ["Run the numbers on", "your next post"],
    body: "Past campaigns have paid between $0.40 and $3.00 per 1,000 views. Each brief sets its own rate, minimum views and max payout per post.",
  },
  trust: {
    title: "Only real views count",
    body: "Every view is checked before it's paid. Brands trust the numbers, keep funding new campaigns, and the marketplace stays full for you.",
    items: [
      {
        icon: "coin",
        title: "No password, ever",
        body: "Verification lets us see your post's analytics page, we never get access to personal data.",
      },
      {
        icon: "banknote",
        title: "Paid per unique viewer",
        body: "Payouts count unique, organic views, so a few people replaying your clip doesn't work.",
      },
      {
        icon: "eye",
        title: "Bought views are held",
        body: "Views that look botted are held from payouts. Grow your account and you'll never need it.",
      },
    ],
  },
  faq: {
    title: "Questions creators ask",
    faqs: [
      {
        q: "How do I start earning?",
        a: "Browse the marketplace, pick campaigns that match your audience, make a short-form post that follows the brief and submit it. Once it is approved, you can claim a payout for every 1,000 new views.",
      },
      // Answers below come from the handoff; Paper only shows the first one open.
      {
        q: "Do I need a big following?",
        a: "No. Creators of any size can earn. Just check each campaign’s minimum views requirement before you post.",
      },
      {
        q: "How and when do I get paid?",
        a: "After your post is approved, view tracking starts and updates every 6 hours. Once it passes the campaign’s minimum views, verify your unique views and claim your payout.",
      },
      {
        q: "How does view verification work?",
        a: "You complete a few steps that let Clipstake see your post’s analytics page. It does not give us access to your account or personal data. It only confirms your views are organic and real.",
      },
      {
        q: "How many posts can I submit?",
        a: "Join as many campaigns as you like. Each account can submit up to 20 posts per campaign, in batches of 3, on any platform.",
      },
      {
        q: "What if a brand declines my post?",
        // Placeholder: the handoff leaves this answer open.
        a: "[Add the real policy: what the creator sees, whether they can resubmit, and how long reviews take.]",
      },
    ] satisfies Faq[],
  },
  cta: {
    title: ["Your next post might already", "be someone's campaign."],
    body: "Open the marketplace, pick one that fits, and start earning today.",
  },
};

// Earnings calculator (creator page). Ranges are assumed: change them here.
export const EARNINGS = {
  views: { min: 1_000, max: 500_000, step: 1_000, initial: 48_000 },
  cpm: { min: 0.4, max: 3, step: 0.05, initial: 2 },
} as const;

// ——— Case studies ———

export const CUSTOMERS = {
  title: "Customers",
  totals: [
    { value: "343M", label: "Views delivered" },
    { value: "$51.5K", label: "Total budget" },
    { value: "1,717", label: "Creators posting" },
    { value: "63.5M", label: "Bot views caught, not billed", accent: true },
  ],
  note: "Totals across the four customer studies below.",
};

export const JACKBIT = {
  name: "JackBit",
  title: "How JackBit turned one logo into 14,241 clips",
  lead: "JackBit is a crypto casino and sportsbook. Going into this campaign it wanted two things from short-form video: more people who knew the name, and more of them signing up to play.",
  stats: [
    { value: "145M", label: "views delivered" },
    { value: "863", label: "creators posting" },
    { value: "32M", label: "bot views, never billed", accent: true },
  ],
  about: "JackBit is a crypto casino and sportsbook.",
  facts: [
    { label: "Industry", value: "Crypto casino and sportsbook" },
    { label: "Format", value: "Logo campaign" },
    { label: "Platforms", value: "TikTok, Instagram" },
    { label: "Geography", value: "Global" },
    { label: "Assets", value: "Logo with embedded promo code" },
    { label: "Ran for", value: "60 days", small: true },
  ],
  numbers: [
    { label: "Budget", value: "$20,000" },
    { label: "Payout", value: "$0.40 per 1,000 verified views" },
    { label: "Clips posted", value: "14,241" },
    { label: "Effective CPM", value: "$0.15" },
  ],
  website: "#",
  sideCta: { title: "Have a logo? That's enough to start.", body: "Logo campaigns start at $1,000." },
  challenge:
    "Get the JackBit name in front of more people, and turn more of them into players, without producing a single video.",
  solution:
    "A logo with a built-in promo code, open to any creator, paid at $0.40 per 1,000 verified views on TikTok and Instagram.",
  sections: [
    {
      title: "One asset, no production",
      paragraphs: [
        "JackBit didn't commission a single video. It gave creators one thing: its logo, with a promo code built into it. The rule was just as short. Put the logo on sports highlights and gambling content.",
        "Creators chose their own clips and posted them to their own accounts. JackBit paid $0.40 for every 1,000 verified views, on TikTok and Instagram, worldwide, for 60 days.",
      ],
    },
    {
      title: "863 creators, not three",
      paragraphs: [
        "Because any creator could join, the campaign never leaned on a few big accounts. 863 creators posted 14,241 clips. Together they delivered 145M views, and a viewer who liked what they saw had the promo code right there on screen.",
      ],
      // Clips are /media/clips/<n>: creator posts from the site's clip library.
      clips: [1, 2, 3],
    },
    {
      title: "The 32M views that didn't count",
      paragraphs: [
        "Not every view was real. Our fraud checks flagged 32M of the 145M as botted. Those views were held and never billed, which left 113M organic views and an effective CPM of $0.15.",
      ],
      split: { organic: 78, organicLabel: "113M organic, billed", botLabel: "32M bot, held" },
    },
    {
      title: "Campaign impact",
      paragraphs: ["Over the campaign, JackBit saw more traffic to its website and more player deposits."],
    },
  ],
  submissions: [4, 5, 6, 7],
};
