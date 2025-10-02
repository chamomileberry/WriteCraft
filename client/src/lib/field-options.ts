/**
 * Centralized type options for all content type select fields
 * 
 * This file contains all dropdown/select options used across content types.
 * Centralizing them here makes them easy to maintain and update.
 * 
 * Usage:
 * import { WEAPON_TYPES, ARMOR_TYPES } from '@/lib/field-options';
 */

// ============================================================================
// ITEMS & OBJECTS
// ============================================================================

export const WEAPON_TYPES = [
  "Air Gun", "Axe", "Bazooka", "Biological Weapon", "Blow Gun", "Blunderbuss", "Bomb", "Bow", 
  "Brass Knuckles", "Cannon", "Chemical Weapon", "Club", "Crossbow", "Dagger", "Derringer", "Gas", 
  "Grenade", "Hammer", "Katana", "Knife", "Lance", "Mace", "Machine Gun", "Missile", "Musket", 
  "Nuclear Weapon", "Nunchaku", "Pike", "Pistol", "Polearm", "Revolver", "Rifle", "Rocket", "Sabre",
  "Scimitar", "Shotgun", "Shuriken", "Slingshot", "Spear", "Staff", "Sword", "Tomahawk", "Torpedo", 
  "Wand", "Whip", "Quarter Staff", "Other"
];

export const ARMOR_TYPES = [
  "Light", "Medium", "Heavy", "Shield", "Helmet", "Gauntlets", 
  "Boots", "Cloak", "Magical", "Plate Armour", "Chainmail", 
  "Leather", "Cloth", "Scale", "Studded", "Ringmail", "Padded", "Hide", "Spiked", "Banded",
  "Lamellar", "Segmented", "Splinted", "Laminar", "Plated", "Studded Leather", "Brigandine", "Kevlar",
  "Soft Body Armour", "Hard Body Armour", "Powered Armour", "Exoskeleton", "Force Field", "Other"
];

export const ITEM_TYPES = [
  "Weapon", "Armour", "Tool", "Magic Item", "Artifact", "Consumable", 
  "Trade Good", "Art Object", "Document", "Other"
];

export const ACCESSORY_TYPES = [
  "Jewelry", "Belt", "Cloak", "Hat", "Gloves", "Bag", "Amulet", 
  "Ring", "Necklace", "Bracelet", "Earrings", "Anklet", "Toe Ring", "Watch", "Purse", "Handbag", 
  "Wallet", "Brooch", "Scarf", "Shoes", "Headband", "Hair clip", "Crown", "Headwrap", "Tiara", 
  "Sceptre", "Socks", "Glasses", "Monacle", "Telescope", "Binoculars", "Spyglass", "Magnifying Glass", 
  "Tie", "Bowtie", "Map", "Cantine", "Flask", "Pendant", "Pouch", "Coin Purse", 
  "Cufflinks", "Sunglasses", "Cane", "Staff", "Walking Stick", "Backpack", "Rucksack", "Satchel", 
  "Clutch", "Totebag", "Brief Case", "Fanny Pack", "Duffle Bag", "Messenger Bag", "Doctor's Bag", 
  "Drawstring Bag", "Bowling Bag", "Saddle Purse", "Bandana", "Gym Bag", "Shawl", "Keffiyah",
  "Beret", "Sombrero", "Fedora", "Baseball Cap", "Beanie", "Bucket Hat", "Toque", "Panama Hat", "Kasa",
  "Cowboy Hat", "Top Hat", "Helmet", "Hardee Hat", "Boater Hat", "Hijab", "Turban", "Handkerchief", 
  "Fez", "Taqiyah", "Bonnet", "Kepi", "Niqab", "Thawb", "Veil", "Tudong", "Songkok", "Girdle", "Hood", 
  "Coif", "Cap", "Sash", "Slouch Hat", "Tricorne", "Other"
];

export const CLOTHING_TYPES = [
  "Shirt", "Pants", "Dress", "Robe", "Cloak", "Hat", "Shoes", "Blouse", "Sportswear", "Swimsuit",
  "Jacket", "Coat", "Sweater", "Suit", "Tuxedo", "T-Shirt", "Polo Shirt", "Pajamas", "Underwear"
  "Stockings", "Hoisery", "Tights", "Corset",  "Hoodie", "Sweatshirt", "Sweater", "Uniform", 
  "Ceremonial", "Jeans", "Crop Top", "Cardigan", "Caftan", "Bell-Bottoms", "Blazer", "Bloomers", 
  "Bathrobe", "Toga", "Kilt", "Kimono", "Sari", "Dashiki", "Dirndl", "Lederhosen", "Cheongsam", "Huipil", 
  "Kebaya", "Poncho", "Hanbok", "Kanzu","Tunic", "Leggings", "Abaya", "Gown", "Jilbāb", "Trousers", 
  "Samping", "Wedding Dress", "Dress Shirt", "Baju Melayu", "Kurta", "Sarong", "Smock", "Hose", 
  "Breeches", "Surcoat", "Doublet", "Yarmulke/Kippah", "Shtreimel", "Spodik", "Trapper Hat", "Overshirt",
  "Undershirt", "Tank Top", "Flannel Shirt", "Henley Shirt", "Night Gown", "Prince's Vest", "Wrap Bust", 
  "Chambray Shirt", "Button-Down Shirt","Turtleneck", "Ruffled Shirt", "Jabot", "Sailot", "Cossack", 
  "Gypsy Shirt", "Jumper", "Military Shirt", "Fitted Wrap Shirt", "Belted Shirt", "Peplum Shirt", 
  "Peasant Shirt", "Long-Sleeve Shirt", "Oxford Shirt", "Tube Top", "V-Neck Shirt", "Sleeveless Shirt", 
  "Cargo Pants", "Chino Pants", "Sweatpants", "Dress Pants", "Joggers", "Sirwal", "Capris", "Culottes", 
  "Pleated Pants", "Corduroy Pants", "Jumpsuit", "Pant Suit", "Romper", "Leather Pants", "Palazzo Pants", 
  "Piping Pants", "Tapered Pants", "Bootcut Pants", "Overalls", "Bodysuit", "Sheath Dress", 
  "Blusson Dress", "Tunic Dress", "Pencil Dress", "Skirt", "Pencil Skirt", "A-Line Skirt", "Coveralls", 
  "Boilersuit", "Other"
];

export const MATERIAL_TYPES = [
  "Metal", "Wood", "Fabric", "Stone", "Crystal", "Organic", "Leather", "Silk", "Wool", "Cotton", "Linen",
  "Denim", "Velvet", "Fur", "Feather", "Bone", "Ivory", "Pearl", "Shell", "Glass", "Ceramic", "Plastic",
  "Rubber", "Glass", "Mithril", "Adamantine", "Ebony", "Oak", "Maple", "Balsa", "Bamboo", "Cedar", 
  "Cypress", "Eucalyptus", "Fir", "Hemlock", "Juniper", "Mahogany", "Pine", "Redwood", "Spruce", 
  "Papyrus", "Parchment", "Paper", "Chambray", "Chiffon", "Chintz", "Corduroy", "Crepe", "Damask", 
  "Flannel", "Hemp", "Gauze", "Lace", "Muslin", "Satin", "Tulle", "Amethyst", "Citrine", "Emerald", 
  "Jasper", "Onyx", "Opal", "Pearl", "Quartz", "Ruby", "Sapphire", "Topaz", "Turquoise", "Zircon", 
  "Brass", "Copper", "Gold", "Silver", "Bronze", "Iron", "Steel", "Titanium", "Tungsten", "Zinc", 
  "Aluminum", "Beryllium", "Chromium", "Cobalt", "Magnesium", "Manganese", "Nickel", "Platinum",
  "Synthetic", "Magical", "Composite", "Diamond", "Coal", "Clay", "Silicone", "Obsidian,", "Brick", 
  "Lithium", "Alloy", "Nanomaterials", "Carbon", "Carbon Fibre", "Rubber", "Cardboard", "Textile", 
  "Linoleum", "Tile", "Granite", "Polymer", "Marble", "Laminate", "Quartzite", "Soapstone", "Adobe", 
  "Concrete", "Ashphalt", "Plywood", "Porcelain", "Vinyl", "Acrylic", "Slate", "Enamel", "Other"
];

export const RESOURCE_TYPES = [
  "Natural", "Manufactured", "Magical", "Energy", "Mineral", "Air", "Water", "Soil", "Solar", "Human", 
  "Nuclear", "Chemical", "Biological", "Biochemical", "Coal", "Natural Gas", "Petrolium", "Oil",
  "Organic", "Rare Earth", "Fuel", "Precious", "Infrastructure", "Tools", "Geothermal", "Biomass", 
  "Hydropower", "Uranium", "Metal Ores", "Gasoline", "Diesel", "Propane", "Gold Ore", "Copper Ore", 
  "Diamond Ore", "Tin Ore", "Dark Soils", "Machinery", "Materials", "Other"
];

export const TRANSPORTATION_TYPES = [
  "Land", "Sea", "Air", "Magical", "Underground", "Dimensional", 
  "Hybrid", "Train", "Bus", "Ship", "Boat", "Sailboat", "Paddle Boat", "Cruiseship", "Submarine", 
  "Rocketship", "Spaceship", "Car", "SUV", "Truck", "Ferry", "Rickshaw", "Bicycle", "Motorcycle", 
  "Electric Scooter", "Motorbike", "Dirtbike", "Dune Buggy", "Golf Cart", "Racecar", "Go Kart", 
  "Pickup Truck", "Transport Truck", "Carriage", "Buggy", "Scooter", "Skateboard", "Snowboard", 
  "Surfboard", "Paddleboard", "Hoverboard", "Airplane", "Jetplane", "Schooner", "Taxi Cab", "Tram",   
  "Streetcar", "Subway", "Helicopter", "Tractor", "Bus", "Barge", "Blimp", "Hot Air Balloon", 
  "Convertible", "Dump Truck", "Battle Tank", "Van", "Fire Engine", "Canoe", "Raft", "Paddleboat", 
  "Ambulance", "Langskip", "Knörr", "Cargo Vessel", "Longship", "Drakkar", "Dragonship", "Karve", 
  "Snekkje", "Sloop", "Brigantine", "Brig", "Galleon", "Barque", "Matawar", "Privateer", "Naval Ship", 
  "Galley", "Cog", "Carrack", "River Boat", "Canal Boat", "Hulk", "Birlinn", "Balinger", "Minivan", 
  "Coupe", "Sedan", "Sportscar", "Crossover", "Hatchback", "Station Wagon", "Limousine", "Roadster", 
  "Muscle Car", "Box Truck", "Flatbed Truck", "Tanker Truck", "Crane Truck", "Semi Truck", "Tow Truck",  
  "Cement Truck", "Refrigerator Truck", "Garbage Truck", "Cement Mixer", "ATV", "UTV", "Snowmobile", 
  "Yacht", "Jetski", "Jeep", "Armoured Car", "Military Truck", "Utility Vehicle", 
  "Infantry Fighting Vehicle", "Armoured Personnel Carrier", "Armoured Fighting Vehicle", 
  "Tank Destroyer", "Amphibious Vehicle", "Armoured Recovery Vehicle", "Armoured Assault Vehicle", 
  "Military Aircraft", "Cargoplane", "Amphibious Aircraft", "Fighter Jet", "Bomber", "Stealth Aircraft",
  "Piston Aircraft", "Horse-Drawn Vehicle", "Sled", "Sleigh", "Cart", "Wagon", "Caravan", "Camel Train",
  "Elephant Train", "Horse Carriage", "Gondola", "Trolley", "Tractor Trailer", "Tanker", "Barge", 
  "Satellite", "UFO", "Space Station", "Hovercraft", "Drone", "Rover", "Lander", "Probe", "Module", 
  "Shuttle", "Spacecraft", "Other"
];

// ============================================================================
// PLACES & LOCATIONS
// ============================================================================

export const LOCATION_TYPES = [
  "Forest", "Mountain", "Desert", "Ocean", "River", "Cave", "Settlement", "Mountain Range", 
  "Archipelagos", "Country", "Beach", "Lake", "Island", "Swamp", "Oasis", "Volcano", "Valley", "River", 
  "Delta", "Canyon", "Jungle", "Tundra", "Salt Flat", "Basin", "Continent", "Farmstead", "Field", 
  "Pasture", "Plain", "Sea", "Glacier", "Ice Cap", "Grassland", "Coastline", "Steppe", "Prairie", 
  "Savanna", "Park", "Other"
];

export const BUILDING_TYPES = [
  "House", "Castle", "Temple", "Shop", "Tavern", "Library", "Condo", "Apartment", "Office", "Warehouse",
  "Prison", "Tower", "Mansion", "Barracks", "Ruins", "Factory", "Hostel", "Hotel", "Inn", "Motel", 
  "Community Centre", "Racetrack", "Flat", "Penthouse", "Suite", "Skyscraper", "Watchtower", 
  "Watertower", "Silo", "Farmhouse", "Barn", "Corral", "Storage Facility", "Dungeon", "Prison", 
  "Barracks", "Wall", "Firehall", "Town Hall", "City Hall", "Meeting Space", "Hut", "Tent", "Duplex", 
  "Triplex", "Bungalow", "Semi-Detached", "Mine", "Jail", "Store", "Boutique", "Restaurant", "Saloon", 
  "Hospital", "Clinic", "Courthouse", "Police Station", "Waterpark", "Splashpad", "Playground", 
  "Skatepark", "Church", "Cemetery", "Mosque", "Synagogue", "Other"
];

export const SETTLEMENT_TYPES = [
  "City", "Town", "Village", "Outpost", "Fortress", "Trading Post", 
  "Port", "Capital", "County", "Country", "State", "Province", "Campsite", "Other"
];

export const SETTING_TYPES = [
  "Urban", "Rural", "Wilderness", "Underground", "Aerial", "Aquatic", 
  "Dimensional", "Magical", "Technological", "Other"
];

export const MAP_TYPES = [
  "Political", "Topographical", "City", "Regional", "World", 
  "Dungeon", "Battle", "Trade Routes", "Other"
];

// ============================================================================
// CREATURES & LIFE
// ============================================================================

export const CREATURE_TYPES = [
  "Beast", "Dragon", "Humanoid", "Fey", "Fiend", "Celestial", 
  "Construct", "Undead", "Elemental", "Aberration", "Other"
];

export const ANIMAL_TYPES = [
  "Mammal", "Bird", "Reptile", "Fish", "Amphibian", "Insect", 
  "Arachnid", "Mythical", "Hybrid", "Other"
];

export const PLANT_TYPES = [
  "Tree", "Shrub", "Herb", "Flower", "Grass", "Vine", "Moss", 
  "Fern", "Mushroom", "Algae", "Other"
];

// ============================================================================
// ORGANIZATIONS & GROUPS
// ============================================================================

export const ORGANIZATION_TYPES = [
  "Guild", "Corporation", "Government", "Military", "Religious", 
  "Academic", "Criminal", "Secret Society", "Tribe", "Clan", "Other"
];

export const FACTION_TYPES = [
  "Political", "Military", "Religious", "Criminal", "Mercantile", 
  "Academic", "Secret", "Revolutionary", "Noble", "Other"
];

export const SOCIETY_TYPES = [
  "Tribal", "Feudal", "Democratic", "Autocratic", "Theocratic", 
  "Merchant", "Nomadic", "Military", "Academic", "Other"
];

export const MILITARY_UNIT_TYPES = [
  "Infantry", "Cavalry", "Navy", "Air Force", "Special Forces", 
  "Artillery", "Engineers", "Guards", "Scouts", "Other"
];

// ============================================================================
// CONSUMABLES
// ============================================================================

export const FOOD_TYPES = [
  "Meat", "Vegetable", "Fruit", "Grain", "Dairy", "Dessert", 
  "Beverage", "Spice", "Bread", "Soup", "Other"
];

export const DRINK_TYPES = [
  "Alcoholic", "Non-alcoholic", "Magical", "Potion", "Tea", 
  "Coffee", "Juice", "Water", "Other"
];

export const POTION_TYPES = [
  "Healing", "Enhancement", "Transformation", "Poison", "Utility", 
  "Combat", "Magical", "Alchemical", "Other"
];

// ============================================================================
// KNOWLEDGE & CULTURE
// ============================================================================

export const DOCUMENT_TYPES = [
  "Book", "Scroll", "Letter", "Map", "Charter", "Diary", "Report", 
  "Contract", "Prophecy", "Manual", "Other"
];

export const LANGUAGE_STATUS = [
  "Living", "Dead", "Constructed", "Evolving", "Extinct", "Revived"
];

export const LANGUAGE_DIFFICULTY = [
  "Very Easy", "Easy", "Moderate", "Hard", "Very Hard"
];

export const TRADITION_TYPES = [
  "Ceremony", "Festival", "Custom", "Ritual", "Holiday", "Practice", 
  "Celebration", "Mourning", "Coming of Age", "Other"
];

export const RITUAL_TYPES = [
  "Religious", "Magical", "Social", "Healing", "Protective", 
  "Summoning", "Binding", "Cleansing", "Divination", "Other"
];

export const CEREMONY_TYPES = [
  "Religious", "Royal", "Cultural", "Coming of Age", "Wedding", 
  "Funeral", "Seasonal", "Military", "Other"
];

export const MUSIC_TYPES = [
  "Song", "Instrumental", "Hymn", "Anthem", "Folk Song", "Battle Song", 
  "Lullaby", "Opera", "Other"
];

export const DANCE_TYPES = [
  "Ceremonial", "Social", "Courtly", "Folk", "Martial", "Religious", 
  "Performance", "Ritual", "Other"
];

export const MYTH_TYPES = [
  "Creation", "Hero", "Origin", "Cautionary", "Transformation", 
  "Destruction", "Divine", "Ancestral", "Natural", "Other"
];

export const LEGEND_TYPES = [
  "Historical", "Supernatural", "Heroic", "Tragic", "Romantic", 
  "Adventure", "Mystery", "Folk", "Urban", "Other"
];

// ============================================================================
// MAGIC & SUPERNATURAL
// ============================================================================

export const SPELL_SCHOOLS = [
  "Evocation", "Divination", "Enchantment", "Illusion", "Necromancy", 
  "Transmutation", "Conjuration", "Abjuration", "Elemental", "Other"
];

export const SPELL_LEVELS = [
  "Cantrip", "1st Level", "2nd Level", "3rd Level", "4th Level", 
  "5th Level", "6th Level", "7th Level", "8th Level", "9th Level", "Epic"
];

export const TECHNOLOGY_TYPES = [
  "Magical", "Mechanical", "Biological", "Chemical", "Quantum", 
  "Digital", "Energy", "Medical", "Transportation", "Other"
];

export const NATURAL_LAW_TYPES = [
  "Physical", "Magical", "Divine", "Quantum", "Biological", 
  "Chemical", "Mathematical", "Metaphysical", "Other"
];

// ============================================================================
// EVENTS & TIME
// ============================================================================

export const EVENT_TYPES = [
  "Battle", "Festival", "Disaster", "Discovery", "Political", 
  "Religious", "Cultural", "Economic", "Scientific", "Other"
];

export const TIMELINE_TYPES = [
  "Historical", "Personal", "Fictional", "Political", "Cultural", 
  "Military", "Scientific", "Other"
];

export const TIME_SCALES = [
  "Years", "Decades", "Centuries", "Millennia", "Days", "Months", 
  "Ages", "Other"
];

// ============================================================================
// GOVERNANCE & LAW
// ============================================================================

export const LAW_TYPES = [
  "Criminal", "Civil", "Commercial", "Constitutional", "Religious", 
  "Military", "Property", "Family", "Tax", "Other"
];

export const POLICY_TYPES = [
  "Economic", "Social", "Foreign", "Military", "Environmental", 
  "Educational", "Healthcare", "Administrative", "Other"
];

// ============================================================================
// STORY & NARRATIVE
// ============================================================================

export const PLOT_STRUCTURE_TYPES = [
  "Three-Act", "Hero's Journey", "Save the Cat", "Freytag's Pyramid", "Other"
];

export const CONFLICT_TYPES = [
  "Internal", "External", "Interpersonal", "Social", "Political", 
  "Moral", "Physical", "Emotional", "Spiritual", "Other"
];

export const THEME_TYPES = [
  "Love", "Power", "Identity", "Betrayal", "Redemption", "Survival", 
  "Coming of Age", "Good vs Evil", "Freedom", "Justice", "Other"
];

export const PROMPT_TYPES = [
  "Character Development", "Plot Hook", "Setting Description", "Dialogue", 
  "Opening Line", "Story Structure", "World Building", "Conflict", "Other"
];

export const DESCRIPTION_TYPES = [
  "Armour", "Weapon", "Clothing", "Location", "Character", "Item", 
  "Creature", "Building", "Event", "Other"
];

// ============================================================================
// GENEALOGY & RELATIONSHIPS
// ============================================================================

export const FAMILY_TREE_TYPES = [
  "Lineage", "Ancestral", "Descendant", "Genealogical", "Royal", 
  "Noble", "Other"
];

// ============================================================================
// PROFESSIONS & ROLES
// ============================================================================

export const PROFESSION_TYPES = [
  "Warrior", "Mage", "Merchant", "Craftsman", "Noble", "Scholar", 
  "Entertainer", "Laborer", "Administrator", "Healer", "Explorer", 
  "Criminal", "Religious", "General"
];

export const PROFESSION_RISK_LEVELS = [
  "Low", "Moderate", "High", "Extreme"
];

// ============================================================================
// CHARACTER SPECIFIC
// ============================================================================

export const GENDER_OPTIONS = [
  "Male", "Female", "Non-Binary", "Agender", "Bigender", "Genderfluid", 
  "Genderqueer", "Transgender", "Intersex", "Pangender", "Demigender", 
  "Androgynous", "Omnigender", "Polygender"
];

export const PRONOUN_OPTIONS = [
  "they/them", "she/her", "he/him", "xe/xem", "ze/zir", "ey/em", 
  "ve/ver", "fae/faer", "it/its", "she/they", "he/they", 
  "any pronouns", "ask for pronouns"
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get type options by content type ID
 * Useful for dynamic form generation
 */
export function getTypeOptions(contentType: string): string[] | null {
  const typeMap: Record<string, string[]> = {
    weapon: WEAPON_TYPES,
    armor: ARMOR_TYPES,
    item: ITEM_TYPES,
    accessory: ACCESSORY_TYPES,
    clothing: CLOTHING_TYPES,
    material: MATERIAL_TYPES,
    resource: RESOURCE_TYPES,
    transportation: TRANSPORTATION_TYPES,
    location: LOCATION_TYPES,
    building: BUILDING_TYPES,
    settlement: SETTLEMENT_TYPES,
    setting: SETTING_TYPES,
    map: MAP_TYPES,
    creature: CREATURE_TYPES,
    animal: ANIMAL_TYPES,
    plant: PLANT_TYPES,
    organization: ORGANIZATION_TYPES,
    faction: FACTION_TYPES,
    society: SOCIETY_TYPES,
    militaryunit: MILITARY_UNIT_TYPES,
    food: FOOD_TYPES,
    drink: DRINK_TYPES,
    potion: POTION_TYPES,
    document: DOCUMENT_TYPES,
    tradition: TRADITION_TYPES,
    ritual: RITUAL_TYPES,
    ceremony: CEREMONY_TYPES,
    music: MUSIC_TYPES,
    dance: DANCE_TYPES,
    myth: MYTH_TYPES,
    legend: LEGEND_TYPES,
    spell: SPELL_SCHOOLS,
    technology: TECHNOLOGY_TYPES,
    naturallaw: NATURAL_LAW_TYPES,
    event: EVENT_TYPES,
    timeline: TIMELINE_TYPES,
    law: LAW_TYPES,
    policy: POLICY_TYPES,
    conflict: CONFLICT_TYPES,
    familyTree: FAMILY_TREE_TYPES,
    profession: PROFESSION_TYPES
  };

  return typeMap[contentType] || null;
}

/**
 * Check if a content type has type options
 */
export function hasTypeOptions(contentType: string): boolean {
  return getTypeOptions(contentType) !== null;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Items & Objects
  WEAPON_TYPES,
  ARMOR_TYPES,
  ITEM_TYPES,
  ACCESSORY_TYPES,
  CLOTHING_TYPES,
  MATERIAL_TYPES,
  RESOURCE_TYPES,
  TRANSPORTATION_TYPES,
  
  // Places & Locations
  LOCATION_TYPES,
  BUILDING_TYPES,
  SETTLEMENT_TYPES,
  SETTING_TYPES,
  MAP_TYPES,
  
  // Creatures & Life
  CREATURE_TYPES,
  ANIMAL_TYPES,
  PLANT_TYPES,
  
  // Organizations & Groups
  ORGANIZATION_TYPES,
  FACTION_TYPES,
  SOCIETY_TYPES,
  MILITARY_UNIT_TYPES,
  
  // Consumables
  FOOD_TYPES,
  DRINK_TYPES,
  POTION_TYPES,
  
  // Knowledge & Culture
  DOCUMENT_TYPES,
  LANGUAGE_STATUS,
  LANGUAGE_DIFFICULTY,
  TRADITION_TYPES,
  RITUAL_TYPES,
  CEREMONY_TYPES,
  MUSIC_TYPES,
  DANCE_TYPES,
  MYTH_TYPES,
  LEGEND_TYPES,
  
  // Magic & Supernatural
  SPELL_SCHOOLS,
  SPELL_LEVELS,
  TECHNOLOGY_TYPES,
  NATURAL_LAW_TYPES,
  
  // Events & Time
  EVENT_TYPES,
  TIMELINE_TYPES,
  TIME_SCALES,
  
  // Governance & Law
  LAW_TYPES,
  POLICY_TYPES,
  
  // Story & Narrative
  PLOT_STRUCTURE_TYPES,
  CONFLICT_TYPES,
  THEME_TYPES,
  PROMPT_TYPES,
  DESCRIPTION_TYPES,
  
  // Genealogy
  FAMILY_TREE_TYPES,
  
  // Professions
  PROFESSION_TYPES,
  PROFESSION_RISK_LEVELS,
  
  // Character
  GENDER_OPTIONS,
  PRONOUN_OPTIONS,
  
  // Helper functions
  getTypeOptions,
  hasTypeOptions
};
