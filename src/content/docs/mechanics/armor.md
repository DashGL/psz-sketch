---
title: Armor
description: Armor types, frames, shields, and defensive equipment in Density Dwarf
---

Armor provides defensive stats and protection for characters. In Phantasy Star Zero, armor consists of Frames (body armor) and Shields.

## Armor Types

### Frames

Frames are the main body armor that provides defensive stats.

#### Frame Categories
- **Light Frames**: Low defense, higher evasion
- **Medium Frames**: Balanced defense and evasion
- **Heavy Frames**: High defense, lower evasion

#### Class-Specific Frames
Different classes have access to different frame types based on their role and requirements.

### Shields

Shields provide additional defense and can block attacks.

#### Shield Types
- **Small Shields**: Fast blocking, moderate defense
- **Large Shields**: High defense, slower blocking
- **Barriers**: Energy-based defense, technique resistance

## Armor Stats

### Primary Stats

- **DFP (Defense Power)**: Physical damage reduction
- **EVP (Evasion)**: Dodge rate modifier
- **Mental Defense**: Resistance to technique damage
- **Status Resistance**: Protection against status effects
- **Slots**: Number of unit slots available

### Equipment Requirements

- **Minimum Level**: Character level requirement
- **Class Restrictions**: Which classes can equip the armor
- **Stat Requirements**: Minimum DFP or other stats needed

## Armor Rarity

TBD - Rarity tiers and their effects on stats

## Enhancement

TBD - How armor can be upgraded

## Database Schema

```sql
-- Frame (body armor) definitions
CREATE TABLE frame_definitions (
  frame_id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  frame_type VARCHAR(50) NOT NULL, -- light, medium, heavy
  base_dfp INTEGER NOT NULL,
  base_evp INTEGER NOT NULL,
  mental_defense INTEGER NOT NULL DEFAULT 0,
  unit_slots INTEGER NOT NULL DEFAULT 0 CHECK (unit_slots >= 0 AND unit_slots <= 4),
  min_level INTEGER NOT NULL DEFAULT 1,
  rarity INTEGER NOT NULL,

  -- Requirements
  required_class_types TEXT[], -- e.g., ['Hunter', 'Ranger']

  -- Visual
  model_path TEXT NOT NULL,
  icon_path TEXT NOT NULL,

  INDEX idx_frame_type (frame_type),
  INDEX idx_rarity (rarity)
);

-- Shield definitions
CREATE TABLE shield_definitions (
  shield_id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  shield_type VARCHAR(50) NOT NULL, -- small, large, barrier
  base_dfp INTEGER NOT NULL,
  base_evp INTEGER NOT NULL,
  block_rate DECIMAL(5,2) NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  rarity INTEGER NOT NULL,

  -- Requirements
  required_class_types TEXT[],

  -- Visual
  model_path TEXT NOT NULL,
  icon_path TEXT NOT NULL,

  INDEX idx_shield_type (shield_type),
  INDEX idx_rarity (rarity)
);

-- Player armor instances
CREATE TABLE player_armor (
  instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  armor_id VARCHAR(100) NOT NULL, -- References either frame_id or shield_id
  armor_type VARCHAR(10) NOT NULL CHECK (armor_type IN ('frame', 'shield')),
  character_id UUID NOT NULL,

  -- Instance-specific modifiers
  bonus_dfp INTEGER DEFAULT 0,
  bonus_evp INTEGER DEFAULT 0,

  FOREIGN KEY (character_id) REFERENCES character_state(character_id)
);
```

## Notes for Implementation

- Complete armor list needs to be extracted from game data
- Frame and shield visual models need cataloging
- Unit slot system needs full documentation (see Units article)
- Drop rates and acquisition methods need specification
- Armor set bonuses (if any) need documentation
