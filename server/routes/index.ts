import { Express } from "express";
import characterRoutes from "./character.routes";
import creatureRoutes from "./creature.routes";
import guideRoutes from "./guide.routes";
import plotRoutes from "./plot.routes";
import promptRoutes from "./prompt.routes";
import settingRoutes from "./setting.routes";
import savedItemRoutes from "./saved-item.routes";
import manuscriptRoutes from "./manuscript.routes";
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

export function registerDomainRoutes(app: Express) {
  // Register all domain-specific routes
  app.use("/api/characters", characterRoutes);
  app.use("/api/creatures", creatureRoutes);
  app.use("/api/guides", guideRoutes);
  app.use("/api/plots", plotRoutes);
  app.use("/api/prompts", promptRoutes);
  app.use("/api/settings", settingRoutes);
  app.use("/api/saved-items", savedItemRoutes);
  app.use("/api/manuscripts", manuscriptRoutes);
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
  
  // TODO: Add more routes as we break them out:
  // etc.
}