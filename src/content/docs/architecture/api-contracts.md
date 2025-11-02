---
title: API Contracts
description: Screen-to-API relationships and contract definitions
---

This diagram shows all API endpoints called during the title-to-city flow and their relationships to screens.

## Diagram

```mermaid
graph TD
    subgraph "Title Screen (/)"
        TS[Title Screen]
    end

    subgraph "Sync Screen (/sync)"
        SS[Sync Screen]
    end

    subgraph "Character Select (/character-select)"
        CS[Character Select]
    end

    subgraph "Character Create (/character-create)"
        CC[Character Create]
    end

    subgraph "Mode Select (/mode-select)"
        MS[Mode Select]
    end

    subgraph "City (/city)"
        City[City Hub]
    end

    subgraph "API Server"
        AuthAPI[Auth API]
        SyncAPI[Sync API]
        CharAPI[Character API]
        CityAPI[City API]
    end

    %% Title Screen Flow
    TS -->|1. POST /api/auth/challenge| AuthAPI
    AuthAPI -->|Response: nonce| TS
    TS -->|2. POST /api/auth/verify| AuthAPI
    AuthAPI -->|Response: session| TS
    TS -->|Navigate| SS

    %% Sync Screen Flow
    SS -->|3. GET /api/sync/manifest| SyncAPI
    SyncAPI -->|Response: manifest| SS
    SS -->|4. GET /assets/*| SyncAPI
    SyncAPI -->|Response: asset blobs| SS
    SS -->|Navigate| CS

    %% Character Select Flow
    CS -->|5. GET /api/characters| CharAPI
    CharAPI -->|Response: characters[]| CS
    CS -->|If no chars, navigate| CC
    CS -->|If has chars, navigate| MS

    %% Character Create Flow
    CC -->|6. POST /api/characters/create| CharAPI
    CharAPI -->|Response: character| CC
    CC -->|Navigate| CS

    %% Mode Select Flow
    MS -->|7. POST /api/city/enter| CityAPI
    CityAPI -->|Response: cityState| MS
    MS -->|Navigate| City

    %% API Contract Annotations
    style AuthAPI fill:#ffcccc
    style SyncAPI fill:#ccffcc
    style CharAPI fill:#ccccff
    style CityAPI fill:#ffffcc

    %% Screens
    style TS fill:#e1f5e1
    style SS fill:#e1f5e1
    style CS fill:#e1f5e1
    style CC fill:#e1f5e1
    style MS fill:#e1f5e1
    style City fill:#e1f5e1
```

## API Contract Definitions

### 1. Auth API - Challenge

**Endpoint**: `POST /api/auth/challenge`

**Request**:
```typescript
{
  publicKey: string; // ED25519 public key in JWK format
}
```

**Response**:
```typescript
{
  nonce: string; // Random challenge to be signed
}
```

**Called by**: Title Screen

---

### 2. Auth API - Verify

**Endpoint**: `POST /api/auth/verify`

**Request**:
```typescript
{
  publicKey: string;   // ED25519 public key
  signature: string;   // Signed nonce
}
```

**Response**:
```typescript
{
  sessionToken: string; // JWT or session ID
}
```

**Called by**: Title Screen

---

### 3. Sync API - Manifest

**Endpoint**: `GET /api/sync/manifest`

**Request**: None (uses session auth)

**Response**:
```typescript
{
  version: string;     // Semantic version
  timestamp: string;   // ISO 8601 timestamp
  assets: {
    [url: string]: string; // URL to SHA-256 hash
  };
}
```

**Called by**: Sync Screen

---

### 4. Sync API - Assets

**Endpoint**: `GET /assets/{path}`

**Request**: Asset path from manifest

**Response**: Binary asset data (Blob)

**Headers**:
- `Content-Type`: Asset mime type
- `ETag`: SHA-256 hash for verification

**Called by**: Sync Screen

---

### 5. Character API - List

**Endpoint**: `GET /api/characters`

**Query Parameters**:
```typescript
{
  publicKey: string; // Account public key
}
```

**Response**:
```typescript
{
  characters: Array<{
    characterId: string;
    characterName: string;
    class: string;
    level: number;
    lastPlayed: string; // ISO 8601
    appearance: {
      race: string;
      texturePath: string;
      modelPath: string;
    };
  }>;
}
```

**Called by**: Character Select

---

### 6. Character API - Create

**Endpoint**: `POST /api/characters/create`

**Request**:
```typescript
{
  publicKey: string;
  characterName: string;
  race: "Human" | "CAST" | "Newman";
  class: string; // One of 14 classes
  appearance: {
    baseColor: number;    // 0-4
    hairColor: number;    // 0-2
    shade: number;        // 0-2
    headVariation: number; // 0-3
  };
}
```

**Response**:
```typescript
{
  characterId: string;
  characterName: string;
  class: string;
  level: 1;
  // ... full character data
}
```

**Called by**: Character Create

---

### 7. City API - Enter

**Endpoint**: `POST /api/city/enter`

**Request**:
```typescript
{
  characterId: string;
}
```

**Response**:
```typescript
{
  success: true;
  cityState: {
    activeQuests: Array<Quest>;
    availableQuests: number;
    unclaimedRewards: number;
    storageItemCount: number;
    meseta: number;
  };
  notifications: Array<{
    type: string;
    message: string;
  }>;
}
```

**Called by**: Mode Select

---

## Contract Validation

All contracts are defined using Zod schemas in `/src/content/config.ts`:

```typescript
import { z } from 'zod';

export const authChallengeRequestSchema = z.object({
  publicKey: z.string()
});

export const authChallengeResponseSchema = z.object({
  nonce: z.string()
});

// ... more schemas
```

These schemas are used for:
- Runtime validation on the server
- TypeScript type generation
- API documentation
- Contract testing

## Validation Script

To verify all screens call valid APIs:

```bash
npm run validate:contracts
```

This script:
1. Parses all screen files to find API calls
2. Checks each call against defined schemas
3. Validates request/response types match
4. Reports any inconsistencies

## Related Documentation

- [User Flow](/architecture/user-flow) - Complete user journey
- [System Architecture](/architecture/system-architecture) - Component overview
- [Data Flow](/architecture/data-flow) - Sequence diagram
