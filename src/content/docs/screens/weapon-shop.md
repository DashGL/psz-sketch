---
title: Weapon Shop
description: Buy and sell weapons, armor, and units
---

The Weapon Shop is accessed from the [City](/screens/city) hub and allows players to purchase and sell weapons, armor (frames and shields), and units with meseta.

## Screen Flow

### Path

`/city/shop/weapons`

### Navigation

```
City → /city/shop/weapons → Browse/Buy/Sell equipment → Return to City
```

## Purpose

The Weapon Shop provides:
- **Weapon Sales**: Purchase swords, guns, wands, and other weapons
- **Armor Sales**: Buy frames and shields for defense
- **Unit Sales**: Purchase stat-boosting units
- **Equipment Trading**: Sell unwanted equipment for meseta
- **Stat Comparison**: Compare equipment stats before purchasing
- **Level Progression**: Access to better equipment as character levels up

## User Interface

### Shop Layout

**Left Panel - Shop Inventory**:
- Tabbed interface: Weapons / Armor / Units
- Equipment list with icons and names
- Stats preview (ATP, DFP, ATA, etc.)
- Price in meseta
- Level requirement indicator
- Class restriction tags

**Right Panel - Character Equipment**:
- Currently equipped weapon, armor, units
- Character stats with current equipment
- Stat comparison when selecting shop items
- Meseta balance
- Inventory slots available

**Middle Panel - Equipment Details**:
- Selected equipment's full stats
- 3D model preview (for weapons/armor)
- Description and lore text
- Special abilities or effects
- Class/race requirements
- Purchase or sell button

### Equipment Categories

**Weapons**:
- Melee (Swords, Sabers, Spears, Claws, Daggers)
- Ranged (Pistols, Rifles, Launchers, Mechs)
- Technique (Wands, Rods, Canes)
- Hybrid (Gun Blades)

**Armor**:
- Frames (Light, Medium, Heavy)
- Shields (Small, Medium, Large)

**Units**:
- HP Units
- TP Units
- Stat Boost Units (ATP, DFP, MST, etc.)
- Resistance Units
- Special Ability Units

### Stat Comparison

When selecting equipment to purchase:
```
Current Weapon: Cutlass
  ATP: 56-72
  ATA: +5
  Requirements: Level 1

Shop Item: Falchion
  ATP: 78-95         [+22 ATP ↑]
  ATA: +8            [+3 ATA ↑]
  Requirements: Level 5

Price: 2,500 meseta
```

Green arrows (↑) for improvements, red arrows (↓) for downgrades.

## Server API

### Get Weapon Shop Inventory

**Endpoint**: `GET /api/shop/weapons`

**Query Parameters**:
- `characterId`: UUID of the character
- `category`: weapons, armor, units (optional)
- `characterLevel`: Filter items by character level (optional)

**Response**:
```json
{
  "shopInventory": {
    "weapons": [
      {
        "itemId": "cutlass",
        "itemName": "Cutlass",
        "category": "weapon",
        "weaponType": "sword",
        "stats": {
          "atpMin": 56,
          "atpMax": 72,
          "ata": 5,
          "mst": 0
        },
        "requirements": {
          "minLevel": 1,
          "allowedClasses": ["HUmar", "HUnewearl", "HUcast", "HUcaseal"]
        },
        "price": 500,
        "sellPrice": 50,
        "rarity": "common",
        "iconPath": "/icons/weapons/cutlass.png",
        "modelPath": "/models/weapons/cutlass.glb"
      },
      {
        "itemId": "falchion",
        "itemName": "Falchion",
        "category": "weapon",
        "weaponType": "sword",
        "stats": {
          "atpMin": 78,
          "atpMax": 95,
          "ata": 8,
          "mst": 0
        },
        "requirements": {
          "minLevel": 5,
          "allowedClasses": ["HUmar", "HUnewearl", "HUcast", "HUcaseal"]
        },
        "price": 2500,
        "sellPrice": 250,
        "rarity": "common",
        "iconPath": "/icons/weapons/falchion.png",
        "modelPath": "/models/weapons/falchion.glb"
      }
    ],
    "armor": [
      {
        "itemId": "normal_frame",
        "itemName": "Normal Frame",
        "category": "armor",
        "armorType": "frame",
        "armorClass": "light",
        "stats": {
          "dfp": 10,
          "evp": 5,
          "unitSlots": 0
        },
        "requirements": {
          "minLevel": 1,
          "allowedClasses": []
        },
        "price": 300,
        "sellPrice": 30,
        "rarity": "common",
        "iconPath": "/icons/armor/normal_frame.png"
      }
    ],
    "units": [
      {
        "itemId": "hp_revival",
        "itemName": "HP/Revival",
        "category": "unit",
        "stats": {
          "hpBonus": 50
        },
        "requirements": {
          "minLevel": 3
        },
        "price": 1000,
        "sellPrice": 100,
        "rarity": "uncommon",
        "iconPath": "/icons/units/hp_revival.png"
      }
    ]
  },
  "characterInfo": {
    "level": 5,
    "class": "HUmar",
    "meseta": 15000,
    "equippedWeapon": {
      "itemId": "cutlass",
      "stats": { "atpMin": 56, "atpMax": 72, "ata": 5 }
    },
    "equippedArmor": {
      "itemId": "normal_frame",
      "stats": { "dfp": 10, "evp": 5 }
    },
    "equippedUnits": []
  }
}
```

### Purchase Equipment

**Endpoint**: `POST /api/shop/weapons/purchase`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "itemId": "falchion"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Purchased Falchion for 2,500 meseta",
  "transaction": {
    "itemId": "falchion",
    "itemName": "Falchion",
    "price": 2500,
    "itemInstanceId": "uuid-v4"
  },
  "updatedInventory": {
    "meseta": 12500,
    "slotsUsed": 19,
    "newItemSlot": 18
  }
}
```

**Error Responses**:
- `400 Bad Request`: Item not available or invalid request
- `402 Payment Required`: Insufficient meseta
- `403 Forbidden`: Character level too low or class restriction
- `409 Conflict`: Inventory full

### Sell Equipment

**Endpoint**: `POST /api/shop/weapons/sell`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "itemInstanceId": "uuid-v4"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Sold Cutlass for 50 meseta",
  "transaction": {
    "itemId": "cutlass",
    "itemName": "Cutlass",
    "sellPrice": 50
  },
  "updatedInventory": {
    "meseta": 12550,
    "slotsUsed": 18
  }
}
```

**Error Responses**:
- `400 Bad Request`: Item not found or cannot be sold
- `409 Conflict`: Cannot sell equipped items

## Equipment Progression

### Weapon Tiers (Example - Swords)

**Tier 1 - Starter** (Level 1-5):
- Cutlass: 56-72 ATP, 500 meseta
- Falchion: 78-95 ATP, 2,500 meseta

**Tier 2 - Early Game** (Level 5-10):
- Claymore: 95-115 ATP, 5,000 meseta
- Brand: 115-135 ATP, 8,500 meseta

**Tier 3 - Mid Game** (Level 10-20):
- Buster: 135-160 ATP, 15,000 meseta
- Pallasch: 160-185 ATP, 25,000 meseta

**Tier 4 - Advanced** (Level 20-30):
- Gladius: 185-215 ATP, 40,000 meseta
- Calibur: 215-245 ATP, 65,000 meseta

**Tier 5 - Rare** (Level 30+):
- Rare weapons primarily obtained through quest drops
- Shop may sell some high-tier weapons for very high prices
- Special weapons with unique abilities

### Armor Tiers

**Frames**:
- Normal Frame (Level 1): 10 DFP, 5 EVP, 0 slots
- Solid Frame (Level 5): 25 DFP, 10 EVP, 1 slot
- Brave Frame (Level 10): 40 DFP, 15 EVP, 2 slots
- Custom Frame (Level 20): 60 DFP, 25 EVP, 3 slots
- Ultimate Frame (Level 30): 85 DFP, 35 EVP, 4 slots

**Shields**:
- Normal Shield (Level 1): 5 DFP, 3 EVP
- Solid Shield (Level 5): 15 DFP, 8 EVP
- Brave Shield (Level 10): 25 DFP, 15 EVP
- Custom Shield (Level 20): 40 DFP, 25 EVP

### Unit Tiers

**HP Units**:
- HP/Revival (Level 3): +50 HP, 1,000 meseta
- HP/Increase (Level 10): +100 HP, 5,000 meseta
- HP/Boost (Level 20): +200 HP, 20,000 meseta

**Attack Units**:
- ATP/Increase (Level 10): +20 ATP, 8,000 meseta
- ATP/Boost (Level 20): +40 ATP, 30,000 meseta

## Database Schema

### Equipment Shop Inventory

Uses shared `shop_inventory` table with additional equipment-specific data:

```sql
-- Equipment in shop_inventory table
INSERT INTO shop_inventory (shop_type, item_id, price, category)
VALUES
  ('weapon', 'cutlass', 500, 'weapon'),
  ('weapon', 'falchion', 2500, 'weapon'),
  ('weapon', 'normal_frame', 300, 'armor'),
  ('weapon', 'hp_revival', 1000, 'unit');
```

Equipment definitions come from:
- `weapon_definitions` table (see [Weapons](/mechanics/weapons))
- `armor_definitions` table (see [Armor](/mechanics/armor))
- `unit_definitions` table (see [Units](/mechanics/units))

### Event Sourcing

Equipment purchases and sales are recorded:

```typescript
// EQUIPMENT_PURCHASED
{
  eventType: 'EQUIPMENT_PURCHASED',
  eventData: {
    shopType: 'weapon',
    itemId: 'falchion',
    category: 'weapon',
    price: 2500,
    itemInstanceId: 'uuid-v4',
    mesetaBefore: 15000,
    mesetaAfter: 12500,
    inventorySlot: 18
  }
}

// EQUIPMENT_SOLD
{
  eventType: 'EQUIPMENT_SOLD',
  eventData: {
    itemId: 'cutlass',
    itemInstanceId: 'uuid-v4',
    category: 'weapon',
    sellPrice: 50,
    mesetaBefore: 12500,
    mesetaAfter: 12550
  }
}
```

## Pricing System

### Purchase Prices

Equipment prices scale with:
- **Base Stats**: Higher ATP/DFP = higher price
- **Level Requirement**: Higher level items cost more
- **Rarity**: Uncommon, rare, very rare multipliers
- **Special Abilities**: Unique effects increase price

### Sell Prices

Standard sell-back value:
- **Common Equipment**: 10% of purchase price
- **Uncommon Equipment**: 15% of purchase price
- **Rare Equipment**: 20% of purchase price
- **Modified Equipment**: +grind value factored in

## Implementation Notes

### Class Restrictions

Validate class can use equipment:
```typescript
function canEquip(characterClass: string, equipment: Equipment): boolean {
  if (!equipment.requirements.allowedClasses.length) {
    return true; // No restrictions
  }
  return equipment.requirements.allowedClasses.includes(characterClass);
}
```

### Level Requirements

Check character level:
```typescript
function meetsLevelRequirement(characterLevel: number, equipment: Equipment): boolean {
  return characterLevel >= equipment.requirements.minLevel;
}
```

### Stat Comparison

Calculate stat differences:
```typescript
function compareEquipment(current: Weapon, shopItem: Weapon) {
  return {
    atpDiff: shopItem.stats.atpMax - current.stats.atpMax,
    ataDiff: shopItem.stats.ata - current.stats.ata,
    mstDiff: shopItem.stats.mst - current.stats.mst
  };
}
```

### Transaction Validation

Server must validate:
- Character has sufficient meseta
- Character meets level requirements
- Character's class can use equipment
- Inventory has space for purchase
- Item exists and is not equipped when selling

### Equipped Item Handling

- Cannot sell equipped items (must unequip first)
- Show "Equipped" badge on items in sell list
- Disable sell button for equipped items
- Provide link to inventory to unequip

## Security Considerations

- Validate all prices server-side
- Prevent selling items not owned by character
- Check class restrictions server-side
- Prevent selling quest-critical items
- Rate limit shop transactions
- Log all equipment transactions

## Future Enhancements

- **Weapon Grinding**: Upgrade weapons at shop for meseta
- **Equipment Synthesis**: Combine equipment for better stats
- **Special Orders**: Custom equipment orders with crafting time
- **Equipment Repair**: Durability system requiring maintenance
- **Trade-In Bonus**: Extra value when selling to buy new equipment
- **Equipment Sets**: Discount when buying matching set pieces
- **Rental Equipment**: Temporarily use high-level gear for quest
- **Equipment Preview**: Equip and see character model with new gear
- **Comparison Mode**: Compare multiple shop items side-by-side
- **Wishlist**: Save equipment to purchase later
- **Equipment Encyclopedia**: Track all equipment seen/owned
