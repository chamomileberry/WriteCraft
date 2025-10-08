import { BaseRepository } from './base.repository';
import { db } from '../db';
import { 
  projects, 
  savedItems,
  notebooks,
  type Project
} from '@shared/schema';
import { eq, and, sql, inArray, desc } from 'drizzle-orm';

export class SearchRepository extends BaseRepository {
  async searchProjects(userId: string, query: string): Promise<Project[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return await db.select().from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.updatedAt));
    }

    const searchQuery = sql`plainto_tsquery('english', ${trimmedQuery})`;
    return await db.select({
      id: projects.id,
      title: projects.title,
      content: projects.content,
      excerpt: projects.excerpt,
      wordCount: projects.wordCount,
      tags: projects.tags,
      status: projects.status,
      searchVector: projects.searchVector,
      folderId: projects.folderId,
      userId: projects.userId,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      rank: sql<number>`ts_rank(${projects.searchVector}, ${searchQuery})`.as('rank')
    })
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        sql`${projects.searchVector} @@ ${searchQuery}`
      )
    )
    .orderBy(desc(sql`ts_rank(${projects.searchVector}, ${searchQuery})`));
  }

  async searchAllContent(userId: string, query: string): Promise<any[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const results: any[] = [];

    try {
      const projectResults = await this.searchProjects(userId, trimmedQuery);
      projectResults.forEach(item => {
        results.push({
          id: item.id,
          title: item.title,
          type: 'project',
          subtitle: item.status,
          description: item.excerpt || item.content?.substring(0, 100) + '...'
        });
      });

      const savedItemResults = await db.select().from(savedItems)
        .where(and(
          eq(savedItems.userId, userId),
          sql`${savedItems.itemData}::text ILIKE ${'%' + trimmedQuery + '%'}`
        ))
        .limit(50);

      const notebookIds = Array.from(new Set(savedItemResults.map(item => item.notebookId).filter((id): id is string => Boolean(id))));
      const notebooksMap = new Map<string, string>();

      if (notebookIds.length > 0) {
        const notebooksData = await db.select()
          .from(notebooks)
          .where(and(
            eq(notebooks.userId, userId),
            inArray(notebooks.id, notebookIds)
          ));

        notebooksData.forEach(notebook => {
          notebooksMap.set(notebook.id, notebook.name);
        });
      }

      for (const savedItem of savedItemResults) {
        const itemData = savedItem.itemData as any;
        let title = 'Untitled';
        let subtitle = '';
        let description = '';

        if (itemData.name) {
          title = itemData.name;
        } else if (itemData.givenName || itemData.familyName) {
          title = [itemData.givenName, itemData.familyName].filter(Boolean).join(' ') || 'Untitled Character';
        } else if (itemData.title) {
          title = itemData.title;
        }

        subtitle = (savedItem.notebookId ? notebooksMap.get(savedItem.notebookId) : null) || 'Unknown Notebook';

        switch (savedItem.itemType) {
          case 'character':
            description = itemData.occupation || 'Character';
            if (itemData.backstory) {
              description += ' • ' + itemData.backstory.substring(0, 80);
            }
            break;
          case 'location':
            description = itemData.locationType || 'Location';
            if (itemData.description) {
              description += ' • ' + itemData.description.substring(0, 80);
            }
            break;
          case 'weapon':
            description = itemData.weaponType || 'Weapon';
            if (itemData.description) {
              description += ' • ' + itemData.description.substring(0, 80);
            }
            break;
          case 'organization':
            description = itemData.organizationType || 'Organization';
            if (itemData.purpose) {
              description += ' • ' + itemData.purpose.substring(0, 80);
            }
            break;
          case 'species':
            description = itemData.classification || 'Species';
            if (itemData.physicalDescription) {
              description += ' • ' + itemData.physicalDescription.substring(0, 80);
            }
            break;
          default:
            description = savedItem.itemType.charAt(0).toUpperCase() + savedItem.itemType.slice(1);
            if (itemData.description) {
              description += ' • ' + itemData.description.substring(0, 80);
            }
        }

        results.push({
          id: savedItem.itemId,
          title: title,
          type: savedItem.itemType,
          subtitle: subtitle,
          description: description + (description && description.includes('•') ? '...' : ''),
          notebookId: savedItem.notebookId
        });
      }

    } catch (error) {
      console.error('Error in universal search:', error);
    }

    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex((r) => r.id === result.id && r.type === result.type)
    );

    return uniqueResults.slice(0, 20);
  }
}

export const searchRepository = new SearchRepository();
