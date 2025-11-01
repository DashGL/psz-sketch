---
title: Character Create
description: Character creation system with race, class, and customization options
---

The Character Create screen (`/character-create`) allows players to create a new character for an empty slot. Players choose their race, class, and customize their appearance before entering the game.

## Character Creation Flow

### 1. Race Selection

Players first select from three available races:

#### Human

![Human Race Selection](/screenshots/create-humans.png)

**Description**: "The original race, and the most numerous. Well-balanced and suited for beginners."

Humans are the balanced race, capable of becoming any class (Hunter, Ranger, or Force). They have moderate stats across the board and can use techniques in all non-CAST classes.

#### CAST

![CAST Race Selection](/screenshots/create-cast.png)

**Description**: "Artificial life forms. Can use traps. Suited for intermediate players."

CASTs are androids that cannot use techniques but have access to trap-based abilities. They can become Hunters or Rangers, offering higher physical stats at the cost of technique usage.

#### Newman

![Newman Race Selection](/screenshots/create-newman.png)

**Description**: "A lunar race skilled with techniques, but with low defense and HP. For advanced players."

Newmans are the magical race with high mental stats and technique proficiency but lower physical defense and HP. They can become Hunters or Forces, excelling at technique-based combat.

### 2. Class Selection

After selecting a race, players choose their class. Available classes depend on the selected race:

#### Hunter (HU) - All Races

Hunters specialize in close-range physical combat.

**Available Classes**:
- **HUmar**: Male Human - Balanced melee fighter
- **HUmarl**: Female Human - Balanced melee fighter
- **HUcast**: Male CAST - High attack, no techniques, can use traps
- **HUcaseal**: Female CAST - High attack, no techniques, can use traps
- **HUnewm**: Male Newman - Melee with technique support
- **HUnewearl**: Female Newman - Melee with technique support

**Weapon Specialties**: Swords, Sabers, Spears, Shields, Gun Blades, Claws

**Technique Access**: Limited techniques (humans and newmans only; CASTs cannot use techniques)

#### Ranger (RA) - Humans and CASTs Only

Rangers specialize in ranged combat and artillery.

**Available Classes**:
- **RAmar**: Male Human - Balanced ranged fighter
- **RAmarl**: Female Human - Balanced ranged fighter
- **RAcast**: Male CAST - High ranged damage, no techniques, can use traps
- **RAcaseal**: Female CAST - High ranged damage, no techniques, can use traps

**Weapon Specialties**: Pistols, Rifles, Cannons, Bazookas, Machineguns, Gun Blades

**Technique Access**: Limited techniques (humans only; CASTs cannot use techniques)

#### Force (FO) - Humans and Newmans Only

Forces specialize in technique-based combat and support.

**Available Classes**:
- **FOmar**: Male Human - Balanced technique user
- **FOmarl**: Female Human - Balanced technique user
- **FOnewm**: Male Newman - High technique power
- **FOnewearl**: Female Newman - High technique power

**Weapon Specialties**: Wands, Rods (can use other weapons with reduced effectiveness)

**Technique Access**: Full technique mastery with wide arsenal

### 3. Appearance Customization

Each class has extensive customization options:

#### Model Variations
- **4 Head Variations**: Each class has 4 different head/face models sharing the same base body

#### Color Customization
- **5 Base Colors**: Primary body/outfit color schemes
- **3 Hair Colors**: Hair color options (varies by class)
- **3 Shades**: Light/medium/dark variations of colors

**Total Textures per Class**: 45 unique texture combinations (5 base × 3 hair × 3 shades)

**Note**: Color palettes and hair color options are unique to each class and must be data-mined from game files.

### 4. MAG Selection

Players choose the starting color for their MAG companion:

- MAG color options (exact colors to be determined from game data)
- MAG starts at Level 5 with base stats
- MAG grows by feeding items and evolves based on stat distribution

### 5. Character Naming

Players enter a character name:
- Maximum length: TBD (to be verified from game)
- Allowed characters: Letters, numbers, possibly symbols
- Profanity filter: TBD based on server implementation

## Initial Character State

When a character is created, they receive:

### Starting Inventory
- **Weapon**: Class-specific starter weapon
  - Hunters: Basic Saber
  - Rangers: Basic Handgun
  - Forces: Basic Wand
- **Armor**: Basic Frame (class-appropriate)
- **MAG**: Level 5 MAG with chosen color
- **Currency**: 500 Meseta
- **Items**: 3 Monomates (healing items)

### Starting Stats
- **Level**: 1
- **Base Stats**: Determined by class (requires data mining)
  - HP (Health Points)
  - TP/PP (Technique Points / Photon Points) - 0 for CASTs
  - ATP (Attack Power)
  - DFP (Defense Power)
  - MST (Mental Strength)
  - ATA (Attack Accuracy)
  - EVP (Evasion)
- **Resistances**: Elemental resistance percentages
  - R-Fire (Fire Resistance)
  - R-Ice (Ice Resistance)
  - R-Thunder (Thunder Resistance)
  - R-Light (Light Resistance)
  - R-Dark (Dark Resistance)

**Note**: PSO Zero simplified stats compared to PSO - LCK (Luck) stat has been removed. Complete stat tables for all classes at all levels (1-100) need to be extracted from game files or data-mined using cheats.

## Server API

### Create Character

**Endpoint**: `POST /api/characters/create`

**Request Headers**:
```http
Authorization: Bearer <session_token>
```

**Request Body**:
```json
{
  "slotIndex": 0,
  "race": "Human",
  "class": "HUmarl",
  "name": "Rina",
  "modelVariation": 1,
  "baseColorIndex": 2,
  "hairColorIndex": 0,
  "shadeIndex": 1,
  "magColorIndex": 3
}
```

**Response**:
```json
{
  "characterId": "uuid-v4",
  "character": {
    "slotIndex": 0,
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
    "stats": {
      "hp": 50,
      "tp": 30,
      "atp": 12,
      "dfp": 10,
      "mst": 8,
      "ata": 10,
      "evp": 8
    },
    "resistances": {
      "rFire": 0,
      "rIce": 0,
      "rThunder": 0,
      "rLight": 4,
      "rDark": 4
    },
    "inventory": {
      "meseta": 500,
      "items": [
        {
          "itemId": "starter-saber",
          "equipped": true,
          "slot": "weapon"
        },
        {
          "itemId": "starter-frame",
          "equipped": true,
          "slot": "armor"
        },
        {
          "itemId": "monomate",
          "quantity": 3,
          "slot": "item"
        }
      ]
    },
    "mag": {
      "magId": "uuid-v4",
      "level": 5,
      "colorIndex": 3,
      "stats": {
        "pow": 0,
        "dex": 0,
        "mind": 0
      },
      "synchro": 0,
      "iq": 0
    },
    "playTimeSeconds": 0,
    "createdAt": "2025-10-28T10:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid class/race combination or customization indices
- `401 Unauthorized`: Invalid session token
- `409 Conflict`: Slot already occupied or character name taken
- `500 Internal Server Error`: Database error

## Database Schema Extensions

### Character Events - Extended Event Types

#### CHARACTER_CREATED Event (Extended)

```json
{
  "eventType": "CHARACTER_CREATED",
  "eventData": {
    "name": "Rina",
    "race": "Human",
    "class": "HUmarl",
    "level": 1,
    "slotIndex": 0,
    "appearance": {
      "modelVariation": 1,
      "baseColorIndex": 2,
      "hairColorIndex": 0,
      "shadeIndex": 1,
      "modelPath": "/models/characters/humarl_v1.glb",
      "texturePath": "/textures/characters/humarl_v1_c2_h0_s1.png"
    },
    "initialStats": {
      "hp": 50,
      "tp": 30,
      "atp": 12,
      "dfp": 10,
      "mst": 8,
      "ata": 10,
      "evp": 8,
      "lck": 5
    },
    "initialInventory": {
      "meseta": 500,
      "items": [
        {"itemId": "starter-saber", "equipped": true, "slot": "weapon"},
        {"itemId": "starter-frame", "equipped": true, "slot": "armor"},
        {"itemId": "monomate", "quantity": 3}
      ]
    },
    "mag": {
      "magId": "uuid-v4",
      "level": 5,
      "colorIndex": 3
    }
  }
}
```

### Inventory System Tables

```sql
-- Character inventory state
CREATE TABLE character_inventory (
  character_id UUID NOT NULL,
  meseta INTEGER NOT NULL DEFAULT 0,
  bank_meseta INTEGER NOT NULL DEFAULT 0,
  max_inventory_slots INTEGER NOT NULL DEFAULT 30,

  PRIMARY KEY (character_id),
  FOREIGN KEY (character_id) REFERENCES character_state(character_id)
);

-- Individual inventory items
CREATE TABLE inventory_items (
  item_instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  item_id VARCHAR(100) NOT NULL, -- References item definition
  quantity INTEGER NOT NULL DEFAULT 1,
  slot_position INTEGER, -- NULL for bank items
  is_equipped BOOLEAN DEFAULT FALSE,
  equipment_slot VARCHAR(20), -- weapon, armor, shield, unit1, unit2, unit3
  item_data JSONB, -- For weapon stats, grind level, etc.

  FOREIGN KEY (character_id) REFERENCES character_state(character_id),
  INDEX idx_character_inventory (character_id),
  INDEX idx_equipped_items (character_id, is_equipped)
);

-- MAG state
CREATE TABLE character_mag (
  mag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  level INTEGER NOT NULL DEFAULT 5,
  color_index INTEGER NOT NULL,
  pow INTEGER NOT NULL DEFAULT 0,
  dex INTEGER NOT NULL DEFAULT 0,
  mind INTEGER NOT NULL DEFAULT 0,
  synchro DECIMAL(5,2) NOT NULL DEFAULT 0,
  iq INTEGER NOT NULL DEFAULT 0,
  photon_blast VARCHAR(50),

  FOREIGN KEY (character_id) REFERENCES character_state(character_id)
);

-- Character stats (current state)
CREATE TABLE character_stats (
  character_id UUID PRIMARY KEY,
  level INTEGER NOT NULL DEFAULT 1,
  experience BIGINT NOT NULL DEFAULT 0,

  -- Base stats (from level + class)
  base_hp INTEGER NOT NULL,
  base_tp INTEGER NOT NULL,
  base_atp INTEGER NOT NULL,
  base_dfp INTEGER NOT NULL,
  base_mst INTEGER NOT NULL,
  base_ata INTEGER NOT NULL,
  base_evp INTEGER NOT NULL,

  -- Resistances (percentage, from class base)
  base_r_fire INTEGER NOT NULL DEFAULT 0,
  base_r_ice INTEGER NOT NULL DEFAULT 0,
  base_r_thunder INTEGER NOT NULL DEFAULT 0,
  base_r_light INTEGER NOT NULL DEFAULT 0,
  base_r_dark INTEGER NOT NULL DEFAULT 0,

  -- Current values (can be modified by equipment, buffs, etc.)
  current_hp INTEGER NOT NULL,
  current_tp INTEGER NOT NULL,

  FOREIGN KEY (character_id) REFERENCES character_state(character_id)
);
```

### Extended Character State Table

Update the `character_state` table from the Character Select documentation:

```sql
ALTER TABLE character_state
ADD COLUMN race VARCHAR(20) NOT NULL,
ADD COLUMN class VARCHAR(20) NOT NULL,
ADD COLUMN model_variation INTEGER NOT NULL CHECK (model_variation >= 0 AND model_variation <= 3),
ADD COLUMN base_color_index INTEGER NOT NULL,
ADD COLUMN hair_color_index INTEGER NOT NULL,
ADD COLUMN shade_index INTEGER NOT NULL,
ADD COLUMN model_path TEXT NOT NULL,
ADD COLUMN texture_path TEXT NOT NULL;
```

## Astro Content Collections

To support character creation, we need content collections for game data:

### Class Stats Collection

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const classStatsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    class: z.enum(['HUmar', 'HUmarl', 'HUcast', 'HUcaseal', 'HUnewm', 'HUnewearl',
                   'RAmar', 'RAmarl', 'RAcast', 'RAcaseal',
                   'FOmar', 'FOmarl', 'FOnewm', 'FOnewearl']),
    race: z.enum(['Human', 'CAST', 'Newman']),
    statsByLevel: z.array(z.object({
      level: z.number().min(1).max(100),
      hp: z.number(),
      tp: z.number(), // PP (Photon Points) in PSO Zero
      atp: z.number(),
      dfp: z.number(),
      mst: z.number(),
      ata: z.number(),
      evp: z.number(),
      // Elemental resistances (percentage)
      rFire: z.number(),
      rIce: z.number(),
      rThunder: z.number(),
      rLight: z.number(),
      rDark: z.number(),
      expToNext: z.number().optional() // Experience needed for next level
    }))
  })
});

const customizationOptionsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    class: z.string(),
    modelVariations: z.number().min(4).max(4),
    baseColors: z.array(z.object({
      index: z.number(),
      name: z.string(),
      hex: z.string() // For preview purposes
    })),
    hairColors: z.array(z.object({
      index: z.number(),
      name: z.string(),
      hex: z.string()
    })),
    shades: z.array(z.object({
      index: z.number(),
      name: z.string(),
      multiplier: z.number() // brightness multiplier
    })),
    starterItems: z.object({
      weapon: z.string(), // Item ID
      armor: z.string(),  // Item ID
      meseta: z.number(),
      consumables: z.array(z.object({
        itemId: z.string(),
        quantity: z.number()
      }))
    })
  })
});

export const collections = {
  'class-stats': classStatsCollection,
  'customization-options': customizationOptionsCollection
};
```

### Example Data Files

```yaml
# src/content/class-stats/humarl.yaml
class: HUmarl
race: Human
statsByLevel:
  - level: 1
    hp: 50  # TBD - needs verification
    tp: 30  # TBD - needs verification
    atp: 12  # TBD - needs verification
    dfp: 10  # TBD - needs verification
    mst: 8  # TBD - needs verification
    ata: 10  # TBD - needs verification
    evp: 8  # TBD - needs verification
    rFire: 0  # TBD - needs verification
    rIce: 0  # TBD - needs verification
    rThunder: 0  # TBD - needs verification
    rLight: 4  # TBD - needs verification
    rDark: 4  # TBD - needs verification
  - level: 2
    hp: 55  # TBD - needs verification
    tp: 32  # TBD - needs verification
    atp: 13  # TBD - needs verification
    dfp: 11  # TBD - needs verification
    mst: 9  # TBD - needs verification
    ata: 11  # TBD - needs verification
    evp: 9  # TBD - needs verification
    rFire: 0  # TBD
    rIce: 0  # TBD
    rThunder: 0  # TBD
    rLight: 4  # TBD
    rDark: 4  # TBD
  # ... levels 3-100 (to be data-mined)
```

```yaml
# src/content/class-stats/humar.yaml
class: HUmar
race: Human
statsByLevel:
  - level: 1
    hp: 82
    tp: 67
    atp: 56
    dfp: 10
    mst: 33
    ata: 110
    evp: 13
    # Resistances
    rFire: 0
    rIce: 0
    rThunder: 0
    rLight: 4
    rDark: 4
    expToNext: 70
  - level: 2
    hp: 85  # TBD - needs verification
    tp: 69  # TBD - needs verification
    atp: 57  # TBD - needs verification
    dfp: 11  # TBD - needs verification
    mst: 34  # TBD - needs verification
    ata: 111  # TBD - needs verification
    evp: 14  # TBD - needs verification
    # Resistances (TBD - likely same as level 1 or scale gradually)
    rFire: 0  # TBD
    rIce: 0  # TBD
    rThunder: 0  # TBD
    rLight: 4  # TBD
    rDark: 4  # TBD
    expToNext: 150  # TBD - needs verification
  # ... levels 3-100 (to be data-mined)
```

```yaml
# src/content/customization-options/humarl.yaml
class: HUmarl
modelVariations: 4
baseColors:
  - index: 0
    name: "Red"
    hex: "#FF0000"
  - index: 1
    name: "Blue"
    hex: "#0000FF"
  - index: 2
    name: "Green"
    hex: "#00FF00"
  - index: 3
    name: "Yellow"
    hex: "#FFFF00"
  - index: 4
    name: "Purple"
    hex: "#FF00FF"
hairColors:
  - index: 0
    name: "Blonde"
    hex: "#FFD700"
  - index: 1
    name: "Brown"
    hex: "#8B4513"
  - index: 2
    name: "Black"
    hex: "#000000"
shades:
  - index: 0
    name: "Light"
    multiplier: 1.2
  - index: 1
    name: "Normal"
    multiplier: 1.0
  - index: 2
    name: "Dark"
    multiplier: 0.8
starterItems:
  weapon: "saber-basic"
  armor: "frame-basic-humarl"
  meseta: 500
  consumables:
    - itemId: "monomate"
      quantity: 3
```

```yaml
# src/content/customization-options/humar.yaml
class: HUmar
modelVariations: 4
baseColors:
  - index: 0
    name: "Red"  # TBD - needs verification
    hex: "#FF0000"
  - index: 1
    name: "Blue"  # TBD - needs verification
    hex: "#0000FF"
  - index: 2
    name: "Green"  # TBD - needs verification
    hex: "#00FF00"
  - index: 3
    name: "Yellow"  # TBD - needs verification
    hex: "#FFFF00"
  - index: 4
    name: "Purple"  # TBD - needs verification
    hex: "#FF00FF"
hairColors:
  - index: 0
    name: "Blonde"  # TBD - needs verification
    hex: "#FFD700"
  - index: 1
    name: "Brown"  # TBD - needs verification
    hex: "#8B4513"
  - index: 2
    name: "Black"  # TBD - needs verification
    hex: "#000000"
shades:
  - index: 0
    name: "Light"
    multiplier: 1.2
  - index: 1
    name: "Normal"
    multiplier: 1.0
  - index: 2
    name: "Dark"
    multiplier: 0.8
starterItems:
  weapon: "cutlass"  # HUmar starts with Cutlass
  armor: "normal-frame"  # HUmar starts with Normal Frame
  meseta: 500
  consumables:
    - itemId: "monomate"
      quantity: 5  # HUmar starts with 5 Monomates
    - itemId: "monofluid"
      quantity: 5  # HUmar starts with 5 Monofluids
```

## Data Mining Requirements

To complete the character creation system, the following data must be extracted from the game:

### Critical Data Needed
1. **Class Base Stats**: HP, TP, ATP, DFP, MST, ATA, EVP, LCK for all 14 classes at levels 1-100
2. **Stat Growth Formulas**: How stats increase per level (if formulaic rather than tabular)
3. **Customization Options**: Exact color palettes for each class (5 base colors × 14 classes = 70 palettes)
4. **Hair Colors**: 3 hair colors per class (may vary by class)
5. **Texture Mappings**: Naming convention for texture files based on variation/color/hair/shade indices
6. **Starter Equipment**: Item IDs and stats for each class's starting weapon and armor
7. **MAG Colors**: Available color options for starting MAG
8. **Character Name Constraints**: Max length, allowed characters, profanity filter list

### Data Mining Approaches
- **Memory Editing**: Use Action Replay or similar to view stat tables in memory
- **File Extraction**: Decompile game files to find stat tables and customization data
- **Save File Analysis**: Create characters with known stats and reverse-engineer save file format
- **Community Resources**: Check existing PSO0 wikis and databases for compiled information

## Implementation Notes

### Texture Generation
- Pre-generate all 630 texture combinations (45 per class × 14 classes) during build
- Store in `/public/textures/characters/` with naming convention: `{class}_v{variation}_c{color}_h{hair}_s{shade}.png`
- Use sprite sheets for efficient loading if textures are small

### Validation
- Validate race/class combinations server-side (e.g., Newman cannot be Ranger)
- Ensure customization indices are within valid ranges for selected class
- Check slot is empty before creating character
- Verify character name uniqueness and profanity filtering

### Client-Side Preview
- Show real-time preview of character appearance as player adjusts customization options
- Display base stats for selected class/level
- Show starting equipment and MAG
