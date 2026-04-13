import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata = {
  title: "Ilm Search - بحث العلم",
  description:
    "Search Islamic knowledge across verified scholar sites and curated YouTube channels from the Mashāyikh - ابحث في مواقع المشايخ وقنوات اليوتيوب الموثوقة",
  metadataBase: new URL("https://is-search.aramb.dev"),
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
  openGraph: {
    title: "Ilm Search - بحث العلم",
    description:
      "Search Islamic knowledge across verified scholar sites and curated YouTube channels from the Mashāyikh",
    url: "https://is-search.aramb.dev",
    siteName: "Ilm Search",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ilm Search - بحث العلم",
    description:
      "Search Islamic knowledge across verified scholar sites and curated YouTube channels from the Mashāyikh",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Microsoft Clarity */}
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
          `}
        </Script>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-20KVLCSQEJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-20KVLCSQEJ');
          `}
        </Script>
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
