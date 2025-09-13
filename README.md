This is a Next.js project bootstrapped with create-next-app.

Getting Started
First, run the development server:

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
Live Version
This project is already hosted and can be accessed at https://task-and-habit-tracker.vercel.app/.

Locally
Open http://localhost:3000 with your browser to see the result.

.env.local
NEXT_PUBLIC_SUPABASE_URL=https://nextpublicsupabaseurl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=samplenextpublicsupabaseanonkey
NEXT_PUBLIC_SITE_URL=https://your-hosted-url.vercel.app/
NODE_ENV=development

# Security: Console Logging Control
# Set to 'true' to enable detailed console logging in development
# Set to 'false' or remove to disable all console logs for security
NEXT_PUBLIC_ENABLE_LOGGING=false
Security Features
This project includes comprehensive security measures to protect user data and privacy:

Secure Console Logging: All console logs are controlled through a centralized logger utility
Environment-Based Logging: Logging can be completely disabled in production
No Sensitive Data Exposure: User IDs, database structures, and API details are never logged to the browser console
Real-Time Security: Real-time subscription details are protected from exposure
See SECURITY.md for detailed security documentation.

You can start editing the page by modifying app/page.tsx. The page auto-updates as you edit the file.

This project uses next/font to automatically optimize and load Geist, a new font family for Vercel.

Learn More
To learn more about Next.js, take a look at the following resources:

Next.js Documentation - learn about Next.js features and API.
Learn Next.js - an interactive Next.js tutorial.
