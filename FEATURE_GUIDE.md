# WriteCraft Feature Guide

## Overview

This guide provides a comprehensive overview of WriteCraft's features, their capabilities, and how they work together to support your creative writing workflow.

## Core Feature Categories

### 1. Content Organization

#### Notebooks

**Purpose:** Container system for organizing worldbuilding content by story universe.

**Key Capabilities:**

- Create unlimited notebooks for different projects/universes
- All worldbuilding content (characters, locations, etc.) scoped to notebooks
- Switch between notebooks to work on different story worlds
- Share notebooks across multiple writing projects

**When to Use:**

- Starting a new story/series with unique worldbuilding
- Separating content for different genres or universes
- Organizing shared universes (e.g., multiple books in same world)

**Works With:** All worldbuilding content types, Projects (for linking)

---

#### Projects

**Purpose:** Hierarchical document system for writing manuscripts.

**Key Capabilities:**

- Unlimited folder nesting for organization (Acts, Chapters, Scenes)
- Rich text editor with formatting, images, links
- Auto-save (every few seconds)
- Word count tracking (live, per-section and total)
- Export to Markdown/PDF
- Link to worldbuilding content from notebooks

**When to Use:**

- Writing novels, short stories, scripts
- Organizing long-form content with complex structure
- Managing multi-chapter works
- Separating different drafts or versions

**Works With:** Notebooks (for content references), AI Writing Assistant, Quick Notes

---

### 2. Worldbuilding System

#### Content Types (40+ Categories)

**Purpose:** Structured database for story world elements.

**Available Types:**

- **People:** Characters, Creatures, Species, Organizations, Professions
- **Places:** Locations, Buildings, Settlements, Maps
- **Objects:** Items, Weapons, Armor, Clothing, Materials, Transportation
- **Culture:** Languages, Religions, Traditions, Ceremonies, Music, Dance, Food, Drinks
- **Society:** Factions, Military Units, Laws, Policies, Governments
- **Magic/Tech:** Spells, Technology, Potions, Natural Laws
- **History:** Events, Timelines, Myths, Legends, Family Trees
- **Nature:** Plants, Animals, Resources

**Key Capabilities:**

- Customizable form fields for each type
- Image uploads (character portraits, location maps, etc.)
- Tagging and categorization
- Genre-specific organization
- Search and filter
- Save generated content from AI generators

**When to Use:**

- Building consistent, detailed story worlds
- Tracking character relationships and backstories
- Maintaining continuity across long series
- Reference while writing

**Works With:** Notebooks (scoping), Generators (creation), Projects (linking/mention)

---

### 3. AI-Powered Tools

#### Content Generators

**Purpose:** AI-assisted creation of worldbuilding elements.

**Available Generators:**

- Characters (personality, backstory, appearance)
- Locations (descriptions, atmosphere)
- Plots (structure, conflicts, themes)
- Settings (world details)
- Names (character, place, object names)
- Creatures (biology, behavior)
- Plants (ecology, uses)
- Descriptions (vivid scene/object descriptions)
- Conflicts (story tension points)
- Themes (philosophical elements)
- Moods (atmosphere palettes)

**Key Capabilities:**

- Genre-aware generation
- Customizable parameters and prompts
- Save directly to notebooks
- Regenerate with variations
- Export/copy generated content

**When to Use:**

- Brainstorming new story elements
- Overcoming writer's block
- Generating inspiration and variations
- Quick worldbuilding for side characters/locations

**Works With:** Notebooks (saving), Content Types (structured storage)

---

#### AI Inline Editing (Grammarly-style)

**Purpose:** In-editor text improvement suggestions.

**Key Capabilities:**

- Select text to see AI menu
- Actions: Improve, Shorten, Expand, Fix Grammar
- Context-aware suggestions
- Real-time processing
- Undo/redo friendly

**When to Use:**

- Revising draft text
- Improving clarity and flow
- Fixing grammatical issues
- Varying sentence structure

**Works With:** Projects (manuscript editing), Notes

---

#### Writing Assistant Panel

**Purpose:** Conversational AI coach for writing feedback.

**Key Modes:**

- **Chat:** Ask questions, brainstorm ideas
- **Analyze:** Get feedback on selected text
- **Proofread:** Detailed grammar and style review
- **Questions:** Generate discussion questions about your text

**Key Capabilities:**

- Context-aware (knows current project/section)
- Maintains conversation history
- Can analyze specific text selections
- Provides actionable feedback
- Genre-specific advice

**When to Use:**

- Getting feedback on scenes/chapters
- Analyzing character dialogue authenticity
- Checking pacing and tension
- Improving descriptive passages
- Planning story structure

**Works With:** Projects, Guides, any editor with text selection

---

### 4. Educational Resources

#### Writing Guides

**Purpose:** Expert advice and comprehensive tutorials.

**Key Capabilities:**

- Categorized by topic (Plot, Character, Dialogue, etc.)
- Difficulty levels (Beginner, Intermediate, Advanced)
- Searchable library
- Read time estimates
- Rich content with examples
- Create custom guides

**When to Use:**

- Learning new writing techniques
- Refreshing on story structure principles
- Finding best practices for specific challenges
- Teaching/mentoring other writers

**Works With:** Writing Assistant (can reference guides in chat)

---

#### Writing Prompts

**Purpose:** Creative inspiration and practice exercises.

**Key Capabilities:**

- Genre-specific prompts
- Story starters
- Character scenarios
- Worldbuilding challenges

**When to Use:**

- Warm-up exercises
- Breaking through creative blocks
- Practice sessions
- Finding new story ideas

**Works With:** Projects (start new sections), Generators (expand prompts)

---

### 5. Workspace Tools

#### Quick Notes

**Purpose:** Capture ephemeral ideas without context switching.

**Key Capabilities:**

- Always accessible from any page
- Auto-saves as you type
- Persistent across sessions
- No organization required (single scratchpad)

**When to Use:**

- Capturing quick ideas while writing
- Temporary research notes
- Brainstorming without commitment
- Copy-paste staging area

**Works With:** Standalone (intentionally isolated)

---

#### Notes System

**Purpose:** Structured notes attached to specific documents.

**Key Capabilities:**

- Create notes for projects, guides, or standalone
- Organization and search
- Markdown support
- Attachments and links

**When to Use:**

- Research notes for specific chapters
- Plot planning for projects
- Commentary on guides
- Long-term idea storage

**Works With:** Projects (attached notes), Guides

---

#### Character Editor Sidebar

**Purpose:** Enhanced character development interface.

**Key Capabilities:**

- Responsive sidebar navigation
- Section-by-section editing
- Quick access to all character fields
- Visual organization

**When to Use:**

- Deep character development
- Complex character with many attributes
- Building character sheets
- Tracking character arcs

**Works With:** Character content type, Notebooks

---

### 6. Collaboration & Sharing

#### Real-Time Collaboration (Team Subscribers)

**Purpose:** Work together with your team on projects simultaneously.

**Key Capabilities:**

- Real-time synchronization using CRDT technology (Yjs)
- See who's actively editing in real-time
- Automatic conflict resolution
- Connection status indicators
- Awareness system showing active collaborators
- WebSocket-based for instant updates

**Available For:**

- **Projects:** Multiple team members can edit the same document simultaneously
- **Team Tier Only:** Requires Team subscription (up to 5 members)

**How It Works:**

- When you open a project, the system automatically connects via WebSocket
- Changes are synced instantly across all connected users
- You can see avatars/names of active collaborators
- All edits are merged seamlessly without manual conflict resolution
- Collaboration state persists even if connection temporarily drops

**When to Use:**

- Co-writing with a partner or team
- Real-time brainstorming sessions
- Pair writing and immediate feedback
- Team editing and revision sessions
- Collaborative worldbuilding with team members

**Works With:** Projects (Team tier)

**Technical Details:**

- Uses Yjs CRDT for conflict-free document merging
- Supports offline editing with sync on reconnect
- Maintains document consistency across all clients
- 30-minute document cleanup after last user disconnects

---

#### Content Sharing

**Purpose:** Share notebooks, projects, and guides with specific users.

**Key Capabilities:**

- Share resources with other WriteCraft users
- Granular permission control (View, Comment, Edit)
- Share notebooks, projects, or writing guides
- Owner retains full control
- Email-based user identification
- Revoke access anytime

**Permission Levels:**

- **View:** Read-only access to content
- **Comment:** Can view and add comments/feedback
- **Edit:** Full editing capabilities (except ownership transfer)

**When to Use:**

- Sharing worldbuilding resources with co-authors
- Giving beta readers access to manuscripts
- Collaborating with editors
- Sharing writing guides with writing groups
- Providing reference material to team members

**Works With:** Notebooks, Projects, Guides, Team Features

**Workflow:**

1. Navigate to resource (notebook/project/guide)
2. Click "Share" button
3. Enter collaborator's email
4. Select permission level
5. Send invitation
6. Collaborator receives access

---

#### Team Management (Team Tier)

**Purpose:** Organize and manage team members for collaborative projects.

**Key Capabilities:**

- Add up to 5 team members (Team tier)
- Role-based access control
- Team member invitations via email
- Permission management per member:
  - Can Edit: Full editing rights
  - Can Comment: Feedback and annotation
  - Can Invite: Add new team members
- Team activity tracking
- Member analytics and usage insights
- View active team members in real-time

**When to Use:**

- Managing a writing team or group
- Collaborative book projects
- Writing room environments
- Co-author partnerships
- Editorial teams

**Works With:** Real-Time Collaboration, Sharing, Projects

**Team Workflow:**

1. Subscribe to Team tier
2. Invite team members via email
3. Set individual permissions
4. Share projects with team
5. Collaborate in real-time
6. Track team activity and contributions

---

## Subscription Tiers

WriteCraft offers four subscription tiers, each designed for different writing needs:

### Free Tier

**Best for:** Writers exploring the platform or working on single projects

**Includes:**

- 3 projects
- 1 notebook per project
- 20 AI generations per day
- Basic search
- TXT and DOCX export
- 7 days version history
- Help docs + AI chat support

---

### Author Tier

**Best for:** Individual authors working on multiple projects

**Includes:**

- Unlimited projects
- 10 notebooks per project
- 100 AI generations per day
- Advanced search
- TXT, DOCX, PDF, HTML export
- 30 days version history
- 5 custom templates
- List + Canvas timeline views
- Advanced AI writing suggestions

---

### Professional Tier

**Best for:** Professional writers needing unlimited AI and advanced features

**Includes:**

- Everything in Author tier
- Unlimited notebooks per project
- Unlimited AI generations
- Custom AI prompts
- Full API access
- Priority support
- 1 year version history
- Unlimited custom templates
- All timeline views (List, Canvas, Gantt)
- Saved searches

---

### Team Tier

**Best for:** Collaborative writing teams and co-author partnerships

**Includes:**

- Everything in Professional tier
- Up to 5 team members
- Real-time collaboration on projects
- Team management dashboard
- Team analytics and usage insights
- Shared AI generation pool
- Team template sharing
- Team search capabilities
- Unlimited version history
- API access for all members

---

## Feature Comparison

### When to Use What for Writing

| Task                    | Recommended Feature                       | Alternative                          |
| ----------------------- | ----------------------------------------- | ------------------------------------ |
| Write a novel           | Projects                                  | -                                    |
| Plan story structure    | Project Outline                           | Writing Guides                       |
| Create characters       | Content Generators → Save to Notebook     | Manual Content Forms                 |
| Track worldbuilding     | Notebooks + Content Types                 | Notes                                |
| Get writing feedback    | Writing Assistant (Analyze/Proofread)     | Writing Guides                       |
| Improve a paragraph     | AI Inline Editing                         | Writing Assistant                    |
| Capture quick ideas     | Quick Notes                               | Notes                                |
| Research for chapter    | Notes (attached to project)               | Quick Notes                          |
| Learn techniques        | Writing Guides                            | Writing Assistant (ask questions)    |
| Overcome writer's block | Writing Prompts + Generators              | Writing Assistant (brainstorm)       |
| Co-write with team      | Real-Time Collaboration (Team tier)       | Content Sharing with Edit permission |
| Share with beta readers | Content Sharing (View/Comment permission) | Export and email                     |
| Collaborate with editor | Content Sharing (Edit permission)         | Export/import workflow               |
| Manage writing team     | Team Management (Team tier)               | Manual coordination                  |

---

## Workflow Examples

### Workflow 1: Starting a New Novel

1. **Create Notebook** for story universe
2. **Use Generators** to create main characters, locations, factions
3. **Save content** to notebook with appropriate tags
4. **Create Project** for manuscript
5. **Build outline** using Project Outline (Acts → Chapters → Scenes)
6. **Write sections** using rich text editor
7. **Link worldbuilding** content using @ mentions
8. **Get feedback** from Writing Assistant as you draft

---

### Workflow 2: Developing Complex Characters

1. **Generate character** with AI Character Generator
2. **Save to Notebook** for persistence
3. **Open in Character Editor** for detailed development
4. **Add personality traits**, backstory, relationships
5. **Upload character portrait** via image field
6. **Reference in Project** using @ mention while writing
7. **Consult Character Detail Panel** while drafting dialogue

---

### Workflow 3: Revising a Draft

1. **Open Project** section in editor
2. **Read through** and identify rough areas
3. **Select problematic text** → use **AI Inline Editing** for quick fixes
4. **Open Writing Assistant** for deeper analysis
5. **Use Proofread mode** for grammar/style review
6. **Use Analyze mode** for pacing/tension feedback
7. **Implement suggestions** and iterate

---

### Workflow 4: Team Collaboration on a Novel (Team Tier)

1. **Subscribe to Team tier** and set up team
2. **Invite team members** via email (up to 5 members)
3. **Create shared notebook** for worldbuilding
4. **Share notebook** with team (Edit permission)
5. **Generate characters/locations** collaboratively using AI
6. **Create project** for manuscript
7. **Share project** with team for real-time editing
8. **Open project** - team members see each other online
9. **Co-write scenes** simultaneously in different chapters
10. **Use Writing Assistant** for team-wide feedback
11. **Track team activity** in analytics dashboard
12. **Monitor contributions** and editing patterns

**Team Benefits:**

- Multiple writers can draft different chapters simultaneously
- Immediate feedback and iteration
- Shared worldbuilding resources
- Consistent voice through AI suggestions
- Real-time conflict resolution
- Transparent collaboration with activity tracking

---

### Workflow 5: Sharing with Beta Readers

1. **Complete draft** in Project
2. **Click Share button** on project
3. **Enter beta reader emails** (one at a time or multiple)
4. **Set permission to "Comment"** (read + feedback only)
5. **Beta readers receive notification** and access
6. **Readers add comments** on specific sections
7. **Review feedback** in project
8. **Make revisions** based on comments
9. **Use Writing Assistant** to implement suggestions
10. **Revoke access** when beta period ends (optional)

**Sharing Benefits:**

- No need to export/email documents
- Real-time comment notifications
- Maintain version control
- Track who provided which feedback
- Keep work secure and controlled
- Easy access management

---

### Workflow 6: Editor Collaboration Workflow

1. **Share project** with editor (Edit permission)
2. **Editor opens project** and sees real-time changes
3. **Editor makes inline edits** while you write other sections
4. **Both use Writing Assistant** for style consistency
5. **Use @ mentions** to reference worldbuilding for fact-checking
6. **Editor uses AI Inline Editing** for suggestions
7. **Review changes together** in real-time session
8. **Export final version** in required format (PDF/DOCX)

**Editor Benefits:**

- No version conflict issues
- Instant synchronization of changes
- Can work simultaneously on different sections
- Shared access to worldbuilding resources
- Professional export formats included

---

## Feature Relationships

### Content Flow

```
Generators → Notebooks (storage) → Projects (reference while writing)
     ↓                                  ↓
Content Types (structured data)   Real-Time Collaboration
                                       ↓
                              Team Members (Team tier)
```

### Writing Flow

```
Writing Prompts → Projects (drafting) → AI Editing → Writing Assistant (feedback)
                      ↓                      ↓
                 Quick Notes (ideas)    Content Sharing
                      ↓                      ↓
                 Notes (research)      Beta Readers/Editors
```

### Learning Flow

```
Writing Guides → Writing Assistant (questions) → Projects (apply techniques)
                                                      ↓
                                              Share with Team
```

### Collaboration Flow

```
Team Management → Invite Members → Share Resources → Real-Time Collaboration
                       ↓                                    ↓
                Set Permissions                    Track Activity
                       ↓                                    ↓
                Content Sharing                      Team Analytics
```

### Complete Creative Workflow

This diagram shows how all features work together in a typical creative process:

```
PLANNING PHASE
├─ Writing Prompts (inspiration)
├─ Notebooks (worldbuilding container)
└─ Generators (AI-powered content creation)
    └─ Save to Content Types (characters, locations, etc.)

WRITING PHASE
├─ Projects (manuscript structure)
├─ @ Mentions (reference worldbuilding)
├─ Quick Notes (capture ideas)
└─ Real-Time Collaboration (Team tier)
    └─ Multiple writers working simultaneously

EDITING PHASE
├─ AI Inline Editing (quick fixes)
├─ Writing Assistant (deep feedback)
├─ Content Sharing (editor/beta reader access)
└─ Team Review (collaborative editing)

REFINEMENT PHASE
├─ Notes (organize feedback)
├─ Writing Guides (reference techniques)
└─ Export (final manuscript delivery)
```

---

## Advanced Features

### Content Linking

Use `@` mentions in any editor to link to:

- Notebook content (characters, locations, etc.)
- Other project sections
- Notes

**Benefits:**

- Maintain consistency
- Quick navigation
- Contextual reference

---

### Multi-Notebook Workflow

Separate notebooks for:

- **Main Story Universe:** Primary worldbuilding
- **Research/References:** Real-world inspiration
- **Deleted Scenes:** Cut content for potential reuse
- **Series Shared Universe:** Content across multiple books

---

### Export & Backup

- **Projects:** Export to Markdown, PDF
- **Content Types:** Export individual items
- **Regular backups:** Recommended practice

---

## Tips for Maximum Productivity

### Solo Writing Tips

1. **Use Notebooks liberally** - Don't cram everything into one
2. **Start with structure** - Build project outline before drafting
3. **Generate first, refine later** - Use AI for initial content, customize after
4. **Keep Quick Notes open** - Capture ideas without breaking flow
5. **Reference worldbuilding** - Use @ mentions to maintain consistency
6. **Get feedback early** - Use Writing Assistant while drafting, not just revising
7. **Learn continuously** - Read guides, apply techniques, iterate

### Team Collaboration Tips

1. **Define roles early** - Establish who writes what sections/chapters
2. **Use shared notebooks** - Keep worldbuilding consistent across team
3. **Leverage real-time editing** - Work on different chapters simultaneously
4. **Set permission levels thoughtfully** - Not everyone needs edit access
5. **Monitor team activity** - Use analytics to track contributions
6. **Establish style guide** - Use Writing Assistant to maintain consistent voice
7. **Schedule collaboration sessions** - Real-time editing works best with communication
8. **Share templates** - Create and share custom templates for consistency

### Sharing & Feedback Tips

1. **Use Comment permission for beta readers** - Prevents accidental edits
2. **Share sections, not full manuscripts** - Give focused feedback requests
3. **Set clear deadlines** - Communicate when you need feedback by
4. **Use Writing Assistant with feedback** - Implement suggestions efficiently
5. **Revoke access appropriately** - Clean up shares after project completion
6. **Export final versions** - Provide polished formats to stakeholders

---

## Feature Limitations & Boundaries

### What WriteCraft Does

✓ Real-time collaboration (Team tier)
✓ Content sharing with permission control
✓ Team management (up to 5 members)
✓ AI-powered writing assistance
✓ Comprehensive worldbuilding tools
✓ Rich text editing with auto-save
✓ Multiple export formats (PDF, DOCX, HTML, TXT)
✓ API access (Professional/Team tiers)

### What WriteCraft Does NOT Do

- **Git-style version control** - No branching/merging (but has version history)
- **Publishing platform integration** - No direct export to Amazon, etc.
- **Plagiarism checking** - Use external tools
- **Advanced formatting** - Limited to rich text basics (no complex page layouts)
- **Community/social features** - No public sharing or critique groups
- **Offline mode** - Requires internet connection (though edits sync when reconnected)
- **Unlimited team size** - Maximum 5 members on Team tier
- **Real-time collaboration on notebooks** - Only available for projects
- **Video/voice integration** - Text-based collaboration only
- **Automated backups** - Manual export recommended for backups

---

## Getting Help

- **USER_GUIDE.md** - Step-by-step how-to instructions
- **API.md** - Technical API reference
- **TERMINOLOGY.md** - Understanding legacy references
- **DEVELOPMENT.md** - Contributing/development setup

---

---

## Summary: How Features Work Together

WriteCraft is designed with interconnected features that support your entire creative process:

1. **Worldbuilding Foundation**: Use Notebooks and Content Types to build your story universe
2. **AI Acceleration**: Leverage Generators to quickly create initial content
3. **Structured Writing**: Organize manuscripts in Projects with hierarchical sections
4. **Smart References**: Link worldbuilding to writing with @ mentions for consistency
5. **Real-Time Feedback**: Get instant AI suggestions via Inline Editing and Writing Assistant
6. **Team Collaboration**: Work simultaneously with team members (Team tier)
7. **Controlled Sharing**: Share with editors and beta readers with granular permissions
8. **Continuous Learning**: Apply techniques from Writing Guides throughout the process
9. **Flexible Output**: Export in multiple formats for different purposes
10. **Activity Tracking**: Monitor team contributions and usage (Team tier)

The key to maximizing WriteCraft is understanding that these features aren't isolated tools—they're designed to work together seamlessly throughout your creative journey, from initial idea through final manuscript.

---

Last updated: 2025-10-29
