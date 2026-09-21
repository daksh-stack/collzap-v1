import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { CheckCircle2, Megaphone, Rocket } from 'lucide-react';
import Nav from './landing/sections/Nav';
import Footer from './landing/sections/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import FileUpload from '../components/ui/FileUpload';
import { cn } from '../lib/utils';
import { snappy, transition, useReducedMotion } from '../lib/motion';
import { api } from '../api/api';

const DOCUMENT_TYPES = [
  { id: 'FEE_SLIP', label: 'Fee slip', hint: 'This term or last' },
  { id: 'ID_CARD', label: 'ID card', hint: 'Name and year visible' },
];

/**
 * Public, unauthenticated — anyone whose college isn't on CollZap yet can
 * apply from here. Backend: POST /api/college-applications (+ /document for
 * the upload), both permitAll and IP rate-limited — see SecurityConfig and
 * CollegeApplicationController. There is no account, no email OTP and no
 * College row created on submit; an admin reviews every one by hand from
 * /admin/applications.
 */
export default function BringCollZapPage() {
  const reduced = useReducedMotion();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeCity, setCollegeCity] = useState('');
  const [motivation, setMotivation] = useState('');
  const [documentType, setDocumentType] = useState('FEE_SLIP');
  const [documentUrl, setDocumentUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const clear = (field) => setErrors((p) => ({ ...p, [field]: undefined }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const next = {};
    if (!fullName.trim()) next.fullName = 'Enter your name';
    if (!email.trim()) next.email = 'Enter your email';
    if (!contactNumber.trim()) next.contactNumber = 'Enter a contact number';
    if (!collegeName.trim()) next.collegeName = 'Enter your college name';
    if (!motivation.trim() || motivation.trim().length < 30) {
      next.motivation = 'A few sentences helps — at least 30 characters';
    }
    if (!documentUrl) next.documentUrl = 'Upload your fee slip or ID card';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const response = await api.post('/college-applications', {
        fullName: fullName.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim(),
        collegeName: collegeName.trim(),
        collegeCity: collegeCity.trim() || null,
        motivation: motivation.trim(),
        documentType,
        documentUrl,
      });
      setDone(response.message);
    } catch (error) {
      if (error.fieldErrors) {
        setErrors(error.fieldErrors);
      } else {
        setErrors({ _form: error.message || 'Could not submit that. Try again in a moment.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      <Helmet>
        <title>Bring CollZap to your college · CollZap</title>
        <meta
          name="description"
          content="CollZap isn't at your college yet? Apply to bring it there — and you may be nominated as a Campus Ambassador and considered for future opportunities with us."
        />
        <link rel="canonical" href="https://collzap.com/bring-collzap" />
        <meta property="og:url" content="https://collzap.com/bring-collzap" />
        <meta property="og:title" content="Bring CollZap to your college" />
        <meta
          property="og:description"
          content="Apply to bring CollZap to your campus. May lead to a Campus Ambassador nomination and future opportunities."
        />
      </Helmet>

      <Nav />

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
          <span className="grad-brand h-1 w-6 rounded-full" />
          Not on your campus yet?
        </p>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink sm:text-5xl">
          Bring CollZap to your college.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-mute">
          CollZap only opens campus by campus, so if your college isn't on it yet, someone has to be
          first to ask. Fill this in and we'll follow up directly.
        </p>

        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-line bg-surface-2 p-5 sm:flex-row sm:items-start">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-ink">
            Students who apply <strong>may be nominated as a Campus Ambassador</strong> and{' '}
            <strong>considered for future opportunities with CollZap</strong> — we look at every
            application ourselves, so a genuine, specific answer below is what stands out.
          </p>
        </div>

        {done ? (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition(snappy, reduced)}
            className="mt-10 rounded-lg border border-good/30 bg-good/5 p-8 text-center"
          >
            <CheckCircle2 className="mx-auto h-10 w-10 text-good" aria-hidden="true" />
            <h2 className="mt-4 font-display text-xl font-bold text-ink">Application received</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-mute">{done}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Your name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); clear('fullName'); }}
                error={errors.fullName}
                disabled={submitting}
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clear('email'); }}
                error={errors.email}
                disabled={submitting}
              />
            </div>

            <Input
              label="Contact number"
              type="tel"
              value={contactNumber}
              onChange={(e) => { setContactNumber(e.target.value); clear('contactNumber'); }}
              error={errors.contactNumber}
              hint="We'll only use this to follow up on your application"
              disabled={submitting}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="College name"
                value={collegeName}
                onChange={(e) => { setCollegeName(e.target.value); clear('collegeName'); }}
                error={errors.collegeName}
                disabled={submitting}
              />
              <Input
                label="City (optional)"
                value={collegeCity}
                onChange={(e) => setCollegeCity(e.target.value)}
                disabled={submitting}
              />
            </div>

            <TextArea
              label="Why do you want CollZap at your college?"
              value={motivation}
              onChange={(e) => { setMotivation(e.target.value); clear('motivation'); }}
              error={errors.motivation}
              hint={!errors.motivation ? `${motivation.trim().length}/1000` : undefined}
              rows={5}
              placeholder="What's missing at your college right now, and how would CollZap help?"
              disabled={submitting}
            />

            <fieldset>
              <legend className="mb-3 font-mono text-[10px] uppercase tracking-widest text-mute">
                Prove you actually go there
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {DOCUMENT_TYPES.map((t) => {
                  const selected = documentType === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      type="button"
                      onClick={() => setDocumentType(t.id)}
                      whileTap={reduced ? undefined : { scale: 0.985 }}
                      transition={transition(snappy, reduced)}
                      aria-pressed={selected}
                      disabled={submitting}
                      className={cn(
                        'rounded-lg border p-4 text-left transition-[background-color,border-color,box-shadow] duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
                        selected
                          ? 'border-accent-500 bg-accent-50 shadow-glow-accent'
                          : 'border-line bg-surface shadow-sm hover:border-accent-300 hover:shadow-md'
                      )}
                    >
                      <span className={cn('block font-display text-base font-semibold tracking-tight', selected ? 'text-accent-800' : 'text-ink')}>
                        {t.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-mute">{t.hint}</span>
                    </motion.button>
                  );
                })}
              </div>
            </fieldset>

            <FileUpload
              category="DOCUMENT"
              endpoint="/college-applications/document"
              label="Upload your document"
              onUploadComplete={(url) => { setDocumentUrl(url); clear('documentUrl'); }}
            />
            {errors.documentUrl && <p className="text-xs text-bad">{errors.documentUrl}</p>}

            {errors._form && (
              <p className="rounded-lg border border-bad/30 bg-bad/5 px-4 py-3 text-sm text-bad">{errors._form}</p>
            )}

            <Button type="submit" variant="gradient" size="lg" className="w-full" loading={submitting} icon={<Rocket className="h-4 w-4" />}>
              Submit application
            </Button>

            <p className="text-center text-xs text-mute">
              What happens next: we review it, verify your college, and reach out at the email above.
            </p>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
