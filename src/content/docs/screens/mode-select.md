---
title: Mode Select
description: Online/Offline mode selection after character selection
---

The Mode Select screen appears after a player selects a character from the [Character Select](/screens/character-select) screen or completes [Character Creation](/screens/character-create). It allows players to choose between Online (multiplayer) and Offline (single-player) game modes.

## Screen Flow

### Entry Points

Players reach this screen from:
1. **Character Select**: After selecting an existing character
2. **Character Create**: After creating a new character

### Path

`/character-select/{characterId}`

Where `{characterId}` is the UUID of the selected character.

## Mode Options

### Offline Mode (Single-Player)

**Description**: Play solo without online connectivity

**Features**:
- Play through story quests alone
- No network latency
- Progress saved locally and to server
- Cannot join multiplayer parties
- Full access to single-player content

**Use Cases**:
- Learning game mechanics
- Playing without internet connection
- Solo challenge runs
- Story progression

**Current Implementation Focus**: This is the primary mode being implemented first.

### Online Mode (Multiplayer)

**Description**: Play with other players online

**Features**:
- Join or create multiplayer parties (up to 4 players)
- Play quests cooperatively
- Chat and social features
- Friend system integration
- Shared quest rewards

**Use Cases**:
- Playing with friends
- Tackling difficult content with help
- Social gameplay
- Efficient farming and grinding

**Implementation Status**: To be implemented after offline mode is complete.

## User Interface

### Layout

The screen presents two clear options:
- **Offline**: Large button or card for single-player mode
- **Online**: Large button or card for multiplayer mode

### Visual Design

TBD - Based on Phantasy Star Zero's original interface:
- Clear distinction between modes
- Icons or imagery representing each mode
- Brief description text for each option
- Back button to return to character select

### Default Selection

- If player has no online friends or is not connected: Default to Offline
- If player is connected and has active friends: Highlight Online
- Remember last selected mode per character (optional)

## Server API

### Get Character Mode Status

**Endpoint**: `GET /api/character/{characterId}/mode-status`

**Response**:
```json
{
  "characterId": "uuid-v4",
  "characterName": "Rina",
  "isOnlineAvailable": true,
  "lastPlayedMode": "offline",
  "onlineFriendsCount": 3,
  "recommendations": {
    "suggestedMode": "offline",
    "reason": "Continue your story progress"
  }
}
```

### Select Mode

**Endpoint**: `POST /api/character/{characterId}/select-mode`

**Request**:
```json
{
  "mode": "offline"
}
```

**Response**:
```json
{
  "success": true,
  "mode": "offline",
  "sessionId": "uuid-v4",
  "redirectTo": "/game/offline"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid mode selection
- `401 Unauthorized`: Invalid session
- `403 Forbidden`: Character not owned by player
- `503 Service Unavailable`: Online mode temporarily unavailable

## Navigation Flow

### Offline Mode Selected

```
Mode Select → /game/offline
```

Players enter the single-player game environment:
1. Load character data
2. Initialize offline game state
3. Present quest selection or town area
4. Begin gameplay

### Online Mode Selected (Future)

```
Mode Select → /lobby or /game/online
```

Players enter the multiplayer environment:
1. Connect to online servers
2. Show online lobby
3. Present party options
4. Enable multiplayer features

### Back Navigation

```
Mode Select → /character-select
```

Pressing back returns to character selection screen.

## Implementation Considerations

### Session Management

When a mode is selected:
- Create a game session associated with the character
- Store session type (offline/online)
- Track session start time
- Monitor for disconnections (online mode)

### State Persistence

- Save last selected mode preference per character
- Track offline/online playtime separately
- Sync progress to server even in offline mode
- Handle mode-specific achievements/rewards

### Offline Mode Implementation

Since offline is the initial focus:

#### Data Requirements
- Character data loaded from server
- Quest data and definitions
- Enemy spawn tables and AI
- Item drop tables
- Map and area data

#### Local Caching
- Cache character state locally for performance
- Sync to server periodically
- Handle offline play when no connection available
- Conflict resolution if data desyncs

#### Progression
- All progress in offline mode counts toward character advancement
- Items obtained offline are saved to server
- Experience and levels sync to account
- No gameplay differences between offline/online for solo play

### Online Mode Implementation (Future)

Features to implement later:
- Party formation and matchmaking
- Real-time position synchronization
- Chat system
- Friend roster integration
- Shared quest rewards
- PvP arena (if applicable)

## Database Schema

### Game Session Tracking

```sql
CREATE TABLE game_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('offline', 'online')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Online-specific fields
  party_id UUID, -- NULL for offline mode
  server_region VARCHAR(50),

  FOREIGN KEY (character_id) REFERENCES character_state(character_id),
  INDEX idx_character_sessions (character_id, started_at),
  INDEX idx_active_sessions (character_id, ended_at)
);

-- Character mode preferences
CREATE TABLE character_mode_preferences (
  character_id UUID PRIMARY KEY,
  last_mode VARCHAR(20) NOT NULL DEFAULT 'offline',
  offline_playtime_seconds BIGINT NOT NULL DEFAULT 0,
  online_playtime_seconds BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (character_id) REFERENCES character_state(character_id)
);
```

## UI/UX Notes

### Performance
- Pre-load character data before showing mode select
- Fast mode switching without long loading screens
- Cache common game data for quick offline start

### User Feedback
- Show loading indicator when mode is being initialized
- Display connection status for online mode
- Warn if online mode is unavailable
- Provide estimated wait time for online server connection

## Notes for Implementation

- This screen should be lightweight and load quickly
- Character data should already be loaded from character select
- Mode selection is per-session, not permanent
- Players can switch modes by returning to character select
- Offline mode should work without any network connection after initial character load
- Consider "quick play" option that uses last selected mode
- Track analytics on offline vs online mode popularity
- May add additional modes in future (arena, challenge mode, etc.)
