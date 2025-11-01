---
title: Inventory
description: Character inventory system, item management, and meseta in Density Dwarf
---

The inventory system manages all items carried by a character, including weapons, armor, units, consumables, and currency (meseta).

## Inventory Capacity

### Item Slots

- **Default Slots**: 40 item slots per character
- **Slot Types**: All items occupy one slot (regardless of type)
- **Stackable Items**: Consumables stack in a single slot (max stack size varies by item)

### Equipped Items

Equipped items do not count toward inventory slots:
- 1 Weapon slot
- 1 Armor (Frame) slot
- 1 Shield slot (optional)
- Units installed in armor do not occupy inventory

## Item Categories

### Equipment

#### Weapons
- Can equip one weapon at a time
- Equipped weapon appears in character's hands
- See [Weapons](/mechanics/weapons) for details

#### Armor
- One frame (body armor) equipped at a time
- One shield equipped at a time (optional)
- See [Armor](/mechanics/armor) for details

#### Units
- Stored in inventory when not installed
- Installed units attached to equipped frame
- See [Units](/mechanics/units) for details

### Consumables

#### Recovery Items
- **Monomate**: Restores small amount of HP
- **Dimate**: Restores medium amount of HP
- **Trimate**: Restores large amount of HP
- **Monofluid**: Restores small amount of TP
- **Difluid**: Restores medium amount of TP
- **Trifluid**: Restores large amount of TP

#### Status Cure Items
- **Antidote**: Cures poison
- **Antiparalysis**: Cures paralysis
- **Sol Atomizer**: Revives fallen ally
- Other status cure items TBD

#### Buff Items
- Temporary stat boosts
- TBD - Complete list needed

### Materials

- Used for crafting and enhancement
- Various types for different upgrade purposes
- TBD - Material types and uses

### Quest Items

- Special items for quests and events
- Cannot be traded or dropped
- Removed from inventory when quest completes

## Meseta (Currency)

### Carrying Capacity

- **On Person**: Maximum meseta carried in inventory
- **Overflow**: Excess meseta must be deposited in storage

### Acquiring Meseta

- Enemy drops
- Quest rewards
- Selling items to shops
- Trading with other players

### Spending Meseta

- Purchasing items from shops
- Weapon and armor enhancement
- Services (teleports, etc.)

## Item Management

### Sorting

Items can be sorted by:
- Type (weapons, armor, consumables, etc.)
- Rarity
- Name (alphabetical)
- Acquisition time (newest/oldest)

### Item Actions

#### Use
- Consume consumable items
- Apply buffs or healing

#### Equip
- Equip weapons, armor, shields
- Install units into armor

#### Drop
- Remove item from inventory
- Item is destroyed (irreversible)

#### Trade
- Trade items with other players
- Some items are untradeable

#### Store
- Transfer items to storage bank
- See [Storage](/mechanics/storage) for details

## Database Schema

The inventory system uses tables defined in the [Character Create](/screens/character-create#inventory-system-tables) documentation:

### Key Tables

- `character_inventory`: Meseta and slot counts
- `inventory_items`: Individual item instances
- Equipment links to `player_weapons`, `player_armor`, `player_units`

### Inventory Events

```sql
-- Item acquisition events
CREATE TABLE inventory_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- acquired, used, dropped, traded, etc.
  item_instance_id UUID,
  item_id VARCHAR(100) NOT NULL,
  quantity INTEGER DEFAULT 1,
  source VARCHAR(100), -- enemy_drop, quest_reward, shop_purchase, trade, etc.
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (character_id) REFERENCES character_state(character_id),

  INDEX idx_character_inventory_events (character_id, event_timestamp),
  INDEX idx_event_type (event_type)
);
```

## Server API

### Get Inventory

**Endpoint**: `GET /api/inventory`

**Response**:
```json
{
  "meseta": 5000,
  "maxSlots": 40,
  "usedSlots": 15,
  "items": [
    {
      "instanceId": "uuid-v4",
      "itemId": "monomate",
      "quantity": 10,
      "slotPosition": 0
    },
    {
      "instanceId": "uuid-v4",
      "itemId": "saber-rare",
      "quantity": 1,
      "slotPosition": 1,
      "isEquipped": true,
      "itemData": {
        "grindLevel": 5,
        "bonusAtp": 10
      }
    }
  ]
}
```

### Use Item

**Endpoint**: `POST /api/inventory/use`

**Request**:
```json
{
  "itemInstanceId": "uuid-v4",
  "quantity": 1,
  "targetCharacterId": "uuid-v4-or-null-for-self"
}
```

### Drop Item

**Endpoint**: `POST /api/inventory/drop`

**Request**:
```json
{
  "itemInstanceId": "uuid-v4",
  "quantity": 1
}
```

### Equip Item

**Endpoint**: `POST /api/inventory/equip`

**Request**:
```json
{
  "itemInstanceId": "uuid-v4",
  "equipmentSlot": "weapon" // weapon, armor, shield
}
```

### Transfer to Storage

**Endpoint**: `POST /api/inventory/transfer-to-storage`

**Request**:
```json
{
  "itemInstanceId": "uuid-v4",
  "quantity": 1
}
```

## Inventory Management Rules

### Acquisition Rules

- Cannot acquire items if inventory is full
- Meseta auto-stacks with existing meseta
- Stackable items automatically stack with existing stacks

### Usage Rules

- Can only use consumables from inventory (not storage)
- Using an item removes it from inventory immediately
- Some items can only be used in specific contexts (e.g., during combat)

### Equipment Rules

- Cannot equip items that don't meet requirements (level, class, stats)
- Equipping new weapon/armor unequips current one
- Unequipped items return to inventory (if space available)

### Deletion Protection

- Rare and valuable items may require confirmation before dropping
- Quest items cannot be dropped
- Equipped items must be unequipped before dropping

## Notes for Implementation

- Complete item list with properties needs cataloging
- Stack sizes for all stackable items need specification
- Item usage effects need detailed documentation
- Trade system rules and restrictions need definition
- Item sorting algorithm needs implementation
- Inventory full handling (auto-loot rules) needs design
