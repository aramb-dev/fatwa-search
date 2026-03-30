"use client";

import { use, Suspense } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import YoutubeSearch from "../../../components/YoutubeSearch";
import type { Language } from "../../../lib/types";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../../../lib/constants";

function toLanguage(lang: string): Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
    ? (lang as Language)
    : DEFAULT_LANGUAGE;
}

function YoutubeSearchComponent({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <YoutubeSearch language={toLanguage(lang)} />;
}

export default function YtSearchPage({ params }: { params: Promise<{ lang: string }> }) {
  return (
    <Tabs.Content value="youtube">
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <YoutubeSearchComponent params={params} />
      </Suspense>
    </Tabs.Content>
  );
}
