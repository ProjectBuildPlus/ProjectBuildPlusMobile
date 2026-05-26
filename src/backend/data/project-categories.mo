import ProjectTypes "../types/project-types";

module {
  type Category = ProjectTypes.ProjectCategory;
  type Subtopic = ProjectTypes.ProjectSubtopic;
  type DefaultPhase = ProjectTypes.DefaultPhase;

  // ─── Shared phase templates ──────────────────────────────────────────────

  let residentialPhases : [DefaultPhase] = [
    { name = "Pre-Construction"; durationDays = 30; order = 1; csiDivisions = [1, 2] },
    { name = "Foundation";        durationDays = 45; order = 2; csiDivisions = [3, 31] },
    { name = "Framing";           durationDays = 60; order = 3; csiDivisions = [5, 6] },
    { name = "MEP Rough-In";      durationDays = 45; order = 4; csiDivisions = [22, 23, 26] },
    { name = "Finishes";          durationDays = 60; order = 5; csiDivisions = [7, 8, 9, 10, 12] },
    { name = "Closeout";          durationDays = 15; order = 6; csiDivisions = [1] },
  ];

  let commercialPhases : [DefaultPhase] = [
    { name = "Pre-Construction"; durationDays = 45;  order = 1; csiDivisions = [1, 2] },
    { name = "Site Work";         durationDays = 30;  order = 2; csiDivisions = [2, 31, 32] },
    { name = "Structure";         durationDays = 90;  order = 3; csiDivisions = [3, 4, 5] },
    { name = "Envelope";          durationDays = 60;  order = 4; csiDivisions = [7, 8] },
    { name = "MEP Systems";       durationDays = 75;  order = 5; csiDivisions = [21, 22, 23, 25, 26, 27, 28] },
    { name = "Finishes";          durationDays = 60;  order = 6; csiDivisions = [9, 10, 11, 12, 14] },
    { name = "Closeout";          durationDays = 20;  order = 7; csiDivisions = [1] },
  ];

  let heavyPhases : [DefaultPhase] = [
    { name = "Investigation & Mobilization"; durationDays = 60;  order = 1; csiDivisions = [1, 2] },
    { name = "Earthworks & Excavation";      durationDays = 120; order = 2; csiDivisions = [2, 31] },
    { name = "Civil / Structural";           durationDays = 180; order = 3; csiDivisions = [3, 4, 5] },
    { name = "Specialty Systems";            durationDays = 90;  order = 4; csiDivisions = [34, 35] },
    { name = "Finishing & Closeout";         durationDays = 45;  order = 5; csiDivisions = [1, 32, 33] },
  ];

  let industrialPhases : [DefaultPhase] = [
    { name = "Engineering & Procurement"; durationDays = 90;  order = 1; csiDivisions = [1] },
    { name = "Site Preparation";          durationDays = 60;  order = 2; csiDivisions = [2, 31] },
    { name = "Civil & Structural";        durationDays = 120; order = 3; csiDivisions = [3, 4, 5] },
    { name = "Process Equipment";         durationDays = 120; order = 4; csiDivisions = [11, 13, 40, 41, 43, 44] },
    { name = "MEP & Controls";            durationDays = 90;  order = 5; csiDivisions = [22, 23, 25, 26, 28] },
    { name = "Commissioning";             durationDays = 45;  order = 6; csiDivisions = [1] },
  ];

  let renovationPhases : [DefaultPhase] = [
    { name = "Assessment & Planning"; durationDays = 30;  order = 1; csiDivisions = [1] },
    { name = "Demolition";            durationDays = 21;  order = 2; csiDivisions = [2] },
    { name = "Structural Repair";     durationDays = 45;  order = 3; csiDivisions = [3, 4, 5] },
    { name = "MEP Upgrades";          durationDays = 45;  order = 4; csiDivisions = [22, 23, 26] },
    { name = "Finishes & Restoration"; durationDays = 60; order = 5; csiDivisions = [7, 8, 9, 10, 12] },
    { name = "Closeout";              durationDays = 10;  order = 6; csiDivisions = [1] },
  ];

  let reModelingPhases : [DefaultPhase] = [
    { name = "Planning & Permitting"; durationDays = 21; order = 1; csiDivisions = [1] },
    { name = "Demolition";           durationDays = 7;  order = 2; csiDivisions = [2] },
    { name = "Rough Work";           durationDays = 21; order = 3; csiDivisions = [6, 22, 23, 26] },
    { name = "Finishes";             durationDays = 30; order = 4; csiDivisions = [7, 8, 9, 10, 12] },
    { name = "Closeout";             durationDays = 5;  order = 5; csiDivisions = [1] },
  ];

  let forestryPhases : [DefaultPhase] = [
    { name = "Site Assessment"; durationDays = 14;  order = 1; csiDivisions = [1] },
    { name = "Land Clearing";   durationDays = 30;  order = 2; csiDivisions = [2, 31] },
    { name = "Installation";    durationDays = 30;  order = 3; csiDivisions = [32] },
    { name = "Closeout";        durationDays = 7;   order = 4; csiDivisions = [1] },
  ];

  let farmingPhases : [DefaultPhase] = [
    { name = "Land Clearing & Grading"; durationDays = 45; order = 1; csiDivisions = [2, 31] },
    { name = "Drainage & Utilities";    durationDays = 30; order = 2; csiDivisions = [22, 33] },
    { name = "Structures";              durationDays = 60; order = 3; csiDivisions = [3, 4, 5, 11] },
    { name = "Site Finishes";           durationDays = 21; order = 4; csiDivisions = [32] },
  ];

  let municipalPhases : [DefaultPhase] = [
    { name = "Design & Permitting";    durationDays = 45; order = 1; csiDivisions = [1] },
    { name = "Excavation & Earthwork"; durationDays = 60; order = 2; csiDivisions = [31, 33] },
    { name = "Utility Installation";   durationDays = 90; order = 3; csiDivisions = [22, 26, 33] },
    { name = "Paving & Site Work";     durationDays = 45; order = 4; csiDivisions = [32, 34] },
    { name = "Closeout";               durationDays = 14; order = 5; csiDivisions = [1] },
  ];

  let highwayPhases : [DefaultPhase] = [
    { name = "Planning & Survey";    durationDays = 60;  order = 1; csiDivisions = [1, 2] },
    { name = "Earthwork & Grading";  durationDays = 120; order = 2; csiDivisions = [31] },
    { name = "Sub-Base & Base";      durationDays = 60;  order = 3; csiDivisions = [32] },
    { name = "Paving";               durationDays = 60;  order = 4; csiDivisions = [32] },
    { name = "Drainage & Utilities"; durationDays = 45;  order = 5; csiDivisions = [26, 33, 34] },
    { name = "Signage & Finishing";  durationDays = 30;  order = 6; csiDivisions = [3, 4, 5] },
  ];

  // ─── CSI division sets ───────────────────────────────────────────────────

  let residentialCSI : [Nat] = [1,2,3,4,5,6,7,8,9,10,12,14,22,23,25,26,27,28];
  let buildingCSI    : [Nat] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,21,22,23,25,26,27,28];
  let heavyCSI       : [Nat] = [1,2,3,4,5,31,32,33,34,35];
  let industrialCSI  : [Nat] = [1,2,3,4,5,11,13,15,22,23,25,26,28,40,41,43,44,46,48];
  let syndicatedCSI  : [Nat] = [1,2,3,4,5,6,7,8,9,10,12,14,22,23,25,26,27,28];
  let publicCSI      : [Nat] = [1,2,3,4,5,7,8,9,10,11,12,13,14,21,22,23,25,26,27,28];
  let duplexCSI      : [Nat] = [1,2,3,4,5,6,7,8,9,10,12,14,22,23,25,26,27,28];
  let renovationCSI  : [Nat] = [1,2,3,4,5,6,7,8,9,10,12,22,23,26,28];
  let remodelingCSI  : [Nat] = [1,6,7,8,9,10,12,22,23,25,26,32];
  let arbCSI         : [Nat] = [1,2,31,32];
  let hortCSI        : [Nat] = [1,2,11,22,31,32,33];
  let farmCSI        : [Nat] = [1,2,3,4,5,11,22,31,32,33];
  let munCSI         : [Nat] = [1,2,3,22,26,31,32,33,34];
  let signalsCSI     : [Nat] = [1,2,26,27,28,31,32,34];
  let pubHwyCSI      : [Nat] = [1,2,3,4,5,26,31,32,33,34];
  let privHwyCSI     : [Nat] = [1,2,3,4,5,31,32,33,34];

  // ─── Category data ───────────────────────────────────────────────────────
  // Subtopics use inline record literals (M0014: no function calls in
  // module-level let bindings).

  public let all : [Category] = [
    {
      id = "residential";
      name = "Residential Projects";
      subtopics = [
        { id = "single-family";      name = "Single-Family Homes";                 defaultPhases = residentialPhases; defaultCostCodeDivisions = residentialCSI },
        { id = "multi-family";       name = "Multi-Family Housing";                 defaultPhases = residentialPhases; defaultCostCodeDivisions = residentialCSI },
        { id = "condos-townhomes";   name = "Condominiums & Townhomes";             defaultPhases = residentialPhases; defaultCostCodeDivisions = residentialCSI },
        { id = "manufactured";       name = "Manufactured & Modular Homes";         defaultPhases = residentialPhases; defaultCostCodeDivisions = residentialCSI },
        { id = "custom-home";        name = "Custom Home Construction";             defaultPhases = residentialPhases; defaultCostCodeDivisions = residentialCSI },
        { id = "adu";                name = "Accessory Dwelling Units (ADUs)";      defaultPhases = residentialPhases; defaultCostCodeDivisions = residentialCSI },
        { id = "senior-living";      name = "Senior & Assisted Living Housing";     defaultPhases = residentialPhases; defaultCostCodeDivisions = residentialCSI },
        { id = "affordable-housing"; name = "Affordable Housing Developments";      defaultPhases = residentialPhases; defaultCostCodeDivisions = residentialCSI },
      ];
    },
    {
      id = "building-construction";
      name = "Building Construction Projects";
      subtopics = [
        { id = "office-buildings";   name = "Commercial Office Buildings";         defaultPhases = commercialPhases; defaultCostCodeDivisions = buildingCSI },
        { id = "retail-shopping";    name = "Retail & Shopping Centers";            defaultPhases = commercialPhases; defaultCostCodeDivisions = buildingCSI },
        { id = "hotels-hospitality"; name = "Hotels & Hospitality";                 defaultPhases = commercialPhases; defaultCostCodeDivisions = buildingCSI },
        { id = "mixed-use";          name = "Mixed-Use Developments";               defaultPhases = commercialPhases; defaultCostCodeDivisions = buildingCSI },
        { id = "educational";        name = "Educational Facilities";               defaultPhases = commercialPhases; defaultCostCodeDivisions = buildingCSI },
        { id = "healthcare";         name = "Healthcare Facilities";                defaultPhases = commercialPhases; defaultCostCodeDivisions = buildingCSI },
        { id = "religious-cultural"; name = "Religious & Cultural Buildings";       defaultPhases = commercialPhases; defaultCostCodeDivisions = buildingCSI },
        { id = "sports-recreation";  name = "Sports & Recreation Facilities";       defaultPhases = commercialPhases; defaultCostCodeDivisions = buildingCSI },
      ];
    },
    {
      id = "heavy-construction";
      name = "Heavy Construction Projects";
      subtopics = [
        { id = "dams-reservoirs";    name = "Dams & Reservoirs";                    defaultPhases = heavyPhases; defaultCostCodeDivisions = heavyCSI },
        { id = "tunnels";            name = "Tunnels & Underground Structures";      defaultPhases = heavyPhases; defaultCostCodeDivisions = heavyCSI },
        { id = "marine-port";        name = "Marine & Port Construction";            defaultPhases = heavyPhases; defaultCostCodeDivisions = heavyCSI },
        { id = "airports-runways";   name = "Airports & Runways";                    defaultPhases = heavyPhases; defaultCostCodeDivisions = heavyCSI },
        { id = "rail-transit";       name = "Rail & Transit Systems";                defaultPhases = heavyPhases; defaultCostCodeDivisions = heavyCSI },
        { id = "flood-control";      name = "Flood Control & Levees";                defaultPhases = heavyPhases; defaultCostCodeDivisions = heavyCSI },
        { id = "deep-foundation";    name = "Deep Foundation & Excavation";          defaultPhases = heavyPhases; defaultCostCodeDivisions = heavyCSI },
        { id = "site-grading";       name = "Large-Scale Site Grading";              defaultPhases = heavyPhases; defaultCostCodeDivisions = heavyCSI },
      ];
    },
    {
      id = "industrial";
      name = "Industrial Construction Projects";
      subtopics = [
        { id = "manufacturing";      name = "Manufacturing Plants & Factories";      defaultPhases = industrialPhases; defaultCostCodeDivisions = industrialCSI },
        { id = "oil-gas";            name = "Oil & Gas Refineries";                  defaultPhases = industrialPhases; defaultCostCodeDivisions = industrialCSI },
        { id = "power-generation";   name = "Power Generation Facilities";           defaultPhases = industrialPhases; defaultCostCodeDivisions = industrialCSI },
        { id = "chemical-plants";    name = "Chemical & Petrochemical Plants";       defaultPhases = industrialPhases; defaultCostCodeDivisions = industrialCSI },
        { id = "warehousing";        name = "Warehousing & Distribution Centers";    defaultPhases = industrialPhases; defaultCostCodeDivisions = industrialCSI },
        { id = "data-centers";       name = "Data Centers";                          defaultPhases = industrialPhases; defaultCostCodeDivisions = industrialCSI },
        { id = "water-treatment";    name = "Water & Wastewater Treatment Plants";   defaultPhases = industrialPhases; defaultCostCodeDivisions = industrialCSI },
        { id = "mining";             name = "Mining & Processing Facilities";        defaultPhases = industrialPhases; defaultCostCodeDivisions = industrialCSI },
      ];
    },
    {
      id = "syndicated-real-estate";
      name = "Syndicated Real Estate Projects";
      subtopics = [
        { id = "reits";              name = "Real Estate Investment Trusts (REITs)"; defaultPhases = commercialPhases;  defaultCostCodeDivisions = syndicatedCSI },
        { id = "private-equity";     name = "Private Equity Real Estate Funds";      defaultPhases = commercialPhases;  defaultCostCodeDivisions = syndicatedCSI },
        { id = "crowdfunded";        name = "Crowdfunded Development Projects";      defaultPhases = commercialPhases;  defaultCostCodeDivisions = syndicatedCSI },
        { id = "joint-venture";      name = "Joint Venture Partnerships";            defaultPhases = commercialPhases;  defaultCostCodeDivisions = syndicatedCSI },
        { id = "mixed-income-syn";   name = "Mixed-Income Housing Syndications";     defaultPhases = residentialPhases; defaultCostCodeDivisions = syndicatedCSI },
        { id = "commercial-syn";     name = "Commercial Property Syndications";      defaultPhases = commercialPhases;  defaultCostCodeDivisions = syndicatedCSI },
        { id = "lihtc";              name = "Tax Credit Housing (LIHTC)";            defaultPhases = residentialPhases; defaultCostCodeDivisions = syndicatedCSI },
        { id = "opportunity-zone";   name = "Opportunity Zone Developments";         defaultPhases = commercialPhases;  defaultCostCodeDivisions = syndicatedCSI },
      ];
    },
    {
      id = "public-government";
      name = "Public and Government Projects";
      subtopics = [
        { id = "federal-buildings";  name = "Federal Building Construction";         defaultPhases = commercialPhases; defaultCostCodeDivisions = publicCSI },
        { id = "courthouses";        name = "State & County Courthouses";            defaultPhases = commercialPhases; defaultCostCodeDivisions = publicCSI },
        { id = "military";           name = "Military Facilities & Bases";           defaultPhases = commercialPhases; defaultCostCodeDivisions = publicCSI },
        { id = "post-office-civic";  name = "Post Offices & Civic Centers";          defaultPhases = commercialPhases; defaultCostCodeDivisions = publicCSI },
        { id = "libraries-museums";  name = "Public Libraries & Museums";            defaultPhases = commercialPhases; defaultCostCodeDivisions = publicCSI },
        { id = "correctional";       name = "Correctional Facilities";               defaultPhases = commercialPhases; defaultCostCodeDivisions = publicCSI },
        { id = "emergency-services"; name = "Emergency Services Facilities";         defaultPhases = commercialPhases; defaultCostCodeDivisions = publicCSI },
        { id = "govt-research";      name = "Government Research Facilities";        defaultPhases = commercialPhases; defaultCostCodeDivisions = publicCSI },
      ];
    },
    {
      id = "duplex-apartment";
      name = "Duplex Apartment Building Projects";
      subtopics = [
        { id = "duplex-triplex";     name = "Duplex & Triplex Construction";             defaultPhases = residentialPhases; defaultCostCodeDivisions = duplexCSI },
        { id = "garden-style";       name = "Garden-Style Apartment Complexes";          defaultPhases = residentialPhases; defaultCostCodeDivisions = duplexCSI },
        { id = "mid-rise-apt";       name = "Mid-Rise Apartment Buildings";              defaultPhases = commercialPhases;  defaultCostCodeDivisions = duplexCSI },
        { id = "high-rise-apt";      name = "High-Rise Residential Towers";              defaultPhases = commercialPhases;  defaultCostCodeDivisions = duplexCSI },
        { id = "student-housing";    name = "Student Housing";                           defaultPhases = residentialPhases; defaultCostCodeDivisions = duplexCSI },
        { id = "mixed-income-apt";   name = "Mixed-Income Apartment Developments";       defaultPhases = residentialPhases; defaultCostCodeDivisions = duplexCSI },
        { id = "urban-infill";       name = "Urban Infill Apartment Projects";           defaultPhases = commercialPhases;  defaultCostCodeDivisions = duplexCSI },
        { id = "transit-oriented";   name = "Transit-Oriented Residential Developments"; defaultPhases = commercialPhases;  defaultCostCodeDivisions = duplexCSI },
      ];
    },
    {
      id = "renovation";
      name = "Renovation Projects";
      subtopics = [
        { id = "historical";         name = "Historical Building Restoration";        defaultPhases = renovationPhases; defaultCostCodeDivisions = renovationCSI },
        { id = "structural-reno";    name = "Structural Renovation & Reinforcement";  defaultPhases = renovationPhases; defaultCostCodeDivisions = renovationCSI },
        { id = "mep-upgrades";       name = "MEP Systems Upgrades";                   defaultPhases = renovationPhases; defaultCostCodeDivisions = renovationCSI },
        { id = "facade-reno";        name = "Facade Renovation";                      defaultPhases = renovationPhases; defaultCostCodeDivisions = renovationCSI },
        { id = "space-reconfig";     name = "Interior Space Reconfiguration";         defaultPhases = renovationPhases; defaultCostCodeDivisions = renovationCSI },
        { id = "ada-compliance";     name = "ADA Compliance Upgrades";                defaultPhases = renovationPhases; defaultCostCodeDivisions = renovationCSI },
        { id = "seismic-retrofit";   name = "Seismic Retrofit & Hardening";           defaultPhases = renovationPhases; defaultCostCodeDivisions = renovationCSI },
        { id = "roof-envelope";      name = "Roof Replacement & Envelope Repair";     defaultPhases = renovationPhases; defaultCostCodeDivisions = renovationCSI },
      ];
    },
    {
      id = "remodeling";
      name = "Remodeling Projects";
      subtopics = [
        { id = "kitchen-bath";        name = "Kitchen & Bathroom Remodeling";          defaultPhases = reModelingPhases; defaultCostCodeDivisions = remodelingCSI },
        { id = "basement-attic";      name = "Basement & Attic Conversion";            defaultPhases = reModelingPhases; defaultCostCodeDivisions = remodelingCSI },
        { id = "room-additions";      name = "Room Additions & Extensions";            defaultPhases = reModelingPhases; defaultCostCodeDivisions = remodelingCSI },
        { id = "tenant-improve";      name = "Commercial Space Tenant Improvements";   defaultPhases = reModelingPhases; defaultCostCodeDivisions = remodelingCSI },
        { id = "floor-plan-reconfig"; name = "Floor Plan Reconfiguration";             defaultPhases = reModelingPhases; defaultCostCodeDivisions = remodelingCSI },
        { id = "energy-efficiency";   name = "Energy Efficiency Upgrades";             defaultPhases = reModelingPhases; defaultCostCodeDivisions = remodelingCSI },
        { id = "smart-home";          name = "Smart Home Integration";                 defaultPhases = reModelingPhases; defaultCostCodeDivisions = remodelingCSI },
        { id = "landscaping";         name = "Exterior Landscaping & Hardscaping";     defaultPhases = reModelingPhases; defaultCostCodeDivisions = remodelingCSI },
      ];
    },
    {
      id = "forestry-arboriculture";
      name = "Forestry & Arboriculture/Ornithology Projects";
      subtopics = [
        { id = "tree-removal";       name = "Tree Removal & Hazard Mitigation";                        defaultPhases = forestryPhases; defaultCostCodeDivisions = arbCSI },
        { id = "canopy-mgmt";        name = "Urban Tree Canopy Management";                            defaultPhases = forestryPhases; defaultCostCodeDivisions = arbCSI },
        { id = "arborist-assess";    name = "Arborist Assessments & Tree Preservation Plans";          defaultPhases = forestryPhases; defaultCostCodeDivisions = arbCSI },
        { id = "reforestation";      name = "Reforestation & Afforestation Programs";                  defaultPhases = forestryPhases; defaultCostCodeDivisions = arbCSI },
        { id = "wildlife-habitat";   name = "Wildlife Habitat Construction";                           defaultPhases = forestryPhases; defaultCostCodeDivisions = arbCSI },
        { id = "avian-impact";       name = "Avian Impact Studies for Construction";                   defaultPhases = forestryPhases; defaultCostCodeDivisions = arbCSI },
        { id = "ornithological";     name = "Ornithological Survey Integration in Site Planning";      defaultPhases = forestryPhases; defaultCostCodeDivisions = arbCSI },
        { id = "green-buffer";       name = "Green Buffer Zone Development";                           defaultPhases = forestryPhases; defaultCostCodeDivisions = arbCSI },
      ];
    },
    {
      id = "forestry-horticultural";
      name = "Forestry & Horticultural Projects";
      subtopics = [
        { id = "nursery-greenhouse";  name = "Commercial Nursery & Greenhouse Construction";        defaultPhases = forestryPhases; defaultCostCodeDivisions = hortCSI },
        { id = "orchard-vineyard";    name = "Orchard & Vineyard Development";                      defaultPhases = forestryPhases; defaultCostCodeDivisions = hortCSI },
        { id = "botanical-garden";    name = "Landscape & Botanical Garden Construction";           defaultPhases = forestryPhases; defaultCostCodeDivisions = hortCSI },
        { id = "erosion-control";     name = "Soil Erosion Control & Revegetation";                 defaultPhases = forestryPhases; defaultCostCodeDivisions = hortCSI },
        { id = "irrigation";          name = "Irrigation System Installation";                      defaultPhases = forestryPhases; defaultCostCodeDivisions = hortCSI },
        { id = "forest-road";         name = "Forest Road Construction & Management";               defaultPhases = forestryPhases; defaultCostCodeDivisions = hortCSI },
        { id = "urban-agriculture";   name = "Urban Agriculture & Vertical Farming Facilities";    defaultPhases = forestryPhases; defaultCostCodeDivisions = hortCSI },
        { id = "wetland-restoration"; name = "Wetland Restoration & Planting Programs";             defaultPhases = forestryPhases; defaultCostCodeDivisions = hortCSI },
      ];
    },
    {
      id = "farming-land-grading";
      name = "Farming and Land Grading/Leveling";
      subtopics = [
        { id = "land-clearing";       name = "Agricultural Land Clearing";              defaultPhases = farmingPhases; defaultCostCodeDivisions = farmCSI },
        { id = "land-leveling";       name = "Precision Land Leveling for Irrigation";  defaultPhases = farmingPhases; defaultCostCodeDivisions = farmCSI },
        { id = "drainage-tile";       name = "Drainage Tile Installation";              defaultPhases = farmingPhases; defaultCostCodeDivisions = farmCSI },
        { id = "terracing";           name = "Terracing & Contour Grading";             defaultPhases = farmingPhases; defaultCostCodeDivisions = farmCSI },
        { id = "farm-building";       name = "Farm Building & Barn Construction";       defaultPhases = farmingPhases; defaultCostCodeDivisions = farmCSI },
        { id = "livestock-facility";  name = "Livestock Facility Construction";         defaultPhases = farmingPhases; defaultCostCodeDivisions = farmCSI },
        { id = "grain-storage";       name = "Grain Storage & Silo Construction";       defaultPhases = farmingPhases; defaultCostCodeDivisions = farmCSI },
        { id = "soil-amendment";      name = "Soil Amendment & Preparation Programs";   defaultPhases = farmingPhases; defaultCostCodeDivisions = farmCSI },
      ];
    },
    {
      id = "municipal-services";
      name = "Municipal Services Projects";
      subtopics = [
        { id = "water-distribution"; name = "Water Distribution System Construction";               defaultPhases = municipalPhases; defaultCostCodeDivisions = munCSI },
        { id = "sanitary-sewer";     name = "Sanitary Sewer System Installation";                  defaultPhases = municipalPhases; defaultCostCodeDivisions = munCSI },
        { id = "stormwater";         name = "Stormwater Management Infrastructure";                defaultPhases = municipalPhases; defaultCostCodeDivisions = munCSI },
        { id = "public-parks";       name = "Public Park & Recreation Development";               defaultPhases = municipalPhases; defaultCostCodeDivisions = munCSI },
        { id = "solid-waste";        name = "Solid Waste Management Facilities";                  defaultPhases = municipalPhases; defaultCostCodeDivisions = munCSI },
        { id = "transit-stops";      name = "Public Transit Stops & Shelters";                    defaultPhases = municipalPhases; defaultCostCodeDivisions = munCSI },
        { id = "street-lighting";    name = "Street Lighting & Electrical Utility Infrastructure"; defaultPhases = municipalPhases; defaultCostCodeDivisions = munCSI },
        { id = "fuel-fleet";         name = "Municipal Fuel & Fleet Facility Construction";       defaultPhases = municipalPhases; defaultCostCodeDivisions = munCSI },
      ];
    },
    {
      id = "street-signals-mapping";
      name = "Street Control Signals and City Mapping";
      subtopics = [
        { id = "traffic-signals";    name = "Traffic Signal Installation & Upgrades";                      defaultPhases = municipalPhases; defaultCostCodeDivisions = signalsCSI },
        { id = "its";                name = "Intelligent Transportation Systems (ITS)";                    defaultPhases = municipalPhases; defaultCostCodeDivisions = signalsCSI },
        { id = "pedestrian-signals"; name = "Pedestrian Crosswalk Signal Systems";                         defaultPhases = municipalPhases; defaultCostCodeDivisions = signalsCSI },
        { id = "school-zone";        name = "School Zone & Flashing Beacon Systems";                       defaultPhases = municipalPhases; defaultCostCodeDivisions = signalsCSI },
        { id = "gis-mapping";        name = "GIS City Mapping & Survey Integration";                       defaultPhases = municipalPhases; defaultCostCodeDivisions = signalsCSI },
        { id = "digital-asset-mgmt"; name = "Digital Asset Management for City Infrastructure";            defaultPhases = municipalPhases; defaultCostCodeDivisions = signalsCSI },
        { id = "fiber-optic";        name = "Fiber Optic & Communication Conduit for Traffic Systems";     defaultPhases = municipalPhases; defaultCostCodeDivisions = signalsCSI },
        { id = "smart-city";         name = "Smart City Sensor & Camera Network Installation";             defaultPhases = municipalPhases; defaultCostCodeDivisions = signalsCSI },
      ];
    },
    {
      id = "public-highways";
      name = "Public Highways/Roadways and Infrastructure";
      subtopics = [
        { id = "interstate";         name = "Interstate & Federal Highway Construction";           defaultPhases = highwayPhases; defaultCostCodeDivisions = pubHwyCSI },
        { id = "state-highway";      name = "State Highway & Arterial Road Construction";         defaultPhases = highwayPhases; defaultCostCodeDivisions = pubHwyCSI },
        { id = "interchange";        name = "Highway Interchange & On/Off Ramp Construction";     defaultPhases = highwayPhases; defaultCostCodeDivisions = pubHwyCSI },
        { id = "pavement-resurface"; name = "Pavement Resurfacing & Reconstruction";               defaultPhases = highwayPhases; defaultCostCodeDivisions = pubHwyCSI },
        { id = "highway-bridge";     name = "Highway Bridge Construction & Replacement";           defaultPhases = highwayPhases; defaultCostCodeDivisions = pubHwyCSI },
        { id = "sound-walls";        name = "Sound Walls & Retaining Structures";                  defaultPhases = highwayPhases; defaultCostCodeDivisions = pubHwyCSI },
        { id = "rest-areas";         name = "Rest Areas & Weigh Stations";                         defaultPhases = highwayPhases; defaultCostCodeDivisions = pubHwyCSI },
        { id = "highway-lighting";   name = "Highway Lighting & Signage Systems";                 defaultPhases = highwayPhases; defaultCostCodeDivisions = pubHwyCSI },
      ];
    },
    {
      id = "private-highways";
      name = "Private Highways and Roadways/Bridges";
      subtopics = [
        { id = "private-road";       name = "Private Road & Driveway Construction";                          defaultPhases = highwayPhases; defaultCostCodeDivisions = privHwyCSI },
        { id = "gated-community";    name = "Gated Community Road Networks";                                defaultPhases = highwayPhases; defaultCostCodeDivisions = privHwyCSI },
        { id = "industrial-access";  name = "Industrial Access Road Construction";                          defaultPhases = highwayPhases; defaultCostCodeDivisions = privHwyCSI },
        { id = "ranch-road";         name = "Agricultural & Ranch Road Development";                        defaultPhases = highwayPhases; defaultCostCodeDivisions = privHwyCSI },
        { id = "private-bridge";     name = "Privately Owned Bridge Construction";                          defaultPhases = highwayPhases; defaultCostCodeDivisions = privHwyCSI },
        { id = "toll-road";          name = "Toll Road & Managed Lane Development";                         defaultPhases = highwayPhases; defaultCostCodeDivisions = privHwyCSI },
        { id = "parking-structures"; name = "Private Parking Structures & Lots";                           defaultPhases = highwayPhases; defaultCostCodeDivisions = privHwyCSI },
        { id = "grade-crossing";     name = "Railroad Grade Crossing & Private Crossing Construction";      defaultPhases = highwayPhases; defaultCostCodeDivisions = privHwyCSI },
      ];
    },
  ];
};
