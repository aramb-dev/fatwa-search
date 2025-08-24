"use client";

import { use, Suspense } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import YoutubeSearch from "../../../components/Youtube-Search";
import { translations } from "../../../translations";

function YoutubeSearchComponent({ params }) {
  const { lang } = use(params);
  return <YoutubeSearch language={lang} translations={translations[lang]} />;
}

export default function YtSearchPage({ params }) {
  return (
    <Tabs.Content value="youtube">
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <YoutubeSearchComponent params={params} />
      </Suspense>
    </Tabs.Content>
  );
}
