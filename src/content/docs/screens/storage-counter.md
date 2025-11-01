---
title: Storage Counter
description: Bank storage for items and meseta management
---

![Storage Counter NPC](/screenshots/quest-counter-storage.png)

The Storage Counter is accessed from the [City](/screens/city) hub and provides bank storage functionality through the Personnel Counter. Players can access their Trunk (character-specific storage) or Joint Trunk (account-wide shared storage).

![Personnel Counter Menu](/screenshots/quest-storage.png)

## Screen Flow

### Path

`/city/storage`

### Navigation

```
City → /city/storage → Manage storage → Return to City
```

## Purpose

The Personnel Counter provides access to:
- **Trunk**: Character-specific storage for items and meseta
- **Joint Trunk**: Account-wide shared storage accessible by all characters
- **Item Trade**: Player-to-player trading (online mode only, out of scope for offline)
- **Player Record**: Statistics tracking and achievement viewing

### Storage Features

- **Item Banking**: Store items beyond inventory capacity
- **Meseta Banking**: Safely store currency
- **Item Organization**: Manage and categorize stored items
- **Inventory Relief**: Free up character inventory slots
- **Cross-Character Sharing**: Joint Trunk allows item transfer between your characters

## User Interface

### Personnel Counter Menu

When accessing the Personnel Counter, players see four options:

**Trunk**:
- Character-specific storage
- Only accessible by the current character
- Items stored here cannot be accessed by other characters

**Joint Trunk**:
- Account-wide shared storage
- All characters on the account can access
- Transfer items between your characters

**Item Trade** (grayed out in offline mode):
- Player-to-player trading functionality
- Only available in online/multiplayer mode

**Player Record**:
- View statistics and achievements
- See [Player Record](/screens/player-record) documentation

### Trunk Storage Menu

![Trunk Menu](/screenshots/quest-trunk.png)

When selecting Trunk or Joint Trunk, players see:

**Store Items**:
- Deposit items from inventory to storage

**Take Items**:
- Withdraw items from storage to inventory

**Deposit Meseta**:
- Transfer meseta from character to storage

**Withdraw Meseta**:
- Transfer meseta from storage to character

### Dual-Panel Layout

When managing items:

**Left Panel - Character Inventory**:
- 40 inventory slots displayed in grid
- Items with icons and quantity
- Equipped items highlighted differently
- Current meseta displayed at top
- Select items to deposit

**Right Panel - Storage (Trunk/Joint Trunk)**:
- Storage slots displayed in grid (200 slots per trunk)
- Stored items with icons and quantity
- Stored meseta displayed at top
- Select items to withdraw

### Actions

**Deposit Item**:
1. Select item from inventory
2. Choose quantity (for stackable items)
3. Confirm deposit
4. Item moves to storage

**Withdraw Item**:
1. Select item from storage
2. Choose quantity (for stackable items)
3. Check inventory has space
4. Confirm withdrawal
5. Item moves to inventory

**Deposit Meseta**:
- Input meseta amount
- Confirm deposit
- Meseta deducted from character, added to storage

**Withdraw Meseta**:
- Input meseta amount
- Confirm withdrawal
- Meseta added to character, deducted from storage

### Filters and Sorting

**Filter by Type**:
- All items
- Weapons
- Armor
- Units
- Consumables
- Materials
- Mags

**Sort Options**:
- Recently added
- Name (A-Z)
- Rarity
- Type

## Server API

### Get Storage Contents

**Endpoint**: `GET /api/storage`

**Query Parameters**:
- `characterId`: UUID of the character

**Response**:
```json
{
  "storage": {
    "storageId": "uuid-v4",
    "meseta": 50000,
    "maxSlots": 200,
    "slotsUsed": 45,
    "items": [
      {
        "slotIndex": 0,
        "itemInstanceId": "uuid-v4",
        "itemId": "monomate",
        "itemName": "Monomate",
        "itemType": "consumable",
        "quantity": 10,
        "rarity": "common",
        "iconPath": "/icons/items/monomate.png"
      },
      {
        "slotIndex": 1,
        "itemInstanceId": "uuid-v4",
        "itemId": "photon_drop",
        "itemName": "Photon Drop",
        "itemType": "currency",
        "quantity": 5,
        "rarity": "rare",
        "iconPath": "/icons/items/photon_drop.png"
      }
    ]
  },
  "characterInventory": {
    "meseta": 15000,
    "maxSlots": 40,
    "slotsUsed": 18,
    "items": [
      {
        "slotIndex": 0,
        "itemInstanceId": "uuid-v4",
        "itemId": "cutlass",
        "itemName": "Cutlass",
        "itemType": "weapon",
        "equipped": true,
        "rarity": "common",
        "iconPath": "/icons/weapons/cutlass.png"
      }
    ]
  }
}
```

### Deposit Item

**Endpoint**: `POST /api/storage/deposit-item`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "itemInstanceId": "uuid-v4",
  "quantity": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "5x Monomate deposited to storage",
  "updatedInventory": {
    "slotsUsed": 17,
    "removedFromSlot": 5
  },
  "updatedStorage": {
    "slotsUsed": 46,
    "addedToSlot": 12
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid quantity or item not found
- `409 Conflict`: Storage full, cannot deposit
- `403 Forbidden`: Cannot deposit equipped items

### Withdraw Item

**Endpoint**: `POST /api/storage/withdraw-item`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "itemInstanceId": "uuid-v4",
  "quantity": 3
}
```

**Response**:
```json
{
  "success": true,
  "message": "3x Monomate withdrawn from storage",
  "updatedInventory": {
    "slotsUsed": 18,
    "addedToSlot": 5
  },
  "updatedStorage": {
    "slotsUsed": 45,
    "removedFromSlot": 12
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid quantity or item not found
- `409 Conflict`: Inventory full, cannot withdraw

### Deposit Meseta

**Endpoint**: `POST /api/storage/deposit-meseta`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "amount": 10000
}
```

**Response**:
```json
{
  "success": true,
  "message": "10,000 meseta deposited",
  "characterMeseta": 5000,
  "storageMeseta": 60000
}
```

**Error Responses**:
- `400 Bad Request`: Invalid amount or insufficient meseta
- `409 Conflict`: Storage meseta limit reached

### Withdraw Meseta

**Endpoint**: `POST /api/storage/withdraw-meseta`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "amount": 5000
}
```

**Response**:
```json
{
  "success": true,
  "message": "5,000 meseta withdrawn",
  "characterMeseta": 20000,
  "storageMeseta": 45000
}
```

**Error Responses**:
- `400 Bad Request`: Invalid amount or insufficient meseta in storage
- `409 Conflict`: Character meseta limit reached

## Database Schema

### Storage Tables

```sql
-- Character-specific Trunk storage
CREATE TABLE character_trunk (
  trunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  meseta BIGINT NOT NULL DEFAULT 0 CHECK (meseta >= 0),
  max_slots INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (character_id) REFERENCES character_state(character_id),
  UNIQUE (character_id)
);

CREATE INDEX idx_trunk_character ON character_trunk(character_id);

-- Account-wide Joint Trunk storage (shared across all characters)
CREATE TABLE account_joint_trunk (
  joint_trunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL, -- Links to account/public_key
  meseta BIGINT NOT NULL DEFAULT 0 CHECK (meseta >= 0),
  max_slots INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (account_id)
);

CREATE INDEX idx_joint_trunk_account ON account_joint_trunk(account_id);
```

### Storage Items Tables

```sql
-- Items in character-specific Trunk
CREATE TABLE trunk_items (
  trunk_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trunk_id UUID NOT NULL,
  item_instance_id UUID NOT NULL,
  slot_index INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  deposited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (trunk_id) REFERENCES character_trunk(trunk_id) ON DELETE CASCADE,
  FOREIGN KEY (item_instance_id) REFERENCES item_instances(item_instance_id),

  UNIQUE (trunk_id, slot_index),
  UNIQUE (trunk_id, item_instance_id)
);

CREATE INDEX idx_trunk_items_trunk ON trunk_items(trunk_id);
CREATE INDEX idx_trunk_items_instance ON trunk_items(item_instance_id);

-- Items in account-wide Joint Trunk
CREATE TABLE joint_trunk_items (
  joint_trunk_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  joint_trunk_id UUID NOT NULL,
  item_instance_id UUID NOT NULL,
  slot_index INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  deposited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deposited_by_character_id UUID, -- Track which character deposited it

  FOREIGN KEY (joint_trunk_id) REFERENCES account_joint_trunk(joint_trunk_id) ON DELETE CASCADE,
  FOREIGN KEY (item_instance_id) REFERENCES item_instances(item_instance_id),
  FOREIGN KEY (deposited_by_character_id) REFERENCES character_state(character_id),

  UNIQUE (joint_trunk_id, slot_index),
  UNIQUE (joint_trunk_id, item_instance_id)
);

CREATE INDEX idx_joint_trunk_items_trunk ON joint_trunk_items(joint_trunk_id);
CREATE INDEX idx_joint_trunk_items_instance ON joint_trunk_items(item_instance_id);
```

## Storage Mechanics

### Storage Capacity

- **Default Capacity**: 200 slots per character
- **Expansion**: Possible future feature (purchase additional slots)
- **No Weight Limit**: Only slot count matters
- **Meseta Limit**: TBD (e.g., 999,999,999 meseta)

### Item Restrictions

**Cannot Store**:
- Currently equipped items
- Quest-specific items (while quest is active)
- Character-bound special items (if applicable)

**Can Store**:
- Weapons (unequipped)
- Armor and units (unequipped)
- Consumables and materials
- Mags (unequipped)
- Currency items (Photon Drops, etc.)

### Stacking Rules

Items stack in storage following same rules as inventory:
- Consumables stack up to max stack size (TBD, e.g., 99)
- Currency items stack to large limits
- Weapons and armor do not stack (unique instances)
- Materials may stack

### Trunk vs Joint Trunk

**Trunk (Character-Specific)**:
- Each character has their own private trunk
- 200 storage slots
- Separate meseta storage
- Items cannot be accessed by other characters
- Use for character-specific items and progression

**Joint Trunk (Account-Wide Shared)**:
- Shared across all characters on the account
- 200 storage slots
- Shared meseta pool
- Any character can deposit/withdraw
- Perfect for transferring items between your characters
- Common in Phantasy Star games for alt management

## Event Sourcing Integration

Storage-related events:
```typescript
// STORAGE_ITEM_DEPOSITED
{
  eventType: 'STORAGE_ITEM_DEPOSITED',
  eventData: {
    itemInstanceId: 'uuid-v4',
    itemId: 'monomate',
    quantity: 5,
    fromSlot: 5,
    toSlot: 12
  }
}

// STORAGE_ITEM_WITHDRAWN
{
  eventType: 'STORAGE_ITEM_WITHDRAWN',
  eventData: {
    itemInstanceId: 'uuid-v4',
    itemId: 'monomate',
    quantity: 3,
    fromSlot: 12,
    toSlot: 5
  }
}

// STORAGE_MESETA_DEPOSITED
{
  eventType: 'STORAGE_MESETA_DEPOSITED',
  eventData: {
    amount: 10000,
    characterMeseta: 5000,
    storageMeseta: 60000
  }
}

// STORAGE_MESETA_WITHDRAWN
{
  eventType: 'STORAGE_MESETA_WITHDRAWN',
  eventData: {
    amount: 5000,
    characterMeseta: 20000,
    storageMeseta: 45000
  }
}
```

## Implementation Notes

### Validation

Server must validate:
- Character owns the item being deposited
- Item is not equipped
- Storage has available slots
- Inventory has space for withdrawals
- Meseta amounts are valid
- No negative values

### Transactions

All storage operations should be atomic:
```sql
BEGIN TRANSACTION;
  -- Remove from inventory
  -- Add to storage
  -- Update character_events
  -- Update timestamps
COMMIT;
```

### Security

- Prevent item duplication exploits
- Validate all operations server-side
- Rate limit storage operations
- Log all storage transactions for audit

### Performance

- Cache storage contents on client
- Batch operations when possible
- Optimize slot index lookups
- Lazy-load item details as needed

## Future Enhancements

- **Storage Expansion**: Purchase additional slots with meseta or premium currency
- **Storage Sorting**: Auto-sort by type, rarity, or name
- **Bulk Operations**: Deposit/withdraw multiple items at once
- **Storage Search**: Find specific items quickly
- **Item Preview**: Hover to see item stats before withdrawing
- **Storage Presets**: Save favorite item configurations
- **Mail System**: Send items between characters or players
