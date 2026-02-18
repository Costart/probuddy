import Link from "next/link";
import { getGeoData } from "@/lib/geo";
import { getPublishedCategories } from "@/lib/db/queries/categories";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HeroSection } from "@/components/HeroSection";
import { SharedPageProvider } from "@/components/SharedPageContext";
import { CityName } from "@/components/CityName";
import { AiScanShowcase } from "@/components/home/AiScanShowcase";
import { AiBuddyShowcase } from "@/components/home/AiBuddyShowcase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ProBuddy — AI-Powered Pro Matching",
  description:
    "AI analyzes profiles, reviews, and experience of up to 30 pros to find your best match. Find trusted professionals for plumbing, electrical, roofing, painting and more.",
};

export default async function HomePage() {
  const geo = await getGeoData();
  const categories = await getPublishedCategories();
  const topCategories = categories.slice(0, 8);

  return (
    <SharedPageProvider
      initialGeo={{
        lat: geo.latitude ?? null,
        lon: geo.longitude ?? null,
        city: geo.city ?? null,
      }}
    >
      <div>
        {/* ─── Section 1: Geo-Personalized Map Hero ─── */}
        <HeroSection>
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-3xl">
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface">
                Find a Trusted Pro
                <CityName fallback={geo.city ?? undefined} />
              </h1>
              <p className="text-base md:text-lg text-on-surface-variant mt-3 max-w-xl">
                AI analyzes profiles, reviews, and experience of up to 30 pros
                to find your best match — instantly.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <Link href="#services">
                  <Button size="lg">Browse Services</Button>
                </Link>
                <Link href="#ai-scanning">
                  <Button variant="outlined" size="lg" className="bg-white/60">
                    See How AI Helps
                  </Button>
                </Link>
              </div>
              {geo.city && (
                <div className="flex items-center gap-1.5 mt-4 text-sm text-on-surface-variant">
                  <svg
                    className="w-3.5 h-3.5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                  <span>
                    {geo.city}
                    {geo.region ? `, ${geo.region}` : ""} — detected
                    automatically
                  </span>
                </div>
              )}
            </div>
          </div>
        </HeroSection>

        {/* ─── Section 2: AI Scanning Showcase ─── */}
        <section
          id="ai-scanning"
          className="bg-surface-container py-16 md:py-20 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Visual */}
              <div className="order-1 lg:order-1">
                <AiScanShowcase />
              </div>
              {/* Copy */}
              <div className="order-2 lg:order-2 space-y-6">
                <p className="text-xs font-bold tracking-widest uppercase text-accent">
                  Powered by AI
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
                  We Don&apos;t Just List Pros.
                  <br />
                  We Analyze Them.
                </h2>
                <p className="text-on-surface-variant leading-relaxed">
                  When you search for a pro, our AI reads every profile,
                  evaluates hundreds of reviews, checks years of experience, and
                  compares response times — across up to 30 professionals. Then
                  it ranks your best matches and tells you exactly why each one
                  stands out.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    {
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      ),
                      title: "Deep Profile Analysis",
                      desc: "AI reads bios, specialties, and credentials",
                    },
                    {
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                        />
                      ),
                      title: "Review Intelligence",
                      desc: "Hundreds of reviews distilled into insights",
                    },
                    {
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 0 1-3.77 1.522m0 0a6.003 6.003 0 0 1-3.77-1.522"
                        />
                      ),
                      title: "Smart Ranking",
                      desc: "Top picks with plain-English explanations",
                    },
                  ].map((feat) => (
                    <div
                      key={feat.title}
                      className="rounded-xl border border-outline-variant/50 bg-white p-4 space-y-2"
                    >
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        {feat.icon}
                      </svg>
                      <p className="font-display font-bold text-sm text-on-surface">
                        {feat.title}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: How It Works ─── */}
        <section id="how-it-works" className="bg-white py-16 md:py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-14 text-center">
              How It Works
            </h2>
            <div className="relative">
              {/* Connector line — desktop */}
              <div className="hidden md:block absolute top-6 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                {[
                  {
                    step: "1",
                    title: "Pick Your Service",
                    desc: "Browse dozens of categories — plumbing, painting, roofing, and more.",
                  },
                  {
                    step: "2",
                    title: "AI Scans & Ranks Pros",
                    desc: "Our AI analyzes up to 30 professionals — profiles, reviews, experience — then ranks your best matches.",
                  },
                  {
                    step: "3",
                    title: "Hire with Confidence",
                    desc: "See exactly why each pro was recommended. Compare quotes, read AI insights, and choose the right fit.",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="text-center relative flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-display font-bold text-lg flex items-center justify-center relative z-10">
                      {item.step}
                    </div>
                    <h3 className="font-display text-lg font-bold text-on-surface mt-4">
                      {item.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-2 max-w-xs">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 4: AI Pro Buddy Preview ─── */}
        <section className="bg-gradient-to-br from-primary/5 via-surface to-accent/5 py-16 md:py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Copy */}
              <div className="order-2 lg:order-1 space-y-6">
                <p className="text-xs font-bold tracking-widest uppercase text-primary">
                  AI Pro Buddy
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
                  Got Questions?
                  <br />
                  Your AI Assistant Has Answers.
                </h2>
                <p className="text-on-surface-variant leading-relaxed">
                  Every service page comes with a built-in AI assistant that
                  knows local pricing, expert tips, and what questions to ask
                  before hiring. It&apos;s like having a knowledgeable friend
                  who&apos;s done the research for you.
                </p>
                <ul className="space-y-3">
                  {[
                    "Knows local pricing ranges for your city",
                    "Shares expert tips specific to your project",
                    "Helps you ask the right questions before hiring",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <svg
                        className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      <span className="text-on-surface-variant">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Link href="/services">
                    <Button>Try It on Any Service Page</Button>
                  </Link>
                </div>
              </div>
              {/* Visual */}
              <div className="order-1 lg:order-2">
                <AiBuddyShowcase city={geo.city} />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 5: Popular Services Grid ─── */}
        <section id="services" className="bg-white py-16 md:py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
                Popular Services
              </h2>
              <Link
                href="/services"
                className="text-sm text-primary hover:text-primary-hover font-medium hidden sm:inline"
              >
                View All {categories.length} Services →
              </Link>
            </div>
            {topCategories.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {topCategories.map((cat) => (
                    <Link key={cat.id} href={`/services/${cat.slug}`}>
                      <Card className="h-full hover:shadow-elevation-2 hover:scale-[1.02] transition-all cursor-pointer overflow-hidden">
                        {cat.imageUrl ? (
                          <div className="relative h-28 md:h-36 w-full">
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="absolute inset-0 w-full h-full object-cover object-top"
                            />
                          </div>
                        ) : (
                          <div className="h-28 md:h-36 w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 md:w-10 md:h-10 text-primary/30"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
                              />
                            </svg>
                          </div>
                        )}
                        <CardContent className="p-4 md:p-5">
                          <h3 className="font-display text-sm md:text-base font-bold text-on-surface mb-1">
                            {cat.name}
                          </h3>
                          {cat.description && (
                            <p className="text-xs md:text-sm text-on-surface-variant line-clamp-2">
                              {cat.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link href="/services">
                    <Button variant="outlined">
                      View All {categories.length} Services
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-on-surface-variant">
                No services available yet.
              </p>
            )}
          </div>
        </section>

        {/* ─── Section 6: Trust & Personalization Strip ─── */}
        <section className="bg-surface-container py-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-on-surface-variant mb-6">
              {geo.city
                ? `Personalized to ${geo.city} — no sign-up required`
                : "Personalized to your location — no sign-up required"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  ),
                  title: "Instant Geo-Detection",
                  desc: "Personalized from the first page load",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
                    />
                  ),
                  title: "AI-Analyzed Rankings",
                  desc: "Up to 30 pros evaluated per search",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                    />
                  ),
                  title: "No Account Needed",
                  desc: "Start searching immediately",
                },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className="rounded-xl border border-outline-variant/50 bg-white p-5 text-center"
                >
                  <svg
                    className="w-6 h-6 text-accent mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    {badge.icon}
                  </svg>
                  <p className="font-display font-bold text-sm text-on-surface">
                    {badge.title}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {badge.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section 7: Final CTA ─── */}
        <section className="bg-primary py-16 md:py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-on-primary">
              Ready to Find Your Perfect Pro?
            </h2>
            <p className="text-primary-container mt-4 text-lg">
              Browse services, let AI do the research, and hire with confidence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href="/services">
                <Button variant="accent" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link href="#ai-scanning">
                <Button
                  variant="outlined"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Learn How AI Ranking Works
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SharedPageProvider>
  );
}
