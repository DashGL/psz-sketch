---
title: Character Select
description: Character slot management and selection interface
---

![Character Select UI](/screenshots/character-select-ui.png)

The Character Select screen allows players to manage up to four character slots per account. Players can view existing characters, create new ones, or start a new game in an empty slot.

## Screen States

### File Selection View

![Character Select File Selection](/screenshots/character-select-ui.png)

The main view displays all four character slots with their current state:

- **Existing Characters**: Shows character name and race (e.g., "Rina HUmarl")
- **Empty Slots**: Displays "New Game" option
- **Bottom Actions**:
  - Friend Roster button for social features
  - Nintendo WFC Settings for network configuration

### Character Details View

![Character Details](/screenshots/character-select.png)

When hovering over or selecting an existing character, the screen displays:

- **Character Model**: 3D preview of the character with their current equipment
- **Character Info**:
  - Name and Race (e.g., "Rina HUmarl")
  - Level (e.g., "LV3")
  - Last Save timestamp (e.g., "10/28/2025 12:40")
  - Total Play Time (e.g., "0:20")

### Empty Slot View

![No Character Data](/screenshots/no-character-data.png)

When selecting an empty slot, the screen displays:
- Message: "No character data."
- Empty character preview area
- Allows player to proceed to character creation

## Server API

### Get Character Slots

**Endpoint**: `GET /api/characters`

**Request Headers**:
```http
Authorization: Bearer <session_token>
```

**Request Body**:
```json
{
  "publicKey": "base64_encoded_ed25519_public_key"
}
```

**Response**:
```json
{
  "slots": [
    {
      "slotIndex": 0,
      "isEmpty": false,
      "character": {
        "characterId": "uuid-v4",
        "name": "Rina",
        "race": "Human",
        "class": "HUmarl",
        "level": 3,
        "lastPlayTime": "2025-10-28T12:40:00Z",
        "playTimeSeconds": 1200,
        "appearance": {
          "modelVariation": 1,
          "baseColorIndex": 2,
          "hairColorIndex": 0,
          "shadeIndex": 1,
          "modelPath": "/models/characters/humarl_v1.glb",
          "texturePath": "/textures/characters/humarl_v1_c2_h0_s1.png"
        },
        "createdAt": "2025-10-28T10:00:00Z"
      }
    },
    {
      "slotIndex": 1,
      "isEmpty": true,
      "character": null
    },
    {
      "slotIndex": 2,
      "isEmpty": true,
      "character": null
    },
    {
      "slotIndex": 3,
      "isEmpty": true,
      "character": null
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing session token
- `404 Not Found`: Public key not found in database
- `500 Internal Server Error`: Database or server error

## Event-Sourced Database Design

The character system uses event sourcing to maintain a complete audit trail of all character changes. Instead of updating records directly, all changes are stored as immutable events that can be replayed to reconstruct character state.

### Character Events Table

```sql
CREATE TABLE character_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  player_public_key TEXT NOT NULL,
  slot_index INTEGER NOT NULL CHECK (slot_index >= 0 AND slot_index <= 3),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sequence_number BIGSERIAL,

  -- Indexes for efficient querying
  INDEX idx_character_id (character_id),
  INDEX idx_player_public_key (player_public_key),
  INDEX idx_slot_index (player_public_key, slot_index),
  INDEX idx_sequence (sequence_number)
);
```

### Event Types

#### CHARACTER_CREATED

Fired when a new character is created in a slot.

```json
{
  "eventType": "CHARACTER_CREATED",
  "eventData": {
    "name": "Rina",
    "race": "Human",
    "class": "HUmarl",
    "level": 1,
    "appearance": {
      "modelVariation": 1,
      "baseColorIndex": 2,
      "hairColorIndex": 0,
      "shadeIndex": 1,
      "modelPath": "/models/characters/humarl_v1.glb",
      "texturePath": "/textures/characters/humarl_v1_c2_h0_s1.png"
    },
    "slotIndex": 0
  }
}
```

#### CHARACTER_NAME_CHANGED

Fired when a character's name is changed.

```json
{
  "eventType": "CHARACTER_NAME_CHANGED",
  "eventData": {
    "oldName": "Rina",
    "newName": "RinaTheHunter"
  }
}
```

#### CHARACTER_TEXTURE_CHANGED

Fired when a character's appearance texture is modified.

```json
{
  "eventType": "CHARACTER_TEXTURE_CHANGED",
  "eventData": {
    "oldTexturePath": "/textures/characters/humarl_01.png",
    "newTexturePath": "/textures/characters/humarl_02.png"
  }
}
```

#### CHARACTER_LEVEL_CHANGED

Fired when a character levels up.

```json
{
  "eventType": "CHARACTER_LEVEL_CHANGED",
  "eventData": {
    "oldLevel": 2,
    "newLevel": 3
  }
}
```

#### CHARACTER_PLAYED

Fired periodically during gameplay to update play time.

```json
{
  "eventType": "CHARACTER_PLAYED",
  "eventData": {
    "playSessionSeconds": 600,
    "sessionEndTime": "2025-10-28T12:40:00Z"
  }
}
```

#### CHARACTER_DELETED

Fired when a character is removed from a slot (soft delete).

```json
{
  "eventType": "CHARACTER_DELETED",
  "eventData": {
    "reason": "player_deleted",
    "deletedBy": "player_action"
  }
}
```

### Character State Projection

The current state of characters is maintained in a separate read-optimized table that is rebuilt from events:

```sql
CREATE TABLE character_state (
  character_id UUID PRIMARY KEY,
  player_public_key TEXT NOT NULL,
  slot_index INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  race VARCHAR(20) NOT NULL,
  class VARCHAR(20) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  model_variation INTEGER NOT NULL CHECK (model_variation >= 0 AND model_variation <= 3),
  base_color_index INTEGER NOT NULL,
  hair_color_index INTEGER NOT NULL,
  shade_index INTEGER NOT NULL,
  texture_path TEXT NOT NULL,
  total_play_time_seconds INTEGER NOT NULL DEFAULT 0,
  last_play_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  last_event_sequence BIGINT NOT NULL,

  -- Constraints
  UNIQUE (player_public_key, slot_index),
  CHECK (slot_index >= 0 AND slot_index <= 3),

  -- Indexes
  INDEX idx_player_slots (player_public_key, is_deleted)
);
```

### Event Projection Logic

The server rebuilds character state by replaying events in sequence:

```typescript
async function projectCharacterState(characterId: string): Promise<CharacterState> {
  const events = await db.query(
    `SELECT * FROM character_events
     WHERE character_id = $1
     ORDER BY sequence_number ASC`,
    [characterId]
  );

  let state: CharacterState = null;

  for (const event of events.rows) {
    switch (event.event_type) {
      case 'CHARACTER_CREATED':
        state = {
          characterId: event.character_id,
          playerPublicKey: event.player_public_key,
          slotIndex: event.slot_index,
          name: event.event_data.name,
          race: event.event_data.race,
          class: event.event_data.class,
          level: event.event_data.level,
          modelVariation: event.event_data.appearance.modelVariation,
          baseColorIndex: event.event_data.appearance.baseColorIndex,
          hairColorIndex: event.event_data.appearance.hairColorIndex,
          shadeIndex: event.event_data.appearance.shadeIndex,
          modelPath: event.event_data.appearance.modelPath,
          texturePath: event.event_data.appearance.texturePath,
          totalPlayTimeSeconds: 0,
          lastPlayTime: event.event_timestamp,
          createdAt: event.event_timestamp,
          isDeleted: false
        };
        break;

      case 'CHARACTER_NAME_CHANGED':
        state.name = event.event_data.newName;
        break;

      case 'CHARACTER_TEXTURE_CHANGED':
        state.texturePath = event.event_data.newTexturePath;
        break;

      case 'CHARACTER_LEVEL_CHANGED':
        state.level = event.event_data.newLevel;
        break;

      case 'CHARACTER_PLAYED':
        state.totalPlayTimeSeconds += event.event_data.playSessionSeconds;
        state.lastPlayTime = event.event_data.sessionEndTime;
        break;

      case 'CHARACTER_DELETED':
        state.isDeleted = true;
        break;
    }
  }

  return state;
}
```

## Benefits of Event Sourcing

### Complete Audit Trail
- Every change to a character is permanently recorded
- Can investigate issues by replaying events
- Supports analytics on player behavior over time

### Data Recovery
- Characters are never truly deleted
- Can restore previous character states
- Protects against accidental deletion or data corruption

### Temporal Queries
- Answer questions like "What was this character's level last week?"
- Track progression over time
- Generate historical reports

### Debugging and Support
- Customer support can see exactly what happened to a character
- Developers can reproduce bugs by replaying event sequences
- Easy to identify when and why issues occurred

## Implementation Considerations

### Performance Optimization
- Maintain `character_state` projection table for fast reads
- Rebuild projections asynchronously in background
- Use caching for frequently accessed character data

### Event Versioning
- Include schema version in events for backward compatibility
- Support migration of old event formats
- Document breaking changes to event structure

### Consistency
- Use database transactions when appending events
- Ensure sequence numbers are monotonically increasing
- Validate event data before persistence

### Scalability
- Partition events by player_public_key for horizontal scaling
- Archive old events to cold storage after a retention period
- Consider CQRS pattern for read/write separation
