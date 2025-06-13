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

Create a `.env` file in the root directory:

```env
REACT_APP_GOOGLE_API_KEY=your_api_key_here
REACT_APP_SEARCH_ENGINE_ID=your_search_engine_id_here
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key_here
```

Under `REACT_APP_YOUTUBE_API_KEY`, enter the same API key as your `REACT_APP_GOOGLE_API_KEY`. This is due to the `YouTube Data API` being a part of the Google Cloud Platform.

## Usage

1. Use the search bar to look for Islamic topics or questions
2. Filter results by specific scholars using the filter button
3. Watch videos directly in the app or open them on YouTube
4. Share interesting search results with others
5. Request new scholars or channels to be added to the platform

## Technology Stack

- React
- React Router
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
