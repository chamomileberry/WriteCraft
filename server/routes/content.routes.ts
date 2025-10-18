import { Router } from "express";
import { db } from "../db";
import { savedItems, projects } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/content/preview - Get preview data for any content type
router.get("/preview", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { type, id } = req.query;

    if (!type || !id) {
      return res.status(400).json({ error: 'Missing type or id parameter' });
    }

    let preview: any = null;

    // Handle projects separately as they're not in savedItems
    if (type === 'project') {
      const [project] = await db.select().from(projects)
        .where(and(
          eq(projects.id, id as string),
          eq(projects.userId, userId)
        ));
      
      if (project) {
        preview = {
          id: project.id,
          type: 'project',
          title: project.title,
          subtitle: `${project.status} - ${project.wordCount || 0} words`,
          description: project.excerpt || project.content?.substring(0, 150) || '',
        };
      }
    } else {
      // Query savedItems table for all other content types
      const [savedItem] = await db.select().from(savedItems)
        .where(and(
          eq(savedItems.itemId, id as string),
          eq(savedItems.itemType, type as string),
          eq(savedItems.userId, userId)
        ));

      if (savedItem) {
        const itemData = savedItem.itemData as any;
        let title = 'Untitled';
        let subtitle = '';
        let description = '';
        let imageUrl = itemData.imageUrl || null;

        // Extract title based on content type
        if (itemData.name) {
          title = itemData.name;
        } else if (itemData.givenName || itemData.familyName) {
          title = [itemData.givenName, itemData.familyName].filter(Boolean).join(' ') || 'Untitled Character';
        } else if (itemData.title) {
          title = itemData.title;
        }

        // Build subtitle and description based on type
        switch (type) {
          case 'character':
            subtitle = itemData.occupation || 'Character';
            description = itemData.backstory || itemData.personalityTraits || '';
            break;
          case 'location':
            subtitle = itemData.locationType || 'Location';
            description = itemData.description || '';
            break;
          case 'organization':
            subtitle = itemData.organizationType || 'Organization';
            description = itemData.description || itemData.purpose || '';
            break;
          case 'species':
            subtitle = itemData.classification || 'Species';
            description = itemData.physicalDescription || '';
            break;
          case 'item':
            subtitle = itemData.itemType || 'Item';
            description = itemData.description || '';
            break;
          case 'spell':
            subtitle = `${itemData.school || 'Unknown'} - Level ${itemData.level || '?'}`;
            description = itemData.description || '';
            break;
          case 'weapon':
            subtitle = itemData.weaponType || 'Weapon';
            description = itemData.description || '';
            break;
          case 'technology':
            subtitle = itemData.technologyType || 'Technology';
            description = itemData.description || '';
            break;
          case 'profession':
            subtitle = itemData.professionType || 'Profession';
            description = itemData.description || '';
            break;
          case 'religion':
            subtitle = 'Religion';
            description = itemData.description || itemData.beliefs || '';
            break;
          case 'culture':
            subtitle = 'Culture';
            description = itemData.description || '';
            break;
          case 'faction':
            subtitle = itemData.factionType || 'Faction';
            description = itemData.description || itemData.goals || '';
            break;
          case 'event':
            subtitle = itemData.eventType || 'Event';
            description = itemData.description || '';
            break;
          default:
            subtitle = type.charAt(0).toUpperCase() + type.slice(1);
            description = itemData.description || '';
        }

        preview = {
          id: savedItem.itemId,
          type: type,
          title: title,
          subtitle: subtitle,
          description: description.substring(0, 200),
          imageUrl: imageUrl,
        };
      }
    }

    if (!preview) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(preview);
  } catch (error) {
    console.error('Error fetching content preview:', error);
    res.status(500).json({ error: 'Failed to fetch content preview' });
  }
});

export default router;
