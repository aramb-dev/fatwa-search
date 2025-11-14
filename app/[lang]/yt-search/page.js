import PropTypes from "prop-types";
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

YtSearchPage.propTypes = {
  params: PropTypes.shape({
    lang: PropTypes.string,
  }).isRequired,
};
