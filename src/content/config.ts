import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

// Quest definitions collection
const questDefinitions = defineCollection({
  type: 'data',
  schema: z.object({
    questId: z.string(),
    questName: z.string(),
    questType: z.enum(['story', 'side', 'multiplayer', 'post_game']),
    area: z.enum([
      'Gurhacia Valley',
      'Ozette Wetlands',
      'Rioh Snowfield',
      'Paru',
      'Makara',
      'Arca Plant',
      'Dark Shrine',
      'Eternal Tower',
      'Moon'
    ]),
    description: z.string(),

    // Race restriction (for story quests)
    race: z.enum(['Human', 'Newman', 'CAST']).optional(),

    // Difficulty levels with rewards
    difficulties: z.array(z.object({
      difficulty: z.enum(['Normal', 'Hard', 'Super Hard', 'Ultimate']),
      recommendedLevel: z.number().optional(),
      rewards: z.object({
        meseta: z.number().default(0),
        experience: z.number().default(0),
        items: z.array(z.object({
          itemId: z.string(),
          itemName: z.string(),
          quantity: z.number().default(1)
        })).optional()
      })
    })),

    // Requirements
    requirements: z.object({
      minLevel: z.number().default(1),
      prerequisiteQuests: z.array(z.string()).default([]),
      unlockCondition: z.string().optional() // e.g., "Find Naura Cake Shop rare block"
    }).optional(),

    // Objectives
    objectives: z.array(z.object({
      type: z.enum(['defeat_enemies', 'collect_items', 'reach_location', 'defeat_boss', 'escort_npc']),
      description: z.string(),
      target: z.string().optional(), // enemyType, itemId, locationId, bossId, npcId
      required: z.number().optional() // quantity required
    })),

    // Multiplayer settings
    multiplayerType: z.enum(['solo', 'co-op', 'boss']).optional(),

    // Special flags
    isRepeatable: z.boolean().default(false),
    isSecret: z.boolean().default(false),

    // Post-game specific (Eternal Tower)
    floors: z.number().optional(),
    bossFrequency: z.number().optional() // boss every X floors
  })
});

// Quest areas collection
const questAreas = defineCollection({
  type: 'data',
  schema: z.object({
    areaId: z.string(),
    areaName: z.string(),
    description: z.string(),
    unlockCondition: z.string().optional(),
    recommendedLevel: z.number().optional(),
    environment: z.string(), // "grasslands", "swamp", "snow", etc.
    questCount: z.number().optional()
  })
});

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
  'quest-definitions': questDefinitions,
  'quest-areas': questAreas
};
