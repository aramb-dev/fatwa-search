import * as Tabs from "@radix-ui/react-tabs";
import YtSearchClient from "./YtSearchClient";

export default async function YtSearchPage({ params }) {
  const { lang } = await params;
  return (
    <Tabs.Content value="youtube">
      <YtSearchClient lang={lang} />
    </Tabs.Content>
  );
}
