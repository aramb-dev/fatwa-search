[![Netlify Status](https://api.netlify.com/api/v1/badges/fa4dfc86-e352-4428-85bb-b4913d7f740b/deploy-status)](https://is-search.aramb.dev)

# Fatwa Search App

A specialized search application designed to help Muslims find Islamic rulings (fatwas) and content from the Mashāyukh. This web application provides a curated search experience restricting the search to known websites and channels.

## Table of Contents

- [Fatwa Search App](#fatwa-search-app)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Getting Started](#getting-started)
  - [Setup Instructions](#setup-instructions)
    - [1. Google Custom Search Engine Setup](#1-google-custom-search-engine-setup)
    - [2. Google Cloud Console Setup](#2-google-cloud-console-setup)
    - [3. Environment Variables](#3-environment-variables)
  - [Usage](#usage)
  - [Technology Stack](#technology-stack)
  - [Contributing](#contributing)
  - [Privacy and Data Usage](#privacy-and-data-usage)
  - [Contact](#contact)
  - [License](#license)

## Features

- **YouTube Search Integration**: Search through verified Islamic scholar channels
- **Verified Channels**:
  - [فضيلة الشيخ محمد بن صالح العثيمين](https://www.youtube.com/channel/UCFjzJYgxHjk44AFoEwwgPjg)
  - [العلامة الدكتور صالح الفوزان](https://www.youtube.com/channel/UCi7vzSJrU3beV_6Sdgpowng)
  - [قناة ميراث الأنبياء المرئية](https://www.youtube.com/channel/UCMgtvQNueoOwjAgo-fMF-lQ)
  - [Think Reflect Ponder](https://www.youtube.com/channel/UCphY7uVzua2z_Mq1oZcOXGA)
  - [قناة الشيخ أ.د عبد الله بن عبد الرحيم البخاري](https://www.youtube.com/channel/UCQPQtAxx45gjN44ZOw4cqmw)
  - [قناة الشيخ محمد ابن عثيمين الرسمية](https://www.youtube.com/channel/UCtF3YygTiodnYSw8vD3UJtQ)
  - [موقع الشـ/ خالد الظفيري](https://www.youtube.com/channel/UCP44H-iDsDp-_wV85QKkdVA)
  - [د. محمد بن غالب العُمري](https://www.youtube.com/channel/UCPPQcw5SA1yeQHttDbdxXGw)
  - [شبكة بينونة للعلوم الشرعية](https://www.youtube.com/channel/UC-V7X5AL2krPtSanQEbCbAQ)
  - [بوابة تراث الإمام الألباني](https://www.youtube.com/channel/UCwMocSKEbLav6SZvwzTvDbQ)
  - [درر الشيخ الألباني](https://www.youtube.com/channel/UC6u5aFIhKDOC_WYKVLBw8Dg)
  - [موقع الشيخ صالح الفوزان](https://www.youtube.com/channel/UCS-XgiMGKaiQsZNkgwsDbYg)
  - [الشيخ عبد الرزاق البدر](https://www.youtube.com/channel/UCWSfNmixfPlKg9OCoqghwwg)
  - [القناة الرسمية لموقع سماحة الشيخ عبدالعزيز بن باز](https://www.youtube.com/channel/UCiiJRwQ0MUaQo8ZZuf18pPw)
  - [سماحة الشيخ عبدالعزيز بن عبدالله آل الشيخ](https://www.youtube.com/channel/UCO_MLsqOIoqYXbSXfyqluxw)
  - [فضيلة الشيخ محمد أمان الجامي](https://www.youtube.com/channel/UCYbR2Su3mqwl88US4eyrQdg)
  - [فضيلة الشيخ صالح آل الشيخ - SalihAlalsheikh](https://www.youtube.com/channel/UCLHZET13eDxW-z1tSKTAdVg)
  - [فضيلة الشيخ ابن باز Alsheikh Binbaz](https://www.youtube.com/channel/UCXI4M81wRAVYlFPw7V1l3Mw)
  - [قناة مؤسسة عبد العزيز بن باز الخيرية الرسمية](https://www.youtube.com/channel/UCYZkmbBbVMWxB1gyioTPLIA)
  - [قناة مؤسسة عبد العزيز بن باز الخيرية الرسمية](https://www.youtube.com/channel/UCleHL3J-q13VVmy7_WwFLCw)
  - [قناة مؤسسة عبد العزيز بن باز الخيرية الرسمية](https://www.youtube.com/channel/UC0ljB6Xfg9RWjFWNb4JO-IQ)
- **Channel Filtering**: Filter results by specific scholars or channels
- **Verified Sites**: Search through verified Islamic sites
  - [موقع الشيخ محمد بن صالح العثيمين](https://binothaimeen.net)
  - [موقع العلامة صالح الفوزان](https://alfawzan.af.org.sa)
  - [موقع سماحة الشيخ صالح اللحيدان](https://lohaidan.af.org.sa)
  - [موقع سماحة الشيخ عبد العزيز بن باز](https://binbaz.org.sa)
  - [موقع الشيخ عبد الرزاق البدر](https://al-badr.net)
  - [موقع الشيخ عبيد الجابري](https://obied-aljabri.com)
  - [موقع العلامة صالح آل الشيخ](https://aletioupi.com)
  - [موقع ميراث الأنبياء](https://miraath.net)
  - [موقع العلامة محمد ناصر الدين الألباني](https://al-albany.com)
  - [موقع الشيخ ربيع المدخلي](https://rabee.net)
- **Scholar Request System**: Request new scholars to be added to the searching list
- **Channel Submission**: Submit YouTube channels for consideration
- **Sharing Capabilities**: Easily share search results with others
- **Mobile Responsive**: Works seamlessly on all devices
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Setup Instructions

### 1. Google Custom Search Engine Setup

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/create/new)
2. Enter the following sites in "Sites to search":

```
binothaimeen.net/*
alfawzan.af.org.sa/*
lohaidan.af.org.sa/*
binbaz.org.sa/*
al-badr.net/*
obied-aljabri.com/*
aletioupi.com/*
miraath.net/*
al-albany.com/*
rabee.net/*
```

3. Click "Create"
4. Copy your Search Engine ID (cx) from the "Setup" tab

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable these APIs:

- Custom Search API
- YouTube Data API v3

4. Go to "Credentials"
5. Click "Create Credentials" > "API Key"
6. Copy your API key
7. (Optional) Restrict the API key to only these APIs for security

### 3. Environment Variables

Create a `.env.local` file in the root directory (or configure these in Netlify's UI):

```env
# Google API Keys (Server-side only - NOT prefixed with NEXT_PUBLIC_)
GOOGLE_API_KEY=your_api_key_here
SEARCH_ENGINE_ID=your_search_engine_id_here
YOUTUBE_API_KEY=your_api_key_here # can reuse same Google API key

# Analytics (Client-side - prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_CLARITY_ID=optional_ms_clarity_project_id
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Important Security Notes:**
- API keys are now **server-side only** and protected from client exposure
- The app supports legacy `REACT_APP_*` prefixed variables for backward compatibility
- Never commit `.env.local` to version control
- For production, set these variables in your hosting platform's environment settings

**Netlify Setup:**

- Build command: `npm run build`
- Publish directory: `.next`
- Ensure the Netlify Next.js Runtime plugin (`@netlify/plugin-nextjs`) is installed (already configured in `netlify.toml`).
- Set environment variables in Netlify under Site Settings > Build & Deploy > Environment.

## Usage

1. Use the search bar to look for Islamic topics or questions
2. Filter results by specific scholars using the filter button
3. Watch videos directly in the app or open them on YouTube
4. Share interesting search results with others
5. Request new scholars or channels to be added to the platform

## Developer Guide

### How to Add New Scholar Sites

To add a new scholar website to the search functionality:

1. **Update the Google Custom Search Engine:**
   - Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
   - Select your search engine
   - Navigate to "Setup" → "Sites to search"
   - Add the new site domain (e.g., `newscholar.com/*`)
   - Save changes

2. **Update the Application Code:**
   - Open `components/Search.js`
   - Locate the `DEFAULT_SITES` array (around line 40)
   - Add the new site domain to the array:
     ```javascript
     export const DEFAULT_SITES = [
       "binothaimeen.net",
       "alfawzan.af.org.sa",
       // ... existing sites
       "newscholar.com", // Add your new site here
     ];
     ```

3. **Update the README (Optional):**
   - Add the new site to the "Verified Sites" list in the Features section

4. **Test the Changes:**
   - Run the development server: `npm run dev`
   - Perform a search and verify the new site appears in results
   - Test with multi-site selection to ensure proper filtering

### How to Add New YouTube Channels

To add a new Islamic scholar's YouTube channel:

1. **Get the Channel ID:**
   - Visit the YouTube channel
   - Click "About" tab
   - Click "Share channel" → "Copy channel ID"
   - The ID looks like: `UCFjzJYgxHjk44AFoEwwgPjg`

2. **Update the Application Code:**
   - Open `components/Youtube-Search.js`
   - Locate the `CHANNELS` array (around line 16)
   - Add the new channel ID to the array:
     ```javascript
     const CHANNELS = [
       "UCFjzJYgxHjk44AFoEwwgPjg",
       "UCi7vzSJrU3beV_6Sdgpowng",
       // ... existing channels
       "UCNewChannelIDHere", // Add your new channel ID here
     ];
     ```

3. **Update the README (Optional):**
   - Add the new channel to the "Verified Channels" list in the Features section
   - Include the channel name and link

4. **Test the Changes:**
   - Run the development server: `npm run dev`
   - Navigate to the YouTube search tab
   - Perform a search and verify videos from the new channel appear in results

### Translation Workflow

The application supports multiple languages (English, Arabic, Urdu). To add or modify translations:

1. **Translation File Location:**
   - All translations are in `translations.js`

2. **Add a New Translation:**
   ```javascript
   export const translations = {
     en: {
       searchPlaceholder: "Search...",
       // ... other English translations
     },
     ar: {
       searchPlaceholder: "بحث...",
       // ... other Arabic translations
     },
     ur: {
       searchPlaceholder: "تلاش کریں...",
       // ... other Urdu translations
     },
   };
   ```

3. **Add a New Language:**
   - Add a new language object to the `translations` export
   - Translate all keys from the English version
   - Update the language switcher in `app/[lang]/layout.js` to include the new language option
   - Add the new language to the routing configuration

4. **Using Translations in Components:**
   ```javascript
   import { translations } from "../translations";

   const MyComponent = ({ language = "en" }) => {
     const t = translations[language];
     return <p>{t.searchPlaceholder}</p>;
   };
   ```

5. **RTL (Right-to-Left) Support:**
   - The app automatically handles RTL for Arabic and Urdu
   - RTL is configured in `app/[lang]/layout.js`
   - Use logical CSS properties (e.g., `margin-inline-start` instead of `margin-left`) for new styles

6. **Testing Translations:**
   - Switch languages using the language selector in the UI
   - Verify all UI elements display correctly
   - Check RTL layout for Arabic and Urdu
   - Ensure no text is hardcoded (all should use translation keys)

## Technology Stack

- Next.js 15 (App Router)
- Tailwind CSS
- shadcn/ui components
- Framer Motion for animations
- YouTube Data API
- Lucide React icons

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## Privacy and Data Usage

This application respects user privacy and only collects necessary data for search functionality. No personal information is stored or shared with third parties.

## Contact

For questions, suggestions, or support:

- GitHub Issues: [Create an issue](https://github.com/aramb-dev/fatwa-search/issues)
- Email: [aramb@aramb.dev](mailto:aramb@aramb.dev)

Please check existing issues before creating a new one and follow our contribution guidelines when submitting questions or suggestions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
