"use client";

import PropTypes from "prop-types";
import YoutubeSearch from "../../../components/Youtube-Search";
import { translations } from "../../../translations";

export default function YtSearchClient({ lang }) {
  return <YoutubeSearch language={lang} translations={translations[lang]} />;
}

YtSearchClient.propTypes = {
  lang: PropTypes.string.isRequired,
};
