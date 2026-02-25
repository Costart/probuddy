import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — ProBuddy",
  description:
    "How ProBuddy collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
        Privacy Policy
      </h1>
      <p className="text-sm text-on-surface-variant mt-2">
        Last updated: 23 February 2026
      </p>

      <div className="mt-8 space-y-8 text-on-surface-variant leading-relaxed">
        {/* 1 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            1. Introduction
          </h2>
          <p>
            ProBuddy (&quot;probuddy.ai&quot;, &quot;we&quot;, &quot;us&quot;,
            &quot;our&quot;) is committed to protecting your privacy. This
            Privacy Policy explains what information we collect when you use our
            AI-powered home services marketplace, how we use it, and the choices
            you have.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            2. Information We Collect
          </h2>

          <h3 className="font-display font-semibold text-on-surface mt-4 mb-2">
            Information collected automatically
          </h3>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              <strong className="text-on-surface">
                Location data (approximate)
              </strong>{" "}
              — We use Cloudflare&apos;s network to detect your approximate city
              and region from your IP address. This is used to personalize
              results and is not stored permanently.
            </li>
            <li>
              <strong className="text-on-surface">Device and browser data</strong>{" "}
              — Standard information such as browser type, operating system,
              screen size, and referring URL may be collected through analytics.
            </li>
            <li>
              <strong className="text-on-surface">
                Usage data and session recordings
              </strong>{" "}
              — We use Microsoft Clarity to understand how visitors interact with
              our site. Clarity may record mouse movements, clicks, and scrolls.
              No personally identifiable information is collected by Clarity.
            </li>
          </ul>

          <h3 className="font-display font-semibold text-on-surface mt-4 mb-2">
            Information you provide
          </h3>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              <strong className="text-on-surface">Search queries</strong> — The
              services you search for and zip codes you enter.
            </li>
            <li>
              <strong className="text-on-surface">Chat messages</strong> — Messages
              you send to the AI Pro Buddy assistant on service pages.
            </li>
            <li>
              <strong className="text-on-surface">Account information</strong> — If
              you create an account, we collect your email address and a securely
              hashed password.
            </li>
          </ul>

          <h3 className="font-display font-semibold text-on-surface mt-4 mb-2">
            Information from third parties
          </h3>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              <strong className="text-on-surface">
                Professional listings
              </strong>{" "}
              — We receive business profiles, ratings, and reviews from
              Thumbtack to display search results.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            3. How We Use Your Information
          </h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>
              Display personalized search results based on your location and
              query.
            </li>
            <li>
              Generate AI-powered rankings and recommendations of local
              professionals.
            </li>
            <li>
              Provide AI chat assistance with context about the service and your
              area.
            </li>
            <li>
              Create location-specific service pages when you search by zip
              code.
            </li>
            <li>Improve and optimize the Service through analytics.</li>
            <li>
              Protect against fraud, abuse, and automated bot traffic.
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            4. Third-Party Services
          </h2>
          <p>
            We share limited data with the following third-party services in
            order to operate ProBuddy:
          </p>
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-outline-variant/50 bg-surface p-4">
              <p className="font-display font-semibold text-on-surface">
                Thumbtack
              </p>
              <p className="text-sm mt-1">
                Receives your search query and zip code to return matching
                professional listings.
              </p>
            </div>
            <div className="rounded-xl border border-outline-variant/50 bg-surface p-4">
              <p className="font-display font-semibold text-on-surface">
                Google Gemini AI
              </p>
              <p className="text-sm mt-1">
                Processes professional profile data to generate rankings and
                powers the AI chat assistant. Your chat messages are sent to
                Google&apos;s API for processing but are not used to train
                Google&apos;s models.
              </p>
            </div>
            <div className="rounded-xl border border-outline-variant/50 bg-surface p-4">
              <p className="font-display font-semibold text-on-surface">
                Cloudflare
              </p>
              <p className="text-sm mt-1">
                Provides hosting infrastructure, CDN, DNS, and Turnstile
                bot-protection. Cloudflare processes your IP address for
                security and geo-detection purposes.
              </p>
            </div>
            <div className="rounded-xl border border-outline-variant/50 bg-surface p-4">
              <p className="font-display font-semibold text-on-surface">
                Microsoft Clarity
              </p>
              <p className="text-sm mt-1">
                Collects anonymized usage data including clicks, scrolls, and
                session recordings to help us improve the user experience. See{" "}
                <a
                  href="https://privacy.microsoft.com/privacystatement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover underline"
                >
                  Microsoft&apos;s Privacy Statement
                </a>
                .
              </p>
            </div>
            <div className="rounded-xl border border-outline-variant/50 bg-surface p-4">
              <p className="font-display font-semibold text-on-surface">
                OpenStreetMap
              </p>
              <p className="text-sm mt-1">
                Provides map tile imagery for location-based features. Your
                browser loads map tiles directly from OpenStreetMap servers.
              </p>
            </div>
          </div>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            5. Cookies &amp; Tracking
          </h2>
          <p>ProBuddy uses minimal cookies and tracking:</p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>
              <strong className="text-on-surface">
                Cloudflare Turnstile
              </strong>{" "}
              — Sets cookies necessary for bot protection. These are essential
              for the Service to function and cannot be disabled.
            </li>
            <li>
              <strong className="text-on-surface">Microsoft Clarity</strong> —
              Uses first-party cookies and session storage to track user
              interactions anonymously.
            </li>
            <li>
              <strong className="text-on-surface">Authentication</strong> — If
              you sign in, a session cookie is used to keep you logged in.
            </li>
          </ul>
          <p className="mt-3">
            We do not use advertising cookies or sell data to advertisers.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            6. Data Retention
          </h2>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              <strong className="text-on-surface">Search results</strong> — Cached
              for up to one week to improve performance, then automatically
              deleted.
            </li>
            <li>
              <strong className="text-on-surface">Chat messages</strong> — Not
              stored permanently. Messages are sent to the AI for processing and
              are not retained after the session.
            </li>
            <li>
              <strong className="text-on-surface">Location data</strong> — Used
              in real time for personalization and not stored in a way that
              identifies you.
            </li>
            <li>
              <strong className="text-on-surface">Account data</strong> — Retained
              for as long as your account is active. You may request deletion at
              any time.
            </li>
          </ul>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            7. Data Security
          </h2>
          <p>
            We take reasonable measures to protect your information, including:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>
              All traffic is encrypted via HTTPS/TLS through Cloudflare.
            </li>
            <li>Passwords are securely hashed and never stored in plain text.</li>
            <li>
              Access to the database and admin features is protected by
              authentication and middleware.
            </li>
            <li>
              Bot protection (Cloudflare Turnstile) prevents automated abuse.
            </li>
          </ul>
          <p className="mt-3">
            However, no method of transmission over the internet is 100% secure.
            We cannot guarantee absolute security.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            8. Your Rights
          </h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>
              <strong className="text-on-surface">Access</strong> — Request a
              copy of the personal data we hold about you.
            </li>
            <li>
              <strong className="text-on-surface">Correction</strong> — Request
              correction of inaccurate data.
            </li>
            <li>
              <strong className="text-on-surface">Deletion</strong> — Request
              deletion of your account and associated data.
            </li>
            <li>
              <strong className="text-on-surface">Opt out of analytics</strong>{" "}
              — You can block Microsoft Clarity by using a browser extension that
              blocks tracking scripts, or by enabling &quot;Do Not Track&quot; in
              your browser settings.
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:hello@probuddy.ai"
              className="text-primary hover:text-primary-hover underline"
            >
              hello@probuddy.ai
            </a>
            .
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            9. California Privacy Rights
          </h2>
          <p>
            If you are a California resident, you may have additional rights
            under the California Consumer Privacy Act (CCPA), including the right
            to know what personal information we collect, the right to request
            deletion, and the right to opt out of the sale of personal
            information.{" "}
            <strong className="text-on-surface">
              We do not sell your personal information.
            </strong>
          </p>
          <p className="mt-3">
            To exercise your California privacy rights, contact us at{" "}
            <a
              href="mailto:hello@probuddy.ai"
              className="text-primary hover:text-primary-hover underline"
            >
              hello@probuddy.ai
            </a>
            .
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            10. Children&apos;s Privacy
          </h2>
          <p>
            ProBuddy is not intended for children under the age of 13. We do not
            knowingly collect personal information from children under 13 in
            compliance with the Children&apos;s Online Privacy Protection Act
            (COPPA). If you believe we have collected information from a child,
            please contact us and we will promptly delete it.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            11. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we
            will revise the &quot;Last updated&quot; date at the top of this
            page. We encourage you to review this page periodically. Continued
            use of the Service after changes are posted constitutes your
            acceptance of the revised policy.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">
            12. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy or how we handle
            your data, please contact us at{" "}
            <a
              href="mailto:hello@probuddy.ai"
              className="text-primary hover:text-primary-hover underline"
            >
              hello@probuddy.ai
            </a>
            .
          </p>
        </section>

        {/* Cross-link */}
        <div className="pt-4 border-t border-outline-variant/50">
          <p className="text-sm">
            See also our{" "}
            <Link
              href="/terms"
              className="text-primary hover:text-primary-hover underline"
            >
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
