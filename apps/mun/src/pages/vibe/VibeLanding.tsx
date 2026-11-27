import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MotionConfig, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronDown, Instagram, Send } from 'lucide-react';
import { useContent } from '@/content/store';
import { HUB_URL } from '@/lib/domains';

/**
 * Vibe Turon landing (vibe.turon.one, and /vibe on the app host).
 * Everything on it is edited in Admin → Site content → Vibe Turon.
 *
 * Design: the logo's V is a stack of navy slabs with a violet edge. That edge
 * becomes a solid violet offset shadow on buttons and idea notes, and the
 * slant becomes the highlight behind the headline word and the step markers.
 */

type Status = 'coming_soon' | 'open' | 'finished';

/** Which state the page is in. "open" needs a link and an unexpired deadline. */
export function useVibeState() {
  const v = useContent('vibe');
  const deadline = v.registration_deadline ? new Date(v.registration_deadline) : null;
  const beforeDeadline = !deadline || isNaN(deadline.getTime()) || Date.now() < deadline.getTime();
  let status = (['coming_soon', 'open', 'finished'].includes(v.status) ? v.status : 'coming_soon') as Status;
  if (status === 'open' && (!v.registration_url || !beforeDeadline)) status = 'coming_soon';
  return status;
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vibe-violet focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const display = 'font-vibe font-extrabold tracking-[-0.04em]';

/** Navy slab with the violet edge from the logo. Presses down on click. */
const slabButton =
  `inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-vibe-navy px-6 py-3 text-base font-semibold text-white shadow-[5px_5px_0_0_#6741D9] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-px hover:-translate-y-px hover:bg-vibe-navy-800 hover:shadow-[7px_7px_0_0_#6741D9] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none motion-reduce:transition-none ${focusRing}`;
const outlineButton =
  `inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl border-2 border-vibe-navy bg-white px-5 py-2.5 text-base font-semibold text-vibe-navy transition-colors hover:bg-vibe-navy-50 ${focusRing}`;

/** "Your idea. *Working* in a weekend." → the starred word on a slanted violet slab. */
function Headline({ text }: { text: string }) {
  const parts = (text || '').split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('*') && p.endsWith('*') ? (
          <span key={i} className="relative mx-[0.06em] inline-block whitespace-nowrap px-[0.12em] text-white">
            <span aria-hidden className="absolute inset-x-0 bottom-[0.04em] top-[0.1em] -skew-x-12 rounded-[0.08em] bg-vibe-violet" />
            <span className="relative">{p.slice(1, -1)}</span>
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}

const TelegramIcon = (props: { className?: string }) => <Send aria-hidden className={props.className} />;

export default function VibeLanding() {
  const v = useContent('vibe');
  const general = useContent('general');
  const status = useVibeState();
  const telegram = v.telegram_url || general.telegram_url;
  const instagram = v.instagram_url || general.instagram_url;

  const ideas = (v.ideas || []).filter(i => i.idea);
  const steps = (v.steps || []).filter(s => s.title);
  const audience = (v.audience || []).filter(a => a.title);
  const info = (v.info || []).filter(i => i.label && i.value);
  const faq = (v.faq || []).filter(f => f.question);

  const badge =
    status === 'open'
      ? ['Registration open', v.date_text, v.venue_text]
      : status === 'finished'
        ? ['Finished', v.date_text]
        : ['Coming soon', v.date_text];

  const nav = [
    ...(steps.length ? [{ href: '#how-it-works', label: v.steps_title }] : []),
    ...(audience.length ? [{ href: '#who', label: v.audience_title }] : []),
    ...(faq.length ? [{ href: '#faq', label: v.faq_title }] : []),
  ];

  // Mobile: a bottom bar with the main button once the hero button has scrolled away.
  const heroCta = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const el = heroCta.current;
    if (!el || status === 'finished') return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [status]);

  const telegramLink = (className: string, label = v.telegram_button, tabIndex?: number) =>
    telegram ? (
      <a href={telegram} target="_blank" rel="noopener noreferrer" className={className} tabIndex={tabIndex}>
        <TelegramIcon className="h-5 w-5" />
        {label}
      </a>
    ) : null;
  const registerLink = (className: string, tabIndex?: number) => (
    <a href={v.registration_url} target="_blank" rel="noopener noreferrer" className={`group ${className}`} tabIndex={tabIndex}>
      {v.register_button}
      <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
  const mainButton = (className: string, tabIndex?: number) =>
    status === 'open' ? registerLink(className, tabIndex) : telegramLink(className, undefined, tabIndex);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-white font-sans text-vibe-navy-900 antialiased">
        <Helmet>
          <title>{v.name}</title>
          <meta name="description" content={v.intro} />
          <meta name="theme-color" content="#283480" />
          <link rel="icon" type="image/svg+xml" href="/vibe/favicon.svg" />
          <link rel="apple-touch-icon" href="/vibe/apple-touch-icon.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&display=swap" />
        </Helmet>

        <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-vibe-navy focus:px-4 focus:py-2 focus:font-semibold focus:text-white">
          Skip to content
        </a>

        {/* ── Header (fixed: the site-wide overflow-x on <body> breaks sticky) ── */}
        <header className="fixed inset-x-0 top-0 z-30 border-b border-vibe-navy/10 bg-white/90 backdrop-blur-md">
          <div className="mx-auto w-full max-w-6xl flex h-16 items-center justify-between gap-3 px-4 md:grid md:grid-cols-[1fr_auto_1fr]">
            <a href="#top" aria-label={`${v.name}, back to top`} className={`justify-self-start rounded-lg ${focusRing}`}>
              <img src="/vibe/mark.svg" alt="" width={107} height={107} className="h-11 w-11" />
            </a>
            {nav.length > 0 && (
              <nav aria-label="Sections" className="hidden items-center gap-1 text-sm md:flex">
                {nav.map(n => (
                  <a key={n.href} href={n.href} className={`rounded-lg px-3 py-2 font-medium text-vibe-navy-800 transition-colors hover:bg-vibe-violet-50 hover:text-vibe-violet-700 ${focusRing}`}>{n.label}</a>
                ))}
              </nav>
            )}
            <div className="flex items-center gap-2 justify-self-end md:col-start-3">
              <a href={HUB_URL} className={`hidden items-center gap-1.5 rounded-full border border-vibe-navy/15 px-3 py-1.5 text-xs font-medium text-vibe-navy-800 transition-colors hover:border-vibe-navy/30 sm:inline-flex ${focusRing}`}>
                part of <span className="font-vibe font-extrabold tracking-[-0.03em] text-vibe-navy">turon.</span>
              </a>
              {status !== 'finished' && mainButton(`${focusRing} hidden sm:inline-flex items-center gap-2 rounded-lg bg-vibe-navy px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-vibe-navy-800 [&_svg]:h-4 [&_svg]:w-4`)}
            </div>
          </div>
        </header>

        <main id="content" className="flex-1 pt-16">
          {/* ── Hero ─────────────────────────────────────────────────── */}
          <section id="top" className="relative overflow-hidden bg-vibe-violet-50">
            <div className="relative mx-auto w-full max-w-6xl grid items-center gap-12 px-4 pb-16 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
              {/* Painted without a fade so the headline shows immediately. */}
              <div>
                <p className={`${display} text-base text-vibe-violet sm:text-lg`}>{v.name}</p>
                <p className="mt-3 inline-flex flex-wrap items-center gap-x-2 rounded-full border border-vibe-violet-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-vibe-violet-700">
                  <span aria-hidden className={`h-2 w-2 rounded-full bg-vibe-violet ${status === 'open' ? 'animate-pulse motion-reduce:animate-none' : ''}`} />
                  {badge.filter(Boolean).join(' · ')}
                </p>
                <h1 className={`${display} mt-5 text-balance text-[2.5rem] leading-[1.04] text-vibe-navy-900 sm:text-6xl lg:text-[4.1rem]`}>
                  <Headline text={v.headline} />
                </h1>
                {status === 'finished' ? (
                  <div className="mt-6 max-w-xl">
                    <p className="text-lg font-semibold text-vibe-navy-900">{v.finished_title}</p>
                    <p className="mt-2 text-base leading-relaxed text-vibe-navy-800/80 sm:text-lg">{v.finished_text}</p>
                  </div>
                ) : (
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-vibe-navy-800/80 sm:text-lg">{v.intro}</p>
                )}
                <div ref={heroCta} className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  {status === 'finished' ? telegramLink(slabButton) : mainButton(slabButton)}
                  {status === 'open' && telegramLink(outlineButton)}
                  {status === 'coming_soon' && v.tagline && <span className={`${display} text-sm tracking-[-0.02em] text-vibe-violet-700`}>{v.tagline}</span>}
                </div>
              </div>

              {ideas.length > 0 && (
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-vibe-navy-800/70">{v.ideas_title}</p>
                  <ul className="grid grid-cols-2 gap-3 sm:gap-5">
                    {ideas.slice(0, 6).map((idea, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 14, rotate: 0 }}
                        animate={{ opacity: 1, y: 0, rotate: [-1.6, 1.2, 0.9, -1.1, 1.4, -0.8][i % 6] }}
                        transition={{ duration: 0.45, delay: 0.08 + i * 0.07, ease: 'easeOut' }}
                        className={`flex min-h-[7.5rem] flex-col justify-between rounded-xl border-2 border-vibe-navy p-3.5 shadow-[5px_5px_0_0_#6741D9] sm:min-h-[8.5rem] sm:p-5 ${['bg-white', 'bg-[#FFF4DC]', 'bg-[#E7EAFB]', 'bg-white', 'bg-[#FFF4DC]', 'bg-[#E7EAFB]'][i % 6]}`}
                      >
                        <span className="text-[0.95rem] font-semibold leading-snug text-vibe-navy-900 sm:text-lg">{idea.idea}</span>
                        {idea.tag && <span className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-vibe-navy-800/65">{idea.tag}</span>}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* ── Key details (filled in when the event is set) ───────────── */}
          {info.length > 0 && (
            <section aria-label={v.info_title} className="bg-vibe-navy text-white">
              <dl className="mx-auto w-full max-w-6xl grid grid-cols-2 px-4 md:grid-flow-col md:auto-cols-fr md:grid-cols-none">
                {info.map(item => (
                  <div key={item.label} className="border-white/10 px-3 py-7 text-center md:border-l md:first:border-l-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">{item.label}</dt>
                    <dd className={`${display} mt-1.5 text-lg tracking-[-0.02em] sm:text-xl`}>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div aria-hidden className="h-1.5 bg-vibe-violet" />
            </section>
          )}

          {/* ── How it works ─────────────────────────────────────────── */}
          {steps.length > 0 && (
            <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:py-24">
              <h2 className={`${display} text-3xl sm:text-4xl`}>{v.steps_title}</h2>
              <ol className={`mt-10 grid gap-8 sm:mt-12 md:gap-6 ${steps.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {steps.map((s, i) => (
                  <li key={i} className="relative">
                    <div className="flex items-center gap-3">
                      {/* The logo's slab, as the step number */}
                      <span className="flex h-11 w-14 -skew-x-12 items-center justify-center rounded-md bg-vibe-navy shadow-[4px_0_0_0_#6741D9]">
                        <span className="skew-x-12 font-vibe text-lg font-extrabold text-white">{i + 1}</span>
                      </span>
                      {s.when && <span className="text-sm font-semibold text-vibe-violet-700">{s.when}</span>}
                    </div>
                    <h3 className={`${display} mt-4 text-xl tracking-[-0.03em]`}>{s.title}</h3>
                    <p className="mt-2 max-w-sm leading-relaxed text-vibe-navy-800/80">{s.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ── Who it's for ─────────────────────────────────────────── */}
          {audience.length > 0 && (
            <section id="who" className="scroll-mt-20 bg-vibe-violet-50 py-16 sm:py-24">
              <div className="mx-auto w-full max-w-6xl px-4">
                <h2 className={`${display} text-3xl sm:text-4xl`}>{v.audience_title}</h2>
                <ul className={`mt-10 grid gap-4 sm:mt-12 ${audience.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                  {audience.map((a, i) => (
                    <li key={i} className="rounded-2xl border border-vibe-violet-200 bg-white p-6">
                      <h3 className="text-lg font-bold text-vibe-navy-900">{a.title}</h3>
                      <p className="mt-2 leading-relaxed text-vibe-navy-800/80">{a.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ── FAQ ──────────────────────────────────────────────────── */}
          {faq.length > 0 && (
            <section id="faq" className="mx-auto w-full max-w-6xl max-w-3xl scroll-mt-20 px-4 py-16 sm:py-24">
              <h2 className={`${display} text-3xl sm:text-4xl`}>{v.faq_title}</h2>
              <div className="mt-8 max-w-3xl divide-y divide-vibe-navy/10 border-y border-vibe-navy/10">
                {faq.map((item, i) => (
                  <details key={i} className="group">
                    <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-5 text-lg font-semibold text-vibe-navy-900 [&::-webkit-details-marker]:hidden ${focusRing}`}>
                      {item.question}
                      <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-vibe-violet transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="whitespace-pre-line pb-5 leading-relaxed text-vibe-navy-800/80">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* ── Closing band ─────────────────────────────────────────── */}
          {status !== 'finished' && (
            <section className="relative overflow-hidden bg-vibe-navy">
              <img src="/vibe/mark-white.svg" alt="" aria-hidden className="pointer-events-none absolute -right-10 top-1/2 h-72 w-72 -translate-y-1/2 select-none opacity-[0.07]" />
              <div className="relative mx-auto w-full max-w-6xl flex flex-col items-start gap-6 px-4 py-14 sm:py-16 md:flex-row md:items-center md:justify-between">
                <p className={`${display} max-w-xl text-balance text-2xl leading-tight tracking-[-0.03em] text-white sm:text-3xl`}>
                  {status === 'open' ? v.cta_open_title : v.cta_title}
                </p>
                {mainButton(`inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-3 text-base font-semibold text-vibe-navy shadow-[5px_5px_0_0_#6741D9] transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[7px_7px_0_0_#6741D9] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-vibe-navy`)}
              </div>
            </section>
          )}
        </main>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="bg-vibe-navy-900 text-sm text-white/70">
          <div className="mx-auto w-full max-w-6xl flex flex-col items-center justify-between gap-6 px-4 py-10 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3">
              <img src="/vibe/mark-white.svg" alt="" width={107} height={107} loading="lazy" className="h-12 w-12" />
              <div>
                <p className="font-semibold text-white">{v.name}</p>
                <p>
                  A{' '}
                  <a href={HUB_URL} className="rounded font-vibe font-extrabold tracking-[-0.03em] text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">turon.</a>
                  {' '}project · Fergana, Uzbekistan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {telegram && (
                <a href={telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="rounded-lg p-2.5 text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><Send className="h-5 w-5" /></a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-lg p-2.5 text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><Instagram className="h-5 w-5" /></a>
              )}
              <a href={HUB_URL} className="ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                turon.one <ArrowUpRight aria-hidden className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div aria-hidden className="flex h-1.5"><span className="flex-[3] bg-vibe-navy" /><span className="flex-1 bg-vibe-violet" /></div>
        </footer>

        {/* ── Mobile: bottom bar once the hero button has scrolled away ── */}
        {status !== 'finished' && (
          <div
            aria-hidden={!showBar}
            className={`fixed inset-x-0 bottom-0 z-20 border-t border-vibe-navy/10 bg-white/95 p-3 backdrop-blur-md transition-transform duration-300 md:hidden ${showBar ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            {mainButton(`${focusRing} flex w-full min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-vibe-navy text-base font-semibold text-white`, showBar ? 0 : -1)}
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
