# Code Review Report - Fatwa Search

**Review Date:** 2025-11-13
**Reviewer:** Claude Code
**Repository:** https://github.com/aramb-dev/fatwa-search

---

## Executive Summary

Fatwa Search is a well-architected Next.js 15 application that provides a curated Islamic knowledge search experience. The codebase demonstrates good modern practices with React 19, proper component organization, and internationalization support. However, there are several critical issues related to security, code quality, and maintainability that should be addressed.

**Overall Assessment:** Good foundation with room for significant improvement

---

## 1. Critical Issues 🔴

### 1.1 Security Vulnerabilities

#### API Keys Exposed to Client
**Severity:** Critical
**Location:** All API calls in components

**Issue:**
```javascript
// components/Search.js:186-190
const specialSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY
}&cx=${process.env.NEXT_PUBLIC_SEARCH_ENGINE_ID}&q=...`;
```

**Problem:** Using `NEXT_PUBLIC_` prefix exposes API keys in the client bundle, making them visible to anyone. This allows:
- API quota theft
- Unauthorized usage
- Potential billing fraud

**Recommendation:** Create API routes in `app/api/` to proxy Google API calls server-side.

```javascript
// app/api/search/route.js (suggested)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  // Make API call server-side with keys from server-only env vars
}
```

#### No Input Sanitization
**Severity:** High
**Location:** components/Search.js:336-356, components/Youtube-Search.js:162-217

**Issue:** User inputs from feedback forms and site requests are not sanitized before submission.

**Recommendation:** Add input validation and sanitization library like DOMPurify or validator.js.

### 1.2 Code Bugs

#### Unused State Variable
**Severity:** Medium
**Location:** components/Search.js:149

```javascript
const [setIsModalOpen] = useState(false);  // Line 149
```

**Problem:** This state setter is defined but never properly used. Line 350 calls `setIsModalOpen(false)` but the getter is missing, so this will always throw an error.

**Fix:**
```javascript
const [isModalOpen, setIsModalOpen] = useState(false);
```

#### Duplicate useEffect Hooks
**Severity:** Medium
**Location:** components/Youtube-Search.js:138-160

**Problem:** Two useEffect hooks handle URL params with similar logic, causing potential race conditions and duplicate searches.

```javascript
// Lines 138-151
useEffect(() => {
  const queryParam = searchParams?.get("q");
  if (queryParam && !initialLoadDoneRef.current) {
    // ... trigger search
  }
}, [searchParams, performYoutubeSearch]);

// Lines 154-160 - DUPLICATE
useEffect(() => {
  const queryParam = searchParams?.get("q");
  if (queryParam && window.location.pathname === "/yt-search") {
    // ... trigger search again
  }
}, [searchParams, performYoutubeSearch]);
```

**Fix:** Consolidate into a single useEffect with proper conditions.

#### Conflicting Modal States
**Severity:** Medium
**Location:** components/Youtube-Search.js:397-473

**Problem:** Both "Scholar Request" modal (line 399) and "Channel Request" modal (line 437) check the same state variable `showRequestModal`, meaning both modals render simultaneously.

**Fix:** Use separate state variables or an activeModal pattern like in Search.js.

---

## 2. Code Quality Issues 🟡

### 2.1 Component Size

**Issue:** Components are too large and violate Single Responsibility Principle.

- `components/Search.js`: **886 lines** - Should be broken into:
  - `SearchComponent` (main)
  - `SearchResult` (already extracted)
  - `SiteFilters`
  - `FeedbackModal`
  - `SiteRequestModal`
  - `FilterModal`

- `components/Youtube-Search.js`: **575 lines** - Should be broken into:
  - `YoutubeSearch` (main)
  - `VideoGrid`
  - `VideoModal`
  - `ScholarRequestModal`
  - `ChannelRequestModal`

**Recommendation:** Extract modals and complex UI sections into separate components.

### 2.2 Inconsistent Translation Usage

**Location:** Multiple files

**Issue:** Some strings are hardcoded while others use translations:

```javascript
// Search.js:362 - HARDCODED
if (!feedback.trim()) {
  toast.error("Please enter your feedback");
  return;
}

// Search.js:336 - Uses translation
if (!siteInput.trim()) {
  toast.error(t.pleaseEnterSite);
  return;
}
```

**Other hardcoded strings:**
- Line 378: "Thank you for your feedback!"
- Line 380: "Failed to submit feedback"
- Line 526-527: "Tap &ldquo;Select Sites&rdquo;..." (mobile instruction)
- Line 710: "Submit Feedback"

**Recommendation:** Add all strings to `translations.js` for consistency.

### 2.3 Console Statements in Production

**Location:** components/Search.js

```javascript
// Lines 195, 197, 223-227
console.log(`Searching ${specialSite}:`, specialData);
console.warn(`No results found for ${specialSite}`);
console.log("Special sites to search:", specialSitesToSearch);
console.log("Before sorting:", allResults.map((r) => r.link));
console.log("After sorting:", allResults.map((r) => r.link));
```

**Recommendation:** Remove or replace with proper logging library that can be disabled in production.

### 2.4 Missing PropTypes

**Issue:** Some components lack prop validation.

- `CustomDialogContent` (Search.js:66)
- `DialogHeader` (Search.js:95)
- `CustomDialogTitle` (Search.js:101)
- `DialogFooter` (Search.js:107)
- `YoutubeSearch` component (Youtube-Search.js:49)

**Recommendation:** Add PropTypes or migrate to TypeScript for better type safety.

---

## 3. Performance Issues ⚡

### 3.1 No Search Debouncing

**Issue:** Search executes immediately on form submit without debouncing. If auto-search is added later, this could cause excessive API calls.

**Recommendation:** Add debouncing with `lodash.debounce` or `use-debounce` hook:

```javascript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (query) => performSearch(1, true),
  500
);
```

### 3.2 No Result Caching

**Issue:** Repeated searches for the same query hit the API every time.

**Recommendation:** Implement simple caching:
- Use React Query or SWR for automatic caching
- Or implement simple Map-based cache with TTL

### 3.3 No Request Cancellation

**Issue:** If user quickly changes search terms, old requests are not cancelled, leading to race conditions.

**Recommendation:** Use AbortController:

```javascript
const performSearch = useCallback(async (start, isNewSearch = false) => {
  const controller = new AbortController();

  try {
    const response = await fetch(url, { signal: controller.signal });
    // ...
  } catch (error) {
    if (error.name === 'AbortError') return;
    // handle error
  }

  return () => controller.abort();
}, [dependencies]);
```

### 3.4 Sequential API Calls

**Location:** components/Search.js:185-203

**Issue:** Special sites are searched sequentially in a for loop instead of in parallel:

```javascript
for (const specialSite of specialSitesToSearch) {
  const specialResponse = await fetch(specialSearchUrl);  // Sequential!
  // ...
}
```

**Fix:** Use Promise.all like the YouTube search does:

```javascript
const specialSearches = specialSitesToSearch.map(site =>
  fetch(specialSearchUrl).then(r => r.json())
);
const specialResults = await Promise.all(specialSearches);
```

---

## 4. Architecture & Design 🏗️

### 4.1 Missing Error Boundaries

**Issue:** No React error boundaries to catch component errors gracefully.

**Recommendation:** Add error boundary wrapper:

```javascript
// components/ErrorBoundary.js
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 4.2 Inconsistent Modal Patterns

**Issue:** Search.js uses custom modal components inline, while these should be in `components/ui/dialog.jsx`.

**Recommendation:** Standardize on shadcn/ui Dialog pattern or extract to reusable components.

### 4.3 Utility Function Organization

**Issue:** Helper function `isMobile()` is defined inline (Search.js:358) instead of in `lib/utils.js`.

**Recommendation:** Move to utils:

```javascript
// lib/utils.js
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};
```

---

## 5. Testing Issues 🧪

### 5.1 No Test Files

**Severity:** High
**Issue:** Testing libraries are installed (@testing-library/react, jest-dom) but no test files exist.

**Recommendation:** Add tests for:
- Search component behavior
- Modal interactions
- API error handling
- Language switching
- Site filtering logic

Example structure:
```
__tests__/
  components/
    Search.test.js
    Youtube-Search.test.js
  lib/
    utils.test.js
```

### 5.2 Missing Test Configuration

**Issue:** `package.json` has `"test": "jest"` script but no jest.config.js exists.

**Recommendation:** Add jest configuration:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

---

## 6. Accessibility Issues ♿

### 6.1 Missing ARIA Labels

**Issue:** Some interactive elements lack proper ARIA labels:

- Filter button (Search.js:510)
- Share button (Search.js:490)
- Site selection buttons (Search.js:582)

**Recommendation:** Add descriptive ARIA labels:

```javascript
<Button
  aria-label={`Share search results for ${searchQuery}`}
  onClick={handleShare}
>
  <Share2 className="h-4 w-4" />
  {t.share}
</Button>
```

### 6.2 Focus Management in Modals

**Issue:** When modals open, focus is not properly managed. Users should be trapped inside the modal.

**Recommendation:** Use Radix UI's focus trap or react-focus-lock.

### 6.3 Keyboard Navigation

**Issue:** Site selection requires Shift+Click for multi-select, but no keyboard alternative exists.

**Recommendation:** Add keyboard shortcuts documentation and implement Space/Enter for selection.

---

## 7. UX Improvements 🎨

### 7.1 Loading States

**Issue:** Basic loading states with no skeleton screens make the UI feel slower.

**Recommendation:** Add skeleton loaders:

```javascript
{loading ? (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-24 w-full" />
    ))}
  </div>
) : (
  // results
)}
```

### 7.2 Empty States

**Issue:** "No results" message is minimal (Search.js:647).

**Recommendation:** Add helpful empty state:
- Suggestions for refining search
- Common search examples
- Link to request new sites

### 7.3 Error Handling

**Issue:** Generic error messages don't help users:

```javascript
// Search.js:265
toast.error("Search failed: " + error.message);
```

**Recommendation:** Provide actionable error messages:
- Quota exceeded → "Try again in a few minutes"
- Network error → "Check your connection"
- Invalid query → "Try different keywords"

---

## 8. Documentation Issues 📚

### 8.1 Missing JSDoc Comments

**Issue:** Functions lack documentation explaining parameters and behavior.

**Recommendation:** Add JSDoc:

```javascript
/**
 * Performs a search across configured scholar websites
 * @param {number} start - The starting index for pagination
 * @param {boolean} isNewSearch - Whether this is a new search or loading more results
 * @returns {Promise<void>}
 */
const performSearch = useCallback(async (start, isNewSearch = false) => {
  // ...
}, [dependencies]);
```

### 8.2 Component Documentation

**Issue:** Complex components lack usage examples.

**Recommendation:** Add README sections explaining:
- How to add new scholar sites
- How to add new YouTube channels
- Translation workflow
- Environment variable setup

---

## 9. Positive Highlights ✅

### What's Working Well

1. **Modern Stack**: Excellent use of Next.js 15, React 19, and latest tooling
2. **Accessibility Foundation**: Radix UI primitives provide solid WCAG compliance
3. **Animation Quality**: Smooth Framer Motion animations enhance UX
4. **Internationalization**: Proper i18n structure with RTL support
5. **Component Extraction**: SearchResult is properly memoized (Search.js:850)
6. **Responsive Design**: Mobile-first approach with proper breakpoints
7. **Form Handling**: Netlify Forms integration is clean
8. **Git Workflow**: Good PR templates, issue templates, and Dependabot setup
9. **Code Style**: ESLint + Prettier ensure consistent formatting
10. **Documentation**: Comprehensive README, CONTRIBUTING, and CODE_OF_CONDUCT

---

## 10. Recommendations by Priority

### High Priority (Fix First)

1. ✅ Move API keys server-side via Next.js API routes
2. ✅ Fix unused state variable in Search.js:149
3. ✅ Fix duplicate useEffect in Youtube-Search.js
4. ✅ Fix conflicting modal states in Youtube-Search.js
5. ✅ Add comprehensive test coverage
6. ✅ Remove console.log statements
7. ✅ Add error boundaries

### Medium Priority (Important Improvements)

8. ✅ Break large components into smaller ones
9. ✅ Add missing translations for hardcoded strings
10. ✅ Implement search debouncing
11. ✅ Add result caching with React Query/SWR
12. ✅ Implement request cancellation
13. ✅ Fix sequential API calls to be parallel
14. ✅ Add loading skeleton screens
15. ✅ Improve error messages

### Low Priority (Nice to Have)

16. ✅ Migrate to TypeScript for type safety
17. ✅ Add PropTypes to all components
18. ✅ Improve empty states with suggestions
19. ✅ Add ARIA labels to all interactive elements
20. ✅ Add JSDoc comments
21. ✅ Extract animation variants to shared constants
22. ✅ Move utility functions to lib/utils.js
23. ✅ Add offline support with service worker
24. ✅ Implement infinite scroll as alternative to "Load More"

---

## 11. Code Metrics

### Component Complexity

| File | Lines | Complexity | Recommendation |
|------|-------|------------|----------------|
| Search.js | 886 | High | Split into 5-6 components |
| Youtube-Search.js | 575 | High | Split into 4-5 components |
| layout.js ([lang]) | 151 | Medium | Acceptable |

### Test Coverage

| Category | Current | Target |
|----------|---------|--------|
| Unit Tests | 0% | 70%+ |
| Integration Tests | 0% | 50%+ |
| E2E Tests | 0% | 30%+ |

### Bundle Analysis Recommendations

- Analyze bundle with `@next/bundle-analyzer`
- Consider code splitting for modals
- Lazy load Framer Motion if needed
- Optimize image loading strategy

---

## 12. Security Checklist

- [ ] API keys moved server-side
- [ ] Input sanitization implemented
- [ ] CSRF protection for forms
- [ ] Rate limiting on API routes
- [ ] Content Security Policy headers
- [ ] Dependency vulnerability scan (run `npm audit`)
- [ ] Environment variable validation
- [ ] XSS protection in user-generated content

---

## 13. Conclusion

The Fatwa Search codebase demonstrates strong fundamentals with modern React patterns and good project organization. The primary concerns are:

1. **Security**: API keys must be protected server-side
2. **Bugs**: Several state management issues need fixing
3. **Testing**: Critical gap in test coverage
4. **Code Size**: Components need to be split for maintainability

With these improvements, this could be an excellent reference implementation for Next.js 15 applications.

### Estimated Effort

- Critical fixes: 8-16 hours
- High priority improvements: 20-30 hours
- Medium priority improvements: 30-40 hours
- Low priority enhancements: 40-60 hours

**Total estimated effort for all improvements: 98-146 hours**

---

## 14. Next Steps

1. Create GitHub issues for each critical bug
2. Set up test infrastructure and write first tests
3. Implement API route proxy for Google APIs
4. Create component extraction plan
5. Add TypeScript gradually (start with new files)
6. Schedule regular code review sessions

---

**Report Generated:** 2025-11-13
**Review Tool:** Claude Code
**Next Review:** Recommended after addressing high-priority issues
