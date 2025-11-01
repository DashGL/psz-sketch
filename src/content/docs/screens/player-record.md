---
title: Player Record
description: View character statistics, achievements, and progress tracking
---

The Player Record screen is accessed from the Personnel Counter in the [City](/screens/city) hub. It displays comprehensive statistics about a character's progress, including enemies defeated, quests completed, and various gameplay achievements.

## Screen Flow

### Path

`/city/storage/player-record`

### Navigation

```
City → Personnel Counter → Player Record → View stats → Return to Personnel Counter
```

## Purpose

The Player Record provides:
- **Enemy Statistics**: Track total enemies defeated by type
- **Quest Completion**: View completed quests and success rates
- **Gameplay Metrics**: Playtime, deaths, damage dealt, etc.
- **Achievement Tracking**: Progress toward in-game achievements
- **Server Flags**: View all tracked flags and state variables
- **Progress Overview**: Comprehensive view of character progression

## User Interface

### Statistics Categories

**Combat Statistics**:
- Total enemies defeated
- Enemies defeated by type (Boomas, Rappies, etc.)
- Bosses defeated
- Total damage dealt
- Deaths
- Revives used

**Quest Statistics**:
- Total quests completed
- Quests completed by difficulty (Normal, Hard, Super Hard)
- Quest success rate
- Fastest quest clear times
- Eternal Tower highest floor reached

**Progression Statistics**:
- Total playtime
- Level reached
- Meseta earned (total)
- Items found
- Rare items obtained

**Exploration Statistics**:
- Areas discovered
- Secret areas found
- Telepipes used
- Distance traveled

**Equipment Statistics**:
- Weapons acquired
- Armor pieces found
- Units collected
- MAG evolutions

## Server API

### Get Player Record

**Endpoint**: `GET /api/player-record`

**Query Parameters**:
- `characterId`: UUID of the character

**Response**:
```json
{
  "characterId": "uuid-v4",
  "characterName": "Rina",
  "class": "HUmar",
  "level": 25,

  "combatStats": {
    "totalEnemiesDefeated": 1547,
    "enemiesByType": {
      "booma": 234,
      "gobooma": 156,
      "gigobooma": 89,
      "rappy": 12,
      "rag_rappy": 3,
      "de_rol_le": 2
    },
    "bossesDefeated": 15,
    "totalDamageDealt": 1234567,
    "deaths": 8,
    "revivesUsed": 8
  },

  "questStats": {
    "totalQuestsCompleted": 45,
    "questsByDifficulty": {
      "normal": 30,
      "hard": 12,
      "superHard": 3
    },
    "questSuccessRate": 0.92,
    "fastestClearTimes": [
      {
        "questId": "the_valley_king",
        "questName": "The Valley King",
        "clearTime": 342,
        "difficulty": "normal"
      }
    ],
    "eternalTowerHighestFloor": 45
  },

  "progressionStats": {
    "totalPlaytimeSeconds": 86400,
    "totalPlaytimeFormatted": "24 hours",
    "currentLevel": 25,
    "totalMesetaEarned": 145000,
    "totalItemsFound": 567,
    "rareItemsObtained": 12
  },

  "explorationStats": {
    "areasDiscovered": 6,
    "secretAreasFound": 2,
    "telepipesUsed": 45,
    "distanceTraveled": 123456
  },

  "equipmentStats": {
    "weaponsAcquired": 34,
    "armorPiecesFound": 28,
    "unitsCollected": 15,
    "magEvolutions": 2
  },

  "serverFlags": {
    "mainStoryCompleted": true,
    "eternalTowerUnlocked": true,
    "secretMissionFound": false,
    "rareEnemyEncountered": true,
    "allClassesUnlocked": false
  },

  "achievements": [
    {
      "achievementId": "first_boss",
      "name": "First Boss Defeated",
      "description": "Defeat your first boss enemy",
      "unlockedAt": "2025-10-28T14:30:00Z",
      "unlocked": true
    },
    {
      "achievementId": "rappy_hunter",
      "name": "Rappy Hunter",
      "description": "Defeat 10 Rappy enemies",
      "progress": 12,
      "required": 10,
      "unlockedAt": "2025-10-29T09:15:00Z",
      "unlocked": true
    },
    {
      "achievementId": "rare_collector",
      "name": "Rare Collector",
      "description": "Obtain 50 rare items",
      "progress": 12,
      "required": 50,
      "unlocked": false
    }
  ]
}
```

## Database Schema

### Player Statistics Table

```sql
CREATE TABLE player_statistics (
  stats_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,

  -- Combat stats
  total_enemies_defeated INTEGER DEFAULT 0,
  enemies_by_type JSONB DEFAULT '{}', -- {"booma": 234, "gobooma": 156, ...}
  bosses_defeated INTEGER DEFAULT 0,
  total_damage_dealt BIGINT DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  revives_used INTEGER DEFAULT 0,

  -- Quest stats
  total_quests_completed INTEGER DEFAULT 0,
  quests_by_difficulty JSONB DEFAULT '{"normal": 0, "hard": 0, "superHard": 0}',
  quest_success_rate DECIMAL(5,2) DEFAULT 0.00,
  fastest_clear_times JSONB DEFAULT '[]',
  eternal_tower_highest_floor INTEGER DEFAULT 0,

  -- Progression stats
  total_playtime_seconds BIGINT DEFAULT 0,
  total_meseta_earned BIGINT DEFAULT 0,
  total_items_found INTEGER DEFAULT 0,
  rare_items_obtained INTEGER DEFAULT 0,

  -- Exploration stats
  areas_discovered INTEGER DEFAULT 0,
  secret_areas_found INTEGER DEFAULT 0,
  telepipes_used INTEGER DEFAULT 0,
  distance_traveled BIGINT DEFAULT 0,

  -- Equipment stats
  weapons_acquired INTEGER DEFAULT 0,
  armor_pieces_found INTEGER DEFAULT 0,
  units_collected INTEGER DEFAULT 0,
  mag_evolutions INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (character_id) REFERENCES character_state(character_id) ON DELETE CASCADE,
  UNIQUE (character_id)
);

CREATE INDEX idx_player_statistics_character ON player_statistics(character_id);
```

### Server Flags Table

```sql
CREATE TABLE server_flags (
  flag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  flag_name VARCHAR(100) NOT NULL,
  flag_value BOOLEAN DEFAULT false,
  set_at TIMESTAMP WITH TIME ZONE,

  FOREIGN KEY (character_id) REFERENCES character_state(character_id) ON DELETE CASCADE,
  UNIQUE (character_id, flag_name)
);

CREATE INDEX idx_server_flags_character ON server_flags(character_id);
CREATE INDEX idx_server_flags_name ON server_flags(flag_name);
```

### Achievements Table

```sql
CREATE TABLE achievement_definitions (
  achievement_id VARCHAR(50) PRIMARY KEY,
  achievement_name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  achievement_type VARCHAR(50) NOT NULL, -- combat, quest, exploration, etc.
  required_count INTEGER DEFAULT 1,
  icon_path VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE character_achievements (
  char_achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  achievement_id VARCHAR(50) NOT NULL,
  current_progress INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,

  FOREIGN KEY (character_id) REFERENCES character_state(character_id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievement_definitions(achievement_id),
  UNIQUE (character_id, achievement_id)
);

CREATE INDEX idx_character_achievements_character ON character_achievements(character_id);
CREATE INDEX idx_character_achievements_unlocked ON character_achievements(unlocked) WHERE unlocked = true;
```

## Statistics Tracking

### Real-Time Updates

Statistics are updated in real-time during gameplay:

**Enemy Defeated**:
```typescript
{
  eventType: 'ENEMY_DEFEATED',
  eventData: {
    enemyType: 'booma',
    enemyLevel: 5,
    damageDealt: 250,
    experienceGained: 50
  }
}
// Triggers update to total_enemies_defeated and enemies_by_type
```

**Quest Completed**:
```typescript
{
  eventType: 'QUEST_COMPLETED',
  eventData: {
    questId: 'the_valley_king',
    difficulty: 'normal',
    clearTimeSeconds: 342,
    success: true
  }
}
// Triggers update to total_quests_completed and quest_success_rate
```

**Item Found**:
```typescript
{
  eventType: 'ITEM_OBTAINED',
  eventData: {
    itemId: 'rare_sword',
    rarity: 'rare',
    source: 'enemy_drop'
  }
}
// Triggers update to total_items_found and rare_items_obtained
```

### Stat Calculation

Some statistics are calculated rather than directly stored:

**Quest Success Rate**:
```sql
SELECT
  total_quests_completed::DECIMAL / NULLIF(total_quests_attempted, 0) * 100 AS success_rate
FROM player_statistics
WHERE character_id = $1;
```

**Playtime Formatting**:
```typescript
function formatPlaytime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} hours, ${minutes} minutes`;
}
```

## Server Flags

Common server flags tracked:

**Story Progress**:
- `main_story_completed`
- `human_story_completed`
- `newman_story_completed`
- `cast_story_completed`

**Unlocks**:
- `eternal_tower_unlocked`
- `hard_mode_unlocked`
- `super_hard_unlocked`
- `all_areas_unlocked`

**Secrets**:
- `secret_mission_found`
- `rare_enemy_encountered`
- `hidden_area_discovered`

**Achievements**:
- `all_weapons_collected`
- `all_classes_unlocked`
- `max_level_reached`

## Implementation Notes

### Performance

- Statistics are updated asynchronously to avoid blocking gameplay
- Batch updates when possible (e.g., end of quest)
- Cache frequently accessed stats on client
- Use database triggers for automatic stat increments

### Event Sourcing Integration

All statistics derive from events in `character_events` table:
- Enemy defeats → combat stats
- Quest completions → quest stats
- Item acquisitions → equipment stats
- Time tracking → progression stats

This allows:
- Audit trail of all statistics
- Recalculation if needed
- Historical analysis
- Cheat detection

### Privacy Considerations

- Player records are private to the character owner
- Optional: Allow players to share records with friends
- Leaderboards may expose certain stats (fastest times, highest floors)

## Future Enhancements

- **Leaderboards**: Compare stats with other players
- **Achievements System**: Unlock rewards for milestones
- **Stat Comparisons**: Compare with other characters on account
- **Export Stats**: Download statistics as JSON or CSV
- **Graphs and Charts**: Visual representation of progress over time
- **Personal Bests**: Track best performance metrics
- **Challenge Mode**: Special stat tracking for challenge runs
