---
title: Item Shop
description: Purchase consumables, materials, and recovery items
---

The Item Shop is accessed from the [City](/screens/city) hub and allows players to purchase consumable items, recovery items, materials, and other useful goods with meseta.

## Screen Flow

### Path

`/city/shop/items`

### Navigation

```
City → /city/shop/items → Browse and purchase → Return to City
```

## Purpose

The Item Shop provides:
- **Recovery Items**: Monomates, Dimates, Trimates, and fluids
- **Status Cures**: Antidotes, antiparalysis, and other cure items
- **Materials**: Crafting components and synthesis materials
- **Consumables**: Temporary boost items and utilities
- **Restocking**: Replenish supplies between quests

## User Interface

### Shop Layout

**Left Panel - Shop Inventory**:
- Grid or list of available items
- Item icon, name, and description
- Price in meseta
- Stock quantity (if limited)
- Item category tags

**Right Panel - Character Info**:
- Current meseta balance
- Inventory slots (used/max)
- Shopping cart or selected item
- Purchase confirmation

**Item Categories**:
- Recovery (HP/TP restoration)
- Status Cure (ailment removal)
- Materials (crafting components)
- Boosters (temporary stat increases)
- Utilities (teleporters, scaperolls, etc.)

### Purchase Flow

1. **Browse Items**: Scroll through shop inventory
2. **Select Item**: Click item to view details
3. **Choose Quantity**: Select how many to purchase
4. **Confirm Purchase**: Review total cost
5. **Transaction**: Meseta deducted, items added to inventory
6. **Receipt**: Confirmation message displayed

## Server API

### Get Shop Inventory

**Endpoint**: `GET /api/shop/items`

**Query Parameters**:
- `characterId`: UUID of the character
- `category`: Filter by category (optional)

**Response**:
```json
{
  "shopInventory": [
    {
      "itemId": "monomate",
      "itemName": "Monomate",
      "description": "Restores a small amount of HP",
      "category": "recovery",
      "price": 50,
      "maxStackSize": 99,
      "iconPath": "/icons/items/monomate.png",
      "rarity": "common",
      "inStock": true,
      "stockQuantity": null
    },
    {
      "itemId": "dimate",
      "itemName": "Dimate",
      "description": "Restores a moderate amount of HP",
      "category": "recovery",
      "price": 150,
      "maxStackSize": 99,
      "iconPath": "/icons/items/dimate.png",
      "rarity": "common",
      "inStock": true,
      "stockQuantity": null
    },
    {
      "itemId": "antidote",
      "itemName": "Antidote",
      "description": "Cures poison status",
      "category": "status_cure",
      "price": 100,
      "maxStackSize": 99,
      "iconPath": "/icons/items/antidote.png",
      "rarity": "common",
      "inStock": true,
      "stockQuantity": null
    },
    {
      "itemId": "power_material",
      "itemName": "Power Material",
      "description": "Material for increasing ATP",
      "category": "material",
      "price": 500,
      "maxStackSize": 99,
      "iconPath": "/icons/materials/power_material.png",
      "rarity": "uncommon",
      "inStock": true,
      "stockQuantity": 10
    }
  ],
  "characterMeseta": 15000,
  "inventorySlots": {
    "used": 18,
    "max": 40
  }
}
```

### Purchase Item

**Endpoint**: `POST /api/shop/items/purchase`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "itemId": "monomate",
  "quantity": 10
}
```

**Response**:
```json
{
  "success": true,
  "message": "Purchased 10x Monomate for 500 meseta",
  "transaction": {
    "itemId": "monomate",
    "itemName": "Monomate",
    "quantity": 10,
    "unitPrice": 50,
    "totalCost": 500
  },
  "updatedInventory": {
    "meseta": 14500,
    "slotsUsed": 19,
    "newItemSlot": 18
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid quantity or item not available
- `402 Payment Required`: Insufficient meseta
- `409 Conflict`: Inventory full, cannot add items

### Sell Item (Optional Feature)

**Endpoint**: `POST /api/shop/items/sell`

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
  "message": "Sold 5x Monomate for 25 meseta",
  "transaction": {
    "itemId": "monomate",
    "quantity": 5,
    "unitPrice": 5,
    "totalValue": 25
  },
  "updatedInventory": {
    "meseta": 14525,
    "slotsUsed": 18
  }
}
```

## Database Schema

### Shop Inventory Definitions

```sql
CREATE TABLE shop_inventory (
  shop_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_type VARCHAR(50) NOT NULL CHECK (shop_type IN ('item', 'weapon', 'custom')),
  item_id VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER, -- NULL = unlimited stock
  is_available BOOLEAN DEFAULT true,
  required_level INTEGER DEFAULT 1,
  category VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (shop_type, item_id)
);

CREATE INDEX idx_shop_inventory_type ON shop_inventory(shop_type);
CREATE INDEX idx_shop_inventory_category ON shop_inventory(category);
CREATE INDEX idx_shop_inventory_available ON shop_inventory(is_available) WHERE is_available = true;
```

### Purchase History (Event Sourcing)

Purchases are recorded in the `character_events` table:

```typescript
{
  eventType: 'ITEM_PURCHASED',
  eventData: {
    shopType: 'item',
    itemId: 'monomate',
    quantity: 10,
    unitPrice: 50,
    totalCost: 500,
    mesetaBefore: 15000,
    mesetaAfter: 14500,
    inventorySlot: 18
  }
}

{
  eventType: 'ITEM_SOLD',
  eventData: {
    itemId: 'monomate',
    quantity: 5,
    unitPrice: 5,
    totalValue: 25,
    mesetaBefore: 14500,
    mesetaAfter: 14525
  }
}
```

## Shop Items by Category

### Recovery Items

**HP Recovery**:
- **Monomate**: 50 meseta - Restores small HP
- **Dimate**: 150 meseta - Restores moderate HP
- **Trimate**: 500 meseta - Restores large HP

**TP Recovery**:
- **Monofluid**: 50 meseta - Restores small TP
- **Difluid**: 150 meseta - Restores moderate TP
- **Trifluid**: 500 meseta - Restores large TP

**Combined Recovery**:
- **Sol Atomizer**: 200 meseta - Restores HP to all party members
- **Moon Atomizer**: 500 meseta - Revives fallen party member

### Status Cure Items

- **Antidote**: 100 meseta - Cures poison
- **Antiparalysis**: 100 meseta - Cures paralysis
- **Cure/Freeze**: 150 meseta - Cures freeze status
- **Cure/Shock**: 150 meseta - Cures shock status
- **Cure/Slow**: 150 meseta - Cures slow status
- **Star Atomizer**: 800 meseta - Cures all status ailments for party

### Materials

**Stat Materials** (prices TBD):
- **Power Material**: +ATP
- **Mind Material**: +MST
- **Evade Material**: +EVP
- **Def Material**: +DFP
- **HP Material**: +Max HP
- **TP Material**: +Max TP
- **Luck Material**: +Luck (if stat exists)

### Utility Items

- **Telepipe**: 50 meseta - Return to city from quest
- **Scaperoll**: 1000 meseta - Escape from battle
- **Grinder**: 500 meseta - Weapon upgrade component
- **Photon Drop**: Not sold (rare drop only)

## Pricing System

### Base Pricing

Items have fixed base prices defined in `shop_inventory` table.

### Dynamic Pricing (Future)

Potential pricing modifiers:
- **Level Discounts**: Higher level characters get better prices
- **Bulk Discounts**: Buy 10+ items for reduced unit price
- **Daily Sales**: Rotating discount items
- **Event Pricing**: Special prices during events

### Sell-Back Value

When selling items to shop:
- **Standard Items**: 10% of purchase price
- **Rare Items**: 25% of estimated value
- **Materials**: 50% of purchase price
- **Quest Items**: Cannot be sold

## Implementation Notes

### Inventory Management

When purchasing items:
1. Check if item already exists in inventory (for stackables)
2. If exists and stack not full: Add to existing stack
3. If new or stack full: Add to first empty slot
4. If no empty slots: Return error (inventory full)

### Transaction Validation

Server must validate:
- Character has sufficient meseta
- Item exists in shop inventory
- Stock is available (if limited)
- Character meets level requirements
- Inventory has space

### Transaction Atomicity

```sql
BEGIN TRANSACTION;
  -- Deduct meseta from character
  UPDATE character_state SET meseta = meseta - $cost WHERE character_id = $id;

  -- Add item to inventory
  INSERT INTO character_inventory (...) VALUES (...);

  -- Record event
  INSERT INTO character_events (...) VALUES (...);

  -- Update stock if limited
  UPDATE shop_inventory SET stock_quantity = stock_quantity - $qty WHERE shop_item_id = $id;
COMMIT;
```

### Error Handling

**Insufficient Meseta**:
- Show clear error: "Not enough meseta! You need 500, but only have 300."
- Highlight total cost in red

**Inventory Full**:
- Show error: "Inventory full! Free up space and try again."
- Offer link to storage counter

**Out of Stock**:
- Show "Out of Stock" badge
- Gray out purchase button
- Show restock time (if applicable)

## Security Considerations

- Validate all prices server-side (never trust client)
- Prevent negative quantity purchases
- Check for integer overflow on meseta calculations
- Rate limit purchase requests
- Log all transactions for audit

## Future Enhancements

- **Shopping Cart**: Add multiple items before checkout
- **Wishlist**: Save items to purchase later
- **Price Comparison**: Compare with other shops (if multiple exist)
- **Bulk Purchase**: "Buy Max" button to fill inventory
- **Item Preview**: 3D model or detailed stats view
- **Shop Reputation**: Unlock better prices through purchases
- **Seasonal Stock**: Limited-time items during events
- **Bundle Deals**: Purchase item sets at discount
