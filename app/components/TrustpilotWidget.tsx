"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

/* Trustpilot Review Collector widget — gowoker.com */
export default function TrustpilotWidget() {
  const ref = useRef<HTMLDivElement>(null);
  const render = () => {
    const w = window as unknown as {
      Trustpilot?: { loadFromElement(el: Element, sync: boolean): void };
    };
    if (w.Trustpilot && ref.current) w.Trustpilot.loadFromElement(ref.current, true);
  };
  useEffect(() => {
    render();
  }, []);
  return (
    <>
      <Script
        src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="afterInteractive"
        onLoad={render}
      />
      <div
        ref={ref}
        className="trustpilot-widget"
        data-locale="en-US"
        data-template-id="56278e9abfbbba0bdcd568bc"
        data-businessunit-id="69b554da9b7a4e60b379cddc"
        data-style-height="52px"
        data-style-width="100%"
      >
        <a
          href="https://www.trustpilot.com/review/gowoker.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Trustpilot
        </a>
      </div>
    </>
  );
}
