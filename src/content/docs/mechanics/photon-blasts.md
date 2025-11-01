---
title: Photon Blasts
description: Powerful special attacks unleashed by MAGs in Density Dwarf
---

Photon Blasts are devastating special attacks that MAGs can unleash when their owner has built up sufficient Synchro. Each MAG evolution has an associated Photon Blast that determines the type of attack or effect when activated.

## Overview

### Activation Requirements

- **Synchro Level**: Must have sufficient synchro built up during combat
- **MAG Evolution**: MAG must have evolved to at least Second Form to have a photon blast
- **Cooldown**: TBD - Time between photon blast uses

### Synchro System

Synchro is the bond meter between a character and their MAG:

#### Building Synchro
- Taking damage from enemies
- Dealing damage to enemies
- Time spent in combat
- MAG level and IQ affect synchro gain rate

#### Synchro Range
- Minimum: 0%
- Maximum: 120%
- Higher synchro = more powerful photon blast

#### Synchro Consumption
- Using a photon blast consumes synchro
- Amount consumed varies by blast type
- Synchro resets to 0 after use

## Photon Blast Types

There are four main photon blasts in Phantasy Star Zero, each associated with different MAG stat focuses.

### Guraniru

**Associated Stats**: Power (POW) focused MAGs

**MAGs with Guraniru**:
- [Yuru](/mechanics/mags#yuru-pow-highest) (2nd Form)
- [Soon](/mechanics/mags#soon-pow-only) (3rd Form)
- [Peoosu](/mechanics/mags#peoosu-hit-highest) (3rd Form)
- [Tiruna](/mechanics/mags#tiruna) (4th Form)
- [Ansuuru](/mechanics/mags#ansuuru) (4th Form)
- [Shato (Dark)](/mechanics/mags#shato-dark-color) (4th Form)

**Effect**: TBD - Requires game data extraction

**Damage Type**: Physical/Energy

**Area of Effect**: TBD

**Special Properties**: TBD

### Midogaru

**Associated Stats**: Defense (DEF) focused MAGs

**MAGs with Midogaru**:
- [Eoo](/mechanics/mags#eoo-def-highest) (2nd Form)
- [Marei](/mechanics/mags#marei-def-only) (3rd Form)
- [Diigu](/mechanics/mags#diigu-mind-highest) (3rd Form)
- [Urado](/mechanics/mags#urado) (4th Form)
- [Hagaru](/mechanics/mags#hagaru) (4th Form)
- [Feo](/mechanics/mags#feo) (4th Form)

**Effect**: TBD - Requires game data extraction

**Damage Type**: Physical/Energy

**Area of Effect**: TBD

**Special Properties**: TBD

### Pashifaru

**Associated Stats**: Accuracy (HIT) focused MAGs

**MAGs with Pashifaru**:
- [Iisu](/mechanics/mags#iisu-hit-highest) (2nd Form)
- [Teruu](/mechanics/mags#teruu-hit-only) (3rd Form)
- [Oseru](/mechanics/mags#oseru-pow-highest) (3rd Form)
- [Uin](/mechanics/mags#uin) (4th Form)
- [Beooku](/mechanics/mags#beooku) (4th Form)
- [Shigu (Primary)](/mechanics/mags#shigu-primary-color) (4th Form)

**Effect**: TBD - Requires game data extraction

**Damage Type**: Physical/Energy

**Area of Effect**: TBD

**Special Properties**: TBD

### Furoojiru

**Associated Stats**: Mental (MIND) focused MAGs

**MAGs with Furoojiru**:
- [Ingu](/mechanics/mags#ingu-mind-highest) (2nd Form)
- [Niido](/mechanics/mags#niido-mind-only) (3rd Form)
- [Eoroo](/mechanics/mags#eoroo-def-highest) (3rd Form)
- [Shato (Light)](/mechanics/mags#shato-light-color) (4th Form)
- [Raagu](/mechanics/mags#raagu) (4th Form)
- [Shigu (Light)](/mechanics/mags#shigu-light-color) (4th Form)

**Effect**: TBD - Requires game data extraction

**Damage Type**: Technique/Energy

**Area of Effect**: TBD

**Special Properties**: TBD

## Rare MAG Photon Blasts

Rare MAGs obtained through feeding Heart items retain the photon blast from their previous evolution form:

- [Rappy](/mechanics/mags#rappy-level-60): Inherits blast
- [Puyopuyo](/mechanics/mags#puyopuyo-level-60): Inherits blast
- [Lassi](/mechanics/mags#lassi-level-60): Inherits blast
- [Toppy](/mechanics/mags#toppy-level-60): Inherits blast
- [Sonichi](/mechanics/mags#sonichi-level-70): Inherits blast
- [Femini](/mechanics/mags#femini-level-75): Inherits blast
- [Radame](/mechanics/mags#radame-level-80): Inherits blast
- [Aakaazu](/mechanics/mags#aakaazu-level-60): Inherits blast

## Photon Blast Mechanics

### Damage Calculation

Photon Blast damage is influenced by:
- **Synchro Level**: Higher synchro = more damage
- **MAG Level**: Higher level MAG = stronger blast
- **Character Stats**: Varies by blast type (ATP for physical, MST for technique)
- **Enemy Resistance**: Some enemies resist certain blast types

### Tactical Usage

#### Solo Play
- Save photon blast for boss fights or dangerous situations
- Use when surrounded by multiple enemies
- Emergency damage burst when low on HP

#### Multiplayer
- Coordinate with team for maximum effect
- Chain photon blasts for bonus damage (if applicable)
- Use supportive blasts to heal or buff allies (if applicable)

### Invincibility Frames

Photon blast activation may provide invincibility frames:
- Character is invulnerable during animation
- Useful for dodging otherwise unavoidable attacks
- Strategic timing can prevent death

## Database Schema

The photon blast definitions table was included in the [MAG documentation](/mechanics/mags#database-schema):

```sql
CREATE TABLE photon_blast_definitions (
  blast_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_damage INTEGER NOT NULL,
  damage_type VARCHAR(20) NOT NULL, -- physical, technique, hybrid
  damage_multiplier DECIMAL(5,2),
  area_of_effect BOOLEAN DEFAULT FALSE,
  aoe_radius DECIMAL(5,2), -- in game units
  synchro_cost DECIMAL(5,2) NOT NULL,
  animation_duration DECIMAL(5,2), -- in seconds
  invincibility_frames BOOLEAN DEFAULT TRUE,
  cooldown_seconds INTEGER DEFAULT 0,

  -- Special effects
  status_effect VARCHAR(50), -- Optional status to apply
  status_chance DECIMAL(5,2), -- Probability of status application

  -- Scaling
  scales_with VARCHAR(20), -- ATP, MST, both
  synchro_damage_bonus DECIMAL(5,2), -- Damage bonus per 10% synchro

  -- Visual
  animation_path TEXT NOT NULL,
  sound_effect_path TEXT
);
```

## Server API

### Activate Photon Blast

**Endpoint**: `POST /api/mag/photon-blast`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "magId": "uuid-v4",
  "targetId": "enemy-uuid-or-null-for-aoe",
  "position": {
    "x": 100.5,
    "y": 50.0,
    "z": 200.3
  }
}
```

**Response**:
```json
{
  "success": true,
  "photonBlastId": "guraniru",
  "damage": 5420,
  "synchroConsumed": 85.5,
  "remainingSynchro": 0,
  "hitTargets": [
    {
      "targetId": "enemy-uuid-1",
      "damage": 5420,
      "killed": true
    },
    {
      "targetId": "enemy-uuid-2",
      "damage": 3200,
      "killed": false
    }
  ],
  "statusEffectsApplied": []
}
```

**Error Responses**:
- `400 Bad Request`: Insufficient synchro
- `404 Not Found`: MAG or character not found
- `409 Conflict`: Photon blast on cooldown

### Get Photon Blast Info

**Endpoint**: `GET /api/photon-blast/:blastId`

**Response**:
```json
{
  "blastId": "guraniru",
  "name": "Guraniru",
  "description": "A powerful energy blast...",
  "damageType": "physical",
  "synchroRequired": 80,
  "areaOfEffect": true,
  "associatedMags": ["yuru", "soon", "peoosu", "tiruna", "ansuuru", "shato-dark"]
}
```

## Photon Blast Chains

If the game supports photon blast chaining (multiple players activating in sequence):

### Chain Mechanics
- Second blast within X seconds = chain bonus
- Damage multiplier increases with chain count
- Maximum chain count: TBD
- Chain resets after timeout or combat end

### Chain Bonuses
- 2-chain: +20% damage
- 3-chain: +40% damage
- 4-chain: +60% damage
- Visual effects become more dramatic with higher chains

## Notes for Implementation

- Complete damage formulas for each blast type need extraction
- Animation files and timing need cataloging
- Exact synchro costs per blast need specification
- Area of effect ranges need measurement
- Status effect chances and durations need documentation
- Invincibility frame duration needs frame-perfect testing
- Chain system mechanics (if any) need verification
- Multiplayer synchronization for blast activation
- Client-side prediction vs server authority
- Visual and audio effect file paths
