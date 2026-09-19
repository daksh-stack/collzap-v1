import { Helmet } from 'react-helmet-async';
import Nav from './landing/sections/Nav';
import Footer from './landing/sections/Footer';

/**
 * Legal copy here should describe what the app actually does, not a generic
 * template. Four corrections were made against the source draft, each because
 * the code says otherwise:
 *
 * - Section 4 (service providers) now lists Cloudinary — verification
 *   documents and profile photos are uploaded there
 *   (CloudinaryService.java), and the original list omitted it entirely.
 * - Section 6 no longer claims documents are "not shared with any third
 *   party" (they're stored on Cloudinary) or "deleted after verification is
 *   complete" (VerificationService never deletes them on approve/reject —
 *   only UserService.deleteAccount does, on account deletion).
 * - Section 9's "within 30 days" became "immediately": deleteAccount() is a
 *   single synchronous hard delete, not a queued or delayed one, so the
 *   stronger claim is the true one.
 * - Section 11 no longer describes cookies — the app sets none. Auth is a
 *   bearer token in localStorage (useAuthStore.js), not a cookie.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      <Helmet>
        <title>Privacy Policy · CollZap</title>
        <meta
          name="description"
          content="How CollZap collects, uses, stores and protects your personal information — including college verification documents, profile data and chat messages."
        />
        <link rel="canonical" href="https://collzap.com/privacy" />
        <meta property="og:url" content="https://collzap.com/privacy" />
        <meta property="og:title" content="Privacy Policy · CollZap" />
      </Helmet>

      <Nav />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
          <span className="grad-brand h-1 w-6 rounded-full" />
          Legal
        </p>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-mute">Last updated: September 2026 &middot; collzap.com</p>

        <div className="prose-legal mt-12 space-y-10">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to CollZap. We are India&rsquo;s first campus-based peer matching platform,
              built to help college students find serious, verified, like-minded peers within their
              own campus.
            </p>
            <p>
              This Privacy Policy explains how CollZap (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
              &ldquo;our&rdquo;) collects, uses, stores, and protects your personal information when
              you use our platform at collzap.com.
            </p>
            <p>
              By signing up and using CollZap, you agree to the terms of this Privacy Policy. If you
              do not agree, please do not use our platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Information you provide directly</h3>
            <ul>
              <li>Full name</li>
              <li>College or institute name</li>
              <li>College email address</li>
              <li>Year of study and course</li>
              <li>City</li>
              <li>Profile photo (optional)</li>
              <li>Story prompts and bio information</li>
              <li>Proof of work link (optional)</li>
              <li>Selected interests and seriousness level</li>
              <li>College ID or fee slip (for document-based verification)</li>
            </ul>
            <h3>2.2 Information generated through use</h3>
            <ul>
              <li>Seriousness assessment responses and scores</li>
              <li>Match preferences and connection type selections</li>
              <li>Chat messages between matched peers</li>
              <li>Activity timestamps and usage patterns</li>
            </ul>
            <h3>2.3 Technical information</h3>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages visited and time spent on platform</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Verify your college identity and ensure only real students access CollZap</li>
              <li>
                Match you with compatible peers based on interest, seriousness level, and connection
                type
              </li>
              <li>Enable real-time chat between matched peers</li>
              <li>Improve and personalize your experience on CollZap</li>
              <li>Send you notifications about new matches, messages, and platform updates</li>
              <li>Ensure the safety and security of our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing</h2>
            <p>We do not sell, rent, or trade your personal information to any third party.</p>
            <p>We share information only in the following circumstances:</p>
            <ul>
              <li>
                <strong>With matched peers:</strong> your profile information &mdash; name, year,
                city, interests, level, and story prompts &mdash; is visible to users you are matched
                with
              </li>
              <li>
                <strong>With service providers:</strong> we use trusted third-party services
                including Supabase (database), Cloudinary (photo and document storage), Resend
                (email delivery), and our hosting provider. These providers process data only as
                necessary to provide their services
              </li>
              <li>
                <strong>For legal compliance:</strong> we may disclose information if required by
                law, court order, or government authority
              </li>
              <li>
                <strong>For safety:</strong> we may share information to prevent fraud, abuse, or
                harm to users
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase &mdash; a trusted database platform with
              industry-standard encryption.
            </p>
            <p>We implement reasonable technical and organizational measures to protect your personal information including:</p>
            <ul>
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Secure password storage</li>
              <li>Access controls limiting who can view user data</li>
              <li>Regular security reviews</li>
            </ul>
            <p>
              However, no system is completely secure. We encourage you to use a strong password and
              not share your account credentials with anyone.
            </p>
          </section>

          <section>
            <h2>6. College Document Verification</h2>
            <p>If you verify your identity using a college ID card or fee slip, that document is:</p>
            <ul>
              <li>Stored securely with Cloudinary, our file storage provider</li>
              <li>Reviewed manually by CollZap administrators only</li>
              <li>Used solely for the purpose of verifying your college enrollment</li>
              <li>Never shown to other users or made public on the platform</li>
              <li>Retained only for as long as your account exists, and deleted when your account is deleted</li>
            </ul>
          </section>

          <section>
            <h2>7. Chat Privacy</h2>
            <p>
              Messages sent between matched peers on CollZap are stored in our secure database to
              enable real-time chat functionality. We do not read your private messages except in
              cases where a report of abuse or safety concern is raised.
            </p>
            <p>We encourage all users to communicate respectfully and within our Community Guidelines.</p>
          </section>

          <section>
            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> request deletion of your account and associated data</li>
              <li><strong>Withdrawal:</strong> withdraw consent for data processing at any time</li>
              <li><strong>Portability:</strong> request your data in a commonly used format</li>
            </ul>
            <p>To exercise any of these rights, contact us at nitishkumar@collzap.com.</p>
          </section>

          <section>
            <h2>9. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active. If you delete your account:</p>
            <ul>
              <li>Your profile, personal information, and verification documents are permanently deleted immediately</li>
              <li>Your chat history is permanently deleted</li>
              <li>Aggregated, anonymized usage data may be retained for analytics purposes</li>
            </ul>
          </section>

          <section>
            <h2>10. Children and Minors</h2>
            <p>
              CollZap is intended for use by college students who are 17 years of age or older. We
              do not knowingly collect personal information from anyone under the age of 17. If we
              become aware that a minor has provided us with personal information, we will delete it
              immediately.
            </p>
          </section>

          <section>
            <h2>11. Cookies and Local Storage</h2>
            <p>
              CollZap does not use cookies, and we do not use any third-party analytics or
              advertising trackers. Instead, we use your browser&rsquo;s local storage &mdash; a
              standard web technology that stays on your device and is never sent to us as
              tracking data &mdash; for two things only:
            </p>
            <ul>
              <li>Keeping you signed in between visits</li>
              <li>Remembering your light/dark theme preference</li>
            </ul>
            <p>
              Clearing your browser&rsquo;s site data for collzap.com will sign you out and reset
              your theme preference, but will not affect any data stored on our servers.
            </p>
          </section>

          <section>
            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the
              &ldquo;Last Updated&rdquo; date at the top of this page and notify active users by
              email. Continued use of CollZap after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2>13. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please
              contact us:
            </p>
            <div className="mt-4 rounded-lg border border-line bg-surface p-5 text-sm not-prose">
              <p className="font-semibold text-ink">Nitish Kumar</p>
              <p className="text-mute">Founder &amp; CEO, CollZap</p>
              <p className="mt-2">
                <a href="mailto:nitishkumar@collzap.com" className="text-accent-700 underline decoration-accent-300 underline-offset-4 hover:text-accent-800">
                  nitishkumar@collzap.com
                </a>
              </p>
              <p className="text-mute">collzap.com</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
