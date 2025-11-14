import PropTypes from "prop-types";
import LanguageLayoutClient from "./LanguageLayoutClient";

// Server component that handles async params
export default async function LanguageLayout({ children, params }) {
  const { lang } = await params;
  return <LanguageLayoutClient lang={lang}>{children}</LanguageLayoutClient>;
}

LanguageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  params: PropTypes.shape({
    lang: PropTypes.string,
  }).isRequired,
};
