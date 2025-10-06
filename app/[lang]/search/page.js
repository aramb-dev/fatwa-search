"use client";

// Removed experimental use() hook - not needed for simple param extraction
import { Suspense } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import Search from "../../../components/Search";
import { translations } from "../../../translations";

function SearchComponent({ params }) {
  const { lang } = params;
  return <Search language={lang} translations={translations[lang]} />;
}

export default function SearchPage({ params }) {
  return (
    <Tabs.Content value="search">
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <SearchComponent params={params} />
      </Suspense>
    </Tabs.Content>
  );
}
