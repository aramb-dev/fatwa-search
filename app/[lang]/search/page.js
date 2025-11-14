import * as Tabs from "@radix-ui/react-tabs";
import SearchClient from "./SearchClient";

export default async function SearchPage({ params }) {
  const { lang } = await params;
  return (
    <Tabs.Content value="search">
      <SearchClient lang={lang} />
    </Tabs.Content>
  );
}
