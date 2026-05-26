export interface ProjectSubtopicDef {
  id: string;
  name: string;
  defaultCsiDivisions: number[];
}

export interface ProjectCategoryDef {
  id: string;
  name: string;
  subtopics: ProjectSubtopicDef[];
}

export const PROJECT_CATEGORIES: ProjectCategoryDef[] = [
  {
    id: "residential",
    name: "Residential Projects",
    subtopics: [
      {
        id: "single-family",
        name: "Single-Family Homes",
        defaultCsiDivisions: [3, 4, 5, 6, 7, 9],
      },
      {
        id: "multi-family",
        name: "Multi-Family Housing",
        defaultCsiDivisions: [3, 5, 6, 7, 8, 9],
      },
      {
        id: "condominiums",
        name: "Condominiums & Townhomes",
        defaultCsiDivisions: [3, 5, 6, 7, 8, 9],
      },
      {
        id: "manufactured",
        name: "Manufactured & Modular Homes",
        defaultCsiDivisions: [3, 5, 6, 7],
      },
      {
        id: "custom-home",
        name: "Custom Home Construction",
        defaultCsiDivisions: [3, 4, 5, 6, 7, 9],
      },
      {
        id: "adu",
        name: "Accessory Dwelling Units (ADUs)",
        defaultCsiDivisions: [3, 6, 7, 8],
      },
      {
        id: "senior-housing",
        name: "Senior & Assisted Living Housing",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 10],
      },
      {
        id: "affordable-housing",
        name: "Affordable Housing Developments",
        defaultCsiDivisions: [3, 5, 6, 7, 8, 9],
      },
    ],
  },
  {
    id: "building-construction",
    name: "Building Construction Projects",
    subtopics: [
      {
        id: "office-buildings",
        name: "Commercial Office Buildings",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10],
      },
      {
        id: "retail",
        name: "Retail & Shopping Centers",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10],
      },
      {
        id: "hotels",
        name: "Hotels & Hospitality",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10],
      },
      {
        id: "mixed-use",
        name: "Mixed-Use Developments",
        defaultCsiDivisions: [3, 5, 6, 7, 8, 9, 10],
      },
      {
        id: "educational",
        name: "Educational Facilities",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10, 11],
      },
      {
        id: "healthcare",
        name: "Healthcare Facilities",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10, 11, 14],
      },
      {
        id: "religious",
        name: "Religious & Cultural Buildings",
        defaultCsiDivisions: [3, 4, 5, 7, 8, 9],
      },
      {
        id: "sports",
        name: "Sports & Recreation Facilities",
        defaultCsiDivisions: [3, 5, 7, 9, 10, 11],
      },
    ],
  },
  {
    id: "heavy-construction",
    name: "Heavy Construction Projects",
    subtopics: [
      {
        id: "dams",
        name: "Dams & Reservoirs",
        defaultCsiDivisions: [2, 3, 31, 32, 33],
      },
      {
        id: "tunnels",
        name: "Tunnels & Underground Structures",
        defaultCsiDivisions: [2, 3, 31, 34],
      },
      {
        id: "marine",
        name: "Marine & Port Construction",
        defaultCsiDivisions: [2, 3, 5, 31, 35],
      },
      {
        id: "airports",
        name: "Airports & Runways",
        defaultCsiDivisions: [2, 3, 5, 31, 32, 34],
      },
      {
        id: "rail",
        name: "Rail & Transit Systems",
        defaultCsiDivisions: [2, 3, 31, 34],
      },
      {
        id: "flood-control",
        name: "Flood Control & Levees",
        defaultCsiDivisions: [2, 3, 31, 33],
      },
      {
        id: "deep-foundation",
        name: "Deep Foundation & Excavation",
        defaultCsiDivisions: [2, 3, 31],
      },
      {
        id: "site-grading",
        name: "Large-Scale Site Grading",
        defaultCsiDivisions: [2, 31, 32],
      },
    ],
  },
  {
    id: "industrial",
    name: "Industrial Construction Projects",
    subtopics: [
      {
        id: "manufacturing",
        name: "Manufacturing Plants & Factories",
        defaultCsiDivisions: [3, 5, 7, 11, 15, 16, 23, 26],
      },
      {
        id: "oil-gas",
        name: "Oil & Gas Refineries",
        defaultCsiDivisions: [3, 5, 11, 15, 23, 26, 40],
      },
      {
        id: "power-generation",
        name: "Power Generation Facilities",
        defaultCsiDivisions: [3, 5, 11, 16, 26],
      },
      {
        id: "chemical",
        name: "Chemical & Petrochemical Plants",
        defaultCsiDivisions: [3, 5, 11, 23, 40],
      },
      {
        id: "warehousing",
        name: "Warehousing & Distribution Centers",
        defaultCsiDivisions: [3, 5, 7, 9, 14],
      },
      {
        id: "data-centers",
        name: "Data Centers",
        defaultCsiDivisions: [3, 5, 7, 11, 23, 26, 27],
      },
      {
        id: "water-treatment",
        name: "Water & Wastewater Treatment Plants",
        defaultCsiDivisions: [3, 5, 11, 23, 33, 40],
      },
      {
        id: "mining",
        name: "Mining & Processing Facilities",
        defaultCsiDivisions: [3, 5, 11, 31, 40],
      },
    ],
  },
  {
    id: "syndicated-real-estate",
    name: "Syndicated Real Estate Projects",
    subtopics: [
      {
        id: "reits",
        name: "Real Estate Investment Trusts (REITs)",
        defaultCsiDivisions: [3, 5, 7, 9, 10],
      },
      {
        id: "private-equity",
        name: "Private Equity Real Estate Funds",
        defaultCsiDivisions: [3, 5, 7, 9, 10],
      },
      {
        id: "crowdfunded",
        name: "Crowdfunded Development Projects",
        defaultCsiDivisions: [3, 5, 6, 7, 9],
      },
      {
        id: "joint-venture",
        name: "Joint Venture Partnerships",
        defaultCsiDivisions: [3, 5, 7, 9, 10],
      },
      {
        id: "mixed-income",
        name: "Mixed-Income Housing Syndications",
        defaultCsiDivisions: [3, 5, 6, 7, 9],
      },
      {
        id: "commercial-syndication",
        name: "Commercial Property Syndications",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10],
      },
      {
        id: "tax-credit",
        name: "Tax Credit Housing (LIHTC) Projects",
        defaultCsiDivisions: [3, 5, 6, 7, 9],
      },
      {
        id: "opportunity-zone",
        name: "Opportunity Zone Developments",
        defaultCsiDivisions: [3, 5, 7, 9, 10],
      },
    ],
  },
  {
    id: "public-government",
    name: "Public and Government Projects",
    subtopics: [
      {
        id: "federal-buildings",
        name: "Federal Building Construction",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10],
      },
      {
        id: "courthouses",
        name: "State & County Courthouses",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10],
      },
      {
        id: "military",
        name: "Military Facilities & Bases",
        defaultCsiDivisions: [3, 5, 7, 9, 10, 11],
      },
      {
        id: "post-offices",
        name: "Post Offices & Civic Centers",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10],
      },
      {
        id: "libraries",
        name: "Public Libraries & Museums",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10],
      },
      {
        id: "correctional",
        name: "Correctional Facilities",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 10, 11],
      },
      {
        id: "emergency-services",
        name: "Emergency Services Facilities",
        defaultCsiDivisions: [3, 5, 7, 9, 10, 11],
      },
      {
        id: "research",
        name: "Government Research Facilities",
        defaultCsiDivisions: [3, 5, 7, 9, 10, 11, 23],
      },
    ],
  },
  {
    id: "duplex-apartment",
    name: "Duplex Apartment Building Projects",
    subtopics: [
      {
        id: "duplex-triplex",
        name: "Duplex & Triplex Construction",
        defaultCsiDivisions: [3, 5, 6, 7, 9],
      },
      {
        id: "garden-apartments",
        name: "Garden-Style Apartment Complexes",
        defaultCsiDivisions: [3, 5, 6, 7, 9],
      },
      {
        id: "mid-rise",
        name: "Mid-Rise Apartment Buildings",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 14],
      },
      {
        id: "high-rise",
        name: "High-Rise Residential Towers",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 14],
      },
      {
        id: "student-housing",
        name: "Student Housing",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 10],
      },
      {
        id: "mixed-income-apt",
        name: "Mixed-Income Apartment Developments",
        defaultCsiDivisions: [3, 5, 6, 7, 9],
      },
      {
        id: "urban-infill",
        name: "Urban Infill Apartment Projects",
        defaultCsiDivisions: [3, 5, 7, 8, 9],
      },
      {
        id: "transit-oriented",
        name: "Transit-Oriented Residential Developments",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 34],
      },
    ],
  },
  {
    id: "renovation",
    name: "Renovation Projects",
    subtopics: [
      {
        id: "historical",
        name: "Historical Building Restoration",
        defaultCsiDivisions: [2, 4, 5, 6, 7, 9],
      },
      {
        id: "structural-reno",
        name: "Structural Renovation & Reinforcement",
        defaultCsiDivisions: [2, 3, 5, 7],
      },
      {
        id: "mep-upgrades",
        name: "MEP Systems Upgrades",
        defaultCsiDivisions: [15, 16, 22, 23, 26],
      },
      {
        id: "facade",
        name: "Facade Renovation",
        defaultCsiDivisions: [4, 7, 8, 9],
      },
      {
        id: "space-reconfig",
        name: "Interior Space Reconfiguration",
        defaultCsiDivisions: [6, 9, 10],
      },
      {
        id: "ada",
        name: "ADA Compliance Upgrades",
        defaultCsiDivisions: [3, 5, 8, 9, 10],
      },
      {
        id: "seismic",
        name: "Seismic Retrofit & Hardening",
        defaultCsiDivisions: [3, 5, 7],
      },
      {
        id: "roof",
        name: "Roof Replacement & Envelope Repair",
        defaultCsiDivisions: [7],
      },
    ],
  },
  {
    id: "remodeling",
    name: "Remodeling Projects",
    subtopics: [
      {
        id: "kitchen-bath",
        name: "Kitchen & Bathroom Remodeling",
        defaultCsiDivisions: [6, 9, 10, 22, 23, 26],
      },
      {
        id: "basement-attic",
        name: "Basement & Attic Conversion",
        defaultCsiDivisions: [3, 6, 7, 9],
      },
      {
        id: "room-additions",
        name: "Room Additions & Extensions",
        defaultCsiDivisions: [3, 5, 6, 7, 9],
      },
      {
        id: "tenant-improvements",
        name: "Commercial Space Tenant Improvements",
        defaultCsiDivisions: [6, 9, 10, 11],
      },
      {
        id: "floor-plan",
        name: "Floor Plan Reconfiguration",
        defaultCsiDivisions: [3, 5, 6, 9],
      },
      {
        id: "energy-efficiency",
        name: "Energy Efficiency Upgrades",
        defaultCsiDivisions: [7, 15, 16, 23, 26],
      },
      {
        id: "smart-home",
        name: "Smart Home Integration",
        defaultCsiDivisions: [16, 26, 27],
      },
      {
        id: "landscaping",
        name: "Exterior Landscaping & Hardscaping",
        defaultCsiDivisions: [2, 31, 32],
      },
    ],
  },
  {
    id: "forestry-arboriculture",
    name: "Forestry & Arboriculture / Ornithology Projects",
    subtopics: [
      {
        id: "tree-removal",
        name: "Tree Removal & Hazard Mitigation",
        defaultCsiDivisions: [1, 2, 31],
      },
      {
        id: "urban-canopy",
        name: "Urban Tree Canopy Management",
        defaultCsiDivisions: [1, 2, 32],
      },
      {
        id: "arborist",
        name: "Arborist Assessments & Tree Preservation",
        defaultCsiDivisions: [1, 2],
      },
      {
        id: "reforestation",
        name: "Reforestation & Afforestation Programs",
        defaultCsiDivisions: [1, 2, 31, 32],
      },
      {
        id: "wildlife-habitat",
        name: "Wildlife Habitat Construction",
        defaultCsiDivisions: [1, 2, 32],
      },
      {
        id: "avian-impact",
        name: "Avian Impact Studies for Construction",
        defaultCsiDivisions: [1],
      },
      {
        id: "ornithological",
        name: "Ornithological Survey Integration",
        defaultCsiDivisions: [1],
      },
      {
        id: "green-buffer",
        name: "Green Buffer Zone Development",
        defaultCsiDivisions: [1, 2, 31, 32],
      },
    ],
  },
  {
    id: "forestry-horticulture",
    name: "Forestry & Horticultural Projects",
    subtopics: [
      {
        id: "nursery",
        name: "Commercial Nursery & Greenhouse Construction",
        defaultCsiDivisions: [3, 5, 7, 11],
      },
      {
        id: "orchard",
        name: "Orchard & Vineyard Development",
        defaultCsiDivisions: [2, 3, 11, 31, 32],
      },
      {
        id: "landscape",
        name: "Landscape & Botanical Garden Construction",
        defaultCsiDivisions: [2, 3, 31, 32],
      },
      {
        id: "erosion-control",
        name: "Soil Erosion Control & Revegetation",
        defaultCsiDivisions: [2, 31, 32],
      },
      {
        id: "irrigation",
        name: "Irrigation System Installation",
        defaultCsiDivisions: [2, 11, 33],
      },
      {
        id: "forest-road",
        name: "Forest Road Construction & Management",
        defaultCsiDivisions: [2, 31, 32],
      },
      {
        id: "urban-agriculture",
        name: "Urban Agriculture & Vertical Farming",
        defaultCsiDivisions: [3, 5, 7, 11],
      },
      {
        id: "wetland",
        name: "Wetland Restoration & Planting Programs",
        defaultCsiDivisions: [2, 31, 32, 33],
      },
    ],
  },
  {
    id: "farming-land-grading",
    name: "Farming and Land Grading / Leveling",
    subtopics: [
      {
        id: "land-clearing",
        name: "Agricultural Land Clearing",
        defaultCsiDivisions: [2, 31],
      },
      {
        id: "precision-leveling",
        name: "Precision Land Leveling for Irrigation",
        defaultCsiDivisions: [2, 31, 33],
      },
      {
        id: "drainage-tile",
        name: "Drainage Tile Installation",
        defaultCsiDivisions: [2, 33],
      },
      {
        id: "terracing",
        name: "Terracing & Contour Grading",
        defaultCsiDivisions: [2, 31, 32],
      },
      {
        id: "farm-buildings",
        name: "Farm Building & Barn Construction",
        defaultCsiDivisions: [3, 5, 7],
      },
      {
        id: "livestock",
        name: "Livestock Facility Construction",
        defaultCsiDivisions: [3, 5, 7, 11],
      },
      {
        id: "grain-storage",
        name: "Grain Storage & Silo Construction",
        defaultCsiDivisions: [3, 5, 11],
      },
      {
        id: "soil-amendment",
        name: "Soil Amendment & Preparation Programs",
        defaultCsiDivisions: [2, 31],
      },
    ],
  },
  {
    id: "municipal-services",
    name: "Municipal Services Projects",
    subtopics: [
      {
        id: "water-distribution",
        name: "Water Distribution System Construction",
        defaultCsiDivisions: [3, 33],
      },
      {
        id: "sanitary-sewer",
        name: "Sanitary Sewer System Installation",
        defaultCsiDivisions: [2, 3, 31, 33],
      },
      {
        id: "stormwater",
        name: "Stormwater Management Infrastructure",
        defaultCsiDivisions: [2, 3, 31, 33],
      },
      {
        id: "parks",
        name: "Public Park & Recreation Development",
        defaultCsiDivisions: [2, 3, 11, 31, 32],
      },
      {
        id: "solid-waste",
        name: "Solid Waste Management Facilities",
        defaultCsiDivisions: [2, 3, 11, 33],
      },
      {
        id: "transit-stops",
        name: "Public Transit Stops & Shelters",
        defaultCsiDivisions: [3, 5, 7, 34],
      },
      {
        id: "street-lighting",
        name: "Street Lighting & Electrical Utility",
        defaultCsiDivisions: [16, 26],
      },
      {
        id: "fleet-facility",
        name: "Municipal Fuel & Fleet Facility Construction",
        defaultCsiDivisions: [3, 5, 7, 11],
      },
    ],
  },
  {
    id: "street-signals",
    name: "Street Control Signals and City Mapping",
    subtopics: [
      {
        id: "traffic-signals",
        name: "Traffic Signal Installation & Upgrades",
        defaultCsiDivisions: [16, 26, 34],
      },
      {
        id: "its",
        name: "Intelligent Transportation Systems (ITS)",
        defaultCsiDivisions: [16, 27, 34],
      },
      {
        id: "pedestrian-signals",
        name: "Pedestrian Crosswalk Signal Systems",
        defaultCsiDivisions: [16, 26, 34],
      },
      {
        id: "school-zone",
        name: "School Zone & Flashing Beacon Systems",
        defaultCsiDivisions: [16, 26, 34],
      },
      {
        id: "gis-mapping",
        name: "GIS City Mapping & Survey Integration",
        defaultCsiDivisions: [1, 2],
      },
      {
        id: "digital-asset",
        name: "Digital Asset Management for City Infrastructure",
        defaultCsiDivisions: [1, 27],
      },
      {
        id: "fiber-optic",
        name: "Fiber Optic & Communication Conduit for Traffic",
        defaultCsiDivisions: [16, 27],
      },
      {
        id: "smart-city",
        name: "Smart City Sensor & Camera Network Installation",
        defaultCsiDivisions: [16, 27],
      },
    ],
  },
  {
    id: "public-highways",
    name: "Public Highways / Roadways and Infrastructure",
    subtopics: [
      {
        id: "interstate",
        name: "Interstate & Federal Highway Construction",
        defaultCsiDivisions: [2, 3, 31, 32, 34],
      },
      {
        id: "state-highway",
        name: "State Highway & Arterial Road Construction",
        defaultCsiDivisions: [2, 3, 31, 32],
      },
      {
        id: "interchange",
        name: "Highway Interchange & On/Off Ramp Construction",
        defaultCsiDivisions: [2, 3, 31, 32],
      },
      {
        id: "pavement",
        name: "Pavement Resurfacing & Reconstruction",
        defaultCsiDivisions: [2, 3, 32],
      },
      {
        id: "highway-bridge",
        name: "Highway Bridge Construction & Replacement",
        defaultCsiDivisions: [3, 5, 31],
      },
      {
        id: "sound-walls",
        name: "Sound Walls & Retaining Structures",
        defaultCsiDivisions: [3, 5, 32],
      },
      {
        id: "rest-areas",
        name: "Rest Areas & Weigh Stations",
        defaultCsiDivisions: [3, 5, 7, 9],
      },
      {
        id: "highway-lighting",
        name: "Highway Lighting & Signage Systems",
        defaultCsiDivisions: [16, 26, 34],
      },
    ],
  },
  {
    id: "private-highways",
    name: "Private Highways and Roadways / Bridges",
    subtopics: [
      {
        id: "private-road",
        name: "Private Road & Driveway Construction",
        defaultCsiDivisions: [2, 3, 32],
      },
      {
        id: "gated-community",
        name: "Gated Community Road Networks",
        defaultCsiDivisions: [2, 3, 32],
      },
      {
        id: "industrial-access",
        name: "Industrial Access Road Construction",
        defaultCsiDivisions: [2, 3, 31, 32],
      },
      {
        id: "agricultural-road",
        name: "Agricultural & Ranch Road Development",
        defaultCsiDivisions: [2, 31, 32],
      },
      {
        id: "private-bridge",
        name: "Privately Owned Bridge Construction",
        defaultCsiDivisions: [3, 5, 31],
      },
      {
        id: "toll-road",
        name: "Toll Road & Managed Lane Development",
        defaultCsiDivisions: [2, 3, 32, 34],
      },
      {
        id: "private-parking",
        name: "Private Parking Structures & Lots",
        defaultCsiDivisions: [3, 5, 7, 9],
      },
      {
        id: "railroad-crossing",
        name: "Railroad Grade Crossing & Private Crossing",
        defaultCsiDivisions: [2, 3, 34],
      },
    ],
  },
];

export const ALL_CATEGORIES_OPTION = { id: "", name: "All Categories" };

export function getCategoryById(id: string): ProjectCategoryDef | undefined {
  return PROJECT_CATEGORIES.find((c) => c.id === id);
}

export function getSubtopicById(
  categoryId: string,
  subtopicId: string,
): ProjectSubtopicDef | undefined {
  return getCategoryById(categoryId)?.subtopics.find(
    (s) => s.id === subtopicId,
  );
}
