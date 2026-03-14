export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">How It Works</h1>
      <p className="text-slate-600 mb-10">
        Spark Deal connects expert contributors who identify savings
        opportunities with companies looking to cut costs.
      </p>

      {/* Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          The Marketplace at a Glance
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-2xl mb-2">1</div>
            <p className="text-sm font-medium text-slate-900">
              Contributors submit savings ideas
            </p>
            <p className="text-xs text-slate-500 mt-1">
              With a teaser and full breakdown
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-2xl mb-2">2</div>
            <p className="text-sm font-medium text-slate-900">
              Companies browse &amp; purchase
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Unlock details in two stages
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-2xl mb-2">3</div>
            <p className="text-sm font-medium text-slate-900">
              Connect &amp; implement
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Message contributors and book meetings
            </p>
          </div>
        </div>
      </div>

      {/* Two-column: Contributors & Companies */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Contributors */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded">
              Contributor
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              Share Your Expertise
            </h2>
          </div>

          <ol className="space-y-4 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Sign up as a contributor
                </p>
                <p className="text-slate-500">
                  Create an account and select the contributor role.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Submit a savings opportunity
                </p>
                <p className="text-slate-500">
                  Provide a teaser title and description, then add detailed
                  Stage 1 and Stage 2 content that companies can unlock.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Automated quality review
                </p>
                <p className="text-slate-500">
                  Submissions are automatically checked for PII, confidential
                  content, and quality. Flagged items go to admin review.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <div>
                <p className="font-medium text-slate-900">Earn from purchases</p>
                <p className="text-slate-500">
                  When a company buys your opportunity, you receive 85% of the
                  sale price. Track your earnings from your dashboard.
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Companies */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
              Company
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              Find Savings
            </h2>
          </div>

          <ol className="space-y-4 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Sign up as a company
                </p>
                <p className="text-slate-500">
                  Create an account and select the company role.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Browse opportunities
                </p>
                <p className="text-slate-500">
                  Filter by category and price tier. Read teaser descriptions to
                  find relevant savings ideas.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Unlock details in two stages
                </p>
                <p className="text-slate-500">
                  Stage 1 unlocks the detailed overview. Stage 2 unlocks the
                  full implementation breakdown with messaging and meetings.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Connect with the contributor
                </p>
                <p className="text-slate-500">
                  After a Stage 2 purchase, message the contributor directly or
                  request a meeting to discuss implementation.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* Pricing & Policies */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Pricing &amp; Policies
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              Stage 1 Pricing
            </h3>
            <p className="text-sm text-slate-500">
              Contributors set their Stage 1 price at either{" "}
              <span className="font-medium text-slate-900">&euro;250</span> or{" "}
              <span className="font-medium text-slate-900">&euro;500</span>.
              Stage 2 is priced at 2&times; the Stage 1 price.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              Platform Fee
            </h3>
            <p className="text-sm text-slate-500">
              A{" "}
              <span className="font-medium text-slate-900">15% platform fee</span>{" "}
              is deducted from each sale. Contributors keep 85% of every
              purchase.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              Refund Window
            </h3>
            <p className="text-sm text-slate-500">
              Companies can request a refund within{" "}
              <span className="font-medium text-slate-900">48 hours</span> of
              purchase. Refunds are reviewed by the Spark Deal team.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-6">
        <p className="text-slate-600 mb-4">Ready to get started?</p>
        <a
          href="/auth/signup"
          className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 font-medium"
        >
          Create Your Account
        </a>
      </div>
    </div>
  );
}
