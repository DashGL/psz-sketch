---
title: Sync
description: Asset synchronization and caching system
---

The Sync screen appears after successful authentication on the [Title Screen](/screens/title-screen) and before the [Character Select](/screens/character-select) screen. It downloads and caches all game assets using localForage for fast loading and offline play.

## Screen Flow

### Path

`/sync`

### Navigation

```
Title Screen (after auth) → /sync → /character-select
```

Players see this screen:
1. **First Time**: On initial login, downloads all game assets
2. **Content Updates**: When new content is available, downloads only changed assets
3. **Skip**: If all assets are up-to-date, quickly validates and proceeds

## Purpose

The sync system provides:
- **Fast Asset Loading**: Pre-cache all assets using localForage for instant access
- **Offline Play**: Store assets locally for gameplay without constant network requests
- **Content Updates**: Seamlessly deliver new game content to players
- **Bandwidth Efficiency**: Only download changed or new assets on updates
- **Version Control**: Track asset versions with hash-based verification
- **Smooth Gameplay**: All assets (including rare enemies) available immediately when needed

## Asset Manifest System

### Manifest Structure

The server provides a JSON manifest mapping asset URLs to their content hashes:

```json
{
  "version": "1.2.3",
  "timestamp": "2025-10-30T12:00:00Z",
  "assets": {
    "/models/characters/humar_v0.glb": "sha256:abc123...",
    "/textures/characters/humar_v0_c0_h0_s0.png": "sha256:def456...",
    "/textures/weapons/cutlass.png": "sha256:789abc...",
    "/models/weapons/cutlass.glb": "sha256:def789...",
    "/audio/bgm/town.mp3": "sha256:123def...",
    "/data/quests/quest_001.json": "sha256:456abc...",
    "/models/enemies/rare_enemy.glb": "sha256:789xyz..."
  }
}
```

### Manifest Fields

- **version**: Semantic version of the content build
- **timestamp**: When the manifest was generated
- **assets**: Map of asset URL to content hash (SHA-256) - all assets are downloaded

## Sync Process

### 1. Fetch Manifest

**Endpoint**: `GET /api/sync/manifest`

**Response**: Asset manifest JSON

**Query Parameters**:
- `clientVersion`: Current client version (optional)
- `lastSync`: Timestamp of last successful sync (optional)

### 2. Compare Local Cache

Client compares manifest against localForage cache:
- Check each asset URL in local cache
- Verify hash matches manifest
- Identify missing or outdated assets

### 3. Download Assets

For each asset that needs updating:
1. Download asset from URL
2. Verify hash matches manifest
3. Store in localForage with URL as key
4. Update sync progress UI

### 4. Validate Cache

After downloading:
- Verify all assets are present
- Confirm hashes match manifest
- Mark sync as complete

### 5. Proceed to Game

Once validation passes:
- Store manifest version in local storage
- Store sync timestamp
- Redirect to `/character-select`

## Progress Display

### UI Elements

**Progress Bar**: Visual indicator of download progress
```
Syncing assets... [████████░░] 80% (40/50 assets)
```

**Status Text**: Current action
- "Checking for updates..."
- "Downloading models..."
- "Downloading textures..."
- "Verifying assets..."
- "Sync complete!"

**Download Stats**:
- Assets downloaded: 40/50
- Data downloaded: 45.2 MB / 52.8 MB
- Estimated time remaining: 15 seconds

**Error Handling**:
- "Download failed. Retrying... (1/3)"
- "Network error. Check your connection."
- "Sync incomplete. Resume download?"

## LocalForage Cache

### Cache Structure

localForage provides a simple key-value interface over IndexedDB, making asset storage straightforward:

```typescript
// Asset cache entry
interface AssetCache {
  hash: string;          // SHA-256 hash
  blob: Blob;            // Asset binary data
  mimeType: string;      // Content type (image/png, model/gltf-binary, etc.)
  size: number;          // File size in bytes
  cachedAt: number;      // Timestamp when cached
}

// Sync metadata
interface SyncMetadata {
  manifestVersion: string;
  lastSyncTimestamp: number;
  totalAssets: number;
  totalSize: number;
}
```

### LocalForage Operations

```typescript
import localforage from 'localforage';

// Configure localForage
localforage.config({
  name: 'density-dwarf',
  storeName: 'assets'
});

// Store asset
await localforage.setItem('/models/characters/humar_v0.glb', {
  hash: 'sha256:abc123...',
  blob: assetBlob,
  mimeType: 'model/gltf-binary',
  size: 1024768,
  cachedAt: Date.now()
});

// Retrieve asset
const asset = await localforage.getItem('/models/characters/humar_v0.glb');
const objectURL = URL.createObjectURL(asset.blob);

// Store sync metadata
await localforage.setItem('_sync_metadata', {
  manifestVersion: '1.2.3',
  lastSyncTimestamp: Date.now(),
  totalAssets: 150,
  totalSize: 52428800
});

// Get all cached asset URLs
const keys = await localforage.keys();
const assetKeys = keys.filter(k => !k.startsWith('_'));
```

## Asset Download Strategy

All assets are downloaded during the initial sync to ensure smooth gameplay:

- **Character Assets**: All character models and textures for all classes and variations
- **Enemy Assets**: All enemy models and textures, including rare enemies
- **Weapon & Armor Assets**: All equipment models and textures
- **UI Assets**: All interface elements, fonts, and icons
- **Audio Assets**: All music, sound effects, and voice clips
- **Game Data**: All item definitions, quest data, and configuration files
- **Environment Assets**: All map tiles, terrain textures, and environmental models

This upfront approach ensures that players never experience loading delays or missing assets during gameplay, even when encountering rare content.

## Content Updates

### Version Checking

On subsequent logins:
1. Fetch manifest from server
2. Compare `version` field with local stored version
3. If versions match and all assets present: skip sync
4. If version differs: show update prompt

### Incremental Updates

```json
{
  "version": "1.2.4",
  "previousVersion": "1.2.3",
  "changedAssets": [
    "/models/weapons/new_sword.glb",
    "/textures/weapons/new_sword.png"
  ],
  "deletedAssets": [
    "/models/weapons/old_deprecated_weapon.glb"
  ]
}
```

Only download `changedAssets`, remove `deletedAssets` from cache.

### Update Prompt

**New Content Available**:
- "Version 1.2.4 is available!"
- "New content: 5 new weapons, 2 new quests"
- "Download size: 12.3 MB"
- Actions: "Update Now" / "Update Later"

If "Update Later":
- Use cached assets
- Show notification badge
- Prompt again on next login

## Error Handling

### Network Errors

**Connection Lost During Sync**:
- Pause download
- Show "Connection lost. Retrying..."
- Retry with exponential backoff (1s, 2s, 4s, 8s)
- After 5 failures: Show "Resume" button

**Manifest Fetch Failed**:
- Retry 3 times
- If still failing: Check if offline mode possible with cached assets
- Prompt: "Cannot reach servers. Play with cached content?"

### Storage Errors

**Storage Quota Exceeded**:
- Show "Storage full. Free up space or clear cache?"
- Provide cache size breakdown
- Link to browser storage settings
- Offer option to clear cache and re-download

**LocalForage/IndexedDB Unavailable**:
- Fall back to in-memory cache (session only)
- Warn: "Assets will not be cached. Downloads required each session."
- Consider degraded experience or blocking gameplay

### Hash Verification Failures

**Downloaded Asset Hash Mismatch**:
- Delete corrupted asset from cache
- Re-download asset (up to 3 attempts)
- If repeated failures: Report to server, skip asset
- Game may degrade gracefully without non-critical assets

## Server API

### Get Asset Manifest

**Endpoint**: `GET /api/sync/manifest`

**Query Parameters**:
- `clientVersion` (optional): Client's current version
- `lastSync` (optional): ISO timestamp of last sync

**Response**:
```json
{
  "version": "1.2.3",
  "timestamp": "2025-10-30T12:00:00Z",
  "assets": { ... }
}
```

### Download Asset

**Endpoint**: `GET /assets/{path}`

**Example**: `GET /assets/models/characters/humar_v0.glb`

**Response**: Binary asset data with appropriate `Content-Type` header

**Headers**:
- `Content-Type`: Mime type of asset
- `Content-Length`: Size in bytes
- `ETag`: SHA-256 hash (for verification)
- `Cache-Control`: max-age=31536000 (assets are immutable, cache forever)

### Report Sync Status

**Endpoint**: `POST /api/sync/status`

**Request**:
```json
{
  "version": "1.2.3",
  "status": "complete",
  "assetsDownloaded": 50,
  "totalSize": 52428800,
  "duration": 45.2,
  "errors": []
}
```

**Response**: 204 No Content

Used for analytics and monitoring sync success rates.

## Performance Optimizations

### Parallel Downloads

- Download multiple assets concurrently (limit: 6 simultaneous)
- Use HTTP/2 multiplexing when available
- Balance download speed with browser resource limits

### Cache Eviction

Automatically clean old assets:
- Remove assets not in current manifest
- Clear outdated versions when new manifest is applied

### Compression

- Serve assets with gzip/brotli compression
- Use compressed texture formats (KTX2, Basis Universal)
- Minify JSON data files

## Implementation Notes

### Browser Compatibility

- localForage provides a unified interface across browsers
- Automatically uses IndexedDB, WebSQL, or localStorage as fallback
- Handle Safari's stricter quota limits
- Test on mobile devices with limited storage

### Development Mode

During development:
- Add `?skipSync=true` query parameter to bypass sync
- Use local asset server for faster iteration
- Clear cache button in dev tools

### CDN Strategy

- Host assets on CDN for global distribution
- Use hash-based URLs for cache busting
- Serve manifest from main server (not CDN) for freshness

### Analytics

Track metrics:
- Average sync time
- Most frequently downloaded assets
- Failed download rates
- Storage usage per user

### Security

- Verify asset hashes to prevent tampering
- Use HTTPS for all asset downloads
- Validate manifest signature (optional, for anti-cheat)

## Future Enhancements

- **Differential Updates**: Binary diffs for large assets
- **Peer-to-Peer Sync**: Share assets between nearby players (WebRTC)
- **Background Sync API**: Update assets when browser is idle
- **Service Worker**: Enable true offline gameplay with cached assets
- **On-Demand Supplemental Caching**: Optionally cache additional assets as encountered during gameplay
