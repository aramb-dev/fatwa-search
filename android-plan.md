# Fatwa Search Android App Implementation Plan

## Tech Stack

- Kotlin as primary language
- Jetpack Compose for UI
- MVVM architecture
- Room Database for local storage
- Retrofit for API calls
- Hilt for dependency injection
- Kotlin Coroutines for async operations
- DataStore for preferences

## Core Features

### 1. Basic Search Features

- Implement existing web app functionality
  - Regular site search
  - YouTube search
  - Special site integrations (Shamela, Almaany, Dorar)
- Use Retrofit to call same Google Custom Search API
- Implement language switching (AR/EN)

### 2. Local Storage & Persistence

- Room Database schema:

```kotlin
@Entity
data class SearchHistory(
    @PrimaryKey val id: Long,
    val query: String,
    val timestamp: Long,
    val language: String
)

@Entity
data class Bookmark(
    @PrimaryKey val id: Long,
    val title: String,
    val url: String,
    val snippet: String,
    val source: String, // "web" or "youtube"
    val timestamp: Long,
    val tags: List<String>
)

@Entity
data class SearchFilter(
    @PrimaryKey val id: Long,
    val name: String,
    val sites: List<String>,
    val scholars: List<String>
)
```

### 3. New Mobile Features

#### Offline Access

- Cache search results using Room
- Implement WorkManager for background sync
- Store HTML content of bookmarked pages

#### Advanced Filtering

- Custom filter creation and storage
- Filter by:
  - Scholar
  - Site
  - Date range
  - Content type
  - Language
- Save filter presets

#### Bookmarking System

- Save search results locally
- Organize with tags
- Export/Import bookmarks
- Share bookmarks

#### Search History

- Track recent searches
- Search suggestions
- Clear history
- Export history

#### UI/UX Enhancements

- Bottom navigation
- Swipe gestures
- Pull to refresh
- Dark mode
- Custom themes
- Arabic text optimization

## Project Structure

```
app/
├── data/
│   ├── local/
│   │   ├── dao/
│   │   ├── entities/
│   │   └── FatwaDatabase
│   ├── remote/
│   │   ├── api/
│   │   └── models/
│   └── repositories/
├── di/
├── domain/
│   ├── models/
│   ├── usecases/
│   └── repositories/
├── ui/
│   ├── screens/
│   ├── components/
│   ├── theme/
│   └── viewmodels/
└── utils/
```

## Implementation Phases

### Phase 1: Core Setup

1. Project setup with dependencies
2. Basic MVVM architecture
3. API integration
4. Basic search functionality

### Phase 2: Local Storage

1. Room database implementation
2. Search history
3. Basic bookmarking
4. Offline caching

### Phase 3: Advanced Features

1. Advanced filtering
2. Tag system
3. Export/Import functionality
4. Search suggestions

### Phase 4: UI/UX

1. Material Design 3 implementation
2. Arabic language support
3. Dark mode
4. Animations and transitions

### Phase 5: Performance & Polish

1. Performance optimization
2. Error handling
3. Analytics integration
4. Testing

## Dependencies

```kotlin
dependencies {
    // Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")

    // Compose
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")

    // Architecture Components
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // DI
    implementation("com.google.dagger:hilt-android:2.50")

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.0")
}
```

## API Integration

- Use same Google Custom Search API
- Add YouTube Data API v3
- Implement API key security
- Handle rate limiting
- Add offline fallback
