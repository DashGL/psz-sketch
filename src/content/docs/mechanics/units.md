---
title: Units
description: Unit system and stat-boosting attachments in Density Dwarf
---

Units are special items that can be attached to Frames (body armor) to provide additional stat bonuses and special abilities. Frames have a limited number of unit slots (typically 0-4), and units can only be equipped if slots are available.

## Unit System

### Unit Slots

Frames have a varying number of unit slots based on their quality and type:
- **Basic Frames**: 0-1 slots
- **Standard Frames**: 2 slots
- **Advanced Frames**: 3 slots
- **Elite Frames**: 4 slots

### Unit Installation

Units are installed into available slots on equipped frames. Each unit occupies one slot and provides specific bonuses while installed.

## Unit Types

### Stat-Boosting Units

#### HP Units
- Increase maximum HP
- Various tiers providing different HP bonuses

#### TP Units
- Increase maximum TP (Technique Points)
- Not useful for CASTs (who cannot use techniques)

#### Attack Units
- Boost ATP (Attack Power)
- Increase physical damage output

#### Defense Units
- Boost DFP (Defense Power)
- Reduce incoming physical damage

#### Mental Units
- Boost MST (Mental Strength)
- Increase technique damage and defense

#### Accuracy Units
- Boost ATA (Attack Accuracy)
- Improve hit rate

#### Evasion Units
- Boost EVP (Evasion)
- Improve dodge rate

#### Luck Units
- Boost LCK (Luck)
- Affect item drop rates and critical hits

### Special Ability Units

#### Resistance Units
- Provide resistance to specific elements (Fire, Ice, Lightning, etc.)
- Reduce damage from elemental attacks

#### Status Protection Units
- Protect against status effects (Poison, Paralysis, Confusion, etc.)
- Prevent or reduce status ailment duration

#### Regeneration Units
- Passive HP regeneration
- Passive TP regeneration

#### Other Special Units
TBD - Additional special effects and abilities

## Unit Rarity

TBD - Rarity tiers and their effect on bonuses

## Database Schema

```sql
-- Unit definitions
CREATE TABLE unit_definitions (
  unit_id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit_type VARCHAR(50) NOT NULL, -- hp, tp, attack, defense, etc.
  rarity INTEGER NOT NULL,

  -- Stat bonuses
  bonus_hp INTEGER DEFAULT 0,
  bonus_tp INTEGER DEFAULT 0,
  bonus_atp INTEGER DEFAULT 0,
  bonus_dfp INTEGER DEFAULT 0,
  bonus_mst INTEGER DEFAULT 0,
  bonus_ata INTEGER DEFAULT 0,
  bonus_evp INTEGER DEFAULT 0,
  bonus_lck INTEGER DEFAULT 0,

  -- Special effects
  special_effect VARCHAR(100), -- e.g., 'fire_resistance', 'poison_immunity'
  special_value DECIMAL(5,2), -- Magnitude of special effect

  -- Requirements
  min_level INTEGER NOT NULL DEFAULT 1,

  -- Visual
  icon_path TEXT NOT NULL,

  INDEX idx_unit_type (unit_type),
  INDEX idx_rarity (rarity)
);

-- Player unit instances and installation
CREATE TABLE player_units (
  instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id VARCHAR(100) NOT NULL,
  character_id UUID NOT NULL,
  installed_in_armor_instance UUID, -- NULL if in inventory, references player_armor

  FOREIGN KEY (unit_id) REFERENCES unit_definitions(unit_id),
  FOREIGN KEY (character_id) REFERENCES character_state(character_id),
  FOREIGN KEY (installed_in_armor_instance) REFERENCES player_armor(instance_id),

  INDEX idx_character_units (character_id),
  INDEX idx_installed_units (installed_in_armor_instance)
);
```

## Unit Management

### Installing Units

1. Character must have an equipped frame with available unit slots
2. Unit must meet level requirements
3. Unit is moved from inventory to the frame's unit slot
4. Bonuses are immediately applied to character stats

### Removing Units

1. Unit is removed from the frame's unit slot
2. Unit returns to inventory
3. Bonuses are removed from character stats

### Slot Limitations

- Cannot install more units than available slots
- Some special frames may have restrictions on unit types
- Units can be swapped between slots freely

## Notes for Implementation

- Complete unit list needs to be extracted from game data
- Unit drop rates and acquisition methods need specification
- Unit stacking rules (if any) need documentation
- Special effect mechanics need detailed specification
- Frame slot counts for all frames need cataloging
