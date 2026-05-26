export interface ProjectSubtopicTemplate {
  id: string;
  name: string;
  defaultCsiDivisions: number[];
}

export interface ProjectCategoryTemplate {
  id: string;
  name: string;
  description: string;
  subtopics: ProjectSubtopicTemplate[];
}

export const PROJECT_CATEGORIES: ProjectCategoryTemplate[] = [
  {
    id: "residential",
    name: "Residential Projects",
    description: "Single-family, multi-family, and custom home construction",
    subtopics: [
      {
        id: "single-family",
        name: "Single-Family Homes",
        defaultCsiDivisions: [3, 6, 7, 9, 22, 23, 26, 31],
      },
      {
        id: "multi-family",
        name: "Multi-Family Housing",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 22, 23, 26],
      },
      {
        id: "condos-townhomes",
        name: "Condominiums & Townhomes",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 22, 23, 31],
      },
      {
        id: "manufactured",
        name: "Manufactured & Modular Homes",
        defaultCsiDivisions: [6, 7, 9, 13, 22, 26, 31, 32],
      },
      {
        id: "custom-home",
        name: "Custom Home Construction",
        defaultCsiDivisions: [3, 6, 7, 9, 10, 22, 23, 31],
      },
      {
        id: "adu",
        name: "Accessory Dwelling Units (ADUs)",
        defaultCsiDivisions: [3, 6, 7, 9, 22, 23, 26, 31],
      },
      {
        id: "senior-living",
        name: "Senior & Assisted Living Housing",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 28],
      },
      {
        id: "affordable-housing",
        name: "Affordable Housing Developments",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 22, 23, 31],
      },
    ],
  },
  {
    id: "building-construction",
    name: "Building Construction Projects",
    description: "Commercial, institutional, and mixed-use buildings",
    subtopics: [
      {
        id: "office-buildings",
        name: "Commercial Office Buildings",
        defaultCsiDivisions: [3, 5, 7, 8, 9, 13, 22, 28],
      },
      {
        id: "retail-shopping",
        name: "Retail & Shopping Centers",
        defaultCsiDivisions: [3, 5, 7, 9, 13, 22, 26, 31],
      },
      {
        id: "hotels-hospitality",
        name: "Hotels & Hospitality",
        defaultCsiDivisions: [3, 5, 7, 9, 11, 13, 22, 28],
      },
      {
        id: "mixed-use",
        name: "Mixed-Use Developments",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "educational",
        name: "Educational Facilities",
        defaultCsiDivisions: [3, 5, 7, 9, 13, 22, 26, 28],
      },
      {
        id: "healthcare",
        name: "Healthcare Facilities",
        defaultCsiDivisions: [3, 5, 7, 9, 11, 13, 22, 28],
      },
      {
        id: "religious-cultural",
        name: "Religious & Cultural Buildings",
        defaultCsiDivisions: [3, 5, 7, 9, 10, 13, 22, 31],
      },
      {
        id: "sports-recreation",
        name: "Sports & Recreation Facilities",
        defaultCsiDivisions: [3, 5, 7, 9, 13, 22, 26, 32],
      },
    ],
  },
  {
    id: "heavy-construction",
    name: "Heavy Construction Projects",
    description: "Dams, tunnels, marine, and large-scale infrastructure",
    subtopics: [
      {
        id: "dams-reservoirs",
        name: "Dams & Reservoirs",
        defaultCsiDivisions: [2, 3, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "tunnels",
        name: "Tunnels & Underground Structures",
        defaultCsiDivisions: [2, 3, 5, 31, 32, 33, 41, 42],
      },
      {
        id: "marine-port",
        name: "Marine & Port Construction",
        defaultCsiDivisions: [2, 3, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "airports-runways",
        name: "Airports & Runways",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "rail-transit",
        name: "Rail & Transit Systems",
        defaultCsiDivisions: [2, 3, 5, 11, 31, 32, 33, 41],
      },
      {
        id: "flood-control",
        name: "Flood Control & Levees",
        defaultCsiDivisions: [2, 3, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "deep-foundation",
        name: "Deep Foundation & Excavation",
        defaultCsiDivisions: [2, 3, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "site-grading",
        name: "Large-Scale Site Grading",
        defaultCsiDivisions: [2, 3, 31, 32, 33, 35, 41, 42],
      },
    ],
  },
  {
    id: "industrial",
    name: "Industrial Construction Projects",
    description: "Manufacturing, energy, and processing facilities",
    subtopics: [
      {
        id: "manufacturing",
        name: "Manufacturing Plants & Factories",
        defaultCsiDivisions: [3, 5, 11, 13, 14, 22, 26, 31],
      },
      {
        id: "oil-gas",
        name: "Oil & Gas Refineries",
        defaultCsiDivisions: [3, 11, 13, 14, 21, 22, 26, 40],
      },
      {
        id: "power-generation",
        name: "Power Generation Facilities",
        defaultCsiDivisions: [3, 11, 13, 14, 21, 22, 26, 40],
      },
      {
        id: "chemical-plants",
        name: "Chemical & Petrochemical Plants",
        defaultCsiDivisions: [3, 11, 13, 14, 21, 22, 26, 40],
      },
      {
        id: "warehousing",
        name: "Warehousing & Distribution Centers",
        defaultCsiDivisions: [3, 5, 7, 11, 13, 22, 26, 31],
      },
      {
        id: "data-centers",
        name: "Data Centers",
        defaultCsiDivisions: [3, 5, 7, 11, 13, 22, 25, 26],
      },
      {
        id: "water-treatment",
        name: "Water & Wastewater Treatment Plants",
        defaultCsiDivisions: [3, 11, 13, 14, 21, 22, 31, 40],
      },
      {
        id: "mining",
        name: "Mining & Processing Facilities",
        defaultCsiDivisions: [2, 3, 11, 13, 14, 21, 31, 40],
      },
    ],
  },
  {
    id: "syndicated-real-estate",
    name: "Syndicated Real Estate Projects",
    description: "Investment funds, joint ventures, and REIT developments",
    subtopics: [
      {
        id: "reits",
        name: "Real Estate Investment Trusts (REITs)",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "private-equity",
        name: "Private Equity Real Estate Funds",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "crowdfunded",
        name: "Crowdfunded Development Projects",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "joint-venture",
        name: "Joint Venture Partnerships",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "mixed-income-syn",
        name: "Mixed-Income Housing Syndications",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "commercial-syn",
        name: "Commercial Property Syndications",
        defaultCsiDivisions: [3, 5, 7, 9, 13, 22, 26, 31],
      },
      {
        id: "lihtc",
        name: "Tax Credit Housing (LIHTC) Projects",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "opportunity-zone",
        name: "Opportunity Zone Developments",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
    ],
  },
  {
    id: "public-government",
    name: "Public and Government Projects",
    description: "Federal, state, and municipal government facilities",
    subtopics: [
      {
        id: "federal-buildings",
        name: "Federal Building Construction",
        defaultCsiDivisions: [3, 5, 7, 9, 13, 22, 26, 28],
      },
      {
        id: "courthouses",
        name: "State & County Courthouses",
        defaultCsiDivisions: [3, 5, 7, 9, 13, 22, 26, 28],
      },
      {
        id: "military",
        name: "Military Facilities & Bases",
        defaultCsiDivisions: [3, 5, 7, 9, 11, 13, 22, 28],
      },
      {
        id: "post-office-civic",
        name: "Post Offices & Civic Centers",
        defaultCsiDivisions: [3, 5, 7, 9, 13, 22, 26, 28],
      },
      {
        id: "libraries-museums",
        name: "Public Libraries & Museums",
        defaultCsiDivisions: [3, 5, 7, 9, 10, 13, 22, 28],
      },
      {
        id: "correctional",
        name: "Correctional Facilities",
        defaultCsiDivisions: [3, 5, 7, 9, 11, 13, 22, 28],
      },
      {
        id: "emergency-services",
        name: "Emergency Services Facilities",
        defaultCsiDivisions: [3, 5, 7, 9, 11, 13, 22, 28],
      },
      {
        id: "govt-research",
        name: "Government Research Facilities",
        defaultCsiDivisions: [3, 5, 7, 9, 11, 13, 22, 28],
      },
    ],
  },
  {
    id: "duplex-apartment",
    name: "Duplex & Apartment Building Projects",
    description: "Multi-unit residential from duplexes to high-rise towers",
    subtopics: [
      {
        id: "duplex-triplex",
        name: "Duplex & Triplex Construction",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 22, 23, 31],
      },
      {
        id: "garden-style",
        name: "Garden-Style Apartment Complexes",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 22, 23, 31],
      },
      {
        id: "mid-rise-apt",
        name: "Mid-Rise Apartment Buildings",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "high-rise-apt",
        name: "High-Rise Residential Towers",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 14, 22],
      },
      {
        id: "student-housing",
        name: "Student Housing",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 28],
      },
      {
        id: "mixed-income-apt",
        name: "Mixed-Income Apartment Developments",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "urban-infill",
        name: "Urban Infill Apartment Projects",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "transit-oriented",
        name: "Transit-Oriented Residential Developments",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
    ],
  },
  {
    id: "renovation",
    name: "Renovation Projects",
    description: "Restoration, structural upgrades, and system overhauls",
    subtopics: [
      {
        id: "historical",
        name: "Historical Building Restoration",
        defaultCsiDivisions: [4, 6, 7, 9, 10, 13, 22, 31],
      },
      {
        id: "structural-reno",
        name: "Structural Renovation & Reinforcement",
        defaultCsiDivisions: [3, 5, 6, 7, 13, 14, 22, 31],
      },
      {
        id: "mep-upgrades",
        name: "MEP Systems Upgrades",
        defaultCsiDivisions: [11, 15, 21, 22, 23, 25, 26, 40],
      },
      {
        id: "facade-reno",
        name: "Facade Renovation",
        defaultCsiDivisions: [4, 6, 7, 9, 10, 13, 22, 31],
      },
      {
        id: "space-reconfig",
        name: "Interior Space Reconfiguration",
        defaultCsiDivisions: [6, 7, 9, 10, 13, 22, 26, 31],
      },
      {
        id: "ada-compliance",
        name: "ADA Compliance Upgrades",
        defaultCsiDivisions: [6, 7, 9, 10, 11, 13, 22, 31],
      },
      {
        id: "seismic-retrofit",
        name: "Seismic Retrofit & Hardening",
        defaultCsiDivisions: [3, 5, 6, 7, 13, 14, 22, 31],
      },
      {
        id: "roof-envelope",
        name: "Roof Replacement & Envelope Repair",
        defaultCsiDivisions: [6, 7, 9, 10, 13, 22, 26, 31],
      },
    ],
  },
  {
    id: "remodeling",
    name: "Remodeling Projects",
    description: "Interior upgrades, additions, and tenant improvements",
    subtopics: [
      {
        id: "kitchen-bath",
        name: "Kitchen & Bathroom Remodeling",
        defaultCsiDivisions: [6, 7, 9, 10, 11, 13, 22, 26],
      },
      {
        id: "basement-attic",
        name: "Basement & Attic Conversion",
        defaultCsiDivisions: [6, 7, 9, 10, 11, 13, 22, 26],
      },
      {
        id: "room-additions",
        name: "Room Additions & Extensions",
        defaultCsiDivisions: [3, 6, 7, 9, 10, 13, 22, 31],
      },
      {
        id: "tenant-improve",
        name: "Commercial Space Tenant Improvements",
        defaultCsiDivisions: [6, 7, 9, 10, 11, 13, 22, 26],
      },
      {
        id: "floor-plan-reconfig",
        name: "Floor Plan Reconfiguration",
        defaultCsiDivisions: [6, 7, 9, 10, 13, 22, 26, 31],
      },
      {
        id: "energy-efficiency",
        name: "Energy Efficiency Upgrades",
        defaultCsiDivisions: [7, 9, 11, 13, 22, 23, 25, 26],
      },
      {
        id: "smart-home",
        name: "Smart Home Integration",
        defaultCsiDivisions: [11, 13, 22, 25, 26, 27, 28, 31],
      },
      {
        id: "landscaping",
        name: "Exterior Landscaping & Hardscaping",
        defaultCsiDivisions: [2, 10, 13, 22, 26, 31, 32, 33],
      },
    ],
  },
  {
    id: "forestry-arboriculture",
    name: "Forestry & Arboriculture / Ornithology Projects",
    description: "Tree management, habitat construction, and wildlife surveys",
    subtopics: [
      {
        id: "tree-removal",
        name: "Tree Removal & Hazard Mitigation",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "canopy-mgmt",
        name: "Urban Tree Canopy Management",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "arborist-assess",
        name: "Arborist Assessments & Tree Preservation Plans",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "reforestation",
        name: "Reforestation & Afforestation Programs",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "wildlife-habitat",
        name: "Wildlife Habitat Construction",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "avian-impact",
        name: "Avian Impact Studies for Construction",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "ornithological",
        name: "Ornithological Survey Integration in Site Planning",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "green-buffer",
        name: "Green Buffer Zone Development",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
    ],
  },
  {
    id: "forestry-horticultural",
    name: "Forestry & Horticultural Projects",
    description: "Nurseries, orchards, gardens, and wetland restoration",
    subtopics: [
      {
        id: "nursery-greenhouse",
        name: "Commercial Nursery & Greenhouse Construction",
        defaultCsiDivisions: [2, 10, 13, 22, 26, 31, 32, 33],
      },
      {
        id: "orchard-vineyard",
        name: "Orchard & Vineyard Development",
        defaultCsiDivisions: [2, 10, 13, 22, 26, 31, 32, 33],
      },
      {
        id: "botanical-garden",
        name: "Landscape & Botanical Garden Construction",
        defaultCsiDivisions: [2, 10, 13, 22, 26, 31, 32, 33],
      },
      {
        id: "erosion-control",
        name: "Soil Erosion Control & Revegetation",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "irrigation",
        name: "Irrigation System Installation",
        defaultCsiDivisions: [2, 10, 13, 22, 31, 32, 33, 35],
      },
      {
        id: "forest-road",
        name: "Forest Road Construction & Management",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "urban-agriculture",
        name: "Urban Agriculture & Vertical Farming Facilities",
        defaultCsiDivisions: [2, 10, 13, 22, 26, 31, 32, 33],
      },
      {
        id: "wetland-restoration",
        name: "Wetland Restoration & Planting Programs",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
    ],
  },
  {
    id: "farming-land-grading",
    name: "Farming & Land Grading / Leveling",
    description: "Agricultural land preparation, drainage, and farm structures",
    subtopics: [
      {
        id: "land-clearing",
        name: "Agricultural Land Clearing",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "land-leveling",
        name: "Precision Land Leveling for Irrigation",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "drainage-tile",
        name: "Drainage Tile Installation",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "terracing",
        name: "Terracing & Contour Grading",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
      {
        id: "farm-building",
        name: "Farm Building & Barn Construction",
        defaultCsiDivisions: [3, 6, 7, 9, 13, 22, 26, 31],
      },
      {
        id: "livestock-facility",
        name: "Livestock Facility Construction",
        defaultCsiDivisions: [3, 6, 7, 9, 13, 22, 26, 31],
      },
      {
        id: "grain-storage",
        name: "Grain Storage & Silo Construction",
        defaultCsiDivisions: [3, 5, 6, 7, 9, 13, 22, 31],
      },
      {
        id: "soil-amendment",
        name: "Soil Amendment & Preparation Programs",
        defaultCsiDivisions: [2, 10, 31, 32, 33, 35, 41, 42],
      },
    ],
  },
  {
    id: "municipal-services",
    name: "Municipal Services Projects",
    description: "Water, sewer, stormwater, parks, and utility infrastructure",
    subtopics: [
      {
        id: "water-distribution",
        name: "Water Distribution System Construction",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 31, 33, 40],
      },
      {
        id: "sanitary-sewer",
        name: "Sanitary Sewer System Installation",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 31, 33, 40],
      },
      {
        id: "stormwater",
        name: "Stormwater Management Infrastructure",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 31, 33, 40],
      },
      {
        id: "public-parks",
        name: "Public Park & Recreation Development",
        defaultCsiDivisions: [2, 10, 13, 22, 26, 31, 32, 33],
      },
      {
        id: "solid-waste",
        name: "Solid Waste Management Facilities",
        defaultCsiDivisions: [2, 3, 11, 13, 21, 22, 31, 40],
      },
      {
        id: "transit-stops",
        name: "Public Transit Stops & Shelters",
        defaultCsiDivisions: [2, 3, 5, 11, 13, 22, 31, 33],
      },
      {
        id: "street-lighting",
        name: "Street Lighting & Electrical Utility Infrastructure",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 25, 26, 31],
      },
      {
        id: "fuel-fleet",
        name: "Municipal Fuel & Fleet Facility Construction",
        defaultCsiDivisions: [3, 5, 11, 13, 22, 26, 31, 40],
      },
    ],
  },
  {
    id: "street-signals-mapping",
    name: "Street Control Signals & City Mapping",
    description: "Traffic systems, ITS, GIS mapping, and smart city sensors",
    subtopics: [
      {
        id: "traffic-signals",
        name: "Traffic Signal Installation & Upgrades",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 25, 26, 31],
      },
      {
        id: "its",
        name: "Intelligent Transportation Systems (ITS)",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 25, 26, 31],
      },
      {
        id: "pedestrian-signals",
        name: "Pedestrian Crosswalk Signal Systems",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 25, 26, 31],
      },
      {
        id: "school-zone",
        name: "School Zone & Flashing Beacon Systems",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 25, 26, 31],
      },
      {
        id: "gis-mapping",
        name: "GIS City Mapping & Survey Integration",
        defaultCsiDivisions: [2, 11, 13, 22, 25, 26, 31, 33],
      },
      {
        id: "digital-asset-mgmt",
        name: "Digital Asset Management for City Infrastructure",
        defaultCsiDivisions: [2, 11, 13, 22, 25, 26, 31, 33],
      },
      {
        id: "fiber-optic",
        name: "Fiber Optic & Communication Conduit for Traffic Systems",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 25, 26, 31],
      },
      {
        id: "smart-city",
        name: "Smart City Sensor & Camera Network Installation",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 25, 26, 31],
      },
    ],
  },
  {
    id: "public-highways",
    name: "Public Highways / Roadways & Infrastructure",
    description: "Interstate, state highway, bridge, and pavement projects",
    subtopics: [
      {
        id: "interstate",
        name: "Interstate & Federal Highway Construction",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "state-highway",
        name: "State Highway & Arterial Road Construction",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "interchange",
        name: "Highway Interchange & On/Off Ramp Construction",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "pavement-resurfacing",
        name: "Pavement Resurfacing & Reconstruction",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "highway-bridge",
        name: "Highway Bridge Construction & Replacement",
        defaultCsiDivisions: [2, 3, 5, 11, 31, 32, 33, 41],
      },
      {
        id: "sound-walls",
        name: "Sound Walls & Retaining Structures",
        defaultCsiDivisions: [2, 3, 5, 31, 32, 33, 35, 41],
      },
      {
        id: "rest-areas",
        name: "Rest Areas & Weigh Stations",
        defaultCsiDivisions: [3, 5, 7, 9, 11, 13, 22, 31],
      },
      {
        id: "highway-lighting",
        name: "Highway Lighting & Signage Systems",
        defaultCsiDivisions: [2, 11, 13, 21, 22, 25, 26, 31],
      },
    ],
  },
  {
    id: "private-highways",
    name: "Private Highways / Roadways & Bridges",
    description: "Private roads, gated communities, toll roads, and bridges",
    subtopics: [
      {
        id: "private-road",
        name: "Private Road & Driveway Construction",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "gated-community",
        name: "Gated Community Road Networks",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "industrial-access",
        name: "Industrial Access Road Construction",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "ranch-road",
        name: "Agricultural & Ranch Road Development",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "private-bridge",
        name: "Privately Owned Bridge Construction",
        defaultCsiDivisions: [2, 3, 5, 11, 31, 32, 33, 41],
      },
      {
        id: "toll-road",
        name: "Toll Road & Managed Lane Development",
        defaultCsiDivisions: [2, 3, 11, 31, 32, 33, 34, 41],
      },
      {
        id: "parking-structures",
        name: "Private Parking Structures & Lots",
        defaultCsiDivisions: [3, 5, 7, 11, 13, 22, 31, 32],
      },
      {
        id: "grade-crossing",
        name: "Railroad Grade Crossing & Private Crossing Construction",
        defaultCsiDivisions: [2, 3, 5, 11, 31, 32, 33, 41],
      },
    ],
  },
];

export function getCategoryById(
  id: string,
): ProjectCategoryTemplate | undefined {
  return PROJECT_CATEGORIES.find((c) => c.id === id);
}

export function getSubtopicById(
  categoryId: string,
  subtopicId: string,
): ProjectSubtopicTemplate | undefined {
  const cat = getCategoryById(categoryId);
  return cat?.subtopics.find((s) => s.id === subtopicId);
}
