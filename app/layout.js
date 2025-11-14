import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata = {
  title: "Fatwa Search - بحث شامل",
  description:
    "Search the Mashayikh sites for your keyword - ابحث في مواقع المشايخ باستخدام الكلمات المفتاحية الخاصة بك",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
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

        {/* Netlify Forms - Hidden forms for detection at build time */}
        <form name="site-request" data-netlify="true" hidden>
          <input type="text" name="requested-site" />
        </form>
        <form name="feedback" data-netlify="true" hidden>
          <textarea name="feedback"></textarea>
        </form>
        <form name="youtube-channel-request" data-netlify="true" hidden>
          <input type="text" name="channel-url" />
        </form>
      </body>
    </html>
  );
}
