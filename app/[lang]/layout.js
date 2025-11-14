import LanguageLayoutClient from "./LanguageLayoutClient";

// Server component that handles async params
export default async function LanguageLayout({ children, params }) {
  const { lang } = await params;
  return <LanguageLayoutClient children={children} lang={lang} />;
}
