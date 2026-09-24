"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Microsoft Clarity (heatmaps + session recordings). Loaded lazily after the page is idle
 * so it never competes with first paint, and never on the admin portal (lead data is private).
 */
export function Clarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const pathname = usePathname();

  if (!projectId || !/^[a-z0-9]+$/i.test(projectId) || pathname?.startsWith("/admin")) return null;

  return (
    <Script id="ms-clarity" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${projectId}");`}
    </Script>
  );
}
