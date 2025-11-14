"use client";

import PropTypes from "prop-types";
import Search from "../../../components/Search";
import { translations } from "../../../translations";

export default function SearchClient({ lang }) {
  return <Search language={lang} translations={translations[lang]} />;
}

SearchClient.propTypes = {
  lang: PropTypes.string.isRequired,
};
