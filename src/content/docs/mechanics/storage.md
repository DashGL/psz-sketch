---
title: Storage
description: Bank storage system for items and meseta in Density Dwarf
---

The storage system (also called "bank" or "shared storage") provides additional space for storing items and meseta beyond character inventory capacity. Storage is typically accessed at specific locations in the game world.

## Storage Access

### Access Points

Storage can be accessed at:
- **Town/Lobby Areas**: Storage terminals or NPCs
- **Personal Quarters**: If available
- **Special Locations**: TBD based on game design

### Access Restrictions

- Can only access storage in safe zones (not during quests/combat)
- Requires interaction with storage terminal
- Some items may be locked or restricted from storage

## Storage Capacity

### Item Storage

- **Storage Slots**: TBD (typically 200+ slots in PSO games)
- **Expandable**: May be upgradable through gameplay or purchase
- **Shared vs Personal**: TBD if storage is per-character or account-wide

### Meseta Storage

- **Bank Meseta**: Separate from carried meseta
- **Higher Limit**: Much higher capacity than inventory meseta
- **Safe Storage**: Meseta in bank is not lost on death (if applicable)

## Storage Organization

### Categories/Tabs

Storage may be organized into categories:
- **Weapons**: All weapon types
- **Armor**: Frames and shields
- **Units**: Unit attachments
- **Consumables**: Recovery items and buffs
- **Materials**: Crafting and enhancement materials
- **Other**: Miscellaneous items

### Sorting Options

- Sort by type, rarity, name, or acquisition date
- Search/filter functionality for large inventories
- Custom organization options

## Item Management

### Depositing Items

**Transfer from Inventory to Storage**:
1. Open storage interface
2. Select item from inventory
3. Choose quantity (for stackables)
4. Confirm transfer

**Rules**:
- Equipped items must be unequipped first
- Cannot deposit quest-critical items
- Cannot deposit if storage is full

### Withdrawing Items

**Transfer from Storage to Inventory**:
1. Open storage interface
2. Select item from storage
3. Choose quantity (for stackables)
4. Confirm transfer

**Rules**:
- Cannot withdraw if inventory is full
- Withdrawn items occupy inventory slots
- Can quick-equip directly from storage withdrawal

### Meseta Transfers

**Deposit Meseta**:
- Transfer meseta from inventory to bank
- Frees up inventory meseta capacity
- Useful for large amounts

**Withdraw Meseta**:
- Transfer meseta from bank to inventory
- Limited by inventory meseta cap
- Cannot withdraw more than inventory can hold

## Shared Storage vs Character Storage

### Character Storage
- Unique to each character
- Items cannot be accessed by other characters
- Personal inventory extension

### Shared Storage (Account-Wide)
- Accessible by all characters on the account
- Enables item transfer between characters
- Common bank system

**Implementation Decision**: TBD which model to use

## Database Schema

```sql
-- Storage configuration per character or account
CREATE TABLE storage_config (
  storage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL, -- character_id or account_id depending on model
  owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('character', 'account')),
  max_slots INTEGER NOT NULL DEFAULT 200,
  bank_meseta BIGINT NOT NULL DEFAULT 0,

  INDEX idx_owner (owner_id, owner_type)
);

-- Items in storage
CREATE TABLE storage_items (
  storage_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_id UUID NOT NULL,
  item_instance_id UUID NOT NULL, -- References the actual item instance
  slot_position INTEGER NOT NULL,
  stored_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (storage_id) REFERENCES storage_config(storage_id),
  FOREIGN KEY (item_instance_id) REFERENCES inventory_items(item_instance_id),

  INDEX idx_storage_items (storage_id),
  INDEX idx_item_location (item_instance_id)
);

-- Storage access log (for event sourcing and auditing)
CREATE TABLE storage_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_id UUID NOT NULL,
  character_id UUID NOT NULL, -- Who performed the action
  event_type VARCHAR(50) NOT NULL, -- deposit, withdraw, deposit_meseta, withdraw_meseta
  item_instance_id UUID,
  quantity INTEGER,
  meseta_amount BIGINT,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (storage_id) REFERENCES storage_config(storage_id),
  FOREIGN KEY (character_id) REFERENCES character_state(character_id),

  INDEX idx_storage_history (storage_id, event_timestamp),
  INDEX idx_character_storage_actions (character_id, event_timestamp)
);
```

## Server API

### Get Storage Contents

**Endpoint**: `GET /api/storage`

**Response**:
```json
{
  "storageId": "uuid-v4",
  "ownerType": "character",
  "maxSlots": 200,
  "usedSlots": 45,
  "bankMeseta": 100000,
  "items": [
    {
      "storageItemId": "uuid-v4",
      "itemInstanceId": "uuid-v4",
      "itemId": "rare-weapon",
      "quantity": 1,
      "slotPosition": 0,
      "storedAt": "2025-10-28T10:00:00Z",
      "itemData": {}
    }
  ]
}
```

### Deposit Item

**Endpoint**: `POST /api/storage/deposit`

**Request**:
```json
{
  "itemInstanceId": "uuid-v4",
  "quantity": 1
}
```

**Response**: Updated storage and inventory states

### Withdraw Item

**Endpoint**: `POST /api/storage/withdraw`

**Request**:
```json
{
  "storageItemId": "uuid-v4",
  "quantity": 1
}
```

**Response**: Updated storage and inventory states

### Deposit Meseta

**Endpoint**: `POST /api/storage/deposit-meseta`

**Request**:
```json
{
  "amount": 5000
}
```

### Withdraw Meseta

**Endpoint**: `POST /api/storage/withdraw-meseta`

**Request**:
```json
{
  "amount": 5000
}
```

## Storage Rules and Limits

### Capacity Management

- Cannot deposit items if storage is full
- Storage expansion may be available through:
  - Gameplay progression
  - Premium features
  - One-time purchases

### Item Restrictions

**Cannot Store**:
- Active quest items
- Currently equipped items (must unequip first)
- Temporary event items (some exceptions)

**Can Store**:
- Weapons, armor, units
- Consumables
- Materials
- Most tradeable items

### Security and Safety

- Items in storage are safe from:
  - Character death (if applicable)
  - Inventory loss
  - Theft (in pvp contexts)

- Storage access log maintains audit trail
- Support can investigate storage issues using event log

## Shared Storage Considerations

If implementing account-wide storage:

### Benefits
- Easy item transfer between characters
- Shared resources across alts
- Simplified multi-character gameplay

### Challenges
- Character progression balance
- Twinking (giving powerful items to low-level alts)
- Database complexity with multiple characters accessing same storage

### Hybrid Approach
- Personal storage per character (200 slots)
- Shared storage for account (100 slots)
- Best of both worlds

## Notes for Implementation

- Storage slot count needs final specification
- UI/UX design for storage interface
- Access point locations need mapping
- Item transfer animation and feedback
- Storage expansion mechanics (if any)
- Premium storage features (if any)
- Transaction atomicity for storage transfers
- Concurrent access handling (if shared storage)
