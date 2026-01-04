'use client';

import {
  ArrowRight,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// FixMate Logo
export const FixMateLogo = () => (
  <Link href="/" className="flex items-center gap-2.5">
    <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
      <Wrench className="size-5 text-white" />
    </div>
    <span className="text-xl font-bold tracking-tight">FixMate</span>
  </Link>
);

// Navigation
export const PublicNavigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass fixed inset-x-0 top-0 z-50 border-b border-border/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <FixMateLogo />

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link href="/guide" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Guide
          </Link>
          <Link href="/wishlist" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Roadmap
          </Link>
          <Link href="/plans" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Plans
          </Link>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-transparent px-5 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-6 bg-foreground transition-transform ${mobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-6 bg-foreground transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-foreground transition-transform ${mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="glass border-t border-border/50 md:hidden">
          <div className="flex flex-col gap-4 p-6">
            <Link href="/features" className="text-sm font-medium text-muted-foreground">Features</Link>
            <Link href="/faq" className="text-sm font-medium text-muted-foreground">FAQ</Link>
            <Link href="/guide" className="text-sm font-medium text-muted-foreground">Guide</Link>
            <Link href="/wishlist" className="text-sm font-medium text-muted-foreground">Roadmap</Link>
            <Link href="/plans" className="text-sm font-medium text-muted-foreground">Plans</Link>
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground">Sign In</Link>
            <Link href="/sign-up" className="text-sm font-medium text-primary">Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// Footer
export const PublicFooter = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
      <FixMateLogo />

      <div className="flex flex-wrap items-center justify-center gap-6">
        <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
        <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
        <Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground">Guide</Link>
        <Link href="/wishlist" className="text-sm text-muted-foreground hover:text-foreground">Roadmap</Link>
        <Link href="/plans" className="text-sm text-muted-foreground hover:text-foreground">Plans</Link>
      </div>

      <p className="text-sm text-muted-foreground">
        ©
        {' '}
        {new Date().getFullYear()}
        {' '}
        FixMate. All rights reserved.
      </p>
    </div>
  </footer>
);

// CTA Banner
export const CTABanner = () => (
  <section className="bg-foreground py-16 text-background">
    <div className="mx-auto max-w-3xl px-6 text-center">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        Ready to streamline your property maintenance?
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-white/70">
        Join property managers who are saving time and money with AI-powered maintenance triage.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/#demo"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-white transition-all hover:bg-primary/90"
        >
          Book a Demo
          <ArrowRight className="size-5" />
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 font-semibold text-white transition-all hover:bg-white/10"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  </section>
);

// Page Layout Wrapper
export const PublicPageLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-screen bg-background">
    <PublicNavigation />
    <div className="pt-20">
      {children}
    </div>
    <PublicFooter />
  </main>
);
