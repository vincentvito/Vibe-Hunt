import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "VibeHunt Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: February 21, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            1. Information We Collect
          </h2>
          <p className="mt-2">We collect the following types of information:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>Account information:</strong> email address, username,
              display name, and profile details provided during registration
            </li>
            <li>
              <strong>Content:</strong> games, comments, and other content you
              submit to the platform
            </li>
            <li>
              <strong>Usage data:</strong> pages visited, features used, and
              interactions with the Service
            </li>
            <li>
              <strong>Device information:</strong> browser type, operating
              system, and IP address
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            2. How We Use Your Information
          </h2>
          <p className="mt-2">We use collected information to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Provide, maintain, and improve the Service</li>
            <li>Authenticate users and manage accounts</li>
            <li>Process marketplace transactions</li>
            <li>Send notifications related to your account and activity</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Detect and prevent fraud, abuse, or security issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. Cookies and Analytics
          </h2>
          <p className="mt-2">
            We use <strong>PostHog</strong> for product analytics to understand
            how users interact with the Service. PostHog collects anonymized
            usage data including page views, feature usage, and session
            information. You can opt out of analytics tracking through the cookie
            consent banner shown on your first visit.
          </p>
          <p className="mt-2">
            We also use essential cookies for authentication and session
            management, which are necessary for the Service to function.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. Third-Party Services
          </h2>
          <p className="mt-2">
            We use the following third-party services that may process your data:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>Clerk</strong> — authentication and user management
            </li>
            <li>
              <strong>Supabase</strong> — database hosting and storage
            </li>
            <li>
              <strong>Stripe</strong> — payment processing for marketplace
              transactions
            </li>
            <li>
              <strong>Cloudflare R2</strong> — file storage for game builds
            </li>
            <li>
              <strong>PostHog</strong> — product analytics
            </li>
          </ul>
          <p className="mt-2">
            Each of these services has its own privacy policy governing how they
            handle your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            5. Data Retention
          </h2>
          <p className="mt-2">
            We retain your account data for as long as your account is active. If
            you delete your account, we will remove your personal data within 30
            days. Some anonymized data may be retained for analytics purposes.
            Transaction records are retained as required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            6. Your Rights
          </h2>
          <p className="mt-2">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Request a copy of your data in a portable format</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, contact us at{" "}
            <a
              href="mailto:privacy@vibehunt.com"
              className="text-primary hover:underline"
            >
              privacy@vibehunt.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            7. Children&apos;s Privacy
          </h2>
          <p className="mt-2">
            The Service is not directed at children under the age of 13. We do
            not knowingly collect personal information from children. If we learn
            that we have collected data from a child under 13, we will delete it
            promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            8. Changes to This Policy
          </h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by posting the updated policy on this page
            with a revised &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            9. Contact
          </h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a
              href="mailto:privacy@vibehunt.com"
              className="text-primary hover:underline"
            >
              privacy@vibehunt.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
