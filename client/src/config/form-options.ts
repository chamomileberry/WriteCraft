import { Building, Users, Crown, Shield, Coins, Globe, Star, Flag, BookOpen, Handshake, Swords, MapPin, Mountain, Trees, Waves, Sun, AlertTriangle, Scroll } from "lucide-react";

/**
 * Form options and constants for various content type forms
 * Centralized configuration to eliminate duplication across components
 */

// Location Types with Icons
export const LOCATION_TYPES = [
  { value: "city", label: "City", icon: Building },
  { value: "town", label: "Town", icon: Building },
  { value: "village", label: "Village", icon: Building },
  { value: "capital", label: "Capital", icon: Crown },
  { value: "fortress", label: "Fortress", icon: Shield },
  { value: "castle", label: "Castle", icon: Crown },
  { value: "port", label: "Port", icon: Waves },
  { value: "forest", label: "Forest", icon: Trees },
  { value: "mountain", label: "Mountain", icon: Mountain },
  { value: "desert", label: "Desert", icon: Sun },
  { value: "plains", label: "Plains", icon: MapPin },
  { value: "swamp", label: "Swamp", icon: Trees },
  { value: "island", label: "Island", icon: Waves },
  { value: "dungeon", label: "Dungeon", icon: AlertTriangle },
  { value: "temple", label: "Temple", icon: Star },
  { value: "ruins", label: "Ruins", icon: Scroll },
  { value: "tavern", label: "Tavern", icon: Building },
  { value: "market", label: "Market", icon: Coins },
  { value: "other", label: "Other", icon: MapPin }
];

// Climate Types
export const CLIMATE_TYPES = [
  "Tropical", "Subtropical", "Temperate", "Continental", "Polar", "Arid", "Mediterranean", 
  "Oceanic", "Subarctic", "Alpine", "Monsoon", "Magical", "Harsh", "Mild", "Variable"
];

// Organization Types with Icons
export const ORGANIZATION_TYPES = [
  { value: "guild", label: "Guild", icon: Users },
  { value: "faction", label: "Faction", icon: Flag },
  { value: "government", label: "Government", icon: Crown },
  { value: "military", label: "Military", icon: Shield },
  { value: "religious", label: "Religious Order", icon: Star },
  { value: "merchant", label: "Merchant Company", icon: Coins },
  { value: "criminal", label: "Criminal Organization", icon: Swords },
  { value: "academic", label: "Academic Institution", icon: BookOpen },
  { value: "secret", label: "Secret Society", icon: Shield },
  { value: "noble", label: "Noble House", icon: Crown },
  { value: "tribal", label: "Tribal Council", icon: Users },
  { value: "corporate", label: "Corporation", icon: Building },
  { value: "cult", label: "Cult", icon: Star },
  { value: "rebellion", label: "Rebellion", icon: Swords },
  { value: "alliance", label: "Alliance", icon: Handshake },
  { value: "order", label: "Knightly Order", icon: Shield },
  { value: "syndicate", label: "Syndicate", icon: Coins },
  { value: "other", label: "Other", icon: Building }
];

// Influence Levels
export const INFLUENCE_LEVELS = [
  "Local", "Regional", "National", "International", "Continental", "Global",
  "Minor", "Moderate", "Major", "Dominant", "Legendary", "Mythical"
];

// Genre Options (shared across forms)
export const FORM_GENRE_OPTIONS = [
  "Fantasy", "Sci-Fi", "Historical", "Modern", "Post-Apocalyptic", "Steampunk", 
  "Cyberpunk", "Medieval", "Victorian", "Ancient", "Futuristic", "Mythological", 
  "Political"
];