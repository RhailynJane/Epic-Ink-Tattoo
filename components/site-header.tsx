"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/editable";
import { useSiteContent } from "@/lib/use-site-content";

const navLinks = [
  { label: "Why Us", href: "/#why-us" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/#about" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { get } = useSiteContent();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="font-serif text-xl font-bold text-primary tracking-wide">
          <EditableText section="header" k="brand" as="span" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary uppercase tracking-wider"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={get("header", "phoneHref")}
            className="flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80"
          >
            <Phone className="h-4 w-4" />
            <EditableText section="header" k="phone" as="span" />
          </a>
          <Button
            asChild
            className="border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <a href="#contact">{get("header", "ctaLabel")}</a>
          </Button>
        </div>

        <button
          className="text-foreground lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-b border-border bg-background/95 backdrop-blur-sm lg:hidden">
          <nav className="flex flex-col gap-4 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary uppercase tracking-wider"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={get("header", "phoneHref")}
              className="flex items-center gap-2 text-sm text-primary"
            >
              <Phone className="h-4 w-4" />
              <span>{get("header", "phone")}</span>
            </a>
            <Button
              asChild
              className="w-full border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>
                {get("header", "ctaLabel")}
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
