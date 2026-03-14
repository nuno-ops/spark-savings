import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: February 26, 2026
      </p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-0">
            1. Overview
          </h2>
          <p>
            Spark Deal (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;)
            operates a marketplace where contributors submit cost-saving
            strategies and companies purchase access to those strategies. By
            creating an account or using the Platform, you agree to these Terms
            of Service (&quot;Terms&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            2. Account Registration
          </h2>
          <p>
            To use the Platform, you must create an account with a valid email
            address and password. You are responsible for maintaining the
            confidentiality of your credentials and for all activities under your
            account. You must be at least 18 years old or the age of majority in
            your jurisdiction.
          </p>
          <p>
            Accounts are available in two roles: <strong>Contributor</strong>{" "}
            (submitting cost-saving strategies) and <strong>Company</strong>{" "}
            (purchasing access to strategies). You may not hold both roles
            simultaneously without prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            3. How the Marketplace Works
          </h2>
          <p>
            Contributors submit cost-saving opportunities which go through an
            automated quality triage process. Approved submissions are published
            on the marketplace with a public teaser visible to all users.
          </p>
          <p>Companies can purchase access in two stages:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Stage 1 (Overview):</strong> Unlocks validation checklist,
              requirements, and high-level approach. Priced at &euro;250 or
              &euro;500.
            </li>
            <li>
              <strong>Stage 2 (Full Playbook):</strong> Unlocks the complete
              implementation playbook and templates. Price set by the
              contributor.
            </li>
          </ul>
          <p>
            All content purchased is licensed for internal use by the purchasing
            company only. Redistribution, resale, or public sharing of purchased
            content is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            4. Payments and Fees
          </h2>
          <p>
            All prices are displayed in Euros (&euro;). The Platform charges a{" "}
            <strong>15% platform fee</strong> on each transaction. Contributors
            receive 85% of the purchase price as their payout.
          </p>
          <p>
            Payments are processed securely through our payment provider. By
            making a purchase, you authorize us to charge the specified amount.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            5. Refund Policy
          </h2>
          <p>
            Companies may request a refund within{" "}
            <strong>48 hours of purchase</strong> if the content does not match
            its description or fails to deliver the promised value. Refund
            requests are reviewed by our team and processed within 5 business
            days.
          </p>
          <p>
            Refunds are not available after the 48-hour window, or if the
            purchaser has already implemented the strategy described in the
            content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            6. Contributor Obligations
          </h2>
          <p>Contributors agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Submit only original content that they have the right to share
            </li>
            <li>
              Not include personally identifiable information (PII) or
              confidential third-party data in submissions
            </li>
            <li>
              Provide accurate savings estimates and descriptions
            </li>
            <li>
              Not submit duplicate or substantially similar content to
              previously published opportunities
            </li>
          </ul>
          <p>
            Submissions that violate these obligations may be flagged, suspended,
            or removed at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            7. API Access
          </h2>
          <p>
            Contributors may access the Platform via API using generated API
            keys. API access is subject to rate limits and must not be used to
            circumvent Platform controls, spam the marketplace, or submit
            low-quality content. We reserve the right to revoke API keys at any
            time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            8. Intellectual Property
          </h2>
          <p>
            Contributors retain ownership of their submitted content.By
            publishing on the Platform, contributors grant Spark Deal a
            non-exclusive license to display, distribute, and facilitate the sale
            of their content through the marketplace.
          </p>
          <p>
            The Spark Deal brand, logo, and platform software are owned by us
            and may not be used without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            9. Content Moderation
          </h2>
          <p>
            All submissions go through automated triage including PII detection,
            confidential keyword scanning, quality scoring, and duplicate
            detection. Content that is flagged may require manual review by our
            team before publication.
          </p>
          <p>
            We reserve the right to remove any content or suspend any account
            that violates these Terms or that we determine, in our sole
            discretion, is harmful to the Platform or its users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            10. Limitation of Liability
          </h2>
          <p>
            Spark Deal is a marketplace connecting contributors and companies.
            We do not guarantee the accuracy, completeness, or effectiveness of
            any cost-saving strategy listed on the Platform. Savings estimates
            are provided by contributors and are not verified by us.
          </p>
          <p>
            To the maximum extent permitted by law, Spark Deal shall not be
            liable for any indirect, incidental, or consequential damages arising
            from the use of the Platform or any content purchased through it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            11. Termination
          </h2>
          <p>
            Either party may terminate their account at any time. We may suspend
            or terminate accounts that violate these Terms. Upon termination,
            purchased content remains accessible to the buyer, but the
            contributor&apos;s active listings will be removed from the
            marketplace.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            12. Governing Law
          </h2>
          <p>
            These Terms are governed by and construed in accordance with the laws
            of the European Union and the applicable national laws of the
            jurisdiction in which Spark Deal operates. Any disputes arising
            from these Terms shall be resolved in the competent courts of that
            jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            13. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. We will notify
            registered users of material changes via email. Continued use of the
            Platform after changes take effect constitutes acceptance of the
            revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">14. Contact</h2>
          <p>
            If you have questions about these Terms, please contact us at{" "}
            <a
              href="mailto:legal@sparkdeal.app"
              className="text-indigo-600 hover:text-indigo-800"
            >
              legal@sparkdeal.app
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
        <Link href="/legal/privacy" className="text-indigo-600 hover:underline">
          Privacy Policy
        </Link>
        <span className="mx-2">&middot;</span>
        <Link href="/" className="text-indigo-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
