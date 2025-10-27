import { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import characterRoutes from "./character.routes";
import creatureRoutes from "./creature.routes";
import guideRoutes from "./guide.routes";
import guideCategoryRoutes from "./guideCategory.routes";
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
import timelineEventRoutes from "./timelineEvent.routes";
import timelineRelationshipRoutes from "./timelineRelationship.routes";
import ceremonyRoutes from "./ceremony.routes";
import mapRoutes from "./map.routes";
import musicRoutes from "./music.routes";
import danceRoutes from "./dance.routes";
import lawRoutes from "./law.routes";
import policyRoutes from "./policy.routes";
import potionRoutes from "./potion.routes";
import notebookRoutes from "./notebook.routes";
import plantRoutes from "./plant.routes";
import shareRoutes from "./share.routes";
import conditionRoutes from "./condition.routes";
import adminRoutes from "./admin.routes";
import bannedPhraseRoutes from "./banned-phrase.routes";
import conversationThreadRoutes from "./conversation-thread.routes";
import keyRotationRoutes from "./keyRotation.routes";
import teamRoutes from "./team.routes";
import usageRoutes from "./usage.routes";
import apiKeysRoutes from "./apiKeys.routes";
import canvasRoutes from "./canvas.routes";
import userRoutes from "./user.routes";
import contentRoutes from "./content.routes";
import securityUserRoutes from "../security/userRoutes";
import securityRoutes from "./security.routes";
import mfaRoutes from "./mfa.routes";
import subscriptionRoutes from "./subscription.routes";
import stripeRoutes from "./stripe.routes";
import billingAlertsRoutes from "./billingAlerts.routes";
import { discountCodeRouter } from "./discountCode.routes";
import migrationRoutes from "./migration.routes";
import teamAnalyticsRoutes from "./team-analytics.routes";
import feedbackRoutes from "./feedback.routes";
import adminFeedbackRoutes from "./admin-feedback.routes";
import exportRoutes from "./export.routes";
import aiRoutes from "./ai.routes";
import emailPreviewRoutes from "./email-preview.routes";
import importRoutes from "./import.routes";
import pexelsRoutes from "./pexels.routes";
import ideogramRoutes from "./ideogram.routes";
import stockImagesRoutes from "./stock-images.routes";
import { storage } from "../storage";
import { requireAuth } from "../middleware/requireAuth";
import { csrfProtection } from "../middleware/csrfProtection";
import inboxRoutes from "./inbox.routes";

export function registerDomainRoutes(app: Express) {
  // Apply global authentication middleware to ALL domain routes EXCEPT certain public endpoints
  // This prevents the critical authentication bypass vulnerability while allowing public test endpoints
  app.use("/api/*", (req, res, next) => {
    // Allow Sentry test endpoints to be accessed without authentication
    // These are needed for error tracking setup and testing
    if (req.path.startsWith('/api/sentry/')) {
      return next();
    }

    // Apply authentication to all other /api routes
    isAuthenticated(req, res, next);
  });

  // Register all domain-specific routes (now protected by authentication)

  // Security and authentication routes
  app.use("/api", securityUserRoutes); // Security-hardened user profile endpoints
  app.use("/api/security", securityRoutes); // Admin security management
  app.use("/api/auth/mfa", mfaRoutes); // Multi-factor authentication

  // Subscription and payment routes
  app.use("/api/subscription", subscriptionRoutes);
  app.use("/api/stripe", stripeRoutes);
  app.use("/api/billing-alerts", billingAlertsRoutes);
  app.use("/api/discount-codes", discountCodeRouter);

  // AI and generation routes
  app.use("/api/ai", aiRoutes);

  // Import/Export routes
  app.use("/api/import", importRoutes);
  app.use("/api/export", exportRoutes);

  // Admin and analytics routes
  app.use("/api/migration", migrationRoutes);
  app.use("/api/team-analytics", teamAnalyticsRoutes);
  app.use("/api/admin/feedback", adminFeedbackRoutes); // More specific route first
  app.use("/api/feedback", feedbackRoutes);

  // Media and stock image routes
  app.use("/api/pexels", pexelsRoutes);
  app.use("/api/ideogram", ideogramRoutes);
  app.use("/api/stock-images", stockImagesRoutes);

  // User preferences and general routes
  app.use("/api/user", userRoutes);
  app.use("/api/usage", usageRoutes);
  app.use("/api/conversation-threads", conversationThreadRoutes);
  app.use("/api/characters", characterRoutes);
  app.use("/api/creatures", creatureRoutes);
  app.use("/api/guides", guideRoutes);
  app.use("/api/guide-categories", guideCategoryRoutes);
  app.use("/api/plots", plotRoutes);
  app.use("/api/prompts", promptRoutes);
  app.use("/api/settings", settingRoutes);
  app.use("/api/saved-items", savedItemRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/canvases", canvasRoutes);
  app.use("/api/notebooks", notebookRoutes);
  app.use("/api", shareRoutes);
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
  app.use("/api/timeline-events", timelineEventRoutes);
  app.use("/api/timeline-relationships", timelineRelationshipRoutes);
  app.use("/api/ceremonies", ceremonyRoutes);
  app.use("/api/maps", mapRoutes);
  app.use("/api/music", musicRoutes);
  app.use("/api/dances", danceRoutes);
  app.use("/api/laws", lawRoutes);
  app.use("/api/policies", policyRoutes);
  app.use("/api/potions", potionRoutes);
  app.use("/api/conditions", conditionRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin/email-preview", emailPreviewRoutes);
  app.use("/api/banned-phrases", bannedPhraseRoutes);
  app.use("/api/admin/key-rotations", keyRotationRoutes);
  app.use("/api/team", teamRoutes);
  app.use("/api/api-keys", apiKeysRoutes);
  app.use("/api/content", contentRoutes);
}