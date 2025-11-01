---
title: Quest Counter
description: Quest selection, tracking, and reward collection
---

![Quest Counter NPC](/screenshots/quest-counter.png)

The Quest Counter is accessed from the [City](/screens/city) hub and provides quest management functionality. Players can view available quests, accept new missions, track progress, and claim rewards.

![Quest Counter Menu](/screenshots/quest-counter-counter.png)

## Screen Flow

### Path

`/city/quest-counter`

### Navigation

```
City → /city/quest-counter → Quest selection → /quest/{questId}
```

## Purpose

The Quest Counter provides:
- **Quest Discovery**: Browse available quests and story missions
- **Progress Tracking**: View active quest objectives
- **Reward Collection**: Claim meseta, items, and experience
- **Quest History**: Review completed quests

## User Interface

### Quest Counter Menu

When accessing the Quest Counter, players see two main options:

**Access Field**:
- Browse and select from available areas/fields
- Each field contains multiple quests
- Fields unlock as story progresses

**Take a Quest**:
- Browse available quests directly
- Filter by type: story, side quest, multiplayer
- View quest details before accepting

**Choose Members** (grayed out in offline mode):
- Online multiplayer party formation
- Not available in offline/single-player mode

### Quest Selection Flow

1. **Select "Access Field"**: Choose an area (Gurhacia Valley, Rioh Snowfield, etc.)
2. **Browse Field Quests**: See all quests available in that area
3. **OR Select "Take a Quest"**: Browse all quests across all areas
4. **View Quest Details**: See objectives, rewards, difficulty
5. **Accept Quest**: Confirm and start the quest

### Quest List View

**Available Quests**:
- List of quests player can accept
- Quest name, difficulty, and area
- Reward preview (meseta, items, experience)
- Quest type indicator (story, side quest, repeatable)
- Unlock status (some quests require prerequisites)

**Active Quests**:
- Currently accepted quests
- Progress bars for objectives
- Time remaining (if timed)
- Option to abandon quest

**Completed Quests**:
- Quests ready for reward collection
- Unclaimed rewards highlighted
- Option to claim rewards

### Quest Detail View

When selecting a quest, show:
- **Quest Name**: Full title
- **Description**: Story and objective details
- **Difficulty**: Normal, Hard, Very Hard, Ultimate
- **Recommended Level**: Suggested character level
- **Objectives**: List of tasks to complete
- **Rewards**: Meseta, items, experience breakdown
- **Requirements**: Level requirements, prerequisite quests
- **Accept Button**: Start the quest

## Server API

### Get Available Quests

**Endpoint**: `GET /api/quests/available`

**Query Parameters**:
- `characterId`: UUID of the character
- `difficulty`: Filter by difficulty (optional)
- `type`: Filter by quest type (optional)

**Response**:
```json
{
  "available": [
    {
      "questId": "quest_001",
      "name": "Forest of Illusion",
      "description": "Investigate mysterious energy readings in the forest.",
      "difficulty": "normal",
      "recommendedLevel": 5,
      "type": "story",
      "objectives": [
        {
          "type": "defeat_enemies",
          "description": "Defeat 10 Boomas",
          "required": 10
        },
        {
          "type": "reach_location",
          "description": "Reach the forest shrine"
        }
      ],
      "rewards": {
        "meseta": 500,
        "experience": 250,
        "items": [
          {
            "itemId": "monomate",
            "quantity": 3
          }
        ]
      },
      "requirements": {
        "minLevel": 3,
        "prerequisiteQuests": []
      }
    }
  ],
  "active": [
    {
      "questId": "quest_002",
      "name": "Cave Exploration",
      "progress": {
        "objectives": [
          {
            "description": "Collect 5 minerals",
            "current": 3,
            "required": 5,
            "completed": false
          }
        ],
        "overallProgress": 0.6
      },
      "acceptedAt": "2025-10-30T10:00:00Z"
    }
  ],
  "completed": [
    {
      "questId": "quest_003",
      "name": "Monster Cleanup",
      "completedAt": "2025-10-30T09:30:00Z",
      "rewardsClaimed": false,
      "rewards": {
        "meseta": 300,
        "experience": 150,
        "items": []
      }
    }
  ]
}
```

### Accept Quest

**Endpoint**: `POST /api/quests/accept`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "questId": "quest_001"
}
```

**Response**:
```json
{
  "success": true,
  "questLog": {
    "questId": "quest_001",
    "status": "active",
    "acceptedAt": "2025-10-30T11:00:00Z",
    "objectives": [
      {
        "objectiveId": "obj_001",
        "description": "Defeat 10 Boomas",
        "current": 0,
        "required": 10,
        "completed": false
      }
    ]
  },
  "redirectTo": "/quest/quest_001"
}
```

**Error Responses**:
- `400 Bad Request`: Quest requirements not met (level too low, missing prerequisites)
- `409 Conflict`: Quest already active or completed
- `404 Not Found`: Quest does not exist

### Claim Reward

**Endpoint**: `POST /api/quests/claim-reward`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "questId": "quest_003"
}
```

**Response**:
```json
{
  "success": true,
  "rewards": {
    "meseta": 300,
    "experience": 150,
    "items": [
      {
        "itemId": "monomate",
        "quantity": 3
      }
    ]
  },
  "newInventoryState": {
    "meseta": 15300,
    "slotsUsed": 16,
    "maxSlots": 40
  },
  "levelUp": false
}
```

### Abandon Quest

**Endpoint**: `POST /api/quests/abandon`

**Request**:
```json
{
  "characterId": "uuid-v4",
  "questId": "quest_002"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Quest abandoned. You can accept it again later."
}
```

## Database Schema

### Quest Definitions

```sql
CREATE TABLE quest_definitions (
  quest_id VARCHAR(50) PRIMARY KEY,
  quest_name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('normal', 'hard', 'very_hard', 'ultimate')),
  recommended_level INTEGER NOT NULL,
  quest_type VARCHAR(50) NOT NULL CHECK (quest_type IN ('story', 'side', 'repeatable', 'event')),

  -- Requirements
  min_level INTEGER NOT NULL DEFAULT 1,
  prerequisite_quests JSONB DEFAULT '[]', -- Array of quest IDs

  -- Objectives
  objectives JSONB NOT NULL, -- Array of objective definitions

  -- Rewards
  reward_meseta INTEGER NOT NULL DEFAULT 0,
  reward_experience INTEGER NOT NULL DEFAULT 0,
  reward_items JSONB DEFAULT '[]', -- Array of {itemId, quantity}

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quest_difficulty ON quest_definitions(difficulty);
CREATE INDEX idx_quest_type ON quest_definitions(quest_type);
CREATE INDEX idx_quest_level ON quest_definitions(recommended_level);
```

### Quest Log (Character Progress)

```sql
CREATE TABLE quest_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  quest_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'completed', 'abandoned')),

  -- Progress tracking
  objectives_progress JSONB NOT NULL, -- Array of {objectiveId, current, required, completed}
  overall_progress DECIMAL(5,2) DEFAULT 0.00, -- 0.00 to 100.00

  -- Timestamps
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  rewards_claimed_at TIMESTAMP WITH TIME ZONE,

  -- Rewards
  rewards_claimed BOOLEAN DEFAULT false,

  FOREIGN KEY (character_id) REFERENCES character_state(character_id),
  FOREIGN KEY (quest_id) REFERENCES quest_definitions(quest_id),

  UNIQUE (character_id, quest_id, status)
);

CREATE INDEX idx_quest_log_character ON quest_log(character_id, status);
CREATE INDEX idx_quest_log_active ON quest_log(character_id) WHERE status = 'active';
```

## Quest Areas

The following areas (fields) are available for quests:

- **Gurhacia Valley**: Starting area with grasslands and forests
- **Ozette Wetlands**: Swamp and marsh environments
- **Rioh Snowfield**: Frozen tundra and ice caves
- **Paru**: TBD area
- **Makara**: TBD area
- **Arca Plant**: Industrial/factory area
- **Dark Shrine**: Dark temple environment
- **Eternal Tower**: Post-game dungeon with 101 floors

Areas unlock as players progress through the story quests.

## Quest Types

### Main Story Quests

Race-specific main story quests that progress the narrative:

**The Valley King** (Human):
- Area: Gurhacia Valley
- Reward: 1000 Meseta
- Difficulty: Normal

**Swamp Devil** (Newman):
- Area: Ozette Wetlands
- Reward: 1000 Meseta
- Difficulty: Normal

**Memories Opened** (CAST):
- Area: Rioh Snowfield
- Reward: 1000 Meseta
- Difficulty: Normal

Main story quests are:
- Tied to character race
- Non-repeatable
- Unlock new areas and features
- Sequential progression

### Side Quests

Optional missions available in each area with difficulty-based rewards:

**Mayor's Mission** (Gurhacia Valley):
- Normal: Grow Shower, 500 Meseta
- Hard: Bloom Shower, 1000 Meseta
- Super Hard: Bloom Shower, 2000 Meseta

**Devilish Return** (Ozette Wetland):
- Normal: Twin Ketchup, 500 Meseta
- Hard: Twin Mustard, 1000 Meseta
- Super Hard: Twin Mustard, 2000 Meseta

**Third Daughter** (Rioh Snowfield - Secret Mission):
- Unlock: Find Naura Cake Shop rare block
- Normal: Chef Apron, 5000 Meseta
- Hard: Chef Apron, 10000 Meseta
- Super Hard: Chef Apron, 20000 Meseta

Side quests:
- Have multiple difficulty levels
- Better rewards on higher difficulties
- May be repeatable
- Independent from main story

### Multiplayer Quests

Co-operative missions (for online mode):

**The Wild Valley**:
- Area: Gurhacia Valley
- Type: Co-op
- Objective: Clear area of enemies

**Mech Assault**:
- Area: Moon
- Type: Boss
- Objective: Defeat giant mech

### Post-Game Content

**Eternal Tower**:
- 101 floors of progressive difficulty
- Boss every 10 floors
- Unlock Super Hard: Complete on Hard mode
- Ultimate endgame challenge

## Objective Types

### Defeat Enemies
```json
{
  "type": "defeat_enemies",
  "description": "Defeat 10 Boomas",
  "enemyType": "booma",
  "required": 10
}
```

### Collect Items
```json
{
  "type": "collect_items",
  "description": "Collect 5 minerals",
  "itemId": "mineral_ore",
  "required": 5
}
```

### Reach Location
```json
{
  "type": "reach_location",
  "description": "Reach the forest shrine",
  "locationId": "forest_shrine"
}
```

### Defeat Boss
```json
{
  "type": "defeat_boss",
  "description": "Defeat the Dragon",
  "bossId": "forest_dragon"
}
```

### Escort NPC
```json
{
  "type": "escort_npc",
  "description": "Escort the scientist safely",
  "npcId": "scientist_npc"
}
```

## Implementation Notes

### Quest Progress Tracking

Progress updates during gameplay:
1. Client sends progress events to server
2. Server validates progress (anti-cheat)
3. Server updates `quest_log.objectives_progress`
4. Server calculates `overall_progress`
5. When all objectives complete, mark quest as completed

### Reward Distribution

When claiming rewards:
1. Verify quest is completed
2. Check inventory has space for items
3. Add meseta to character
4. Add items to inventory
5. Award experience (check for level up)
6. Mark `rewards_claimed = true`
7. Create event in `character_events` table

### Quest Availability

Determine which quests to show:
```sql
SELECT qd.*
FROM quest_definitions qd
WHERE qd.is_active = true
  AND qd.min_level <= (SELECT level FROM character_state WHERE character_id = $1)
  AND NOT EXISTS (
    SELECT 1 FROM quest_log ql
    WHERE ql.character_id = $1
      AND ql.quest_id = qd.quest_id
      AND ql.status IN ('active', 'completed')
  )
  -- Check prerequisite quests are completed
  -- (Complex JSON query for prerequisite_quests)
```

### Event Sourcing Integration

Quest-related events:
- `QUEST_ACCEPTED`: When player accepts a quest
- `QUEST_PROGRESS_UPDATED`: When objective progress changes
- `QUEST_COMPLETED`: When all objectives are met
- `QUEST_REWARD_CLAIMED`: When rewards are collected
- `QUEST_ABANDONED`: When player gives up on quest

## Future Enhancements

- **Quest Chains**: Multi-part story arcs
- **Dynamic Quests**: Procedurally generated missions
- **Co-op Quests**: Multiplayer-specific missions
- **Quest Ratings**: Player feedback and difficulty ratings
- **Quest Search**: Filter and search quest list
- **Quest Recommendations**: Suggested quests based on level and progress
