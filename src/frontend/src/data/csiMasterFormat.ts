export interface CSIMasterFormatEntry {
  code: string;
  division: string;
  description: string;
}

export const CSI_MASTER_FORMAT: CSIMasterFormatEntry[] = [
  // Division 01 — General Requirements
  {
    code: "01 10 00",
    division: "Division 01 - General Requirements",
    description: "Summary",
  },
  {
    code: "01 20 00",
    division: "Division 01 - General Requirements",
    description: "Price and Payment Procedures",
  },
  {
    code: "01 30 00",
    division: "Division 01 - General Requirements",
    description: "Administrative Requirements",
  },
  {
    code: "01 40 00",
    division: "Division 01 - General Requirements",
    description: "Quality Requirements",
  },
  {
    code: "01 50 00",
    division: "Division 01 - General Requirements",
    description: "Temporary Facilities and Controls",
  },

  // Division 02 — Existing Conditions
  {
    code: "02 10 00",
    division: "Division 02 - Existing Conditions",
    description: "Subsurface Investigation",
  },
  {
    code: "02 20 00",
    division: "Division 02 - Existing Conditions",
    description: "Assessment",
  },
  {
    code: "02 30 00",
    division: "Division 02 - Existing Conditions",
    description: "Subsurface Remediation",
  },
  {
    code: "02 40 00",
    division: "Division 02 - Existing Conditions",
    description: "Demolition and Structure Moving",
  },
  {
    code: "02 50 00",
    division: "Division 02 - Existing Conditions",
    description: "Site Remediation",
  },

  // Division 03 — Concrete
  {
    code: "03 10 00",
    division: "Division 03 - Concrete",
    description: "Concrete Forming and Accessories",
  },
  {
    code: "03 20 00",
    division: "Division 03 - Concrete",
    description: "Concrete Reinforcing",
  },
  {
    code: "03 30 00",
    division: "Division 03 - Concrete",
    description: "Cast-in-Place Concrete",
  },
  {
    code: "03 40 00",
    division: "Division 03 - Concrete",
    description: "Precast Concrete",
  },
  {
    code: "03 50 00",
    division: "Division 03 - Concrete",
    description: "Cast Decks and Underlayment",
  },

  // Division 04 — Masonry
  {
    code: "04 10 00",
    division: "Division 04 - Masonry",
    description: "Masonry Mortaring and Grouting",
  },
  {
    code: "04 20 00",
    division: "Division 04 - Masonry",
    description: "Unit Masonry",
  },
  {
    code: "04 30 00",
    division: "Division 04 - Masonry",
    description: "Masonry Veneer",
  },
  {
    code: "04 40 00",
    division: "Division 04 - Masonry",
    description: "Stone Assemblies",
  },
  {
    code: "04 50 00",
    division: "Division 04 - Masonry",
    description: "Refractory Masonry",
  },

  // Division 05 — Metals
  {
    code: "05 10 00",
    division: "Division 05 - Metals",
    description: "Structural Metal Framing",
  },
  {
    code: "05 20 00",
    division: "Division 05 - Metals",
    description: "Metal Joists",
  },
  {
    code: "05 30 00",
    division: "Division 05 - Metals",
    description: "Metal Decking",
  },
  {
    code: "05 40 00",
    division: "Division 05 - Metals",
    description: "Cold-Formed Metal Framing",
  },
  {
    code: "05 50 00",
    division: "Division 05 - Metals",
    description: "Metal Fabrications",
  },

  // Division 06 — Wood, Plastics, and Composites
  {
    code: "06 10 00",
    division: "Division 06 - Wood, Plastics, and Composites",
    description: "Rough Carpentry",
  },
  {
    code: "06 20 00",
    division: "Division 06 - Wood, Plastics, and Composites",
    description: "Finish Carpentry",
  },
  {
    code: "06 30 00",
    division: "Division 06 - Wood, Plastics, and Composites",
    description: "Heavy Timber Construction",
  },
  {
    code: "06 40 00",
    division: "Division 06 - Wood, Plastics, and Composites",
    description: "Architectural Woodwork",
  },
  {
    code: "06 50 00",
    division: "Division 06 - Wood, Plastics, and Composites",
    description: "Structural Plastics",
  },

  // Division 07 — Thermal and Moisture Protection
  {
    code: "07 10 00",
    division: "Division 07 - Thermal and Moisture Protection",
    description: "Dampproofing and Waterproofing",
  },
  {
    code: "07 20 00",
    division: "Division 07 - Thermal and Moisture Protection",
    description: "Thermal Protection",
  },
  {
    code: "07 30 00",
    division: "Division 07 - Thermal and Moisture Protection",
    description: "Steep Slope Roofing",
  },
  {
    code: "07 40 00",
    division: "Division 07 - Thermal and Moisture Protection",
    description: "Roofing and Siding Panels",
  },
  {
    code: "07 50 00",
    division: "Division 07 - Thermal and Moisture Protection",
    description: "Membrane Roofing",
  },

  // Division 08 — Openings
  {
    code: "08 10 00",
    division: "Division 08 - Openings",
    description: "Doors and Frames",
  },
  {
    code: "08 30 00",
    division: "Division 08 - Openings",
    description: "Specialty Doors and Frames",
  },
  {
    code: "08 40 00",
    division: "Division 08 - Openings",
    description: "Entrances, Storefronts, and Curtain Walls",
  },
  {
    code: "08 50 00",
    division: "Division 08 - Openings",
    description: "Windows",
  },
  {
    code: "08 70 00",
    division: "Division 08 - Openings",
    description: "Hardware",
  },

  // Division 09 — Finishes
  {
    code: "09 10 00",
    division: "Division 09 - Finishes",
    description: "Wall and Ceiling Finishes",
  },
  {
    code: "09 20 00",
    division: "Division 09 - Finishes",
    description: "Plaster and Gypsum Board",
  },
  {
    code: "09 30 00",
    division: "Division 09 - Finishes",
    description: "Tiling",
  },
  {
    code: "09 50 00",
    division: "Division 09 - Finishes",
    description: "Ceilings",
  },
  {
    code: "09 60 00",
    division: "Division 09 - Finishes",
    description: "Flooring",
  },

  // Division 10 — Specialties
  {
    code: "10 10 00",
    division: "Division 10 - Specialties",
    description: "Visual Display Boards",
  },
  {
    code: "10 20 00",
    division: "Division 10 - Specialties",
    description: "Interior Identifying Devices",
  },
  {
    code: "10 30 00",
    division: "Division 10 - Specialties",
    description: "Fireplaces and Stoves",
  },
  {
    code: "10 40 00",
    division: "Division 10 - Specialties",
    description: "Safety Specialties",
  },
  {
    code: "10 50 00",
    division: "Division 10 - Specialties",
    description: "Storage Specialties",
  },

  // Division 11 — Equipment
  {
    code: "11 10 00",
    division: "Division 11 - Equipment",
    description: "Vehicle and Pedestrian Equipment",
  },
  {
    code: "11 20 00",
    division: "Division 11 - Equipment",
    description: "Commercial Equipment",
  },
  {
    code: "11 30 00",
    division: "Division 11 - Equipment",
    description: "Residential Equipment",
  },
  {
    code: "11 40 00",
    division: "Division 11 - Equipment",
    description: "Food Service Equipment",
  },
  {
    code: "11 50 00",
    division: "Division 11 - Equipment",
    description: "Educational and Scientific Equipment",
  },

  // Division 12 — Furnishings
  {
    code: "12 10 00",
    division: "Division 12 - Furnishings",
    description: "Art",
  },
  {
    code: "12 20 00",
    division: "Division 12 - Furnishings",
    description: "Window Treatments",
  },
  {
    code: "12 30 00",
    division: "Division 12 - Furnishings",
    description: "Casework",
  },
  {
    code: "12 40 00",
    division: "Division 12 - Furnishings",
    description: "Furnishings and Accessories",
  },
  {
    code: "12 50 00",
    division: "Division 12 - Furnishings",
    description: "Furniture",
  },

  // Division 13 — Special Construction
  {
    code: "13 10 00",
    division: "Division 13 - Special Construction",
    description: "Special Facility Components",
  },
  {
    code: "13 20 00",
    division: "Division 13 - Special Construction",
    description: "Special Purpose Rooms",
  },
  {
    code: "13 30 00",
    division: "Division 13 - Special Construction",
    description: "Special Structures",
  },
  {
    code: "13 40 00",
    division: "Division 13 - Special Construction",
    description: "Integrated Construction",
  },
  {
    code: "13 50 00",
    division: "Division 13 - Special Construction",
    description: "Special Instrumentation",
  },

  // Division 14 — Conveying Equipment
  {
    code: "14 10 00",
    division: "Division 14 - Conveying Equipment",
    description: "Dumbwaiters",
  },
  {
    code: "14 20 00",
    division: "Division 14 - Conveying Equipment",
    description: "Elevators",
  },
  {
    code: "14 30 00",
    division: "Division 14 - Conveying Equipment",
    description: "Escalators and Moving Walks",
  },
  {
    code: "14 40 00",
    division: "Division 14 - Conveying Equipment",
    description: "Lifts",
  },
  {
    code: "14 50 00",
    division: "Division 14 - Conveying Equipment",
    description: "Material Handling Systems",
  },

  // Division 21 — Fire Suppression
  {
    code: "21 10 00",
    division: "Division 21 - Fire Suppression",
    description: "Water-Based Fire-Suppression Systems",
  },
  {
    code: "21 20 00",
    division: "Division 21 - Fire Suppression",
    description: "Fire-Extinguishing Systems",
  },
  {
    code: "21 30 00",
    division: "Division 21 - Fire Suppression",
    description: "Fire Pumps",
  },
  {
    code: "21 40 00",
    division: "Division 21 - Fire Suppression",
    description: "Fire-Suppression Water Storage",
  },
  {
    code: "21 50 00",
    division: "Division 21 - Fire Suppression",
    description: "Detection and Alarm",
  },

  // Division 22 — Plumbing
  {
    code: "22 10 00",
    division: "Division 22 - Plumbing",
    description: "Plumbing Piping and Pumps",
  },
  {
    code: "22 20 00",
    division: "Division 22 - Plumbing",
    description: "Plumbing Fixtures",
  },
  {
    code: "22 30 00",
    division: "Division 22 - Plumbing",
    description: "Domestic Water Filtration Equipment",
  },
  {
    code: "22 40 00",
    division: "Division 22 - Plumbing",
    description: "Plumbing Waste and Vent Equipment",
  },
  {
    code: "22 50 00",
    division: "Division 22 - Plumbing",
    description: "Pool and Fountain Plumbing Systems",
  },

  // Division 23 — HVAC
  {
    code: "23 10 00",
    division: "Division 23 - HVAC",
    description: "Facility Fuel Systems",
  },
  {
    code: "23 20 00",
    division: "Division 23 - HVAC",
    description: "HVAC Piping and Pumps",
  },
  {
    code: "23 30 00",
    division: "Division 23 - HVAC",
    description: "HVAC Air Distribution",
  },
  {
    code: "23 40 00",
    division: "Division 23 - HVAC",
    description: "HVAC Air Cleaning Devices",
  },
  {
    code: "23 50 00",
    division: "Division 23 - HVAC",
    description: "Central Heating Equipment",
  },

  // Division 25 — Integrated Automation
  {
    code: "25 10 00",
    division: "Division 25 - Integrated Automation",
    description: "Integrated Automation Network Equipment",
  },
  {
    code: "25 20 00",
    division: "Division 25 - Integrated Automation",
    description: "Integrated Automation Instrumentation",
  },
  {
    code: "25 30 00",
    division: "Division 25 - Integrated Automation",
    description: "Integrated Automation Control",
  },
  {
    code: "25 40 00",
    division: "Division 25 - Integrated Automation",
    description: "Integrated Automation Local Control Units",
  },
  {
    code: "25 50 00",
    division: "Division 25 - Integrated Automation",
    description: "Integrated Automation Facility Management Systems",
  },

  // Division 26 — Electrical
  {
    code: "26 10 00",
    division: "Division 26 - Electrical",
    description: "Medium-Voltage Electrical Distribution",
  },
  {
    code: "26 20 00",
    division: "Division 26 - Electrical",
    description: "Low-Voltage Electrical Transmission",
  },
  {
    code: "26 30 00",
    division: "Division 26 - Electrical",
    description: "Facility Electrical Power Generating and Storing Equipment",
  },
  {
    code: "26 40 00",
    division: "Division 26 - Electrical",
    description: "Electrical and Cathodic Protection",
  },
  {
    code: "26 50 00",
    division: "Division 26 - Electrical",
    description: "Lighting",
  },

  // Division 27 — Communications
  {
    code: "27 10 00",
    division: "Division 27 - Communications",
    description: "Structured Cabling",
  },
  {
    code: "27 20 00",
    division: "Division 27 - Communications",
    description: "Data Communications Equipment",
  },
  {
    code: "27 30 00",
    division: "Division 27 - Communications",
    description: "Voice Communications Equipment",
  },
  {
    code: "27 40 00",
    division: "Division 27 - Communications",
    description: "Audio-Video Communications",
  },
  {
    code: "27 50 00",
    division: "Division 27 - Communications",
    description: "Distributed Communications and Monitoring Systems",
  },

  // Division 28 — Electronic Safety and Security
  {
    code: "28 10 00",
    division: "Division 28 - Electronic Safety and Security",
    description: "Access Control",
  },
  {
    code: "28 20 00",
    division: "Division 28 - Electronic Safety and Security",
    description: "Intrusion Detection",
  },
  {
    code: "28 30 00",
    division: "Division 28 - Electronic Safety and Security",
    description: "Life Safety",
  },
  {
    code: "28 40 00",
    division: "Division 28 - Electronic Safety and Security",
    description: "Fire Alarm and Detection",
  },
  {
    code: "28 50 00",
    division: "Division 28 - Electronic Safety and Security",
    description: "Surveillance",
  },

  // Division 31 — Earthwork
  {
    code: "31 10 00",
    division: "Division 31 - Earthwork",
    description: "Clearing and Grubbing",
  },
  {
    code: "31 20 00",
    division: "Division 31 - Earthwork",
    description: "Earth Moving",
  },
  {
    code: "31 30 00",
    division: "Division 31 - Earthwork",
    description: "Excavation and Fill",
  },
  {
    code: "31 40 00",
    division: "Division 31 - Earthwork",
    description: "Shoring and Underpinning",
  },
  {
    code: "31 50 00",
    division: "Division 31 - Earthwork",
    description: "Excavation Support and Protection",
  },

  // Division 32 — Exterior Improvements
  {
    code: "32 10 00",
    division: "Division 32 - Exterior Improvements",
    description: "Bases, Ballasts, and Paving",
  },
  {
    code: "32 20 00",
    division: "Division 32 - Exterior Improvements",
    description: "Site Improvements",
  },
  {
    code: "32 30 00",
    division: "Division 32 - Exterior Improvements",
    description: "Site Furnishings",
  },
  {
    code: "32 40 00",
    division: "Division 32 - Exterior Improvements",
    description: "Site Irrigation",
  },
  {
    code: "32 80 00",
    division: "Division 32 - Exterior Improvements",
    description: "Planting",
  },

  // Division 33 — Utilities
  {
    code: "33 10 00",
    division: "Division 33 - Utilities",
    description: "Water Utility Distribution and Storage",
  },
  {
    code: "33 20 00",
    division: "Division 33 - Utilities",
    description: "Sanitary Sewerage",
  },
  {
    code: "33 30 00",
    division: "Division 33 - Utilities",
    description: "Storm Drainage",
  },
  {
    code: "33 40 00",
    division: "Division 33 - Utilities",
    description: "Gas Distribution",
  },
  {
    code: "33 50 00",
    division: "Division 33 - Utilities",
    description: "Fuel Distribution",
  },
];
