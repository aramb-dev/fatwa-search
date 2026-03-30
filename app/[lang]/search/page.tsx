"use client";

import { use, Suspense } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import Search from "../../../components/Search";
import type { Language } from "../../../lib/types";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../../../lib/constants";

function toLanguage(lang: string): Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
    ? (lang as Language)
    : DEFAULT_LANGUAGE;
}

function SearchComponent({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <Search language={toLanguage(lang)} />;
}

export default function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
  return (
    <Tabs.Content value="search">
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <SearchComponent params={params} />
      </Suspense>
    </Tabs.Content>
  );
}
