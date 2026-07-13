import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CartIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";

const LINKS = [
  { href: "#story", label: "Our story" },
  { href: "#shop", label: "Shop" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the mobile menu from surviving a viewport resize past the
  // breakpoint where it's hidden (e.g. rotating a tablet).
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    event.preventDefault();
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || mobileOpen
          ? "bg-char-950/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(231,165,60,0.15)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, "#top")}
          className="flex items-center gap-3"
        >
          <span className="relative h-10 w-24 overflow-hidden rounded-lg">
            <Image
              src="/assets/logo.png"
              alt=""
              fill
              sizes="96px"
              className="object-cover object-top"
              priority
            />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.14em] text-cream-50">
            HANAWARI
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm text-cream-50/75 transition-colors hover:text-gold-400"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/orders"
              className="text-sm text-cream-50/75 transition-colors hover:text-gold-400"
            >
              My orders
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/15 text-cream-50 transition-colors hover:border-gold-400 hover:text-gold-400"
          >
            <CartIcon className="h-5 w-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-600 px-1 text-[11px] font-bold text-cream-50"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/15 text-cream-50 transition-colors hover:border-gold-400 hover:text-gold-400 md:hidden"
          >
            {mobileOpen ? <CloseIcon className="h-4.5 w-4.5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-cream-50/10 bg-char-950/95 backdrop-blur-md md:hidden"
          >
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block px-5 py-3.5 text-sm text-cream-50/85 hover:bg-cream-50/5 hover:text-gold-400 sm:px-8"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/orders"
                onClick={() => setMobileOpen(false)}
                className="block px-5 py-3.5 text-sm text-cream-50/85 hover:bg-cream-50/5 hover:text-gold-400 sm:px-8"
              >
                My orders
              </Link>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
