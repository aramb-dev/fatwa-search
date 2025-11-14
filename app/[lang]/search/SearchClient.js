"use client";

import Search from "../../../components/Search";
import { translations } from "../../../translations";

export default function SearchClient({ lang }) {
  return <Search language={lang} translations={translations[lang]} />;
}
