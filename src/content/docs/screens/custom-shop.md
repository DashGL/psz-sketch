---
title: Custom Shop
description: Weapon customization through element synthesis and photon fortification
---

![Custom Shop NPC](/screenshots/shop-custom.png)

The Custom Shop is accessed from the [City](/screens/city) hub and provides advanced weapon customization services. Players can add elemental attributes to weapons or enhance fully-grinded weapons with photon fortification.

![Custom Shop Menu](/screenshots/shop-custom-buy.png)

## Screen Flow

### Path

`/city/shop/custom`

### Navigation

```
City → /city/shop/custom → Select service → Customize weapon → Return to City
```

## Purpose

The Custom Shop provides:
- **Element Synthesis**: Add elemental attributes to weapons using element items
- **Photon Fortification**: Enhance fully-grinded weapons with photon power
- **Weapon Customization**: Advanced modifications beyond basic grinding
- **Special Properties**: Imbue weapons with unique capabilities

## User Interface

### Main Menu

When accessing the Custom Shop, players see two service options:

**Element Synthesis** (highlighted in screenshot):
- Add elemental attributes to weapons
- Requires element items (possibly obtained from Photon Collector)
- Imbues weapon with fire, ice, lightning, or other elemental damage

**Photon Fortification**:
- Enhance fully-grinded weapons
- Requires weapon to be at maximum grind level
- Adds photon-based enhancements beyond normal grinding limits

**UI Elements**:
- Service options displayed in vertical list
- Selected option highlighted in orange
- Text prompt at bottom: "Select from the Menu."

### Service Flow (Element Synthesis)

*Note: Exact mechanics need testing in-game*

**Presumed Flow**:
1. Select "Element Synthesis" from menu
2. Choose weapon from inventory to modify
3. Select element type (requires element item in inventory)
4. Confirm synthesis
5. Weapon gains elemental attribute
6. Element item consumed, meseta may be charged

**Requirements**:
- Weapon in inventory (not equipped)
- Element item obtained (possibly from Photon Collector or quest rewards)
- Sufficient meseta for service fee

### Service Flow (Photon Fortification)

*Note: Exact mechanics need testing in-game*

**Presumed Flow**:
1. Select "Photon Fortification" from menu
2. Choose fully-grinded weapon from inventory
3. Confirm fortification
4. Weapon receives photon enhancement
5. Materials consumed, meseta charged

**Requirements**:
- Weapon must be at maximum grind level (+10 or class-specific max)
- Photon materials (possibly Photon Drops/Crystals)
- Sufficient meseta for service fee

## Server API

*Note: API endpoints are preliminary and need validation through in-game testing*

### Get Available Services

**Endpoint**: `GET /api/shop/custom/services`

**Query Parameters**:
- `characterId`: UUID of the character

**Response**:
```json
{
  "services": [
    {
      "serviceId": "element_synthesis",
      "serviceName": "Element Synthesis",
      "description": "Add elemental attributes to weapons",
      "available": true
    },
    {
      "serviceId": "photon_fortification",
      "serviceName": "Photon Fortification",
      "description": "Enhance fully-grinded weapons",
      "available": true
    }
  ],
  "inventory": {
    "weapons": [
      {
        "itemInstanceId": "uuid-v4",
        "itemId": "sword_001",
        "itemName": "Sword",
        "grindLevel": 5,
        "maxGrindLevel": 10,
        "elementType": null,
        "canSynthesize": true,
        "canFortify": false
      }
    ],
    "elementItems": [
      {
        "itemInstanceId": "uuid-v4",
        "itemId": "fire_element",
        "itemName": "Fire Element",
        "quantity": 1
      }
    ],
    "photonMaterials": [
      {
        "itemInstanceId": "uuid-v4",
        "itemId": "photon_drop",
        "itemName": "Photon Drop",
        "quantity": 3
      }
    ]
  },
  "characterMeseta": 15000
}
```

### Element Synthesis

**Endpoint**: `POST /api/shop/custom/element-synthesis`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "weaponInstanceId": "uuid-v4",
  "elementItemId": "uuid-v4"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Element synthesis successful! Your weapon now has Fire attribute.",
  "serviceCost": 5000,
  "updatedWeapon": {
    "itemInstanceId": "uuid-v4",
    "itemName": "Sword [Fire]",
    "elementType": "fire",
    "elementLevel": 10,
    "stats": {
      "atp": 100,
      "bonusDamage": "+10% vs Ice enemies"
    }
  },
  "consumedItems": ["fire_element"],
  "characterMeseta": 10000
}
```

**Error Responses**:
- `400 Bad Request`: Weapon already has element or invalid element item
- `402 Payment Required`: Insufficient meseta
- `404 Not Found`: Weapon or element item not found in inventory
- `409 Conflict`: Weapon is currently equipped

### Photon Fortification

**Endpoint**: `POST /api/shop/custom/photon-fortification`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "weaponInstanceId": "uuid-v4",
  "photonMaterialIds": ["uuid-v4", "uuid-v4"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Photon fortification successful! Your weapon has been enhanced.",
  "serviceCost": 10000,
  "updatedWeapon": {
    "itemInstanceId": "uuid-v4",
    "itemName": "Sword +10 [Photon]",
    "grindLevel": 10,
    "photonLevel": 1,
    "stats": {
      "atp": 150,
      "specialAbility": "Photon Burst"
    }
  },
  "consumedItems": ["photon_drop", "photon_crystal"],
  "characterMeseta": 5000
}
```

**Error Responses**:
- `400 Bad Request`: Weapon not at maximum grind level
- `402 Payment Required`: Insufficient meseta or materials
- `404 Not Found`: Weapon or materials not found
- `409 Conflict`: Weapon is currently equipped

## Pricing Structure

*Note: Exact pricing needs validation through in-game testing*

### Element Synthesis Costs

**Estimated Pricing**:
- Service fee: 5,000-10,000 meseta (TBD)
- Element item consumed (1x Fire/Ice/Lightning/etc. element)
- Higher-tier elements may cost more

**Element Types** (presumed):
- Fire Element
- Ice Element
- Lightning Element
- Light Element
- Dark Element
- Wind Element (possibly)

### Photon Fortification Costs

**Estimated Pricing**:
- Service fee: 10,000-20,000 meseta (TBD)
- Photon materials required (Photon Drops, Photon Crystals)
- Higher fortification levels may require more materials

**Material Requirements** (presumed):
- Photon Drop x2-3
- Photon Crystal x1-2
- Additional rare materials for higher levels

## Database Integration

### Weapon Modification Storage

Weapon attributes are stored in `item_instances` table (see [Weapons](/mechanics/weapons)):

```sql
-- Update weapon with element
UPDATE item_instances
SET attributes = jsonb_set(
  jsonb_set(
    attributes,
    '{elementType}', '"fire"'
  ),
  '{elementLevel}', '10'
)
WHERE item_instance_id = $1;

-- Update weapon with photon fortification
UPDATE item_instances
SET attributes = jsonb_set(
  attributes,
  '{photonLevel}', '1'
)
WHERE item_instance_id = $1 AND attributes->>'grindLevel' = '10';
```

### Event Sourcing

Weapon customization changes are recorded as events:

```typescript
// Element Synthesis
{
  eventType: 'WEAPON_ELEMENT_SYNTHESIS',
  eventData: {
    weaponInstanceId: 'uuid-v4',
    weaponName: 'Sword',
    elementType: 'fire',
    elementLevel: 10,
    elementItemConsumed: 'fire_element',
    serviceCost: 5000,
    mesetaBefore: 15000,
    mesetaAfter: 10000
  }
}

// Photon Fortification
{
  eventType: 'WEAPON_PHOTON_FORTIFICATION',
  eventData: {
    weaponInstanceId: 'uuid-v4',
    weaponName: 'Sword +10',
    photonLevel: 1,
    materialsConsumed: ['photon_drop', 'photon_crystal'],
    serviceCost: 10000,
    mesetaBefore: 15000,
    mesetaAfter: 5000
  }
}
```

## Implementation Notes

*Note: These are preliminary guidelines subject to validation through gameplay testing*

### Material Acquisition

**Element Items**:
- Possibly obtained from Photon Collector (see reference if documented)
- May be quest rewards
- Could be enemy drops from elemental enemies
- Possibly craftable or purchaseable elsewhere

**Photon Materials**:
- Photon Drops: Rare enemy drops
- Photon Crystals: Very rare drops or quest rewards
- May require trading multiple drops for crystals

### Weapon Requirements

**For Element Synthesis**:
- Weapon must not already have an element
- Weapon must be in inventory (not equipped)
- Must have appropriate element item
- Some weapon types may not support elements

**For Photon Fortification**:
- Weapon must be at maximum grind level (+10 or class max)
- Weapon must be in inventory (not equipped)
- Must have required photon materials
- May have level/class restrictions

### Validation

Server must validate:
- Character owns the weapon being modified
- Weapon meets requirements for selected service
- Required materials are in inventory
- Character has sufficient meseta
- Weapon is not currently equipped

### Transaction Atomicity

```sql
BEGIN TRANSACTION;
  -- Update weapon attributes
  UPDATE item_instances SET attributes = $newAttributes WHERE item_instance_id = $weaponId;

  -- Remove consumed materials from inventory
  DELETE FROM character_inventory WHERE item_instance_id IN ($materialIds);

  -- Deduct meseta
  UPDATE character_state SET meseta = meseta - $cost WHERE character_id = $id;

  -- Record event
  INSERT INTO character_events (...) VALUES (...);
COMMIT;
```

## Weapon Customization Effects

### Element Synthesis Effects (Presumed)

**Elemental Damage**:
- Weapon gains bonus damage of selected element type
- Effective against enemies weak to that element
- May reduce effectiveness against resistant enemies
- Element level (1-100%) determines bonus strength

**Elemental Types**:
- Fire: Bonus vs ice/nature enemies
- Ice: Bonus vs fire/electric enemies
- Lightning: Bonus vs mechanical/water enemies
- Light: Bonus vs dark enemies
- Dark: Bonus vs light enemies

### Photon Fortification Effects (Presumed)

**Enhanced Stats**:
- Further increases ATP beyond grind cap
- May add special abilities or photon blast
- Visual effect changes (glowing weapon)
- Potential stat bonuses beyond raw damage

## Security Considerations

- Validate all weapon modifications server-side
- Prevent item duplication exploits
- Check meseta and material availability before applying
- Verify weapon ownership and eligibility
- Rate limit customization requests
- Log all modifications for audit trail

## Future Enhancements

- **Multiple Element Levels**: Upgrade element strength over time
- **Element Changing**: Replace existing element with different one
- **Photon Levels**: Multiple tiers of photon fortification
- **Special Abilities**: Unique weapon skills from customization
- **Visual Customization**: Change weapon appearance/color
- **Combination Effects**: Synergy between element and photon
- **Material Trading**: Exchange materials with other players
- **Customization Preview**: See stats before committing
