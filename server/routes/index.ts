import { Express } from "express";
import characterRoutes from "./character.routes";
import creatureRoutes from "./creature.routes";
import guideRoutes from "./guide.routes";
import plotRoutes from "./plot.routes";
import promptRoutes from "./prompt.routes";
import settingRoutes from "./setting.routes";
import savedItemRoutes from "./saved-item.routes";
import projectRoutes from "./project.routes";
import nameRoutes from "./name.routes";
import conflictRoutes from "./conflict.routes";
import themeRoutes from "./theme.routes";
import moodRoutes from "./mood.routes";
import locationRoutes from "./location.routes";
import itemRoutes from "./item.routes";
import organizationRoutes from "./organization.routes";
import speciesRoutes from "./species.routes";
import cultureRoutes from "./culture.routes";
import documentRoutes from "./document.routes";
import folderRoutes from "./folder.routes";
import noteRoutes from "./note.routes";
import foodRoutes from "./food.routes";
import weaponRoutes from "./weapon.routes";
import religionRoutes from "./religion.routes";
import languageRoutes from "./language.routes";
import technologyRoutes from "./technology.routes";
import professionRoutes from "./profession.routes";
import descriptionRoutes from "./description.routes";
import ethnicityRoutes from "./ethnicity.routes";
import drinkRoutes from "./drink.routes";
import armorRoutes from "./armor.routes";
import accessoryRoutes from "./accessory.routes";
import clothingRoutes from "./clothing.routes";
import materialRoutes from "./material.routes";
import settlementRoutes from "./settlement.routes";
import societyRoutes from "./society.routes";
import factionRoutes from "./faction.routes";
import militaryUnitRoutes from "./military-unit.routes";
import mythRoutes from "./myth.routes";
import legendRoutes from "./legend.routes";
import eventRoutes from "./event.routes";
import spellRoutes from "./spell.routes";
import resourceRoutes from "./resource.routes";
import buildingRoutes from "./building.routes";
import animalRoutes from "./animal.routes";
import transportationRoutes from "./transportation.routes";
import naturalLawRoutes from "./natural-law.routes";
import traditionRoutes from "./tradition.routes";
import ritualRoutes from "./ritual.routes";
import familyTreeRoutes from "./family-tree.routes";
import timelineRoutes from "./timeline.routes";
import ceremonyRoutes from "./ceremony.routes";
import mapRoutes from "./map.routes";
import musicRoutes from "./music.routes";
import danceRoutes from "./dance.routes";
import lawRoutes from "./law.routes";
import policyRoutes from "./policy.routes";
import potionRoutes from "./potion.routes";
import notebookRoutes from "./notebook.routes";
import { storage } from "../storage/storage"; // Assuming storage is imported from here

export function registerDomainRoutes(app: Express) {
  // Register all domain-specific routes
  app.use("/api/characters", characterRoutes);
  app.use("/api/creatures", creatureRoutes);
  app.use("/api/guides", guideRoutes);
  app.use("/api/plots", plotRoutes);
  app.use("/api/prompts", promptRoutes);
  app.use("/api/settings", settingRoutes);
  app.use("/api/saved-items", savedItemRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/notebooks", notebookRoutes);
  app.use("/api/names", nameRoutes);
  app.use("/api/conflicts", conflictRoutes);
  app.use("/api/themes", themeRoutes);
  app.use("/api/moods", moodRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/items", itemRoutes);
  app.use("/api/organizations", organizationRoutes);
  app.use("/api/species", speciesRoutes);
  app.use("/api/cultures", cultureRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/folders", folderRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/foods", foodRoutes);
  app.use("/api/weapons", weaponRoutes);
  app.use("/api/religions", religionRoutes);
  app.use("/api/languages", languageRoutes);
  app.use("/api/technologies", technologyRoutes);
  app.use("/api/professions", professionRoutes);
  app.use("/api/plants", plantRoutes);
  app.use("/api/descriptions", descriptionRoutes);
  app.use("/api/ethnicities", ethnicityRoutes);
  app.use("/api/drinks", drinkRoutes);
  app.use("/api/armor", armorRoutes);
  app.use("/api/accessories", accessoryRoutes);
  app.use("/api/clothing", clothingRoutes);
  app.use("/api/materials", materialRoutes);
  app.use("/api/settlements", settlementRoutes);
  app.use("/api/societies", societyRoutes);
  app.use("/api/factions", factionRoutes);
  app.use("/api/military-units", militaryUnitRoutes);
  app.use("/api/myths", mythRoutes);
  app.use("/api/legends", legendRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/spells", spellRoutes);
  app.use("/api/resources", resourceRoutes);
  app.use("/api/buildings", buildingRoutes);
  app.use("/api/animals", animalRoutes);
  app.use("/api/transportation", transportationRoutes);
  app.use("/api/natural-laws", naturalLawRoutes);
  app.use("/api/traditions", traditionRoutes);
  app.use("/api/rituals", ritualRoutes);
  app.use("/api/family-trees", familyTreeRoutes);
  app.use("/api/timelines", timelineRoutes);
  app.use("/api/ceremonies", ceremonyRoutes);
  app.use("/api/maps", mapRoutes);
  app.use("/api/music", musicRoutes);
  app.use("/api/dances", danceRoutes);
  app.use("/api/laws", lawRoutes);
  app.use("/api/policies", policyRoutes);
  app.use("/api/potions", potionRoutes);
  // Plant generation route (separate from CRUD operations)
  app.post('/api/plants/generate', async (req, res) => {
    try {
      const { genre, type } = req.body;
      const userId = req.headers['x-user-id'] as string || 'demo-user';

      const { generatePlantWithAI } = await import('../ai-generation');
      const plantData = await generatePlantWithAI({ genre, type });

      // Save the generated plant
      const savedPlant = await storage.createPlant({
        ...plantData,
        userId,
        notebookId: req.body.notebookId || null
      });

      res.json(savedPlant);
    } catch (error) {
      console.error('Error generating plant:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: `Failed to generate plant: ${errorMessage}` });
    }
  });
}