import React from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  ShieldCheck,
  Cpu,
  Truck,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  ClipboardCheck,
  MapPin
} from "lucide-react";

export default function Landing() {
  const steps = [
    {
      num: "01",
      title: "List surplus food",
      desc: "Share what is available, how it should be handled, and when it can be collected.",
      icon: <HeartHandshake className="h-5 w-5 text-[#087443]" />
    },
    {
      num: "02",
      title: "Find a suitable partner",
      desc: "Use location and donation details to help connect food with an organization that can receive it.",
      icon: <Cpu className="h-5 w-5 text-[#1E8E6A]" />
    },
    {
      num: "03",
      title: "Confirm the collection",
      desc: "The receiving organization reviews the listing and coordinates the pickup with the donor.",
      icon: <ShieldCheck className="h-5 w-5 text-[#426F9D]" />
    },
    {
      num: "04",
      title: "Complete the handoff",
      desc: "Record collection and delivery progress so everyone can follow the rescue through to handoff.",
      icon: <Truck className="h-5 w-5 text-[#12A66A]" />
    }
  ];

  const roleFeatures = [
    {
      role: "Donors",
      tagline: "Restaurants, grocers, caterers, and local businesses",
      description: "List safe surplus food and coordinate a convenient collection with a receiving organization.",
      ctaText: "Donate Food",
      ctaLink: "/donor/register",
      icon: <HeartHandshake className="h-5 w-5 text-[#087443]" />,
      accent: "border-[#DDEBD9] bg-[#F7FBF7]"
    },
    {
      role: "NGOs",
      tagline: "Food banks, shelters, and community kitchens",
      description: "Register your organization, review available donations, and coordinate the food your community needs.",
      ctaText: "NGO Registration",
      ctaLink: "/ngo/register",
      icon: <ShieldCheck className="h-5 w-5 text-[#1E8E6A]" />,
      accent: "border-[#DDEBD9] bg-[#EEF8F5]"
    },
    {
      role: "Volunteers",
      tagline: "People helping food reach local communities",
      description: "Sign in to access the existing volunteer and operations workflows for food rescue coordination.",
      ctaText: "Volunteer Portal",
      ctaLink: "/login",
      icon: <Truck className="h-5 w-5 text-[#426F9D]" />,
      accent: "border-[#DDEBD9] bg-[#F3F8FE]"
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4F8F2] text-[#142A21] font-sans selection:bg-[#10B981]/20">
      <header className="sticky top-0 z-50 border-b border-[#DDEBD9] bg-[#F9FBF8]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-3 max-[360px]:gap-1 max-[360px]:px-2 sm:h-[76px] sm:gap-4 sm:px-8 lg:px-12">
          <Link to="/" aria-label="EcoShare AI home" className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 max-[360px]:gap-1.5 sm:gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#0D8A68] text-[#061F15] max-[360px]:h-8 max-[360px]:w-8 sm:h-10 sm:w-10">
              <Leaf className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-bold text-[#142A21] max-[360px]:text-sm sm:text-lg">EcoShare <span className="text-[#087443]">AI</span></span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64746A] sm:block">Food rescue network</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm font-medium text-[#4F6258] lg:flex">
            <a href="#how-it-works" className="rounded-sm transition-colors hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">How It Works</a>
            <a href="#roles" className="rounded-sm transition-colors hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">Portals</a>
            <a href="#safety" className="rounded-sm transition-colors hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">Food Safety</a>
            <Link to="/ngos" className="rounded-sm transition-colors hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">NGO Directory</Link>
            <Link to="/sustainability" className="rounded-sm transition-colors hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">Impact</Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 max-[360px]:gap-1 sm:gap-3">
            <Link to="/login" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#D9E6D8] bg-white px-2.5 text-xs font-semibold text-[#142A21] transition-colors hover:border-[#B8D7BE] hover:bg-[#F1F8F3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 max-[360px]:px-2 sm:px-4 sm:text-sm">Sign In</Link>
            <Link to="/register" aria-label="Get Started" title="Get Started" className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg bg-[#087443] px-2.5 text-xs font-bold text-white transition-colors hover:bg-[#065D38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 max-[360px]:px-2 sm:gap-1.5 sm:px-4 sm:text-sm">
              <span className="hidden sm:inline">Get Started</span><span className="max-[360px]:hidden sm:hidden">Join</span><ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(107,191,89,0.12),transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-12 lg:pb-24 lg:pt-20">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#B8D7BE] bg-[#E8F7ED] px-3.5 py-2 text-sm font-semibold text-[#087443]">
                <Sparkles className="h-4 w-4" /> AI-POWERED • PEOPLE-DRIVEN • ZERO FOOD WASTE
              </div>
              <h1 id="hero-title" className="min-w-0 w-full max-w-full text-4xl font-extrabold leading-[1.06] text-[#142A21] sm:max-w-[14ch] sm:text-6xl xl:text-7xl">
                Good food. <span className="text-[#087443]">Better futures.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#4F6258] sm:text-lg sm:leading-8">
                Rescue surplus meals from local kitchens and deliver them to communities that need them.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/donor/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#087443] px-6 py-3 text-base font-bold text-white shadow-[0_18px_28px_rgba(8,116,67,0.18)] transition-colors hover:bg-[#065D38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-700">
                  Donate Surplus Food <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/ngo/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#C9DCCB] bg-white px-6 py-3 text-base font-bold text-[#142A21] transition-colors hover:border-[#A8C6AF] hover:bg-[#F5FBF6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
                  Find NGO Partners <ShieldCheck className="h-4 w-4 text-[#087443]" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium text-[#475D51]">
                {[
                  "Reduce food waste",
                  "Support local communities",
                  "Build a greener India"
                ].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2 rounded-full border border-[#DDEBD9] bg-white px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-[#12A66A]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[560px] lg:justify-self-end">
              <div className="rounded-[28px] border border-[#DDEBD9] bg-white p-4 shadow-[0_22px_60px_rgba(8,116,67,0.08)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E7EFE7] pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#087443]">Illustrative workflow</p>
                    <h2 className="mt-2 text-xl font-bold text-[#142A21] sm:text-2xl">A shared path from surplus to support</h2>
                  </div>
                  <span className="rounded-full border border-[#D9E6D8] bg-[#F3FAF5] px-3 py-1 text-xs font-medium text-[#4F6258]">Conceptual view</span>
                </div>

                <div className="relative mt-6 space-y-4 before:absolute before:bottom-8 before:left-[21px] before:top-8 before:w-px before:bg-gradient-to-b before:from-[#12A66A] before:via-[#85CFA2] before:to-[#BFDDE5]">
                  <div className="relative flex items-center gap-4 rounded-2xl border border-[#E7EFE7] bg-[#F7FBF7] p-4 sm:p-5">
                    <span className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F7ED] text-[#087443]"><HeartHandshake className="h-5 w-5" /></span>
                    <span><span className="block text-sm font-semibold text-[#142A21]">Food donor</span><span className="mt-1 block text-sm text-[#64746A]">Shares a surplus food listing</span></span>
                    <MapPin className="ml-auto h-4 w-4 shrink-0 text-[#7A8D83]" />
                  </div>
                  <div className="relative flex items-center gap-4 rounded-2xl border border-[#E7EFE7] bg-[#F7FBF7] p-4 sm:p-5">
                    <span className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F4FC] text-[#1E8E6A]"><ShieldCheck className="h-5 w-5" /></span>
                    <span><span className="block text-sm font-semibold text-[#142A21]">Receiving organization</span><span className="mt-1 block text-sm text-[#64746A]">Reviews and coordinates collection</span></span>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[#7A8D83]" />
                  </div>
                  <div className="relative flex items-center gap-4 rounded-2xl border border-[#E7EFE7] bg-[#F7FBF7] p-4 sm:p-5">
                    <span className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4F0FF] text-[#4E7C9D]"><Truck className="h-5 w-5" /></span>
                    <span><span className="block text-sm font-semibold text-[#142A21]">Volunteer or pickup team</span><span className="mt-1 block text-sm text-[#64746A]">Helps complete the handoff</span></span>
                    <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-[#12A66A]" />
                  </div>
                </div>
                <p className="mt-5 text-xs leading-5 text-[#64746A]">Illustration only. This panel does not display live donation, partner, or delivery data.</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Platform capabilities" className="border-y border-[#E1EAE0] bg-[#EEF7F1]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-6 sm:px-8 md:grid-cols-4 md:gap-4 lg:px-12">
            {[
              { icon: <ClipboardCheck className="h-5 w-5" />, label: "Donation traceability", tone: "text-[#087443]" },
              { icon: <Cpu className="h-5 w-5" />, label: "Smart matching", tone: "text-[#1E8E6A]" },
              { icon: <ShieldCheck className="h-5 w-5" />, label: "NGO registration", tone: "text-[#426F9D]" },
              { icon: <CheckCircle2 className="h-5 w-5" />, label: "Food-safety guidance", tone: "text-[#C4781F]" }
            ].map((item) => (
              <div key={item.label} className="flex min-h-[72px] items-center gap-3 rounded-xl border border-[#DDEBD9] bg-white px-3 py-3 sm:px-4">
                <span className={item.tone}>{item.icon}</span>
                <span className="text-sm font-semibold leading-5 text-[#1A2C25]">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#087443]">How It Works</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#142A21] sm:text-4xl">A clear path for every food rescue</h2>
              <p className="mt-4 text-base leading-7 text-[#4F6258]">From the first listing to the final handoff, each participant knows what comes next.</p>
            </div>
            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {steps.map((step) => (
                <article key={step.num} className="flex min-h-[220px] flex-col rounded-2xl border border-[#E1EAE0] bg-white p-5 shadow-[0_16px_30px_rgba(20,42,33,0.04)] sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#64746A]">{step.num}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDEBD9] bg-[#F4FBF6] text-[#087443]">{step.icon}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#142A21]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4F6258]">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="scroll-mt-24 border-y border-[#E1EAE0] bg-[#F7FBF7] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#087443]">Get involved</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-[#142A21] sm:text-4xl">One network, three ways to help</h2>
              </div>
              <p className="max-w-md text-base leading-7 text-[#4F6258]">Choose the role that fits how you want to support your community.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {roleFeatures.map((feature) => (
                <article key={feature.role} className={`flex min-h-[260px] flex-col rounded-2xl border p-6 shadow-[0_14px_24px_rgba(20,42,33,0.03)] sm:p-7 ${feature.accent}`}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DDEBD9] bg-white text-[#087443]">{feature.icon}</div>
                  <h3 className="mt-5 text-xl font-bold text-[#142A21]">{feature.role}</h3>
                  <p className="mt-1 text-sm font-medium text-[#4F6258]">{feature.tagline}</p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#4F6258]">{feature.description}</p>
                  <Link to={feature.ctaLink} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-[#CFE4D5] bg-white px-4 py-2.5 text-sm font-bold text-[#142A21] transition-colors hover:border-[#9CC3A9] hover:bg-[#F5FBF6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600">
                    {feature.ctaText} <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="safety" className="scroll-mt-24 px-5 py-12 sm:px-8 sm:py-14 lg:px-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-2xl border border-[#F0D6A0] bg-[#FFF8DC] p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E4C774] bg-[#FFF3C4] text-[#9A6300]"><AlertTriangle className="h-5 w-5" /></span>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#142A21] sm:text-xl">Food safety comes first</h2>
              <p className="mt-1 text-sm leading-6 text-[#4F6258]">Share accurate handling and allergen information, and coordinate collection within safe time and storage conditions. The platform supports coordination; food safety decisions remain with participating organizations.</p>
            </div>
            <Link to="/donor/register" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-[#E3D7B1] bg-white px-4 py-2 text-sm font-semibold text-[#142A21] transition-colors hover:bg-[#F5FBF6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:self-center">
              Donation guidance <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E1EAE0] bg-[#F9FBF8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <Link to="/" className="inline-flex items-center gap-3 self-start rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#087443] text-white"><Leaf className="h-4 w-4" /></span>
            <span className="text-sm font-bold text-[#142A21]">EcoShare AI</span>
            <span className="text-sm text-[#64746A]">© {new Date().getFullYear()}</span>
          </Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#4F6258]">
            <Link to="/login" className="rounded-sm hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600">Sign In</Link>
            <Link to="/donor/register" className="rounded-sm hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600">Donate Food</Link>
            <Link to="/ngo/register" className="rounded-sm hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600">NGO Registration</Link>
            <Link to="/login" className="rounded-sm hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600">Volunteer Portal</Link>
            <Link to="/ngos" className="rounded-sm hover:text-[#087443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600">NGO Directory</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
