---
title: Weapons
description: Weapon types, stats, and mechanics in Density Dwarf
---

Weapons are the primary means of dealing damage in Density Dwarf. Each class specializes in different weapon types, and weapons have various stats and properties that affect combat performance.

## Weapon Types

### Melee Weapons

#### Swords
- **Primary Classes**: Hunters
- **Attack Style**: Balanced physical damage
- **Special Properties**: TBD

#### Sabers
- **Primary Classes**: Hunters
- **Attack Style**: Fast, balanced attacks
- **Special Properties**: TBD

#### Spears
- **Primary Classes**: Hunters
- **Attack Style**: Long reach, piercing attacks
- **Special Properties**: TBD

#### Claws
- **Primary Classes**: Hunters
- **Attack Style**: Fast, multi-hit combos
- **Special Properties**: TBD

### Ranged Weapons

#### Pistols
- **Primary Classes**: Rangers
- **Attack Style**: Fast, accurate shots
- **Special Properties**: TBD

#### Rifles
- **Primary Classes**: Rangers
- **Attack Style**: Long-range precision
- **Special Properties**: TBD

#### Machineguns
- **Primary Classes**: Rangers
- **Attack Style**: Rapid-fire suppression
- **Special Properties**: TBD

#### Cannons
- **Primary Classes**: Rangers
- **Attack Style**: Heavy damage, area effect
- **Special Properties**: TBD

#### Bazookas
- **Primary Classes**: Rangers
- **Attack Style**: Explosive projectiles
- **Special Properties**: TBD

### Technique Weapons

#### Wands
- **Primary Classes**: Forces
- **Attack Style**: Melee with technique boost
- **Special Properties**: Enhances technique power

#### Rods
- **Primary Classes**: Forces
- **Attack Style**: Ranged with technique boost
- **Special Properties**: Enhances technique power and range

### Hybrid Weapons

#### Gun Blades
- **Primary Classes**: Hunters, Rangers
- **Attack Style**: Melee and ranged hybrid
- **Special Properties**: Can switch between modes

## Weapon Stats

### Primary Stats

- **ATP (Attack Power)**: Base damage of the weapon
- **ATA (Attack Accuracy)**: Hit rate modifier
- **Grind**: Upgrade level (0-10, affects damage)
- **Attributes**: Elemental or special properties
- **Requirements**: Minimum stats needed to equip

### Special Attributes

- **Elemental**: Fire, Ice, Lightning, Light, Dark
- **Status Effects**: Poison, Paralysis, Confusion, etc.
- **Special Abilities**: TBD

## Weapon Rarity

TBD - Rarity tiers and how they affect stats

## Grinding and Enhancement

TBD - How weapons can be upgraded and enhanced

## Database Schema

```sql
-- Weapon definitions
CREATE TABLE weapon_definitions (
  weapon_id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  weapon_type VARCHAR(50) NOT NULL,
  base_atp INTEGER NOT NULL,
  base_ata INTEGER NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  rarity INTEGER NOT NULL,
  element VARCHAR(20),
  special_ability VARCHAR(50),

  -- Requirements
  required_class_types TEXT[], -- e.g., ['Hunter', 'Ranger']
  required_atp INTEGER,
  required_ata INTEGER,

  -- Visual
  model_path TEXT NOT NULL,
  icon_path TEXT NOT NULL,

  INDEX idx_weapon_type (weapon_type),
  INDEX idx_rarity (rarity)
);

-- Player weapon instances
CREATE TABLE player_weapons (
  instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weapon_id VARCHAR(100) NOT NULL,
  character_id UUID NOT NULL,
  grind_level INTEGER NOT NULL DEFAULT 0 CHECK (grind_level >= 0 AND grind_level <= 10),

  -- Instance-specific modifiers
  bonus_atp INTEGER DEFAULT 0,
  bonus_ata INTEGER DEFAULT 0,

  FOREIGN KEY (weapon_id) REFERENCES weapon_definitions(weapon_id),
  FOREIGN KEY (character_id) REFERENCES character_state(character_id)
);
```

## Notes for Implementation

- Complete weapon list needs to be extracted from game data
- Weapon attack patterns and animations need documentation
- Special abilities and their effects need definition
- Drop rates and acquisition methods need specification
