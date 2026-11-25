'use client';

import { MotionConfig } from 'framer-motion';

/** Framer Motion animations follow the device's "reduce motion" setting. */
export function MotionPrefs({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** First stop for keyboard users: jumps past the menus to the page's main content. */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={(event) => {
        const main = document.querySelector('main');
        if (!main) return;
        event.preventDefault();
        if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
        main.focus();
        main.scrollIntoView();
      }}
    >
      Skip to main content
    </a>
  );
}
