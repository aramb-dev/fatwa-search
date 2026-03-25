import React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { Search, Plus, Share2 } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { Toaster, toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { translations } from "../translations"
import { FeedbackModal } from "./search/FeedbackModal"
import { SiteRequestModal } from "./search/SiteRequestModal"
import { FilterModal } from "./search/FilterModal"
import { SitePickerModal } from "./search/SitePickerModal"
import { searchCache } from "../lib/cache"
import PropTypes from "prop-types"
import { cn } from "../lib/utils"

const SITE_LABELS = {
  "binothaimeen.net": "Ibn Uthaimeen",
  "alfawzan.af.org.sa": "Al-Fawzan",
  "lohaidan.af.org.sa": "Al-Luhaydan",
  "binbaz.org.sa": "Ibn Baz",
  "al-badr.net": "Al-Badr",
  "obied-aljabri.com": "Al-Jabri",
  "aletioupi.com": "Aal Al-Shaikh",
  "miraath.net": "Miraath",
  "al-albany.com": "Al-Albani",
  "rabee.net": "Rabee",
}

export const DEFAULT_SITES = [
  "binothaimeen.net",
  "alfawzan.af.org.sa",
  "lohaidan.af.org.sa",
  "binbaz.org.sa",
  "al-badr.net",
  "obied-aljabri.com",
  "aletioupi.com",
  "miraath.net",
  "al-albany.com",
  "rabee.net",
]

export const ENGLISH_SITES = [
  "islamtees.wordpress.com",
  "bakkah.net",
  "greatrewards.abdurrahman.org",
  "authentic-dua.com",
  "thenoblequran.com",
  "sunnah.com",
  "salaf.com",
  "aqidah.com",
  "tawhidfirst.com",
  "abovethethrone.com",
  "manhaj.com",
  "salafis.com",
  "piousmuslim.com",
  "ibntaymiyyah.com",
  "themadkhalis.com",
  "wahhabis.com",
  "sahihalbukhari.com",
  "sahihmuslim.com",
  "nawawis40hadith.com",
  "fatwaislam.com",
  "learnaboutislam.co.uk",
  "salafisounds.com",
  "sunnahaudio.com",
  "sunnahradio.net",
  "troid.org",
  "bidah.com",
  "islamagainstextremism.com",
  "kharijites.com",
  "takfiris.com",
  "mutazilah.com",
  "asharis.com",
  "maturidis.com",
  "sayyidqutb.com",
  "ikhwanis.com",
  "barelwis.com",
  "shariah.ws",
  "dajjaal.com",
  "aboutatheism.net",
  "islamjesus.ws",
  "islammoses.com",
  "islaam.ca",
  "prophetmuhammad.name",
  "abukhadeejah.com",
  "embodyislam.org",
  "knowledgeofislamblog.wordpress.com",
  "miraathpubs.net",
  "mpubs.org",
  "dusunnah.com",
  "quran.com",
]

const resultsVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const SearchComponent = ({ language = "en" }) => {
  let t = translations[language]
  if (!t) {
    console.error("Missing translations for language:", language)
    t = translations.en
  }

  const resultsPerPage = 10

  const getErrorMessage = (error) => {
    const msg = error.message.toLowerCase()
    if (msg.includes("failed to fetch") || msg.includes("network"))
      return "Network error. Please check your internet connection and try again."
    if (msg.includes("quota") || msg.includes("limit"))
      return "Search quota exceeded. Please try again in a few minutes."
    if (msg.includes("timeout") || msg.includes("aborted"))
      return "Search timed out. Please try again with different keywords."
    if (msg.includes("invalid") || msg.includes("bad request"))
      return "Invalid search query. Please try different keywords."
    return "Search failed. Please try again or contact support if the problem persists."
  }

  const isEnglish = language === "en"
  const sitesForLanguage = isEnglish ? ENGLISH_SITES : DEFAULT_SITES

  const [searchQuery, setSearchQuery] = useState("")
  const [sites] = useState(sitesForLanguage)
  const [includeShamela, setIncludeShamela] = useState(false)
  const [includeAlmaany, setIncludeAlmaany] = useState(false)
  const [includeDorar, setIncludeDorar] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [siteInput, setSiteInput] = useState("")
  const [startIndex, setStartIndex] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedSites, setSelectedSites] = useState(sitesForLanguage)
  const [siteFilters, setSiteFilters] = useState([])
  const [activeModal, setActiveModal] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [searchParams] = useSearchParams()

  const initialLoadDoneRef = useRef(false)
  const abortControllerRef = useRef(null)

  const performSearch = useCallback(
    async (start, isNewSearch = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setLoading(true)
      try {
        const regularSites = selectedSites
        const specialSitesToSearch = [
          ...(includeShamela ? ["shamela.ws"] : []),
          ...(includeAlmaany ? ["almaany.com"] : []),
          ...(includeDorar ? ["dorar.net"] : []),
        ]

        const cacheKey = { query: searchQuery, sites: regularSites, special: specialSitesToSearch, start }
        const cachedResults = searchCache.get(cacheKey)

        if (cachedResults && isNewSearch) {
          setSearchResults(cachedResults)
          setHasMore(cachedResults.length >= resultsPerPage)
          setStartIndex(start + resultsPerPage)
          setLoading(false)
          toast(t.searchResultsDisclaimer, { duration: 5000, closeButton: true })
          return
        }

        let allResults = []

        const specialSearches = specialSitesToSearch.map(async (specialSite) => {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(searchQuery)}&site=${specialSite}&start=${start}&lang=${language}`,
            { signal },
          )
          const data = await response.json()
          if (data.error) {
            console.error(`Search error for ${specialSite}:`, data.error)
            return []
          }
          return data.items || []
        })

        const specialResults = await Promise.all(specialSearches)
        allResults = specialResults.flat()

        if (regularSites.length > 0) {
          const regularSiteQuery = regularSites.map((site) => `site:${site}`).join(" OR ")
          const combinedQuery = `(${regularSiteQuery}) ${searchQuery}`
          const regularResponse = await fetch(
            `/api/search?q=${encodeURIComponent(combinedQuery)}&start=${start}&lang=${language}`,
            { signal },
          )
          const regularData = await regularResponse.json()
          if (regularData.error) {
            console.error("Search error:", regularData.error)
            throw new Error(regularData.error)
          }
          if (regularData.items) {
            allResults = [...allResults, ...regularData.items]
          }
        }

        allResults.sort((a, b) => {
          const aIsDorar = a.link.includes("dorar.net")
          const bIsDorar = b.link.includes("dorar.net")
          if (aIsDorar && !bIsDorar) return -1
          if (!aIsDorar && bIsDorar) return 1
          const aIsSpecial = specialSitesToSearch.some((site) => a.link.includes(site))
          const bIsSpecial = specialSitesToSearch.some((site) => b.link.includes(site))
          return bIsSpecial - aIsSpecial
        })

        setSearchResults((prev) => {
          const newResults = isNewSearch ? allResults : [...prev, ...allResults]
          if (isNewSearch && allResults.length > 0) {
            searchCache.set(cacheKey, allResults)
          }
          return newResults
        })

        setHasMore(allResults.length >= resultsPerPage)
        setStartIndex(start + resultsPerPage)

        if (isNewSearch) {
          toast(t.searchResultsDisclaimer, { duration: 5000, closeButton: true })
        }
      } catch (error) {
        if (error.name === "AbortError") return
        console.error("Search failed:", error)
        toast.error(getErrorMessage(error), { duration: 7000, closeButton: true })
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    [searchQuery, selectedSites, includeShamela, includeAlmaany, includeDorar, t],
  )

  const debouncedSearch = useDebouncedCallback(() => {
    if (searchQuery.trim()) {
      setSearchResults([])
      setStartIndex(1)
      setHasMore(true)
      performSearch(1, true)
    }
  }, 500)

  useEffect(() => {
    const queryParam = searchParams?.get("q")
    if (queryParam && !initialLoadDoneRef.current) {
      setSearchQuery(queryParam)
      initialLoadDoneRef.current = true
      performSearch(1, true)
    }
  }, [searchParams, performSearch])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    debouncedSearch.cancel()
    setSearchResults([])
    setStartIndex(1)
    setHasMore(true)
    await performSearch(1, true)
  }

  const handleQueryChange = (e) => {
    setSearchQuery(e.target.value)
    debouncedSearch()
  }

  const openModal = (name) => setActiveModal(name)
  const closeModal = () => setActiveModal(null)

  const handleSiteRequest = async () => {
    if (!siteInput.trim()) {
      toast.error(t.pleaseEnterSite)
      return
    }
    const formData = new FormData()
    formData.append("form-name", "site-request")
    formData.append("requested-site", siteInput)
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
      setSiteInput("")
      closeModal()
      toast.success(t.requestSubmitted)
    } catch {
      toast.error(t.requestFailed)
    }
  }

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback")
      return
    }
    const formData = new FormData()
    formData.append("form-name", "feedback")
    formData.append("feedback", feedback)
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
      setFeedback("")
      closeModal()
      toast.success("Thank you for your feedback!")
    } catch {
      toast.error("Failed to submit feedback")
    }
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = new URL(window.location.href)
    url.searchParams.set("q", searchQuery)
    if (navigator.share) {
      navigator.share({ title: "Fatwa Search Results", text: `Search results for "${searchQuery}"`, url: url.toString() }).catch(console.error)
    } else {
      navigator.clipboard.writeText(url.toString())
      toast.success("Link copied to clipboard!")
    }
  }

  const toggleSite = (site) => {
    setSelectedSites((prev) =>
      prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site],
    )
  }

  const filteredResults = searchResults.filter((result) => {
    if (siteFilters.length === 0) return true
    return siteFilters.some((site) => result.link.includes(site))
  })

  const hasResults = filteredResults.length > 0
  const isLoading = loading && searchQuery
  const showEmptyState = searchQuery && !loading && !hasResults

  return (
    <>
      <Toaster position="top-center" />

      <div className="w-full max-w-3xl mx-auto px-4 pb-24">
        {/* Hero title — only shown before search */}
        {!searchQuery && !hasResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center pt-16 pb-8"
          >
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">{t.searchLabel}</h1>
            <p className="text-gray-500 text-sm">{t.searchDescription}</p>
          </motion.div>
        )}

        {/* Sticky search bar */}
        <div className={cn("sticky top-4 z-20", searchQuery && "pt-4")}>
          <form onSubmit={handleSearch}>
            {/* Input row */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full shadow-md px-3 py-2">
              {/* + Sites button */}
              <button
                type="button"
                onClick={() => openModal("sitePicker")}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0 transition-colors"
                aria-label="Select sites to search"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Query input */}
              <input
                value={searchQuery}
                onChange={handleQueryChange}
                placeholder={t.searchPlaceholder || "Ask anything"}
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base min-w-0"
                aria-label={t.searchPlaceholder}
                type="search"
                autoFocus
              />

              {/* Share button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label={t.share || "Share"}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  searchQuery.trim()
                    ? "bg-gray-900 hover:bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed",
                )}
                aria-label={t.searchAction}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Active site pills */}
          {searchQuery && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2 px-1">
              {selectedSites.length === sites.length && !includeShamela && !includeAlmaany && !includeDorar ? (
                <span className="text-xs text-gray-400 py-1">All {sites.length} sites</span>
              ) : (
                <>
                  {selectedSites.map((site) => (
                    <span key={site} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {SITE_LABELS[site] || site}
                    </span>
                  ))}
                  {includeShamela && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Shamela</span>}
                  {includeAlmaany && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Al-Maany</span>}
                  {includeDorar && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Dorar</span>}
                </>
              )}
              {searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={() => openModal("filter")}
                  className="text-xs text-blue-600 hover:underline py-0.5 ml-1"
                >
                  {t.filter}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="skeletons" variants={resultsVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                {[...new Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </motion.div>
            ) : hasResults ? (
              <motion.div key="results" variants={resultsVariants} initial="initial" animate="animate" exit="exit" className="divide-y divide-gray-100">
                {filteredResults.map((result, index) => (
                  <SearchResult
                    key={result.link}
                    result={result}
                    isNewResult={index >= filteredResults.length - resultsPerPage}
                  />
                ))}
              </motion.div>
            ) : showEmptyState ? (
              <motion.div key="empty" variants={resultsVariants} initial="initial" animate="animate" exit="exit" className="text-center py-16">
                <svg className="mx-auto h-10 w-10 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base font-medium text-gray-700 mb-1">{t.noResults}</h3>
                <p className="text-sm text-gray-400 mb-4">Try different keywords or select more sites</p>
                <button onClick={() => openModal("siteRequest")} className="text-sm text-blue-600 hover:underline">
                  Request a new site
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Load more */}
        {hasMore && searchResults.length > 0 && !loading && (
          <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            <Button
              onClick={() => performSearch(startIndex)}
              disabled={loading}
              variant="outline"
              className="shadow-lg bg-white hover:bg-gray-50"
            >
              {t.loadMore}
            </Button>
            <Button
              variant="outline"
              onClick={() => openModal("feedback")}
              className="shadow-lg bg-white hover:bg-gray-50"
            >
              {t.provideFeedback}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-6 border-t text-center text-xs text-gray-400 space-x-2">
          <span>{t.createdBy}</span>
          <a href="https://github.com/aramb-dev" className="hover:text-gray-600 underline" target="_blank" rel="noreferrer">
            عبد من عباد الله
          </a>
          <span>·</span>
          <a href="https://github.com/aramb-dev/fatwa-search" className="hover:text-gray-600 underline" target="_blank" rel="noreferrer">
            {t.viewOnGithub}
          </a>
          <span>·</span>
          <button onClick={() => openModal("feedback")} className="hover:text-gray-600 underline">
            {t.provideFeedback}
          </button>
        </div>
      </div>

      <SitePickerModal
        isOpen={activeModal === "sitePicker"}
        onClose={closeModal}
        sites={sites}
        selectedSites={selectedSites}
        setSelectedSites={setSelectedSites}
        includeShamela={includeShamela}
        setIncludeShamela={setIncludeShamela}
        includeAlmaany={includeAlmaany}
        setIncludeAlmaany={setIncludeAlmaany}
        includeDorar={includeDorar}
        setIncludeDorar={setIncludeDorar}
        translations={t}
        onRequestSite={() => openModal("siteRequest")}
        isEnglish={isEnglish}
      />

      <AnimatePresence mode="wait">
        <FeedbackModal
          isOpen={activeModal === "feedback"}
          onClose={closeModal}
          feedback={feedback}
          setFeedback={setFeedback}
          onSubmit={handleFeedbackSubmit}
          translations={t}
        />
        <SiteRequestModal
          isOpen={activeModal === "siteRequest"}
          onClose={closeModal}
          siteInput={siteInput}
          setSiteInput={setSiteInput}
          onSubmit={handleSiteRequest}
          translations={t}
        />
        {searchResults.length > 0 && (
          <FilterModal
            isOpen={activeModal === "filter"}
            onClose={closeModal}
            searchResults={searchResults}
            siteFilters={siteFilters}
            setSiteFilters={setSiteFilters}
            translations={t}
          />
        )}
      </AnimatePresence>
    </>
  )
}

const SearchResult = React.memo(({ result, isNewResult }) => {
  let hostname = ""
  let breadcrumb = ""

  try {
    const url = new URL(result.link)
    hostname = url.hostname.replace(/^www\./, "")
    const parts = url.pathname.split("/").filter(Boolean)
    breadcrumb = parts.length > 0 ? [hostname, ...parts].join(" › ") : hostname
  } catch {
    hostname = result.link
    breadcrumb = result.link
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`

  return (
    <motion.div
      initial={isNewResult ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isNewResult ? 0.05 : 0 }}
      className="py-4 group"
    >
      {/* Source line */}
      <div className="flex items-center gap-2 mb-1">
        <img
          src={faviconUrl}
          alt=""
          className="w-4 h-4 rounded-full flex-shrink-0"
          onError={(e) => { e.target.style.display = "none" }}
        />
        <span className="text-sm text-gray-700 truncate">{breadcrumb}</span>
      </div>

      {/* Title */}
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1a0dab] hover:underline text-xl font-normal leading-snug block mb-1 group-hover:text-[#1a0dab]"
      >
        {result.title}
      </a>

      {/* Snippet */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{result.snippet}</p>
    </motion.div>
  )
})

SearchResult.propTypes = {
  result: PropTypes.shape({
    link: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    snippet: PropTypes.string.isRequired,
  }).isRequired,
  isNewResult: PropTypes.bool,
}

SearchResult.displayName = "SearchResult"

export default SearchComponent
