export type Language = "en" | "ar";

export type SearchMode = "scholars" | "shamela" | "dorar" | "almaany";

export interface SearchResultItem {
  link: string;
  title: string;
  snippet: string;
}

export interface VideoSnippet {
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnails: {
    medium: {
      url: string;
    };
  };
}

export interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: VideoSnippet;
}

export interface Translation {
  search: string;
  youtubeSearch: string;
  searchLabel: string;
  searchDescription: string;
  searchPlaceholder: string;
  arabicTip: string;
  requestSite: string;
  searchShamela: string;
  searchAlmaany: string;
  searchDorar: string;
  searching: string;
  searchAction: string;
  share: string;
  filter: string;
  selectSites: string;
  done: string;
  selectAll: string;
  selectNone: string;
  allSites: string;
  loadMore: string;
  loading: string;
  provideFeedback: string;
  closeFeedback: string;
  feedbackPlaceholder: string;
  cancel: string;
  submit: string;
  noResults: string;
  filterResults: string;
  filterByChannel: string;
  clearFilters: string;
  close: string;
  createdBy: string;
  viewOnGithub: string;
  searchResultsDisclaimer: string;
  requestNewSite: string;
  enterSiteDomain: string;
  siteUrlPlaceholder: string;
  feedbackDescription: string;
  filterBySite: string;
  loadMoreTip: string;
  selectTooltip: string;
  feedbackSubmit: string;
  submitRequest: string;
  pleaseEnterSite: string;
  requestSubmitted: string;
  requestFailed: string;
  requestChannel: string;
  viewOnYoutube: string;
  requestScholar: string;
  enterScholarName: string;
  pasteYoutubeLink: string;
  errorNetwork: string;
  errorQuota: string;
  errorTimeout: string;
  errorInvalid: string;
  errorGeneric: string;
  pleaseEnterFeedback: string;
  feedbackSuccess: string;
  feedbackFailed: string;
  shareTitleFatwa: string;
  shareText: string;
  linkCopied: string;
  newBadge: string;
  v3Announcement: string;
  tryDifferentKeywords: string;
  tabAll: string;
  tabScholars: string;
  tabLibraries: string;
  xOfYSelected: string;
  andNMore: string;
  modeScholars: string;
  modeShamela: string;
  modeDorar: string;
  modeAlmaany: string;
  v3WhatsNew: string;
  v3Feature1Title: string;
  v3Feature1Desc: string;
  v3Feature2Title: string;
  v3Feature2Desc: string;
  v3Feature3Title: string;
  v3Feature3Desc: string;
  gotIt: string;
  ytEnglishComingSoon: string;
}

export type Translations = Record<Language, Translation>;
