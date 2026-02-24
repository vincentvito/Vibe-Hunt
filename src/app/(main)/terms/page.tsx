import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "VibeHunt Terms of Service — rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: February 21, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p className="mt-2">
            By accessing or using VibeHunt (&quot;the Service&quot;), you agree
            to be bound by these Terms of Service (&quot;Terms&quot;). If you do
            not agree to these Terms, you may not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            2. User Accounts
          </h2>
          <p className="mt-2">
            To access certain features of the Service, you must create an
            account. You are responsible for maintaining the confidentiality of
            your account credentials and for all activities that occur under your
            account. You must provide accurate and complete information when
            creating your account and keep it up to date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. Content Submissions
          </h2>
          <p className="mt-2">
            By submitting games, comments, or other content to the Service, you
            grant VibeHunt a non-exclusive, worldwide, royalty-free license to
            display, distribute, and promote your content on the platform. You
            retain ownership of your content and are solely responsible for
            ensuring it does not violate any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. Intellectual Property
          </h2>
          <p className="mt-2">
            You represent and warrant that you own or have the necessary rights
            to all content you submit. You must not upload content that infringes
            on the intellectual property rights of others. VibeHunt reserves the
            right to remove any content that violates these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            5. Marketplace Transactions
          </h2>
          <p className="mt-2">
            The VibeHunt marketplace allows users to list and purchase game
            projects. All transactions are subject to our escrow process.
            VibeHunt acts as an intermediary and is not a party to transactions
            between buyers and sellers. We charge a platform fee on completed
            transactions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            6. Prohibited Conduct
          </h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Use the Service for any unlawful purpose</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Harass, abuse, or threaten other users</li>
            <li>Attempt to gain unauthorized access to other accounts</li>
            <li>Manipulate upvotes, reviews, or rankings</li>
            <li>Scrape or collect user data without consent</li>
            <li>Circumvent any security features of the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            7. Disclaimers
          </h2>
          <p className="mt-2">
            The Service is provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, either express or
            implied. We do not guarantee that the Service will be uninterrupted,
            secure, or error-free. We are not responsible for the content,
            quality, or safety of games submitted by users.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            8. Limitation of Liability
          </h2>
          <p className="mt-2">
            To the maximum extent permitted by law, VibeHunt shall not be liable
            for any indirect, incidental, special, consequential, or punitive
            damages arising from your use of the Service or any transactions
            conducted through the marketplace.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            9. Termination
          </h2>
          <p className="mt-2">
            We reserve the right to suspend or terminate your account at any
            time for violations of these Terms. Upon termination, your right to
            use the Service will cease immediately. Provisions that by their
            nature should survive termination will remain in effect.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            10. Changes to Terms
          </h2>
          <p className="mt-2">
            We may update these Terms from time to time. We will notify you of
            material changes by posting the updated Terms on this page. Your
            continued use of the Service after changes are posted constitutes
            acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            11. Contact
          </h2>
          <p className="mt-2">
            If you have questions about these Terms, please contact us at{" "}
            <a
              href="mailto:legal@vibehunt.games"
              className="text-primary hover:underline"
            >
              legal@vibehunt.games
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
