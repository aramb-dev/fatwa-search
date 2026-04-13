import type { Metadata } from "next"
import LanguageShell from "./_components/LanguageShell"
import type { Language } from "../../lib/types"
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../../lib/constants"

const BASE_URL = "https://search.aramb.dev"

function toLanguage(lang: string): Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
    ? (lang as Language)
    : DEFAULT_LANGUAGE
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const language = toLanguage(lang)

  const isAr = language === "ar"
  const title = isAr ? "بحث العلم" : "Ilm Search"
  const description = isAr
    ? "ابحث في مواقع المشايخ وقنوات اليوتيوب الموثوقة باستخدام الكلمات المفتاحية الخاصة بك"
    : "Search Islamic knowledge across verified scholar sites and curated YouTube channels from the Mashāyikh"

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${language}/search`,
      languages: {
        en: `${BASE_URL}/en/search`,
        ar: `${BASE_URL}/ar/search`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${language}/search`,
      locale: isAr ? "ar_SA" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_SA",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = toLanguage(lang)

  return <LanguageShell language={language}>{children}</LanguageShell>
}
