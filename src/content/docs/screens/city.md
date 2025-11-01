---
title: City
description: Dairon City hub with access to shops, storage, and quests
---

![Dairon City Overview](/screenshots/dairon-city1.png)

Dairon City is the central hub of Density Dwarf where players access various services between quests. After selecting offline mode from the [Mode Select](/screens/mode-select) screen, players arrive in the city to prepare for their adventures.

![City Shops](/screenshots/dairon-city3.png)

![Quest Counter](/screenshots/dairon-city6.png)

## Screen Flow

### Path

`/city`

### Navigation

```
Mode Select → /city → Various city services
```

Players can access multiple services from the city hub:
- [Quest Counter](/screens/quest-counter) - Accept and manage quests
- [Storage Counter](/screens/storage-counter) - Access bank storage
- [Item Shop](/screens/item-shop) - Purchase consumables and materials
- [Custom Shop](/screens/custom-shop) - Customize character appearance
- [Weapon Shop](/screens/weapon-shop) - Buy and sell weapons and armor

## Purpose

The city hub provides:
- **Quest Management**: Accept new quests and track progress
- **Equipment Preparation**: Purchase and upgrade gear before missions
- **Inventory Management**: Store items and manage meseta
- **Character Customization**: Change appearance and cosmetics
- **Safe Haven**: No combat, social space for players

## City Layout

### Interactive Elements

**Quest Counter**:
- Large counter with quest board
- Shows available quests and current progress
- Access to quest log and rewards

**Storage Counter**:
- Bank vault interface
- Deposit and withdraw items
- Manage meseta between character and storage

**Item Shop**:
- Merchant selling consumables
- Recovery items (monomates, fluids, etc.)
- Materials and crafting components

**Custom Shop**:
- Appearance customization station
- Change character colors, hairstyle, accessories
- Preview changes before purchasing

**Weapon Shop**:
- Arsenal display with weapons and armor
- Buy, sell, and compare equipment
- View equipment stats and requirements

## User Interface

### Hub Navigation

**Main Menu Options**:
- Quest Counter
- Storage Counter
- Item Shop
- Custom Shop
- Weapon Shop
- Settings
- Logout

**Character Display**:
- Character model rendered in 3D
- Current equipment visible
- Level, meseta, and basic stats shown

**Quick Info Panel**:
- Current meseta
- Active quest (if any)
- Inventory slots used (e.g., 15/40)
- Quick access to inventory

### Visual Design

TBD - Based on Phantasy Star Zero's city aesthetic:
- Futuristic sci-fi architecture
- Clean, bright environment
- Clear signage for each shop/counter
- NPCs or terminals at each service point

## Server API

### Enter City

**Endpoint**: `GET /api/city/enter`

**Query Parameters**:
- `characterId`: UUID of the character

**Response**:
```json
{
  "success": true,
  "cityState": {
    "activeQuests": [
      {
        "questId": "quest_001",
        "name": "Forest of Illusion",
        "progress": "in_progress",
        "objectives": [
          {
            "description": "Defeat 10 Boomas",
            "current": 7,
            "required": 10,
            "completed": false
          }
        ]
      }
    ],
    "availableQuests": 5,
    "unclaimedRewards": 2,
    "storageItemCount": 12,
    "meseta": 15000
  },
  "notifications": [
    {
      "type": "quest_reward",
      "message": "Quest completed! Claim your reward at the Quest Counter."
    }
  ]
}
```

### Leave City (Start Quest)

**Endpoint**: `POST /api/city/leave`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "destination": "quest",
  "questId": "quest_001"
}
```

**Response**:
```json
{
  "success": true,
  "sessionId": "uuid-v4",
  "redirectTo": "/quest/quest_001"
}
```

## Navigation Flow

### Entering the City

When players enter the city:
1. Load character state from server
2. Check for active quests and notifications
3. Display city hub with available services
4. Show any pending rewards or alerts

### Accessing Services

Each service opens a dedicated screen:
- **Quest Counter**: Navigate to `/city/quest-counter`
- **Storage Counter**: Navigate to `/city/storage`
- **Item Shop**: Navigate to `/city/shop/items`
- **Custom Shop**: Navigate to `/city/shop/custom`
- **Weapon Shop**: Navigate to `/city/shop/weapons`

### Leaving the City

Players can leave the city by:
- Starting a quest from Quest Counter
- Logging out (return to character select)
- Using quick navigation (if implemented)

## State Management

### City Session

When in the city, track:
- Current service being accessed
- Pending transactions (purchases, storage operations)
- Quest selections and preparations
- Character state changes (equipment, appearance)

### Synchronization

All city actions sync to server:
- Item purchases update inventory and meseta
- Storage operations update both tables
- Quest acceptance updates quest log
- Customization changes update character appearance
- Equipment changes update character loadout

## Implementation Notes

### Performance

- Pre-load city assets during sync screen
- Cache shop inventory data
- Lazy-load service screens as needed
- 3D character model optimization for real-time rendering

### Database Tables

City state leverages existing tables:
- `character_state` - Character inventory and meseta
- `character_storage` - Bank storage items
- `quest_log` - Active and completed quests
- `shop_inventory` - Available items in each shop
- `character_events` - All state changes via event sourcing

### User Experience

- Fast transitions between city services
- Clear visual feedback for transactions
- Confirmation dialogs for purchases and important actions
- Ability to cancel and return to city hub
- Auto-save after each transaction

## Security Considerations

- Validate all transactions server-side
- Check meseta balance before purchases
- Verify item existence before storage operations
- Prevent item duplication exploits
- Rate limit shop interactions

## Future Enhancements

- **City NPCs**: Add characters with dialogue and lore
- **Player Housing**: Personal room or apartment
- **Guild Hall**: Social space for online mode
- **Seasonal Events**: Limited-time city decorations and events
- **Quick Travel**: Teleport directly to specific services
- **City Map**: Navigation helper for new players
