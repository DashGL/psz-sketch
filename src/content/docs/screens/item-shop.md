---
title: Item Shop
description: Purchase consumables, materials, and recovery items
---

![Item Shop NPC](/screenshots/shop-item.png)

The Item Shop is accessed from the [City](/screens/city) hub and allows players to purchase consumable items, recovery items, and other useful goods with meseta. The shop has a fixed inventory of essential items plus a rotating selection of random items that changes each time you visit.

## Screen Flow

### Path

`/city/shop/items`

### Navigation

```
City → /city/shop/items → Browse and purchase → Return to City
```

## Purpose

The Item Shop provides:
- **Recovery Items**: Monomates, Dimates, Monofluids, Difluids, and atomizers
- **Random Stock**: Low-level techniques, grinders, and rare consumables
- **Restocking**: Replenish supplies between quests
- **Selling**: Sell unwanted items from your inventory for meseta

## User Interface

### Main Menu

When you access the Item Shop, you're presented with two options:
- **Buy**: Purchase items from the shop
- **Sell**: Sell items from your inventory

### Buy Interface

![Item Shop Buy Screen](/screenshots/shop-item-buy.png)

**Shop Inventory List**:
- Items displayed in vertical list with prices
- Currently selected item highlighted in orange
- Item icon on left, name in center, price on right
- Scrollable list to view all available items

**Character Info (Top Right)**:
- **Item Pack**: Shows inventory slots (22/40 in screenshot)
- Current meseta balance displayed at bottom right (1290 in screenshot)

**Controls (Bottom Left)**:
- **Qty**: Shows quantity to purchase (defaults to 0)
- Adjust quantity before purchasing

**Action Prompt**:
- "Choose the item you wish to buy." displayed at bottom

### Sell Interface

![Item Shop Sell Screen](/screenshots/shop-item-sell.png)

**Note**: The sell interface is shared between the Item Shop and Weapon Shop.

**Inventory Filter Tabs**:
- Filter buttons displayed above inventory list: "Usable", "Weapon", "Armor", "Special"
- Currently selected filter highlighted in orange

**Inventory List**:
- Shows items from your inventory that can be sold
- Item icon, name, and sell value displayed
- Selected item highlighted in orange

**Character Info**:
- Shows current inventory slots and meseta
- **Qty**: Shows quantity being sold

**Action Prompt**:
- "Choose the item you wish to sell." displayed at bottom

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

## Shop Inventory System

### Fixed Inventory

These items are **always available** in the Item Shop:

**HP Recovery**:
- **Monomate**: 50 meseta - Restores small HP
- **Dimate**: 150 meseta - Restores moderate HP (as seen in screenshot)

**TP Recovery**:
- **Monofluid**: 100 meseta - Restores small TP (as seen in screenshot)
- **Difluid**: Price TBD - Restores moderate TP

**Party Recovery**:
- **Sol Atomizer**: 50 meseta - Restores HP to all party members (as seen in screenshot)
- **Telepipe**: 100 meseta - Return to city from quest (as seen in screenshot)
- **Moon Atomizer**: Price TBD - Revives fallen party member

### Random Inventory

Each time you visit the shop, **additional random items** may appear:

**Low-Level Techniques**:
- Basic offensive and support techniques
- Foie Lv1: 300 meseta (fire technique, as seen in screenshot)
- Other starter techniques

**Upgrade Materials**:
- **Monogrinder**: Price TBD - Basic weapon grinding material

**Rare Consumables**:
- **Star Atomizer**: Price TBD - Cures all status ailments for party
- Other utility items

### Items NOT Sold

The following cannot be purchased at shops:
- **Photon Drops/Crystals**: Rare drop only
- **High-level techniques**: Must be found or purchased elsewhere
- **Rare materials**: Quest rewards or drops only

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

### Random Inventory Generation

When the shop is accessed:
1. Load fixed inventory items (always available)
2. Generate random selection of additional items:
   - Low-level techniques (random selection)
   - Monogrinder (chance to appear)
   - Star Atomizer (chance to appear)
   - Other utility items
3. Random items change each visit to encourage checking the shop regularly

### Shared Sell Interface

The Item Shop and Weapon Shop share the **same sell interface**:
- Unified inventory filter tabs: "Usable", "Weapon", "Armor", "Special"
- Shows all sellable items from character inventory
- Sell prices calculated based on item type and rarity
- Same transaction logic regardless of which shop you're in

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
- Character meets level requirements (if any)
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
