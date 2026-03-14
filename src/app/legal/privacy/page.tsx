import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: February 26, 2026
      </p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-0">
            1. Introduction
          </h2>
          <p>
            Spark Deal (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;)
            is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, store, and share your personal data when you use
            our marketplace platform. This policy applies to all users including
            contributors, companies, and visitors.
          </p>
          <p>
            We process personal data in accordance with the General Data
            Protection Regulation (GDPR) and applicable EU data protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            2. Data We Collect
          </h2>

          <h3 className="text-lg font-medium text-gray-800 mt-4">
            2.1 Information You Provide
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Account data:</strong> Name, email address, password
              (stored as a bcrypt hash), and selected role (contributor or
              company)
            </li>
            <li>
              <strong>Submission data:</strong> Cost-saving strategies, titles,
              descriptions, pricing, and related content submitted by
              contributors
            </li>
            <li>
              <strong>Transaction data:</strong> Purchase history, payment
              amounts, and refund requests
            </li>
            <li>
              <strong>Reviews:</strong> Ratings and comments left on
              opportunities
            </li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-4">
            2.2 Information Collected Automatically
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Usage analytics:</strong> Page views on opportunity
              listings (recorded anonymously with viewer role only &mdash; no IP
              addresses or device fingerprints)
            </li>
            <li>
              <strong>Session data:</strong> Authentication tokens (JWT) stored
              in browser cookies for session management
            </li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-4">
            2.3 Information We Do Not Collect
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              We do not collect IP addresses, device fingerprints, or location
              data
            </li>
            <li>
              We do not use third-party tracking pixels or advertising cookies
            </li>
            <li>
              We do not store credit card numbers &mdash; payment processing is
              handled entirely by our payment provider (Stripe)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            3. How We Use Your Data
          </h2>
          <p>We use your personal data for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Service delivery:</strong> Creating and managing your
              account, processing purchases, facilitating payouts to contributors
            </li>
            <li>
              <strong>Content moderation:</strong> Automated triage of
              submissions (PII detection, quality scoring, duplicate detection)
              to maintain marketplace quality
            </li>
            <li>
              <strong>Analytics:</strong> Providing contributors with view
              counts, conversion rates, and earnings data for their submissions
            </li>
            <li>
              <strong>Communication:</strong> Sending transactional emails
              (purchase confirmations, password resets, refund notifications)
            </li>
            <li>
              <strong>Security:</strong> Detecting fraud, preventing abuse, and
              enforcing our Terms of Service
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            4. Legal Basis for Processing (GDPR)
          </h2>
          <p>We process your data under the following legal bases:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Contract performance:</strong> Processing necessary to
              provide our marketplace services (account management, purchases,
              payouts)
            </li>
            <li>
              <strong>Legitimate interest:</strong> Content moderation, fraud
              prevention, and platform analytics
            </li>
            <li>
              <strong>Consent:</strong> Non-essential cookies (you may withdraw
              consent at any time via the cookie banner)
            </li>
            <li>
              <strong>Legal obligation:</strong> Tax records and financial
              reporting as required by law
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            5. Data Sharing
          </h2>
          <p>We share your personal data only in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Payment processor (Stripe):</strong> To process payments
              and payouts securely
            </li>
            <li>
              <strong>Between users:</strong> Contributor names are visible on
              published opportunities. Company names are visible on reviews and
              to contributors on purchase notifications.
            </li>
            <li>
              <strong>Legal requirements:</strong> When required by law, court
              order, or regulatory authority
            </li>
          </ul>
          <p>
            We do not sell your personal data to third parties. We do not share
            data with advertisers or marketing companies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            6. Cookies
          </h2>
          <p>We use the following types of cookies:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Essential cookies:</strong> Authentication session tokens
              (required for the Platform to function). These cannot be disabled.
            </li>
            <li>
              <strong>Analytics cookies:</strong> Anonymous page view tracking
              for contributor analytics. You can opt out via the cookie consent
              banner.
            </li>
          </ul>
          <p>
            We do not use advertising cookies, social media tracking pixels, or
            cross-site tracking technologies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            7. Data Retention
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Account data:</strong> Retained while your account is
              active. Deleted within 30 days of account deletion request.
            </li>
            <li>
              <strong>Transaction records:</strong> Retained for 7 years as
              required by financial regulations.
            </li>
            <li>
              <strong>Submitted content:</strong> Retained while published.
              Removed within 30 days of deletion by the contributor, unless
              purchased (in which case the purchased version is retained for
              buyer access).
            </li>
            <li>
              <strong>Password reset tokens:</strong> Expire after 1 hour and
              are retained for audit purposes only.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            8. Your Rights (GDPR)
          </h2>
          <p>Under the GDPR, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Access:</strong> Request a copy of all personal data we
              hold about you
            </li>
            <li>
              <strong>Rectification:</strong> Correct inaccurate or incomplete
              data
            </li>
            <li>
              <strong>Erasure:</strong> Request deletion of your personal data
              (&quot;right to be forgotten&quot;)
            </li>
            <li>
              <strong>Portability:</strong> Receive your data in a structured,
              machine-readable format
            </li>
            <li>
              <strong>Restriction:</strong> Request limitation of processing in
              certain circumstances
            </li>
            <li>
              <strong>Objection:</strong> Object to processing based on
              legitimate interest
            </li>
            <li>
              <strong>Withdraw consent:</strong> Where processing is based on
              consent, withdraw it at any time
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:privacy@sparkdeal.app"
              className="text-indigo-600 hover:text-indigo-800"
            >
              privacy@sparkdeal.app
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            9. Data Security
          </h2>
          <p>We protect your data through:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Password hashing using bcrypt with salt rounds</li>
            <li>
              Cryptographically secure tokens for password resets and API keys
            </li>
            <li>HTTPS encryption for all data in transit</li>
            <li>Role-based access control for platform data</li>
            <li>
              Automated PII detection to prevent accidental disclosure in
              submissions
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            10. International Data Transfers
          </h2>
          <p>
            Your data is processed and stored within the European Union. If any
            data transfer outside the EU becomes necessary (e.g., through
            third-party service providers), we will ensure appropriate safeguards
            are in place as required by the GDPR, such as Standard Contractual
            Clauses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            11. Children&apos;s Privacy
          </h2>
          <p>
            The Platform is not intended for users under the age of 18. We do
            not knowingly collect personal data from children. If you believe a
            child has provided us with personal data, please contact us and we
            will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            12. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Material
            changes will be communicated to registered users via email. The
            &quot;Last updated&quot; date at the top of this page indicates when
            the policy was last revised.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">13. Contact</h2>
          <p>
            For privacy-related inquiries or to exercise your data rights,
            contact our Data Protection team:
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:privacy@sparkdeal.app"
              className="text-indigo-600 hover:text-indigo-800"
            >
              privacy@sparkdeal.app
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            14. Supervisory Authority
          </h2>
          <p>
            If you are not satisfied with our response to a privacy concern, you
            have the right to lodge a complaint with your local data protection
            supervisory authority.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
        <Link href="/legal/terms" className="text-indigo-600 hover:underline">
          Terms of Service
        </Link>
        <span className="mx-2">&middot;</span>
        <Link href="/" className="text-indigo-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
