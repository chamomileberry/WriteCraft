import type { SubscriptionTier } from "@shared/types/subscription";

export interface PremiumSample {
  id: string;
  type:
    | "character"
    | "plot"
    | "setting"
    | "creature"
    | "conflict"
    | "theme"
    | "description"
    | "mood";
  title: string;
  content: {
    summary: string;
    details: string;
  };
  tier: SubscriptionTier;
  category: string;
  quality: "basic" | "enhanced" | "premium" | "elite";
}

export const PREMIUM_SAMPLES: PremiumSample[] = [
  // Free Tier Samples
  {
    id: "char-free-1",
    type: "character",
    title: "Elena Blackwood",
    content: {
      summary: "A skilled archer from the northern forests",
      details:
        "Elena is a 28-year-old ranger known for her exceptional tracking skills. She has auburn hair, green eyes, and prefers practical leather armor. Her motivations include protecting the forest and finding her missing brother.",
    },
    tier: "free",
    category: "Character",
    quality: "basic",
  },
  {
    id: "plot-free-1",
    type: "plot",
    title: "The Lost Artifact",
    content: {
      summary: "A quest to recover a stolen magical item",
      details:
        "Act 1: A valuable artifact is stolen. Act 2: Heroes track the thieves across dangerous terrain. Act 3: Final confrontation and recovery of the artifact. Stakes: If the artifact isn't recovered, the kingdom falls to darkness.",
    },
    tier: "free",
    category: "Plot Structure",
    quality: "basic",
  },

  // Author Tier Samples
  {
    id: "char-author-1",
    type: "character",
    title: "Captain Mira Vex",
    content: {
      summary: "A complex starship captain with a troubled past",
      details:
        "Captain Mira Vex, 42, commands the cargo vessel Nebula's Edge. Her weathered features and cybernetic left eye tell of countless close calls in deep space. Once a decorated military officer, she was dishonorably discharged for refusing an immoral order - a decision that haunts her still. Her motivations are layered: prove her honor wasn't lost, protect her chosen crew family, and secretly search for evidence to clear her name. She masks vulnerability with dry humor and maintains distance from emotional attachments, yet shows fierce loyalty to those who earn her trust.",
    },
    tier: "author",
    category: "Character",
    quality: "enhanced",
  },
  {
    id: "setting-author-1",
    type: "setting",
    title: "The Floating Markets of Aethermoor",
    content: {
      summary: "A bustling sky-city marketplace suspended by ancient magic",
      details:
        "The Floating Markets hover two miles above the Crystalline Sea, a maze of enchanted platforms connected by shimmering bridges of solidified light. Merchants from across the realm peddle exotic wares: luminescent fungi from the Deep Caves, bottled emotions from Sentiment Valley, and clockwork automatons from the Gear Districts. The air smells of spiced tea, ozone from magical discharge, and the salt spray from far below. At sunset, the platforms glow with embedded crystals, creating a constellation of commerce against the darkening sky. The market operates under the strict oversight of the Merchant's Guild, whose floating tower-fortress looms at the center like a watchful sentinel.",
    },
    tier: "author",
    category: "Setting",
    quality: "enhanced",
  },

  // Professional Tier Samples
  {
    id: "char-pro-1",
    type: "character",
    title: "Dr. Kieran Vale",
    content: {
      summary:
        "A brilliant neuroscientist whose research into consciousness has led to both breakthrough and tragedy",
      details:
        "Dr. Kieran Vale, 37, is a neuroscientist at the forefront of consciousness research at Cambridge. His disheveled appearance - perpetually rumpled suits, ink-stained fingers, and unkempt dark hair streaked with premature gray - belies a mind operating at extraordinary levels. Following the loss of his wife to early-onset Alzheimer's, Kieran's research became obsession. His groundbreaking work on neural mapping promises to preserve consciousness digitally, but each success brings him closer to an ethical precipice. \n\nHis internal conflict manifests in meticulous routines: exactly three cups of black coffee before dawn, never takes the same route to the lab twice, and maintains his wife's greenhouse despite his admitted lack of botanical knowledge. He speaks in rapid, technical bursts when excited, then retreats into contemplative silences that can last hours. His relationship with his research assistant Sarah oscillates between mentor-student professionalism and something more tender, complicated by guilt over moving forward emotionally. \n\nKieran's fatal flaw is his inability to accept loss, driving him toward increasingly questionable methods. His arc explores whether some boundaries of science exist for good reason, and whether love can be preserved in code.",
    },
    tier: "professional",
    category: "Character",
    quality: "premium",
  },
  {
    id: "conflict-pro-1",
    type: "conflict",
    title: "The Price of Progress",
    content: {
      summary:
        "A community torn between technological advancement and cultural preservation",
      details:
        "The island nation of Meridara faces an impossible choice: accept a megacorporation's offer to modernize their infrastructure, bringing prosperity and connection to the wider world, or maintain their centuries-old traditions and risk economic collapse. \n\nExternal Conflict: The Helios Corporation offers a 50-year development contract that would transform Meridara's economy but requires surrendering autonomy over natural resources. Time pressure mounts as neighboring nations sign similar deals, threatening to leave Meridara isolated. \n\nInternal Conflict (protagonist): Amara, the youngest council member, sees her culture through two lenses - the beauty of ancestral wisdom her grandmother taught her, and the limitations that drove her brother to emigrate for medical treatment he couldn't receive at home. \n\nRelationship Conflict: Generational divide fractures families as youth embrace change while elders see cultural erasure. Amara's romance with visiting engineer David becomes a symbol of the larger conflict. \n\nPhilosophical Stakes: Can tradition and progress coexist, or must one always consume the other? \n\nPotential Resolutions: (1) Hybrid approach - selective modernization preserving core cultural elements, (2) Complete rejection leading to alternative partnership, (3) Acceptance revealing unforeseen consequences, (4) Internal revolution as younger generation seizes control.",
    },
    tier: "professional",
    category: "Conflict",
    quality: "premium",
  },

  // Team Tier Sample
  {
    id: "world-team-1",
    type: "setting",
    title: "The Shattered Realms",
    content: {
      summary:
        "A comprehensive multi-layered world system where reality itself has fractured into competing dimensions",
      details:
        'The Shattered Realms exist in a state of dimensional flux, where seven parallel realities intersect and overlap in unstable patterns. Each realm operates under different fundamental laws: \n\n**The Prime Realm (Mundus)**: Where traditional physics apply, home to humans and the last bastions of pre-Shattering civilization. Victorian-era technology mingles with rediscovered ancient magic. Gothic architecture dominates cities protected by crystal barriers that prevent dimensional bleeding.\n\n**The Verdant Dream (Sylvaria)**: A realm where thought manifests as living flora. Cities grow from seed-thoughts, and the boundary between consciousness and matter dissolves. Time flows non-linearly here - past, present, and future exist simultaneously in different growth rings of the World Tree.\n\n**The Forge of Echoes (Metallum)**: Reality crystallized into geometric perfection. Everything exists in precise mathematical relationships. Inhabitants are living equations, and magic here is pure logic made manifest. The realm\'s capital is a tesseract city where buildings exist in multiple dimensions simultaneously.\n\n**The Depths of Memory (Obscura)**: A nightmare realm where forgotten things dwell. Physical laws are malleable, shaped by collective unconscious fears. Architecture impossible in Euclidean space - buildings with more inside than outside, stairs leading to their own beginnings, doorways to moments rather than places.\n\n**The Celestial Mechanism (Aetheria)**: A realm of pure energy and clockwork cosmos. Beings of living light navigate astronomical mechanics. Stars are conscious entities, and space itself can be wound like a spring, storing temporal energy.\n\n**The Still Waters (Quietus)**: Where entropy has won. A dying realm of perfect stasis and terrible peace. Nothing ages, nothing grows, nothing changes. Refugees from other realms seek sanctuary here, willing to trade vitality for safety.\n\n**The Crossroads (Nexum)**: The newest realm, formed from the collision points of all others. Chaos incarnate, where laws from multiple realities compete. This is where Realm Walkers - those who can traverse realities - make their homes, in cities built on stable probability islands.\n\n**The Shattering Event**: Three hundred years ago, an experiment in the Prime Realm to bridge reality to pure magical source backfired catastrophically, fracturing existence itself. The event created Thin Places - geographical locations where realm boundaries are permeable and unpredictable crossovers occur.\n\n**Sociopolitical Structure**: The Council of Resonance (representatives from each stable realm) attempts to govern cross-realm interaction, but their authority is disputed. The Scar Cults believe the Shattering should be completed, merging all realities into transcendent chaos. The Restoration Movement seeks to reverse the Shattering, but doing so might erase three centuries of existence.\n\n**Economic System**: "Stable moments" serve as currency across realms - crystallized instances of fixed reality that hold value regardless of dimensional law. Trade occurs at Thin Places during predictable overlap windows.\n\n**Cultural Elements**: Each realm has developed distinct philosophies - Mundus values preservation, Sylvaria embraces growth, Metallum seeks perfection, Obscura feeds on fear, Aetheria pursues enlightenment, Quietus craves rest, and Nexum celebrates adaptability.',
    },
    tier: "team",
    category: "World Building",
    quality: "elite",
  },
];

// Helper function to get samples by tier
export function getSamplesByTier(tier: SubscriptionTier): PremiumSample[] {
  const tierOrder: SubscriptionTier[] = [
    "free",
    "author",
    "professional",
    "team",
  ];
  const tierIndex = tierOrder.indexOf(tier);

  return PREMIUM_SAMPLES.filter((sample) => {
    const sampleIndex = tierOrder.indexOf(sample.tier);
    return sampleIndex <= tierIndex;
  });
}

// Helper function to get samples by type
export function getSamplesByType(type: PremiumSample["type"]): PremiumSample[] {
  return PREMIUM_SAMPLES.filter((sample) => sample.type === type);
}

// Helper function to check if sample is locked for tier
export function isSampleLocked(
  sample: PremiumSample,
  userTier: SubscriptionTier,
): boolean {
  const tierOrder: SubscriptionTier[] = [
    "free",
    "author",
    "professional",
    "team",
  ];
  const userTierIndex = tierOrder.indexOf(userTier);
  const sampleTierIndex = tierOrder.indexOf(sample.tier);

  return sampleTierIndex > userTierIndex;
}
