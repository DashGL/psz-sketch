---
title: Custom Shop
description: Character appearance customization and cosmetic changes
---

The Custom Shop is accessed from the [City](/screens/city) hub and allows players to modify their character's appearance, including colors, hairstyle variations, and other cosmetic options.

## Screen Flow

### Path

`/city/shop/custom`

### Navigation

```
City → /city/shop/custom → Customize appearance → Return to City
```

## Purpose

The Custom Shop provides:
- **Color Changes**: Modify base color, hair color, and shade
- **Variation Changes**: Switch between head/face variations
- **Preview System**: See changes before purchasing
- **Appearance History**: Revert to previous looks
- **Cosmetic Items**: Purchase and apply special cosmetics (future)

## User Interface

### Customization Screen

**Left Panel - Character Preview**:
- 3D character model with current customization
- Rotate and zoom controls
- Real-time preview of changes
- Animation toggle (idle, run, attack poses)

**Right Panel - Customization Options**:
- Color selection (base, hair, shade)
- Variation selection (head/face options)
- Accessory options (future)
- Price display for each change
- Apply/Cancel buttons

### Customization Categories

**Base Color** (5 options):
- Color 0 (default)
- Color 1
- Color 2
- Color 3
- Color 4

**Hair Color** (3 options):
- Hair 0 (default)
- Hair 1
- Hair 2

**Shade** (3 options):
- Shade 0 (light)
- Shade 1 (medium)
- Shade 2 (dark)

**Head Variation** (4 options):
- Variation 0
- Variation 1
- Variation 2
- Variation 3

### Preview and Confirmation

1. **Select Options**: Choose new colors/variations
2. **Preview**: See changes in real-time on 3D model
3. **View Price**: Total cost displayed
4. **Confirm**: Apply changes and deduct meseta
5. **Cancel**: Revert to original appearance

## Server API

### Get Customization Options

**Endpoint**: `GET /api/shop/custom/options`

**Query Parameters**:
- `characterId`: UUID of the character

**Response**:
```json
{
  "currentAppearance": {
    "race": "Human",
    "class": "HUmar",
    "baseColor": 0,
    "hairColor": 0,
    "shade": 0,
    "headVariation": 0,
    "modelPath": "/models/characters/humar_v0.glb",
    "texturePath": "/textures/characters/humar_v0_c0_h0_s0.png"
  },
  "availableOptions": {
    "baseColors": [
      { "id": 0, "name": "Default", "price": 0, "current": true },
      { "id": 1, "name": "Color 1", "price": 1000, "current": false },
      { "id": 2, "name": "Color 2", "price": 1000, "current": false },
      { "id": 3, "name": "Color 3", "price": 1000, "current": false },
      { "id": 4, "name": "Color 4", "price": 1000, "current": false }
    ],
    "hairColors": [
      { "id": 0, "name": "Default", "price": 0, "current": true },
      { "id": 1, "name": "Hair 1", "price": 500, "current": false },
      { "id": 2, "name": "Hair 2", "price": 500, "current": false }
    ],
    "shades": [
      { "id": 0, "name": "Light", "price": 0, "current": true },
      { "id": 1, "name": "Medium", "price": 500, "current": false },
      { "id": 2, "name": "Dark", "price": 500, "current": false }
    ],
    "headVariations": [
      { "id": 0, "name": "Variation 0", "price": 0, "current": true },
      { "id": 1, "name": "Variation 1", "price": 2000, "current": false },
      { "id": 2, "name": "Variation 2", "price": 2000, "current": false },
      { "id": 3, "name": "Variation 3", "price": 2000, "current": false }
    ]
  },
  "characterMeseta": 15000
}
```

### Apply Customization

**Endpoint**: `POST /api/shop/custom/apply`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "customization": {
    "baseColor": 2,
    "hairColor": 1,
    "shade": 1,
    "headVariation": 1
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Appearance updated successfully",
  "totalCost": 4000,
  "updatedAppearance": {
    "baseColor": 2,
    "hairColor": 1,
    "shade": 1,
    "headVariation": 1,
    "modelPath": "/models/characters/humar_v1.glb",
    "texturePath": "/textures/characters/humar_v1_c2_h1_s1.png"
  },
  "characterMeseta": 11000
}
```

**Error Responses**:
- `400 Bad Request`: Invalid customization options for character's race/class
- `402 Payment Required`: Insufficient meseta
- `404 Not Found`: Character not found

### Preview Customization (No Cost)

**Endpoint**: `POST /api/shop/custom/preview`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "customization": {
    "baseColor": 2,
    "hairColor": 1,
    "shade": 1,
    "headVariation": 1
  }
}
```

**Response**:
```json
{
  "success": true,
  "previewData": {
    "modelPath": "/models/characters/humar_v1.glb",
    "texturePath": "/textures/characters/humar_v1_c2_h1_s1.png",
    "estimatedCost": 4000
  }
}
```

## Pricing Structure

### Base Customization Prices

**Color Changes**:
- Base Color change: 1,000 meseta per change
- Hair Color change: 500 meseta per change
- Shade change: 500 meseta per change

**Variation Changes**:
- Head Variation change: 2,000 meseta per change

**Free Options**:
- Returning to default (option 0) is free
- No charge for keeping current appearance

### Calculation Logic

Total cost = sum of changes from current state:
- If current baseColor = 0, changing to baseColor = 2 costs 1,000
- If current hairColor = 0, changing to hairColor = 1 costs 500
- If keeping shade = 0, no charge for shade
- If changing headVariation = 0 to 1, costs 2,000

Example: Changing from default (c0_h0_s0_v0) to (c2_h1_s1_v1) = 1,000 + 500 + 500 + 2,000 = 4,000 meseta

## Database Integration

### Character Appearance Storage

Appearance is stored in `character_state` table (see [Character Create](/screens/character-create)):

```sql
-- Update appearance
UPDATE character_state
SET appearance = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        appearance,
        '{baseColor}', '2'
      ),
      '{hairColor}', '1'
    ),
    '{shade}', '1'
  ),
  '{headVariation}', '1'
)
WHERE character_id = $1;
```

### Event Sourcing

Customization changes are recorded as events:

```typescript
{
  eventType: 'CHARACTER_APPEARANCE_CHANGED',
  eventData: {
    previousAppearance: {
      baseColor: 0,
      hairColor: 0,
      shade: 0,
      headVariation: 0
    },
    newAppearance: {
      baseColor: 2,
      hairColor: 1,
      shade: 1,
      headVariation: 1
    },
    cost: 4000,
    mesetaBefore: 15000,
    mesetaAfter: 11000,
    texturePath: '/textures/characters/humar_v1_c2_h1_s1.png',
    modelPath: '/models/characters/humar_v1.glb'
  }
}
```

## Texture Path Generation

The texture path is computed based on customization:

```typescript
function generateTexturePath(
  race: string,
  class: string,
  variation: number,
  baseColor: number,
  hairColor: number,
  shade: number
): string {
  const classPrefix = class.toLowerCase(); // e.g., "humar"
  return `/textures/characters/${classPrefix}_v${variation}_c${baseColor}_h${hairColor}_s${shade}.png`;
}

// Example: HUmar with v1, c2, h1, s1
// Returns: /textures/characters/humar_v1_c2_h1_s1.png
```

Model path generation:

```typescript
function generateModelPath(
  race: string,
  class: string,
  variation: number
): string {
  const classPrefix = class.toLowerCase();
  return `/models/characters/${classPrefix}_v${variation}.glb`;
}

// Example: HUmar with v1
// Returns: /models/characters/humar_v1.glb
```

## Implementation Notes

### Client-Side Preview

For smooth UX, implement client-side preview:
1. Load all texture variants for current character during sync
2. Swap textures on 3D model in real-time as user selects options
3. Calculate cost on client and verify on server
4. Only commit changes when user confirms

### Asset Management

Since all assets are pre-cached (see [Sync](/screens/sync)):
- All textures for current character class already downloaded
- Model variations already cached
- Preview is instant with no loading time
- Switching between options is seamless

### Validation

Server must validate:
- Character owns the character being customized
- Customization options are valid for the character's race/class
- Character has sufficient meseta
- Texture and model paths exist

### Transaction Atomicity

```sql
BEGIN TRANSACTION;
  -- Update character appearance
  UPDATE character_state SET appearance = $newAppearance WHERE character_id = $id;

  -- Deduct meseta
  UPDATE character_state SET meseta = meseta - $cost WHERE character_id = $id;

  -- Record event
  INSERT INTO character_events (...) VALUES (...);
COMMIT;
```

## Appearance Constraints

### Race-Specific Constraints

Each race has different customization options:
- **Humans**: 4 variations, 5 colors, 3 hair, 3 shades
- **CASTs**: Different model parts, metallic textures
- **Newmans**: Elf-like features, different ear/hair options

### Class-Specific Constraints

Each class within a race has unique models:
- HUmar, HUnewearl, HUcast, etc. each have distinct appearance sets
- Cannot mix customization across classes
- Variations are class-specific

## Security Considerations

- Validate all customization options server-side
- Prevent invalid texture/model path injection
- Check meseta balance before applying
- Rate limit customization requests
- Log all appearance changes for audit

## Future Enhancements

- **Cosmetic Items**: Hats, glasses, accessories
- **Premium Customization**: Special colors or effects for real money
- **Seasonal Cosmetics**: Limited-time appearance options
- **Saved Presets**: Save multiple appearance configurations
- **Random Appearance**: Randomize all options for fun
- **Appearance Vouchers**: Free customization tickets from quests
- **Preview Emotes**: Preview character with different animations
- **Screenshot Feature**: Capture character appearance to share
- **Appearance History**: View and revert to past appearances
- **Voice Options**: Change character voice lines (if applicable)
