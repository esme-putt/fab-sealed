// FAB SEALED — Omens of the Third Age Sealed Practice Tool
import { useState, useMemo, useRef } from "react";

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const CARD_BACK = "https://fabdb2.imgix.net/cards/backs/cardback1.png";
const SCG = "https://scg-static.starcitygames.com/articles/2026/";
const LSS = "https://legendstory-production-s3-public.s3.amazonaws.com/media/cards/normal/";

const T = {
  bg:       "#08080f",
  surface:  "#111120",
  panel:    "#181828",
  border:   "#25253a",
  borderHi: "#3a3a58",
  accent:   "#e8a820",
  text:     "#ede8df",
  muted:    "#8b8fa8",
  dim:      "#4a4d64",
};

const RM = {
  T:  { label:"Token",    bg:"#0f2b1a", fg:"#4ade80", bd:"#4ade8044" },
  B:  { label:"Basic",   bg:"#211608", fg:"#d4aa70", bd:"#d4aa7066" },
  C:  { label:"Common",  bg:"#1a1a1a", fg:"#b8bfd0", bd:"#b8bfd033" },
  R:  { label:"Rare",    bg:"#0b1c34", fg:"#60a5fa", bd:"#60a5fa44" },
  M:  { label:"Majestic",bg:"#1a0c34", fg:"#c084fc", bd:"#c084fc66" },
  L:  { label:"Legendary",bg:"#2c1804",fg:"#fbbf24", bd:"#fbbf2466" },
  MV: { label:"Marvel",  bg:"#1d1206", fg:"#fde68a", bd:"#fde68a88" },
  F:  { label:"Fabled",  bg:"#2c0b0b", fg:"#f87171", bd:"#f8717166" },
};

// Foil treatment overlays (applied on top of any base rarity)
const FOIL = {
  RF:  { badge:"RF",  label:"Rainbow Foil", fg:"#fcd34d", bg:"#261800", glow:"#fcd34d33" },
  CF:  { badge:"CF",  label:"Cold Foil",    fg:"#93c5fd", bg:"#00142a", glow:"#93c5fd33" },
  EXP: { badge:"EXP", label:"Expansion",    fg:"#d8b4fe", bg:"#18002e", glow:"#d8b4fe33" },
};

const CLASS_ORDER = [
  "Lightning","Lightning Runeblade","Lightning Wizard","Lightning Illusionist",
  "Illusionist / Wizard","Illusionist","Wizard","Runeblade","Draconic",
  "Assassin","Brute","Guardian","Guardian / Warrior","Reviled Guardian",
  "Mechanologist","Ninja","Pirate Mechanologist","Pirate Ranger","Pirate Necromancer",
  "Ranger","Warrior","Light","Chaos","Generic","Token / Macro","Basic","Unrevealed",
];

const HEROES = [
  { id:"OMN047", name:"Aurora, Legacy of Tempest",      img:LSS+"OMN047.webp", cls:"Lightning Runeblade"   },
  { id:"OMN094", name:"Oscilio, Forked Continuum",       img:LSS+"OMN094.webp", cls:"Lightning Wizard"      },
  { id:"OMN001", name:"Zyggy Starlight",                 img:LSS+"OMN001.webp", cls:"Lightning Illusionist" },
];

// Pre-release promo pack — 12 cards (4 CF equipment, 1 MV GTS, 3 heroes, 3 weapons, 1 macro)
// Distributor lists as 10 because some are double-sided; we print each face separately
const PROMO_PACK = [
  { id:"pr-h1", name:"Aurora, Emissary of Lightning",  rarity:"B", img:LSS+"OMN048.webp", type:"Lightning Runeblade Hero - Young"   },
  { id:"pr-h2", name:"Oscilio, Scion of the Third Age",rarity:"B", img:LSS+"OMN095.webp", type:"Lightning Wizard Hero - Young"      },
  { id:"pr-h3", name:"Zyggy",                          rarity:"B", img:LSS+"OMN002.webp", type:"Lightning Illusionist Hero - Young" },
  { id:"pr-w1", name:"Scorpio, Comet Tail",            rarity:"B", img:LSS+"OMN049.webp", type:"Lightning Runeblade Weapon - Sword (2H)" },
  { id:"pr-w2", name:"Volzar, Meteor Storm",           rarity:"B", img:LSS+"OMN096.webp", type:"Lightning Wizard Weapon - Staff (2H)" },
  { id:"pr-w3", name:"Aphrodias",                      rarity:"B", img:LSS+"OMN003.webp", type:"Lightning Illusionist Weapon - Orb (2H)" },
  { id:"pr-e1", name:"Helm of Astral Sanctuary",       rarity:"C", img:LSS+"OMN209.webp", type:"Generic Equipment - Head"   },
  { id:"pr-e2", name:"Robe of Astral Sanctuary",       rarity:"C", img:LSS+"OMN210.webp", type:"Generic Equipment - Chest"  },
  { id:"pr-e3", name:"Gloves of Astral Sanctuary",     rarity:"C", img:LSS+"OMN211.webp", type:"Generic Equipment - Arms"   },
  { id:"pr-e4", name:"Boots of Astral Sanctuary",      rarity:"C", img:LSS+"OMN212.webp", type:"Generic Equipment - Legs"   },
  { id:"pr-c1", name:"Glide Through Starlight (1)",    rarity:"C", img:LSS+"OMN169.webp", type:"Lightning Action - Attack",  pitch:1 },
  { id:"pr-t1", name:"Omens of Arcana",                rarity:"B", img:LSS+"OMN227.webp", type:"Omens of the Third Age Macro" },
];

// ── Full OTA card list — sourced from @flesh-and-blood/cards npm package ──────
// All 251 cards, correct rarities. No placeholders needed.
const REVEALED = [
  {id:"OMN000",name:"Voltaris (3)",rarity:"F",img:LSS+"OMN000.webp",type:"Lightning Resource - Gem",pitch:3},
  {id:"OMN001",name:"Zyggy Starlight",rarity:"B",img:LSS+"OMN001.webp",type:"Lightning Illusionist Hero"},
  {id:"OMN002",name:"Zyggy",rarity:"B",img:LSS+"OMN002.webp",type:"Lightning Illusionist Hero - Young"},
  {id:"OMN003",name:"Aphrodias",rarity:"B",img:LSS+"OMN003.webp",type:"Lightning Illusionist Weapon - Orb (2H)"},
  {id:"OMN004",name:"Unwinding Finality (1)",rarity:"M",img:LSS+"OMN004.webp",type:"Lightning Illusionist Action - Attack",pitch:1},
  {id:"OMN005",name:"Flicker Reality (3)",rarity:"M",img:LSS+"OMN005.webp",type:"Lightning Illusionist Instant - Aura",pitch:3},
  {id:"OMN006",name:"Blink of an Eye (1)",rarity:"R",img:LSS+"OMN006.webp",type:"Lightning Illusionist Action - Attack",pitch:1},
  {id:"OMN007",name:"Fraying Lifeforce (1)",rarity:"R",img:LSS+"OMN007.webp",type:"Lightning Illusionist Action - Attack",pitch:1},
  {id:"OMN008",name:"Scattering Conflux (1)",rarity:"R",img:LSS+"OMN008.webp",type:"Lightning Illusionist Action - Attack",pitch:1},
  {id:"OMN009",name:"Polarus Pulse Ray (1)",rarity:"R",img:LSS+"OMN009.webp",type:"Lightning Illusionist Action - Attack",pitch:1},
  {id:"OMN010",name:"Polarus Pulse Ray (2)",rarity:"R",img:LSS+"OMN010.webp",type:"Lightning Illusionist Action - Attack",pitch:2},
  {id:"OMN011",name:"Polarus Pulse Ray (3)",rarity:"R",img:LSS+"OMN011.webp",type:"Lightning Illusionist Action - Attack",pitch:3},
  {id:"OMN012",name:"Corrosive Space Dust (1)",rarity:"R",img:LSS+"OMN012.webp",type:"Lightning Illusionist Instant - Aura",pitch:1},
  {id:"OMN013",name:"Corrosive Space Dust (2)",rarity:"R",img:LSS+"OMN013.webp",type:"Lightning Illusionist Instant - Aura",pitch:2},
  {id:"OMN014",name:"Corrosive Space Dust (3)",rarity:"R",img:LSS+"OMN014.webp",type:"Lightning Illusionist Instant - Aura",pitch:3},
  {id:"OMN015",name:"Cosmic Duality (1)",rarity:"C",img:LSS+"OMN015.webp",type:"Lightning Illusionist Action - Attack",pitch:1},
  {id:"OMN016",name:"Cosmic Duality (2)",rarity:"C",img:LSS+"OMN016.webp",type:"Lightning Illusionist Action - Attack",pitch:2},
  {id:"OMN017",name:"Cosmic Duality (3)",rarity:"C",img:LSS+"OMN017.webp",type:"Lightning Illusionist Action - Attack",pitch:3},
  {id:"OMN018",name:"Ebbing Arcstride (1)",rarity:"C",img:LSS+"OMN018.webp",type:"Lightning Illusionist Action - Attack",pitch:1},
  {id:"OMN019",name:"Ebbing Arcstride (2)",rarity:"C",img:LSS+"OMN019.webp",type:"Lightning Illusionist Action - Attack",pitch:2},
  {id:"OMN020",name:"Ebbing Arcstride (3)",rarity:"C",img:LSS+"OMN020.webp",type:"Lightning Illusionist Action - Attack",pitch:3},
  {id:"OMN021",name:"Pulsing Cardia (1)",rarity:"C",img:LSS+"OMN021.webp",type:"Lightning Illusionist Action - Attack",pitch:1},
  {id:"OMN022",name:"Pulsing Cardia (2)",rarity:"C",img:LSS+"OMN022.webp",type:"Lightning Illusionist Action - Attack",pitch:2},
  {id:"OMN023",name:"Pulsing Cardia (3)",rarity:"C",img:LSS+"OMN023.webp",type:"Lightning Illusionist Action - Attack",pitch:3},
  {id:"OMN024",name:"Shattering Flowtide (1)",rarity:"C",img:LSS+"OMN024.webp",type:"Lightning Illusionist Action - Attack",pitch:1},
  {id:"OMN025",name:"Shattering Flowtide (2)",rarity:"C",img:LSS+"OMN025.webp",type:"Lightning Illusionist Action - Attack",pitch:2},
  {id:"OMN026",name:"Shattering Flowtide (3)",rarity:"C",img:LSS+"OMN026.webp",type:"Lightning Illusionist Action - Attack",pitch:3},
  {id:"OMN027",name:"Auric Shards (1)",rarity:"C",img:LSS+"OMN027.webp",type:"Lightning Illusionist Instant - Aura",pitch:1},
  {id:"OMN028",name:"Auric Shards (2)",rarity:"C",img:LSS+"OMN028.webp",type:"Lightning Illusionist Instant - Aura",pitch:2},
  {id:"OMN029",name:"Auric Shards (3)",rarity:"C",img:LSS+"OMN029.webp",type:"Lightning Illusionist Instant - Aura",pitch:3},
  {id:"OMN030",name:"Holo Shield (1)",rarity:"C",img:LSS+"OMN030.webp",type:"Lightning Illusionist Instant - Aura",pitch:1},
  {id:"OMN031",name:"Holo Shield (2)",rarity:"C",img:LSS+"OMN031.webp",type:"Lightning Illusionist Instant - Aura",pitch:2},
  {id:"OMN032",name:"Holo Shield (3)",rarity:"C",img:LSS+"OMN032.webp",type:"Lightning Illusionist Instant - Aura",pitch:3},
  {id:"OMN033",name:"Circular Flowtide (2)",rarity:"C",img:LSS+"OMN033.webp",type:"Lightning Illusionist Instant - Aura",pitch:2},
  {id:"OMN034",name:"Elliptical Conflux (2)",rarity:"C",img:LSS+"OMN034.webp",type:"Lightning Illusionist Instant - Aura",pitch:2},
  {id:"OMN035",name:"Nebulus Cycle (2)",rarity:"C",img:LSS+"OMN035.webp",type:"Lightning Illusionist Instant - Aura",pitch:2},
  {id:"OMN036",name:"Crackle from Afar (3)",rarity:"C",img:LSS+"OMN036.webp",type:"Lightning Illusionist Instant - Aura",pitch:3},
  {id:"OMN037",name:"Fleeing Starbreeze (3)",rarity:"C",img:LSS+"OMN037.webp",type:"Lightning Illusionist Instant - Aura",pitch:3},
  {id:"OMN038",name:"Nourishing Glow (3)",rarity:"C",img:LSS+"OMN038.webp",type:"Lightning Illusionist Instant - Aura",pitch:3},
  {id:"OMN039",name:"Fingers of Fragmentation",rarity:"C",img:LSS+"OMN039.webp",type:"Illusionist Equipment - Arms"},
  {id:"OMN040",name:"Fractal Creation (3)",rarity:"M",img:LSS+"OMN040.webp",type:"Illusionist Action - Attack",pitch:3},
  {id:"OMN041",name:"Clear Conscience (1)",rarity:"R",img:LSS+"OMN041.webp",type:"Illusionist Action - Attack",pitch:1},
  {id:"OMN042",name:"Clear Conscience (2)",rarity:"R",img:LSS+"OMN042.webp",type:"Illusionist Action - Attack",pitch:2},
  {id:"OMN043",name:"Clear Conscience (3)",rarity:"R",img:LSS+"OMN043.webp",type:"Illusionist Action - Attack",pitch:3},
  {id:"OMN044",name:"Erode Authority (1)",rarity:"R",img:LSS+"OMN044.webp",type:"Illusionist Action - Attack",pitch:1},
  {id:"OMN045",name:"Erode Authority (2)",rarity:"R",img:LSS+"OMN045.webp",type:"Illusionist Action - Attack",pitch:2},
  {id:"OMN046",name:"Erode Authority (3)",rarity:"R",img:LSS+"OMN046.webp",type:"Illusionist Action - Attack",pitch:3},
  {id:"OMN047",name:"Aurora, Legacy of Tempest",rarity:"B",img:LSS+"OMN047.webp",type:"Lightning Runeblade Hero"},
  {id:"OMN048",name:"Aurora, Emissary of Lightning",rarity:"B",img:LSS+"OMN048.webp",type:"Lightning Runeblade Hero - Young"},
  {id:"OMN049",name:"Scorpio, Comet Tail",rarity:"B",img:LSS+"OMN049.webp",type:"Lightning Runeblade Weapon - Sword (2H)"},
  {id:"OMN050",name:"Snap Fingers",rarity:"C",img:LSS+"OMN050.webp",type:"Lightning Runeblade Equipment - Arms"},
  {id:"OMN051",name:"Tempestuous Kiss (1)",rarity:"M",img:LSS+"OMN051.webp",type:"Lightning Runeblade Action - Attack",pitch:1},
  {id:"OMN052",name:"Arcanic Reproach (3)",rarity:"M",img:LSS+"OMN052.webp",type:"Lightning Runeblade Instant - Aura",pitch:3},
  {id:"OMN053",name:"Dashing Flashfoot (2)",rarity:"R",img:LSS+"OMN053.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN054",name:"Electryn Mindmeld (2)",rarity:"R",img:LSS+"OMN054.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN055",name:"Prophetic Quickstep (2)",rarity:"R",img:LSS+"OMN055.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN056",name:"Stinging Sprite (1)",rarity:"R",img:LSS+"OMN056.webp",type:"Lightning Runeblade Action - Attack",pitch:1},
  {id:"OMN057",name:"Stinging Sprite (2)",rarity:"R",img:LSS+"OMN057.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN058",name:"Stinging Sprite (3)",rarity:"R",img:LSS+"OMN058.webp",type:"Lightning Runeblade Action - Attack",pitch:3},
  {id:"OMN059",name:"Mercurial Skies (1)",rarity:"R",img:LSS+"OMN059.webp",type:"Lightning Runeblade Action",pitch:1},
  {id:"OMN060",name:"Mercurial Skies (2)",rarity:"R",img:LSS+"OMN060.webp",type:"Lightning Runeblade Action",pitch:2},
  {id:"OMN061",name:"Mercurial Skies (3)",rarity:"R",img:LSS+"OMN061.webp",type:"Lightning Runeblade Action",pitch:3},
  {id:"OMN062",name:"Destructive Fleetfoot (1)",rarity:"C",img:LSS+"OMN062.webp",type:"Lightning Runeblade Action - Attack",pitch:1},
  {id:"OMN063",name:"Destructive Fleetfoot (2)",rarity:"C",img:LSS+"OMN063.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN064",name:"Destructive Fleetfoot (3)",rarity:"C",img:LSS+"OMN064.webp",type:"Lightning Runeblade Action - Attack",pitch:3},
  {id:"OMN065",name:"Path of Same Ends (1)",rarity:"C",img:LSS+"OMN065.webp",type:"Lightning Runeblade Action - Attack",pitch:1},
  {id:"OMN066",name:"Path of Same Ends (2)",rarity:"C",img:LSS+"OMN066.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN067",name:"Path of Same Ends (3)",rarity:"C",img:LSS+"OMN067.webp",type:"Lightning Runeblade Action - Attack",pitch:3},
  {id:"OMN068",name:"Rush of Power (1)",rarity:"C",img:LSS+"OMN068.webp",type:"Lightning Runeblade Action - Attack",pitch:1},
  {id:"OMN069",name:"Rush of Power (2)",rarity:"C",img:LSS+"OMN069.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN070",name:"Rush of Power (3)",rarity:"C",img:LSS+"OMN070.webp",type:"Lightning Runeblade Action - Attack",pitch:3},
  {id:"OMN071",name:"Singeing Flowstride (1)",rarity:"C",img:LSS+"OMN071.webp",type:"Lightning Runeblade Action - Attack",pitch:1},
  {id:"OMN072",name:"Singeing Flowstride (2)",rarity:"C",img:LSS+"OMN072.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN073",name:"Singeing Flowstride (3)",rarity:"C",img:LSS+"OMN073.webp",type:"Lightning Runeblade Action - Attack",pitch:3},
  {id:"OMN074",name:"Stunning Swipe (1)",rarity:"C",img:LSS+"OMN074.webp",type:"Lightning Runeblade Action - Attack",pitch:1},
  {id:"OMN075",name:"Stunning Swipe (2)",rarity:"C",img:LSS+"OMN075.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN076",name:"Stunning Swipe (3)",rarity:"C",img:LSS+"OMN076.webp",type:"Lightning Runeblade Action - Attack",pitch:3},
  {id:"OMN077",name:"Voltbound Duality (1)",rarity:"C",img:LSS+"OMN077.webp",type:"Lightning Runeblade Action - Attack",pitch:1},
  {id:"OMN078",name:"Voltbound Duality (2)",rarity:"C",img:LSS+"OMN078.webp",type:"Lightning Runeblade Action - Attack",pitch:2},
  {id:"OMN079",name:"Voltbound Duality (3)",rarity:"C",img:LSS+"OMN079.webp",type:"Lightning Runeblade Action - Attack",pitch:3},
  {id:"OMN080",name:"Electryn Joltstep (1)",rarity:"C",img:LSS+"OMN080.webp",type:"Lightning Runelbade Action",pitch:1},
  {id:"OMN081",name:"Electryn Joltstep (2)",rarity:"C",img:LSS+"OMN081.webp",type:"Lightning Runelbade Action",pitch:2},
  {id:"OMN082",name:"Electryn Joltstep (3)",rarity:"C",img:LSS+"OMN082.webp",type:"Lightning Runelbade Action",pitch:3},
  {id:"OMN083",name:"Quick Succession (1)",rarity:"C",img:LSS+"OMN083.webp",type:"Lightning Runelbade Action",pitch:1},
  {id:"OMN084",name:"Quick Succession (2)",rarity:"C",img:LSS+"OMN084.webp",type:"Lightning Runelbade Action",pitch:2},
  {id:"OMN085",name:"Quick Succession (3)",rarity:"C",img:LSS+"OMN085.webp",type:"Lightning Runelbade Action",pitch:3},
  {id:"OMN086",name:"Gauntlet of Sword and Sorcery",rarity:"L",img:LSS+"OMN086.webp",type:"Runeblade Equipment - Arms"},
  {id:"OMN087",name:"Caress of the Reaper (1)",rarity:"M",img:LSS+"OMN087.webp",type:"Runeblade Action - Attack",pitch:1},
  {id:"OMN088",name:"Arcanic Cunning (1)",rarity:"R",img:LSS+"OMN088.webp",type:"Runeblade Action - Attack",pitch:1},
  {id:"OMN089",name:"Arcanic Cunning (2)",rarity:"R",img:LSS+"OMN089.webp",type:"Runeblade Action - Attack",pitch:2},
  {id:"OMN090",name:"Arcanic Cunning (3)",rarity:"R",img:LSS+"OMN090.webp",type:"Runeblade Action - Attack",pitch:3},
  {id:"OMN091",name:"Leech Memory (1)",rarity:"R",img:LSS+"OMN091.webp",type:"Runeblade Action",pitch:1},
  {id:"OMN092",name:"Leech Renown (1)",rarity:"R",img:LSS+"OMN092.webp",type:"Runeblade Action",pitch:1},
  {id:"OMN093",name:"Leech Vitality (1)",rarity:"R",img:LSS+"OMN093.webp",type:"Runeblade Action",pitch:1},
  {id:"OMN094",name:"Oscilio, Forked Continuum",rarity:"B",img:LSS+"OMN094.webp",type:"Lightning Wizard Hero"},
  {id:"OMN095",name:"Oscilio, Scion of the Third Age",rarity:"B",img:LSS+"OMN095.webp",type:"Lightning Wizard Hero - Young"},
  {id:"OMN096",name:"Volzar, Meteor Storm",rarity:"B",img:LSS+"OMN096.webp",type:"Lightning Wizard Weapon - Staff (2H)"},
  {id:"OMN097",name:"Constella Waves",rarity:"C",img:LSS+"OMN097.webp",type:"Lightning Wizard Equipment - Arms"},
  {id:"OMN098",name:"Astral Bridge (1)",rarity:"M",img:LSS+"OMN098.webp",type:"Lightning Wizard Instant",pitch:1},
  {id:"OMN099",name:"Echoflash (2)",rarity:"M",img:LSS+"OMN099.webp",type:"Lightning Wizard Instant",pitch:2},
  {id:"OMN100",name:"Arc Ramp (1)",rarity:"R",img:LSS+"OMN100.webp",type:"Lightning Wizard Action",pitch:1},
  {id:"OMN101",name:"Arc Ramp (2)",rarity:"R",img:LSS+"OMN101.webp",type:"Lightning Wizard Action",pitch:2},
  {id:"OMN102",name:"Arc Ramp (3)",rarity:"R",img:LSS+"OMN102.webp",type:"Lightning Wizard Action",pitch:3},
  {id:"OMN103",name:"Core Reaction (1)",rarity:"R",img:LSS+"OMN103.webp",type:"Lightning Wizard Instant - Aura",pitch:1},
  {id:"OMN104",name:"Core Reaction (2)",rarity:"R",img:LSS+"OMN104.webp",type:"Lightning Wizard Instant - Aura",pitch:2},
  {id:"OMN105",name:"Core Reaction (3)",rarity:"R",img:LSS+"OMN105.webp",type:"Lightning Wizard Instant - Aura",pitch:3},
  {id:"OMN106",name:"Flash Bolt (1)",rarity:"R",img:LSS+"OMN106.webp",type:"Lightning Wizard Instant",pitch:1},
  {id:"OMN107",name:"Flash Bolt (2)",rarity:"R",img:LSS+"OMN107.webp",type:"Lightning Wizard Instant",pitch:2},
  {id:"OMN108",name:"Flash Bolt (3)",rarity:"R",img:LSS+"OMN108.webp",type:"Lightning Wizard Instant",pitch:3},
  {id:"OMN109",name:"Comet Collision (1)",rarity:"R",img:LSS+"OMN109.webp",type:"Lightning Wizard Instant",pitch:1},
  {id:"OMN110",name:"Comet Collision (2)",rarity:"R",img:LSS+"OMN110.webp",type:"Lightning Wizard Instant",pitch:2},
  {id:"OMN111",name:"Comet Collision (3)",rarity:"R",img:LSS+"OMN111.webp",type:"Lightning Wizard Instant",pitch:3},
  {id:"OMN112",name:"Enion Surge (1)",rarity:"C",img:LSS+"OMN112.webp",type:"Lightning Wizard Action",pitch:1},
  {id:"OMN113",name:"Enion Surge (2)",rarity:"C",img:LSS+"OMN113.webp",type:"Lightning Wizard Action",pitch:2},
  {id:"OMN114",name:"Enion Surge (3)",rarity:"C",img:LSS+"OMN114.webp",type:"Lightning Wizard Action",pitch:3},
  {id:"OMN115",name:"Lightning Overload (1)",rarity:"C",img:LSS+"OMN115.webp",type:"Lightning Wizard Action",pitch:1},
  {id:"OMN116",name:"Lightning Overload (2)",rarity:"C",img:LSS+"OMN116.webp",type:"Lightning Wizard Action",pitch:2},
  {id:"OMN117",name:"Lightning Overload (3)",rarity:"C",img:LSS+"OMN117.webp",type:"Lightning Wizard Action",pitch:3},
  {id:"OMN118",name:"Meteoric Impact (1)",rarity:"C",img:LSS+"OMN118.webp",type:"Lightning Wizard Action",pitch:1},
  {id:"OMN119",name:"Meteoric Impact (2)",rarity:"C",img:LSS+"OMN119.webp",type:"Lightning Wizard Action",pitch:2},
  {id:"OMN120",name:"Meteoric Impact (3)",rarity:"C",img:LSS+"OMN120.webp",type:"Lightning Wizard Action",pitch:3},
  {id:"OMN121",name:"Nebula Duality (1)",rarity:"C",img:LSS+"OMN121.webp",type:"Lightning Wizard Action",pitch:1},
  {id:"OMN122",name:"Nebula Duality (2)",rarity:"C",img:LSS+"OMN122.webp",type:"Lightning Wizard Action",pitch:2},
  {id:"OMN123",name:"Nebula Duality (3)",rarity:"C",img:LSS+"OMN123.webp",type:"Lightning Wizard Action",pitch:3},
  {id:"OMN124",name:"Tap Lessons Past (1)",rarity:"C",img:LSS+"OMN124.webp",type:"Lightning Wizard Action",pitch:1},
  {id:"OMN125",name:"Tap Lessons Past (2)",rarity:"C",img:LSS+"OMN125.webp",type:"Lightning Wizard Action",pitch:2},
  {id:"OMN126",name:"Tap Lessons Past (3)",rarity:"C",img:LSS+"OMN126.webp",type:"Lightning Wizard Action",pitch:3},
  {id:"OMN127",name:"Cosmic Suture (1)",rarity:"C",img:LSS+"OMN127.webp",type:"Lightning Wizard Instant",pitch:1},
  {id:"OMN128",name:"Cosmic Suture (2)",rarity:"C",img:LSS+"OMN128.webp",type:"Lightning Wizard Instant",pitch:2},
  {id:"OMN129",name:"Cosmic Suture (3)",rarity:"C",img:LSS+"OMN129.webp",type:"Lightning Wizard Instant",pitch:3},
  {id:"OMN130",name:"Constella Contemplation (2)",rarity:"C",img:LSS+"OMN130.webp",type:"Lightning Wizard Instant",pitch:2},
  {id:"OMN131",name:"Constella Flowslide (2)",rarity:"C",img:LSS+"OMN131.webp",type:"Lightning Wizard Instant",pitch:2},
  {id:"OMN132",name:"Constella Uplift (2)",rarity:"C",img:LSS+"OMN132.webp",type:"Lightning Wizard Instant",pitch:2},
  {id:"OMN133",name:"Tome of Quandaries (3)",rarity:"M",img:LSS+"OMN133.webp",type:"Wizard Instant",pitch:3},
  {id:"OMN134",name:"Aethersling (1)",rarity:"R",img:LSS+"OMN134.webp",type:"Wizard Action",pitch:1},
  {id:"OMN135",name:"Nucleus Aetherbolt (1)",rarity:"R",img:LSS+"OMN135.webp",type:"Wizard Action",pitch:1},
  {id:"OMN136",name:"Turn to Mindfire (1)",rarity:"R",img:LSS+"OMN136.webp",type:"Wizard Action",pitch:1},
  {id:"OMN137",name:"Haven Veil (1)",rarity:"R",img:LSS+"OMN137.webp",type:"Wizard Instant - Aura",pitch:1},
  {id:"OMN138",name:"Haven Veil (2)",rarity:"R",img:LSS+"OMN138.webp",type:"Wizard Instant - Aura",pitch:2},
  {id:"OMN139",name:"Haven Veil (3)",rarity:"R",img:LSS+"OMN139.webp",type:"Wizard Instant - Aura",pitch:3},
  {id:"OMN140",name:"Third Eye of the Sphinx",rarity:"L",img:LSS+"OMN140.webp",type:"Illusionist / Wizard Equipment - Head"},
  {id:"OMN141",name:"Plutonic Starplate",rarity:"L",img:LSS+"OMN141.webp",type:"Lightning Equipment - Chest"},
  {id:"OMN142",name:"Constella Tiara",rarity:"C",img:LSS+"OMN142.webp",type:"Lightning Equipment - Head"},
  {id:"OMN143",name:"Starflow Robes",rarity:"C",img:LSS+"OMN143.webp",type:"Lightning Equipment - Chest"},
  {id:"OMN144",name:"Laced Lightning",rarity:"C",img:LSS+"OMN144.webp",type:"Lightning Equipment - Legs"},
  {id:"OMN145",name:"Astral Strike (1)",rarity:"M",img:LSS+"OMN145.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN146",name:"Flowstate Embodiment (1)",rarity:"M",img:LSS+"OMN146.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN147",name:"Static Shelter (2)",rarity:"M",img:LSS+"OMN147.webp",type:"Lightning Defense Reaction",pitch:2},
  {id:"OMN148",name:"Beckoning Brilliance (1)",rarity:"R",img:LSS+"OMN148.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN149",name:"Flowshard Elemental (1)",rarity:"R",img:LSS+"OMN149.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN150",name:"Lightning Form (1)",rarity:"R",img:LSS+"OMN150.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN151",name:"Visionary of Orbits (1)",rarity:"R",img:LSS+"OMN151.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN152",name:"Flowing Stormstrike (1)",rarity:"R",img:LSS+"OMN152.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN153",name:"Meteoric Rise (1)",rarity:"R",img:LSS+"OMN153.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN154",name:"Voltic Impact (1)",rarity:"R",img:LSS+"OMN154.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN155",name:"Rift Breaker (1)",rarity:"R",img:LSS+"OMN155.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN156",name:"Rift Breaker (2)",rarity:"R",img:LSS+"OMN156.webp",type:"Lightning Action - Attack",pitch:2},
  {id:"OMN157",name:"Rift Breaker (3)",rarity:"R",img:LSS+"OMN157.webp",type:"Lightning Action - Attack",pitch:3},
  {id:"OMN158",name:"Flow Through (3)",rarity:"R",img:LSS+"OMN158.webp",type:"Lightning Instant",pitch:3},
  {id:"OMN159",name:"Livewire Press (1)",rarity:"R",img:LSS+"OMN159.webp",type:"Lightning Instant",pitch:1},
  {id:"OMN160",name:"Astral Assault (1)",rarity:"C",img:LSS+"OMN160.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN161",name:"Astral Assault (2)",rarity:"C",img:LSS+"OMN161.webp",type:"Lightning Action - Attack",pitch:2},
  {id:"OMN162",name:"Astral Assault (3)",rarity:"C",img:LSS+"OMN162.webp",type:"Lightning Action - Attack",pitch:3},
  {id:"OMN163",name:"Electrolyze (1)",rarity:"C",img:LSS+"OMN163.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN164",name:"Electrolyze (2)",rarity:"C",img:LSS+"OMN164.webp",type:"Lightning Action - Attack",pitch:2},
  {id:"OMN165",name:"Electrolyze (3)",rarity:"C",img:LSS+"OMN165.webp",type:"Lightning Action - Attack",pitch:3},
  {id:"OMN166",name:"Flittering Spike (1)",rarity:"C",img:LSS+"OMN166.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN167",name:"Flittering Spike (2)",rarity:"C",img:LSS+"OMN167.webp",type:"Lightning Action - Attack",pitch:2},
  {id:"OMN168",name:"Flittering Spike (3)",rarity:"C",img:LSS+"OMN168.webp",type:"Lightning Action - Attack",pitch:3},
  {id:"OMN169",name:"Glide Through Starlight (1)",rarity:"C",img:LSS+"OMN169.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN170",name:"Glide Through Starlight (2)",rarity:"C",img:LSS+"OMN170.webp",type:"Lightning Action - Attack",pitch:2},
  {id:"OMN171",name:"Glide Through Starlight (3)",rarity:"C",img:LSS+"OMN171.webp",type:"Lightning Action - Attack",pitch:3},
  {id:"OMN172",name:"Heaven's Claws (1)",rarity:"C",img:LSS+"OMN172.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN173",name:"Heaven's Claws (2)",rarity:"C",img:LSS+"OMN173.webp",type:"Lightning Action - Attack",pitch:2},
  {id:"OMN174",name:"Heaven's Claws (3)",rarity:"C",img:LSS+"OMN174.webp",type:"Lightning Action - Attack",pitch:3},
  {id:"OMN175",name:"Stellar Glide (1)",rarity:"C",img:LSS+"OMN175.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN176",name:"Stellar Glide (2)",rarity:"C",img:LSS+"OMN176.webp",type:"Lightning Action - Attack",pitch:2},
  {id:"OMN177",name:"Stellar Glide (3)",rarity:"C",img:LSS+"OMN177.webp",type:"Lightning Action - Attack",pitch:3},
  {id:"OMN178",name:"Volatile Fluxor (1)",rarity:"C",img:LSS+"OMN178.webp",type:"Lightning Action - Attack",pitch:1},
  {id:"OMN179",name:"Volatile Fluxor (2)",rarity:"C",img:LSS+"OMN179.webp",type:"Lightning Action - Attack",pitch:2},
  {id:"OMN180",name:"Volatile Fluxor (3)",rarity:"C",img:LSS+"OMN180.webp",type:"Lightning Action - Attack",pitch:3},
  {id:"OMN181",name:"Flittering Forcefield (1)",rarity:"C",img:LSS+"OMN181.webp",type:"Lightning Defense Reaction",pitch:1},
  {id:"OMN182",name:"Flittering Forcefield (2)",rarity:"C",img:LSS+"OMN182.webp",type:"Lightning Defense Reaction",pitch:2},
  {id:"OMN183",name:"Flittering Forcefield (3)",rarity:"C",img:LSS+"OMN183.webp",type:"Lightning Defense Reaction",pitch:3},
  {id:"OMN184",name:"Calmveil of Volthaven (1)",rarity:"C",img:LSS+"OMN184.webp",type:"Lightning Instant",pitch:1},
  {id:"OMN185",name:"Calmveil of Volthaven (2)",rarity:"C",img:LSS+"OMN185.webp",type:"Lightning Instant",pitch:2},
  {id:"OMN186",name:"Calmveil of Volthaven (3)",rarity:"C",img:LSS+"OMN186.webp",type:"Lightning Instant",pitch:3},
  {id:"OMN187",name:"Cosmic Flare (1)",rarity:"C",img:LSS+"OMN187.webp",type:"Lightning Instant",pitch:1},
  {id:"OMN188",name:"Starworld Warning (2)",rarity:"C",img:LSS+"OMN188.webp",type:"Lightning Instant",pitch:2},
  {id:"OMN189",name:"Starlight Road (3)",rarity:"C",img:LSS+"OMN189.webp",type:"Lightning Instant",pitch:3},
  {id:"OMN190",name:"Stormshard (1)",rarity:"C",img:LSS+"OMN190.webp",type:"Lightning Instant",pitch:1},
  {id:"OMN191",name:"Stormshatter (2)",rarity:"C",img:LSS+"OMN191.webp",type:"Lightning Instant",pitch:2},
  {id:"OMN192",name:"Stormwhirl (3)",rarity:"C",img:LSS+"OMN192.webp",type:"Lightning Instant",pitch:3},
  {id:"OMN193",name:"Chromatic Refinement (1)",rarity:"C",img:LSS+"OMN193.webp",type:"Lightning Instant - Aura",pitch:1},
  {id:"OMN194",name:"Chromatic Refinement (2)",rarity:"C",img:LSS+"OMN194.webp",type:"Lightning Instant - Aura",pitch:2},
  {id:"OMN195",name:"Chromatic Refinement (3)",rarity:"C",img:LSS+"OMN195.webp",type:"Lightning Instant - Aura",pitch:3},
  {id:"OMN196",name:"Thunderous Retort (1)",rarity:"C",img:LSS+"OMN196.webp",type:"Lightning Instant - Aura",pitch:1},
  {id:"OMN197",name:"Thunderous Retort (2)",rarity:"C",img:LSS+"OMN197.webp",type:"Lightning Instant - Aura",pitch:2},
  {id:"OMN198",name:"Thunderous Retort (3)",rarity:"C",img:LSS+"OMN198.webp",type:"Lightning Instant - Aura",pitch:3},
  {id:"OMN199",name:"Sigil of Astral Flow (3)",rarity:"C",img:LSS+"OMN199.webp",type:"Lightning Instant - Aura",pitch:3},
  {id:"OMN200",name:"Sigil of Lightning (3)",rarity:"C",img:LSS+"OMN200.webp",type:"Lightning Instant - Aura",pitch:3},
  {id:"OMN201",name:"Spellbane Sigil (3)",rarity:"C",img:LSS+"OMN201.webp",type:"Lightning Instant - Aura",pitch:3},
  {id:"OMN202",name:"Embodiment of Lightning",rarity:"B",img:LSS+"OMN202.webp",type:"Elemental Token - Aura"},
  {id:"OMN203",name:"Lightning Flow",rarity:"B",img:LSS+"OMN203.webp",type:"Elemental Token - Aura"},
  {id:"OMN204",name:"Boots of Omnis Ward",rarity:"L",img:LSS+"OMN204.webp",type:"Generic Equipment - Legs"},
  {id:"OMN205",name:"Seeker's Hood",rarity:"C",img:LSS+"OMN205.webp",type:"Generic Equipment - Head"},
  {id:"OMN206",name:"Seeker's Gilet",rarity:"C",img:LSS+"OMN206.webp",type:"Generic Equipment - Chest"},
  {id:"OMN207",name:"Seeker's Mitts",rarity:"C",img:LSS+"OMN207.webp",type:"Generic Equipment - Arms"},
  {id:"OMN208",name:"Seeker's Leggings",rarity:"C",img:LSS+"OMN208.webp",type:"Generic Equipment - Legs"},
  {id:"OMN209",name:"Helm of Astral Sanctuary",rarity:"C",img:LSS+"OMN209.webp",type:"Generic Equipment - Head"},
  {id:"OMN210",name:"Robe of Astral Sanctuary",rarity:"C",img:LSS+"OMN210.webp",type:"Generic Equipment - Chest"},
  {id:"OMN211",name:"Gloves of Astral Sanctuary",rarity:"C",img:LSS+"OMN211.webp",type:"Generic Equipment - Arms"},
  {id:"OMN212",name:"Boots of Astral Sanctuary",rarity:"C",img:LSS+"OMN212.webp",type:"Generic Equipment - Legs"},
  {id:"OMN213",name:"Browbeat (3)",rarity:"M",img:LSS+"OMN213.webp",type:"Generic Action - Attack",pitch:3},
  {id:"OMN214",name:"Step Between (1)",rarity:"M",img:LSS+"OMN214.webp",type:"Generic Action - Attack",pitch:1},
  {id:"OMN215",name:"Tempt Over (2)",rarity:"M",img:LSS+"OMN215.webp",type:"Generic Action - Attack",pitch:2},
  {id:"OMN216",name:"Ominous Aggression (1)",rarity:"R",img:LSS+"OMN216.webp",type:"Generic Instant",pitch:1},
  {id:"OMN217",name:"Ominous Excavation (3)",rarity:"R",img:LSS+"OMN217.webp",type:"Generic Instant",pitch:3},
  {id:"OMN218",name:"Ominous Respite (2)",rarity:"R",img:LSS+"OMN218.webp",type:"Generic Instant",pitch:2},
  {id:"OMN219",name:"Conflicting Thoughts (1)",rarity:"C",img:LSS+"OMN219.webp",type:"Generic Action - Attack",pitch:1},
  {id:"OMN220",name:"Conflicting Thoughts (2)",rarity:"C",img:LSS+"OMN220.webp",type:"Generic Action - Attack",pitch:2},
  {id:"OMN221",name:"Conflicting Thoughts (3)",rarity:"C",img:LSS+"OMN221.webp",type:"Generic Action - Attack",pitch:3},
  {id:"OMN222",name:"Brush Off (1)",rarity:"C",img:LSS+"OMN222.webp",type:"Generic Instant",pitch:1},
  {id:"OMN223",name:"Brush Off (2)",rarity:"C",img:LSS+"OMN223.webp",type:"Generic Instant",pitch:2},
  {id:"OMN224",name:"Brush Off (3)",rarity:"C",img:LSS+"OMN224.webp",type:"Generic Instant",pitch:3},
  {id:"OMN225",name:"Ponder",rarity:"B",img:LSS+"OMN225.webp",type:"Generic Token - Aura"},
  {id:"OMN226",name:"Cracked Bauble (2)",rarity:"B",img:LSS+"OMN226.webp",type:"Generic Resource",pitch:2},
  {id:"OMN227",name:"Omens of Arcana",rarity:"B",img:LSS+"OMN227.webp",type:"Omens of the Third Age Macro"},
  {id:"OMN228",name:"Unmake the Underlings (3)",rarity:"M",img:LSS+"OMN228.webp",type:"Assassin Action - Attack",pitch:3},
  {id:"OMN229",name:"Feral Instinct (2)",rarity:"M",img:LSS+"OMN229.webp",type:"Brute Action - Attack",pitch:2},
  {id:"OMN230",name:"Pile Driver",rarity:"M",img:LSS+"OMN230.webp",type:"Guardian Weapon - Log (2H)"},
  {id:"OMN231",name:"Swift Pickup (1)",rarity:"M",img:LSS+"OMN231.webp",type:"Ninja Action - Attack",pitch:1},
  {id:"OMN232",name:"Evasive Nageboshi (3)",rarity:"M",img:LSS+"OMN232.webp",type:"Ninja Instant - Shuriken Item",pitch:3},
  {id:"OMN233",name:"Razor Ring (3)",rarity:"M",img:LSS+"OMN233.webp",type:"Ninja Instant - Shuriken Item",pitch:3},
  {id:"OMN234",name:"Stun Star (3)",rarity:"M",img:LSS+"OMN234.webp",type:"Ninja Instant - Shuriken Item",pitch:3},
  {id:"OMN235",name:"Gear Turner (1)",rarity:"M",img:LSS+"OMN235.webp",type:"Mechanologist Action - Attack",pitch:1},
  {id:"OMN236",name:"Arcbane Grasp (3)",rarity:"M",img:LSS+"OMN236.webp",type:"Mechanologist Instant Equipment - Evo Base Arms",pitch:3},
  {id:"OMN237",name:"Settle the Bill (1)",rarity:"M",img:LSS+"OMN237.webp",type:"Ranger Action",pitch:1},
  {id:"OMN238",name:"Beckon Steel (3)",rarity:"M",img:LSS+"OMN238.webp",type:"Warrior Attack Reaction",pitch:3},
  {id:"OMN239",name:"Crash Site Salvage (2)",rarity:"M",img:LSS+"OMN239.webp",type:"Pirate Mechanologist Action - Attack",pitch:2},
  {id:"OMN240",name:"Golden Skull (2)",rarity:"M",img:LSS+"OMN240.webp",type:"Pirate Necromancer Action - Item",pitch:2},
  {id:"OMN241",name:"Red Lure Harpoon (3)",rarity:"M",img:LSS+"OMN241.webp",type:"Pirate Ranger Action - Arrow Attack",pitch:3},
  {id:"OMN242",name:"Fortitude of Anvilheim",rarity:"L",img:LSS+"OMN242.webp",type:"Guardian / Warrior Equipment - Off-Hand"},
  {id:"OMN243",name:"A Bit off the Side (1)",rarity:"M",img:LSS+"OMN243.webp",type:"Guardian / Warrior Action",pitch:1},
  {id:"OMN244",name:"Blessing of Aegis (2)",rarity:"M",img:LSS+"OMN244.webp",type:"Light Action - Aura",pitch:2},
  {id:"OMN245",name:"Draco Fire (1)",rarity:"M",img:LSS+"OMN245.webp",type:"Draconic Instant",pitch:1},
  {id:"OMN246",name:"Induce Panic (2)",rarity:"M",img:LSS+"OMN246.webp",type:"Chaos Block",pitch:2},
  {id:"OMN247",name:"Lionclaw Maul",rarity:"M",img:LSS+"OMN247.webp",type:"Reviled Guardian Weapon - Hammer Axe (1H)"},
  {id:"OMN248",name:"Starfield Veil",rarity:"M",img:LSS+"OMN248.webp",type:"Lightning Illusionist Equipment - Head"},
  {id:"OMN249",name:"Starfield Carapace",rarity:"M",img:LSS+"OMN249.webp",type:"Lightning Illusionist Equipment - Chest"},
  {id:"OMN250",name:"Starfield Touch",rarity:"M",img:LSS+"OMN250.webp",type:"Lightning Illusionist Equipment - Arms"},
];

// ── DATA SETUP ───────────────────────────────────────────────────────────────

function buildPool() {
  // All 251 cards are known — no placeholders needed
  return [...REVEALED];
}

const POOL = buildPool();
const BY   = { T:[], B:[], C:[], R:[], M:[], L:[], MV:[], F:[] };
POOL.forEach(c => { if (BY[c.rarity]) BY[c.rarity].push(c); });

// Commons split by class for pack collation (exclude Basic-rarity cards from C pool).
// OTA: 3 Lightning Illusionist + 3 Lightning Runeblade + 3 Lightning Wizard + 2 generic = 11 C/pack
const isC = c => c.rarity === "C";
const CC = {
  runeblade:   POOL.filter(c => isC(c) && (c.type||"").includes("Lightning Runeblade")),
  wizard:      POOL.filter(c => isC(c) && (c.type||"").includes("Lightning Wizard")),
  illusionist: POOL.filter(c => isC(c) && (c.type||"").includes("Lightning Illusionist")),
  generic:     POOL.filter(c => isC(c)
    && !(c.type||"").includes("Lightning Runeblade")
    && !(c.type||"").includes("Lightning Wizard")
    && !(c.type||"").includes("Lightning Illusionist")),
};
// Basic pool: heroes, weapons, tokens, macro, resource
const BASIC_POOL = POOL.filter(c => c.rarity === "B");

let _uid = 0;
const stamp = (c, pi) => ({ ...c, _iid:`${pi}-${++_uid}`, _pack:pi });
const pickN = (arr, n) => [...(arr||[])].sort(() => Math.random() - 0.5).slice(0, n);

function buildPack(pi, revealedOnly = false) {
  const rev = c => !revealedOnly || !!c.img;

  // Pre-filter all pools when revealedOnly is active
  const rPool  = BY.R.filter(rev);
  const mPool  = BY.M.filter(rev);
  const lPool  = BY.L.filter(rev);
  const fPool  = BY.F.filter(rev);
  const bPool  = BASIC_POOL.filter(rev);
  const mvPool = BY.MV.filter(rev);
  const ccR    = CC.runeblade.filter(rev);
  const ccW    = CC.wizard.filter(rev);
  const ccI    = CC.illusionist.filter(rev);
  const ccG    = CC.generic.filter(rev);

  const pick1 = pool => pickN(pool?.length ? pool : rPool, 1)[0];
  const cards  = [];

  // 11 Commons — collated by class: 3 per Lightning class + 2 generic
  const commons = [
    ...pickN(ccR, 3), ...pickN(ccW, 3), ...pickN(ccI, 3), ...pickN(ccG, 2),
  ];
  cards.push(...commons.map(c => ({...c})));

  // Rare slot (always Rare)
  const r1 = pick1(rPool);
  if (r1) cards.push({...r1});

  // Rare-or-Majestic slot (~1 in 7 chance of Majestic)
  const r2src = Math.random() < 1/7 && mPool.length ? mPool : rPool;
  const r2 = pick1(r2src);
  if (r2) cards.push({...r2});

  // Rainbow Foil: pick any card from set, weighted toward Commons
  const rfRoll = Math.random();
  const rfSrc  = rfRoll < 0.62 ? ccG     // generic commons for RF (most common)
    : rfRoll < 0.89 ? rPool
    : rfRoll < 0.98 ? mPool
    : [...lPool, ...mvPool].filter(Boolean);
  const rfBase = pick1(rfSrc?.length ? rfSrc : BY.C.filter(rev));
  if (rfBase) cards.push({ ...rfBase, foil:"RF" });

  // Basic Slot 1: usually a Basic card; 1-in-24 packs replaced by Cold Foil
  if (Math.random() < 1/24) {
    const cfRoll = Math.random();
    const cfSrc  = cfRoll < 0.50 ? rPool : cfRoll < 0.85 ? mPool : lPool;
    const cfBase = pick1(cfSrc?.length ? cfSrc : rPool);
    if (cfBase) cards.push({ ...cfBase, foil:"CF" });
  } else {
    const b = pick1(bPool);
    if (b) cards.push({...b});
  }

  // Basic Slot 2: Basic (~93%), Expansion Slot (~4%), Legendary (~2%),
  //              Marvel (~0.6%), Fabled (~0.2%)
  const s2 = Math.random();
  if      (s2 < 0.002 && fPool.length)  { cards.push({...pick1(fPool) }); }
  else if (s2 < 0.008 && mvPool.length) { cards.push({...pick1(mvPool)}); }
  else if (s2 < 0.028 && lPool.length)  { cards.push({...pick1(lPool) }); }
  else if (s2 < 0.068) {
    const expBase = pick1([...rPool, ...mPool]);
    if (expBase) cards.push({ ...expBase, foil:"EXP" });
  } else {
    const b = pick1(bPool);
    if (b) cards.push({...b});
  }

  return cards.map(c => stamp(c, pi));
}

function getClass(c) {
  const t = c.type || "";
  if (t.startsWith("Unrevealed"))                        return "Unrevealed";
  if (c.rarity === "B")                                  return "Basic";
  if (t.includes("Token")||t.includes("Macro")||t.includes("Resource - Gem")) return "Token / Macro";
  if (t.includes("Lightning Runeblade"))                 return "Lightning Runeblade";
  if (t.includes("Lightning Wizard"))                    return "Lightning Wizard";
  if (t.includes("Lightning Illusionist"))               return "Lightning Illusionist";
  if (t.includes("Lightning"))                           return "Lightning";
  if (t.includes("Illusionist")&&t.includes("Wizard"))  return "Illusionist / Wizard";
  if (t.includes("Illusionist"))                         return "Illusionist";
  if (t.includes("Wizard"))                              return "Wizard";
  if (t.includes("Draconic"))                            return "Draconic";
  if (t.includes("Runeblade"))                           return "Runeblade";
  if (t.includes("Pirate Mechanologist"))                return "Pirate Mechanologist";
  if (t.includes("Pirate Ranger"))                       return "Pirate Ranger";
  if (t.includes("Pirate Necromancer"))                  return "Pirate Necromancer";
  if (t.includes("Reviled Guardian"))                    return "Reviled Guardian";
  if (t.includes("Guardian")&&t.includes("Warrior"))    return "Guardian / Warrior";
  if (t.includes("Guardian"))                            return "Guardian";
  if (t.includes("Mechanologist"))                       return "Mechanologist";
  if (t.includes("Assassin"))                            return "Assassin";
  if (t.includes("Brute"))                               return "Brute";
  if (t.includes("Ninja"))                               return "Ninja";
  if (t.includes("Ranger"))                              return "Ranger";
  if (t.includes("Warrior"))                             return "Warrior";
  if (t.includes("Light "))                              return "Light";
  if (t.includes("Chaos"))                               return "Chaos";
  return "Generic";
}

function groupCards(cards, mode) {
  if (mode === "class") {
    const g = {};
    cards.forEach(c => { const k = getClass(c); if (!g[k]) g[k] = []; g[k].push(c); });
    return CLASS_ORDER.filter(k => g[k]?.length).map(k => ({ key:k, label:k, cards:g[k] }));
  }
  if (mode === "rarity") {
    const ord = ["T","B","C","R","M","L","MV","F"], g = {};
    ord.forEach(r => { g[r] = []; });
    cards.forEach(c => { if (g[c.rarity]) g[c.rarity].push(c); });
    return ord.filter(r => g[r].length).map(r => ({ key:r, label:RM[r].label+"s", cards:g[r], rm:RM[r] }));
  }
  return [{ key:"all", label:null, cards:[...cards].sort((a,b) => a.name.localeCompare(b.name)) }];
}

function buildDeckList(heroId, deckCards) {
  const hero = HEROES.find(h => h.id === heroId);
  const counts = {};
  deckCards.forEach(c => {
    if (c.name.startsWith("Unrevealed")) return;
    if (!counts[c.id]) counts[c.id] = { card:c, n:0 };
    counts[c.id].n++;
  });
  const byClass = {};
  Object.values(counts).forEach(({ card, n }) => {
    const cls = getClass(card);
    if (!byClass[cls]) byClass[cls] = [];
    byClass[cls].push(`${n} ${card.name}`);
  });
  const lines = [];
  if (hero) lines.push(hero.name);
  lines.push("");
  CLASS_ORDER.forEach(cls => {
    if (!byClass[cls]?.length) return;
    lines.push(`// ${cls}`);
    byClass[cls].sort().forEach(l => lines.push(l));
    lines.push("");
  });
  const skipped = deckCards.filter(c => c.name.startsWith("Unrevealed")).length;
  if (skipped > 0)
    lines.push(`// Note: ${skipped} unrevealed card${skipped!==1?"s":""} omitted`);
  return lines.join("\n").trim();
}

// ── BASE COMPONENTS ───────────────────────────────────────────────────────────

function Btn({ children, onClick, ghost, disabled, style: xtra = {} }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        fontFamily:"inherit", fontSize:13, fontWeight:600,
        padding:"7px 14px", borderRadius:6,
        cursor:     disabled ? "default" : "pointer",
        opacity:    disabled ? 0.35      : 1,
        transition:"opacity 0.12s, background 0.12s",
        display:"inline-flex", alignItems:"center", gap:5,
        border:"none",
        ...(ghost
          ? { background:"transparent", color:T.muted, boxShadow:`inset 0 0 0 1px ${T.border}` }
          : { background:T.accent, color:T.bg }),
        ...xtra,
      }}
    >{children}</button>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize:12, padding:"4px 11px", borderRadius:4, fontFamily:"inherit",
      fontWeight: active ? 600 : 400, cursor:"pointer",
      background: active ? T.accent+"22" : "transparent",
      color:      active ? T.accent      : T.muted,
      border:`1px solid ${active ? T.accent+"66" : T.border}`,
      transition:"all 0.12s",
    }}>{label}</button>
  );
}

function RarityBadge({ r }) {
  const m = RM[r] || RM.C;
  return (
    <span style={{ fontSize:11, fontWeight:600, background:m.bg, color:m.fg,
      border:`1px solid ${m.bd}`, borderRadius:4, padding:"1px 8px" }}>{m.label}</span>
  );
}

function Brand() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <rect x="3" y="2" width="32" height="34" rx="5" fill={T.accent} />
        <path d="M22 5L11 20h8L16 33 28 17h-8L22 5z" fill={T.bg} />
      </svg>
      <div>
        <div style={{
          fontFamily:"'Cinzel','Palatino Linotype',serif",
          fontSize:22, fontWeight:700, letterSpacing:"0.15em",
          color:T.accent, lineHeight:1,
        }}>FAB SEALED</div>
        <div style={{ fontSize:10, color:T.dim, letterSpacing:"0.2em", marginTop:3 }}>
          OMENS OF THE THIRD AGE
        </div>
      </div>
    </div>
  );
}

// ── CARD TILE ────────────────────────────────────────────────────────────────

function CardTile({ card, selected, onClick }) {
  const [primaryErr, setPrimaryErr] = useState(false);
  const [backErr,    setBackErr]    = useState(false);
  const m            = RM[card.rarity] || RM.C;
  const f            = card.foil ? FOIL[card.foil] : null;
  const isUnrevealed = !card.img;
  const showBack     = isUnrevealed || primaryErr;
  const showFallback = showBack && backErr;

  const borderColor = selected ? m.fg : f ? f.fg + "99" : m.bd;
  const shadow      = selected
    ? `0 0 0 2px ${m.fg}55, 0 4px 20px #00000088`
    : f ? `0 0 14px ${f.glow}, 0 2px 8px #00000066`
    : "0 2px 8px #00000066";

  return (
    <div
      onClick={onClick}
      style={{
        aspectRatio:"5/7", borderRadius:8, overflow:"hidden",
        position:"relative", background:m.bg,
        border:`2px solid ${borderColor}`,
        boxShadow: shadow,
        cursor: onClick ? "pointer" : "default",
        transition:"border-color 0.12s, box-shadow 0.12s, transform 0.1s",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
    >
      {!isUnrevealed && !primaryErr && (
        <img src={card.img} alt={card.name} onError={() => setPrimaryErr(true)}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
      )}
      {showBack && !backErr && (
        <img src={CARD_BACK} alt="Unrevealed card" onError={() => setBackErr(true)}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
      )}
      {showFallback && (
        <div style={{ width:"100%", height:"100%", background:m.bg, display:"flex",
          flexDirection:"column", justifyContent:"center",
          alignItems:"center", padding:"8px 6px", gap:4, textAlign:"center" }}>
          <span style={{ fontSize:9, fontWeight:600, color:m.fg,
            background:m.fg+"22", padding:"2px 7px", borderRadius:4 }}>{m.label}</span>
          <span style={{ fontSize:card.name.length > 20 ? 8 : 10,
            fontWeight:600, color:m.fg, lineHeight:1.3 }}>{card.name}</span>
        </div>
      )}
      {showBack && !backErr && (
        <div style={{ position:"absolute", bottom:4, left:4, background:"#00000099",
          border:`1px solid ${m.bd}`, borderRadius:3,
          padding:"1px 5px", fontSize:8, fontWeight:600, color:m.fg }}>{m.label}</div>
      )}
      {/* Foil treatment badge (top-left) */}
      {f && (
        <div style={{ position:"absolute", top:4, left:4,
          background: f.bg, border:`1px solid ${f.fg}99`,
          borderRadius:3, padding:"1px 5px",
          fontSize:8, fontWeight:700, color:f.fg, lineHeight:1.5 }}>
          {f.badge}
        </div>
      )}
      {/* Selected tick (top-right) */}
      {selected && (
        <div style={{ position:"absolute", top:4, right:4, width:18, height:18,
          borderRadius:"50%", background:m.fg, border:`2px solid ${T.bg}`,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke={T.bg}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}

function CardGrid({ cards, deckSet, onToggle, cols }) {
  return (
    <div className="cg" style={{ display:"grid",
      gridTemplateColumns:cols||"repeat(auto-fill,minmax(105px,1fr))", gap:8 }}>
      {cards.map(c => (
        <CardTile key={c._iid||c.id} card={c}
          selected={deckSet?.has(c._iid)}
          onClick={onToggle ? () => onToggle(c) : undefined} />
      ))}
    </div>
  );
}

function GroupedGrid({ cards, deckSet, onToggle, sortMode, cols }) {
  const groups = groupCards(cards, sortMode || "rarity");
  if (groups.length === 1 && !groups[0].label)
    return <CardGrid cards={groups[0].cards} deckSet={deckSet} onToggle={onToggle} cols={cols} />;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
      {groups.map(g => (
        <div key={g.key}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8,
            paddingBottom:6, borderBottom:`1px solid ${T.border}` }}>
            {g.rm && <span style={{ width:7, height:7, borderRadius:"50%",
              background:g.rm.fg, display:"inline-block", flexShrink:0 }} />}
            <span style={{ fontSize:11, fontWeight:600, color:T.muted,
              letterSpacing:"0.06em", textTransform:"uppercase" }}>{g.label}</span>
            <span style={{ fontSize:11, color:T.dim }}>({g.cards.length})</span>
          </div>
          <CardGrid cards={g.cards} deckSet={deckSet} onToggle={onToggle} cols={cols} />
        </div>
      ))}
    </div>
  );
}

// ── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, description, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", textAlign:"center", padding:"64px 24px", gap:16 }}>
      <div style={{ fontSize:52, lineHeight:1, opacity:0.6 }}>{icon}</div>
      <div>
        <div style={{ fontSize:18, fontWeight:600, color:T.text, marginBottom:6 }}>{title}</div>
        <div style={{ fontSize:13, color:T.muted, maxWidth:340, lineHeight:1.7, margin:"0 auto" }}>
          {description}
        </div>
      </div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginTop:4 }}>
        {children}
      </div>
    </div>
  );
}

// ── VIEWS ─────────────────────────────────────────────────────────────────────

function HomeView({ onGenPack, onGenSealed, onPrintTokens, revealedOnly, onToggleRevealedOnly, includeBs, onToggleIncludeBs }) {
  const counts = Object.entries(RM).map(([r,m]) => ({ r,m, n:BY[r].length })).filter(x => x.n);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
      <div style={{ background:"#0d1828", border:"1px solid #1e4a7a",
        borderRadius:8, padding:"10px 14px", fontSize:13, color:"#74b3f4",
        display:"flex", gap:10, alignItems:"flex-start" }}>
        <span style={{ flexShrink:0 }}>⚡</span>
        <span>Pre-release practice tool. Spoiled cards show real art; ~170 unrevealed cards show
          the official FaB card back. OTA releases{" "}
          <strong style={{color:"#a0c8f8"}}>June 5, 2026</strong>. Rarity assignments are estimated.</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:8 }}>
        <div style={{ gridColumn:"1/-1", background:T.surface, borderRadius:8,
          border:`1px solid ${T.border}`, padding:"12px 16px",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontSize:24, fontWeight:700, color:T.text }}>251</div>
            <div style={{ fontSize:12, color:T.muted }}>cards in set</div>
          </div>
          <div style={{ fontSize:12, color:T.dim, textAlign:"right", lineHeight:1.8 }}>
            {BY.C.length} Common · {BY.R.length} Rare · {BY.M.length} Majestic<br/>
            {BY.L.length} Legendary · {BY.MV.length} Marvel · {BY.F.length} Fabled · {BY.B.length} Basic
          </div>
        </div>
        {counts.filter(x => x.r !== "C" && x.r !== "T").map(({ r, m, n }) => (
          <div key={r} style={{ background:m.bg, border:`1px solid ${m.bd}`,
            borderRadius:8, padding:"10px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:m.fg, fontWeight:600 }}>{m.label}</div>
            <div style={{ fontSize:22, fontWeight:700, color:m.fg, marginTop:2 }}>{n}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <Btn onClick={onGenPack}>🃏 Generate booster pack</Btn>
        <Btn ghost onClick={onGenSealed}>📦 Generate sealed pool (8 packs)</Btn>
        {/* Revealed-only toggle */}
        <button
          onClick={onToggleRevealedOnly}
          title={revealedOnly
            ? "Packs use only the ~80 spoiled cards with real art"
            : "Packs include ~170 unrevealed placeholder cards"}
          style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"7px 12px", borderRadius:6, cursor:"pointer",
            fontFamily:"inherit", fontSize:12, fontWeight:600,
            background: revealedOnly ? T.accent+"22" : "transparent",
            color:       revealedOnly ? T.accent       : T.muted,
            border:`1px solid ${revealedOnly ? T.accent+"66" : T.border}`,
            transition:"all 0.15s",
          }}
        >
          {/* Toggle pill */}
          <span style={{
            display:"inline-flex", width:30, height:16, borderRadius:8, flexShrink:0,
            background: revealedOnly ? T.accent : T.dim,
            position:"relative", transition:"background 0.15s",
          }}>
            <span style={{
              position:"absolute", top:2, left: revealedOnly ? 16 : 2,
              width:12, height:12, borderRadius:"50%", background:"#fff",
              transition:"left 0.15s",
            }} />
          </span>
          Revealed cards only
        </button>
        {/* Include basics toggle */}
        <button
          onClick={onToggleIncludeBs}
          title={includeBs
            ? "Basic cards (heroes, weapons, tokens) will be included when printing"
            : "Basic cards excluded from print output"}
          style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"7px 12px", borderRadius:6, cursor:"pointer",
            fontFamily:"inherit", fontSize:12, fontWeight:600,
            background: !includeBs ? "#ef444422" : "transparent",
            color:       !includeBs ? "#f87171"   : T.muted,
            border:`1px solid ${!includeBs ? "#ef444466" : T.border}`,
            transition:"all 0.15s",
          }}
        >
          <span style={{
            display:"inline-flex", width:30, height:16, borderRadius:8, flexShrink:0,
            background: includeBs ? T.accent : T.dim,
            position:"relative", transition:"background 0.15s",
          }}>
            <span style={{
              position:"absolute", top:2, left: includeBs ? 16 : 2,
              width:12, height:12, borderRadius:"50%", background:"#fff",
              transition:"left 0.15s",
            }} />
          </span>
          Print basic cards
        </button>
      </div>

      {/* Pre-release promo pack section */}
      <div style={{ background:T.surface, borderRadius:8,
        border:`1px solid ${T.border}`, padding:"14px 18px" }}>
        <div style={{ fontSize:12, color:T.muted, fontWeight:600, marginBottom:4,
          letterSpacing:"0.06em", textTransform:"uppercase" }}>Pre-release promo pack</div>
        <p style={{ fontSize:13, color:T.muted, margin:"0 0 12px", lineHeight:1.6 }}>
          14 cards included in the pre-release kit — heroes, signature weapons, the Astral Sanctuary equipment set, Glide Through Starlight, and the Omens of Arcana macro.
        </p>
        {/* Scrollable thumbnail row */}
        <div style={{ overflowX:"auto", paddingBottom:4, marginBottom:12 }}>
          <div style={{ display:"flex", gap:6, width:"max-content" }}>
            {PROMO_PACK.map(t => {
              const m = RM[t.rarity] || RM.C;
              return (
                <div key={t.id} style={{ width:48, flexShrink:0 }}>
                  <div style={{ aspectRatio:"5/7", borderRadius:4, overflow:"hidden",
                    border:`1px solid ${m.bd}` }}>
                    <img src={t.img} alt={t.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  </div>
                  <div style={{ fontSize:8, color:T.dim, marginTop:3, lineHeight:1.3,
                    textAlign:"center", wordBreak:"break-word" }}>
                    {t.name.replace(/ \(\d\)$/, "")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Btn ghost onClick={onPrintTokens}>🖨 Print promo pack</Btn>
      </div>

      <div style={{ background:T.surface, borderRadius:8,
        border:`1px solid ${T.border}`, padding:"14px 18px" }}>
        <div style={{ fontSize:12, color:T.muted, fontWeight:600, marginBottom:10,
          letterSpacing:"0.06em", textTransform:"uppercase" }}>Pack contents — 16 cards</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6,
          fontSize:13, color:T.muted }}>
          <div>11× <RarityBadge r="C" /></div>
          <div>1× <RarityBadge r="R" />
            <span style={{color:T.dim,margin:"0 6px"}}>+</span>
            <span>1× <RarityBadge r="R" /> or <RarityBadge r="M" /></span>
          </div>
          <div>
            <span style={{ color:FOIL.RF.fg, background:FOIL.RF.bg,
              border:`1px solid ${FOIL.RF.fg}88`, borderRadius:4,
              fontSize:11, fontWeight:700, padding:"1px 7px", marginRight:6 }}>RF</span>
            1× Rainbow Foil
            <span style={{fontSize:11,color:T.dim,marginLeft:5}}>(Common · Rare · Majestic · ...)</span>
          </div>
          <div>2× <RarityBadge r="B" />
            <span style={{fontSize:11,color:T.dim,marginLeft:5}}>
              (slot 2 upgrades to Expansion · Legendary · Marvel · Fabled;
              1-in-24 packs slot 1 replaced by{" "}
              <span style={{ color:FOIL.CF.fg, fontWeight:700 }}>CF</span> Cold Foil)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PackView({ pack, onRegen, onPrint }) {
  const breakdown = Object.entries(RM)
    .map(([r,m]) => { const n = pack.filter(c=>c.rarity===r).length; return n?{r,m,n}:null; })
    .filter(Boolean);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:T.text }}>Booster pack</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:6 }}>
            {breakdown.map(({r,m,n}) => (
              <span key={r} style={{ background:m.bg, color:m.fg, border:`1px solid ${m.bd}`,
                borderRadius:4, fontSize:11, padding:"2px 8px", fontWeight:600 }}>
                {n}× {m.label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn ghost onClick={onRegen}>↺ New pack</Btn>
          <Btn ghost onClick={onPrint}>🖨 Print proxies</Btn>
        </div>
      </div>
      <CardGrid cards={pack} cols="repeat(auto-fill,minmax(115px,1fr))" />
    </div>
  );
}

function SealedView({ pools, expanded, setExpanded, onRegen, onPrint, onDeck }) {
  const flat = pools.flat();
  const [sortMode, setSortMode] = useState("default");
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:T.text }}>Sealed pool</div>
          <div style={{ fontSize:13, color:T.muted, marginTop:2 }}>
            8 packs · {flat.length} cards
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Btn ghost onClick={onRegen}>↺ New pool</Btn>
          <Btn ghost onClick={onDeck}>🃏 Build deck</Btn>
          <Btn ghost onClick={onPrint}>🖨 Print all</Btn>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {pools.map((pack, i) => {
          const open    = expanded[i] !== false;
          const notable = pack.filter(c => ["M","L","F"].includes(c.rarity));
          return (
            <div key={i} style={{ border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
              <button
                onClick={() => setExpanded(p => ({ ...p, [i]: !open }))}
                style={{ width:"100%", background:open ? T.panel : T.surface, border:"none",
                  cursor:"pointer", padding:"10px 14px",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  fontFamily:"inherit", fontSize:14, color:T.text,
                  borderBottom: open ? `1px solid ${T.border}` : "none",
                  transition:"background 0.12s" }}>
                <span style={{ fontWeight:600 }}>Pack {i + 1}</span>
                <span className="pk-notables" style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {notable.map(c => { const m = RM[c.rarity]; return (
                    <span key={c._iid} className="pk-badge" style={{ background:m.bg, color:m.fg,
                      border:`1px solid ${m.bd}`, borderRadius:4,
                      fontSize:11, padding:"2px 8px", fontWeight:600 }}>
                      ✦ {c.name.replace(/ \(\d\)$/, "")}
                    </span>
                  ); })}
                  <span style={{ color:T.dim, fontSize:14, flexShrink:0 }}>{open ? "▲" : "▼"}</span>
                </span>
              </button>
              {open && (
                <div style={{ background:T.panel }}>
                  <div style={{ display:"flex", gap:4, padding:"8px 12px 0", flexWrap:"wrap" }}>
                    {[["default","By pack"],["class","By class"],["rarity","By rarity"]].map(([v,l]) => (
                      <Pill key={v} label={l} active={sortMode===v} onClick={() => setSortMode(v)} />
                    ))}
                  </div>
                  <div style={{ padding:"10px 12px 14px" }}>
                    {sortMode === "default"
                      ? <CardGrid cards={pack} cols="repeat(auto-fill,minmax(90px,1fr))" />
                      : <GroupedGrid cards={pack} sortMode={sortMode} cols="repeat(auto-fill,minmax(90px,1fr))" />
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FabraryPanel({ heroId, deckCards, onClose }) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef(null);
  const list    = useMemo(() => buildDeckList(heroId, deckCards), [heroId, deckCards]);
  const skipped = deckCards.filter(c => c.name.startsWith("Unrevealed")).length;
  const copy = () => {
    if (textRef.current) { textRef.current.select(); document.execCommand("copy"); }
    else navigator.clipboard?.writeText(list);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ background:T.panel, border:`1px solid ${T.borderHi}`,
      borderRadius:8, padding:"16px 18px", marginTop:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:T.text }}>Export to Fabrary</div>
          <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
            Copy and paste into Fabrary's deck builder.
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <Btn onClick={copy}>{copied ? "✓ Copied!" : "📋 Copy list"}</Btn>
          <a href="https://fabrary.net/decks" target="_blank" rel="noopener noreferrer"
            style={{ textDecoration:"none" }}>
            <Btn ghost>↗ Open Fabrary</Btn>
          </a>
          <button onClick={onClose} style={{ background:"transparent", border:"none",
            color:T.dim, cursor:"pointer", fontSize:20, lineHeight:1, padding:"2px 6px" }}>×</button>
        </div>
      </div>
      {skipped > 0 && (
        <div style={{ background:"#2c1a04", border:"1px solid #7c4a10", borderRadius:6,
          padding:"8px 12px", fontSize:12, color:"#fbbf24", marginBottom:12 }}>
          ⚠ {skipped} unrevealed card{skipped!==1?"s":""} excluded — replace once OTA is live.
        </div>
      )}
      <textarea ref={textRef} readOnly value={list}
        style={{ width:"100%", minHeight:220, padding:"10px 12px",
          background:T.bg, border:`1px solid ${T.border}`, borderRadius:6,
          fontFamily:"'Menlo','Monaco','Courier New',monospace",
          fontSize:12, color:T.text, resize:"vertical",
          lineHeight:1.7, boxSizing:"border-box" }} />
    </div>
  );
}

function DeckView({ flatPool, deckSet, deckCards, onToggle, onPrint, hero, setHero }) {
  const [filter,     setFilter]     = useState("ALL");
  const [sortMode,   setSortMode]   = useState("class");
  const [showExport, setShowExport] = useState(false);
  const isLegal = deckCards.length >= 30;
  const need    = Math.max(0, 30 - deckCards.length);

  const baseCards = useMemo(() => {
    if (filter === "DECK") return flatPool.filter(c => deckSet.has(c._iid));
    if (filter !== "ALL")  return flatPool.filter(c => c.rarity === filter);
    return flatPool;
  }, [flatPool, deckSet, filter]);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:T.muted, fontWeight:600, marginBottom:10,
          letterSpacing:"0.06em", textTransform:"uppercase" }}>Choose your hero</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {HEROES.map(h => (
            <div key={h.id} onClick={() => setHero(h.id === hero ? null : h.id)}
              style={{ cursor:"pointer", textAlign:"center", width:80 }}>
              <div style={{ borderRadius:8, overflow:"hidden",
                border:`2px solid ${hero===h.id ? T.accent : T.border}`,
                boxShadow: hero===h.id ? `0 0 0 2px ${T.accent}55, 0 4px 20px #00000066` : "none",
                transition:"all 0.15s" }}>
                <div style={{ aspectRatio:"5/7", overflow:"hidden" }}>
                  <img src={h.img} alt={h.name}
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                </div>
              </div>
              <div style={{ fontSize:10, fontWeight:600, marginTop:5, lineHeight:1.3,
                color: hero===h.id ? T.accent : T.muted }}>{h.name}</div>
              <div style={{ fontSize:9, color:T.dim, marginTop:2 }}>{h.cls}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:12 }}>
        <p style={{ margin:0, fontSize:13, color:T.muted, alignSelf:"center" }}>
          Click cards to add or remove from your deck
        </p>
        <div className="dk-status" style={{
          background: isLegal ? "#0d2c1a" : T.surface,
          border:`1px solid ${isLegal ? "#2a7a4a" : T.border}`,
          borderRadius:8, padding:"10px 18px", minWidth:185, textAlign:"right" }}>
          <div style={{ fontSize:12, fontWeight:600, marginBottom:3,
            color: isLegal ? "#4ade80" : T.muted }}>
            {isLegal ? "✓ Legal deck" : `${need} more card${need!==1?"s":""} needed`}
          </div>
          <div style={{ fontSize:30, fontWeight:700, color:T.text, lineHeight:1 }}>
            {deckCards.length}
            <span style={{ fontSize:14, fontWeight:400, color:T.dim }}> / 30 min</span>
          </div>
          {deckCards.length > 0 && (
            <div style={{ marginTop:6, display:"flex", gap:4, flexWrap:"wrap", justifyContent:"flex-end" }}>
              {Object.entries(RM).map(([r,m]) => {
                const n = deckCards.filter(c=>c.rarity===r).length; if (!n) return null;
                return <span key={r} style={{ fontSize:10, background:m.bg, color:m.fg,
                  border:`1px solid ${m.bd}`, borderRadius:3, padding:"0 5px" }}>
                  {n}× {m.label}</span>;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter row — scrollable on mobile */}
      <div className="ctl" style={{ display:"flex", gap:5, alignItems:"center",
        marginBottom:6, flexWrap:"wrap" }}>
        {[["ALL","All"],["DECK",`In deck (${deckCards.length})`],
          ["C","Commons"],["R","Rares"],["M","Majestics"],["B","Basics"],["T","Tokens"]].map(([v,l]) => (
          <Pill key={v} label={l} active={filter===v} onClick={() => setFilter(v)} />
        ))}
      </div>
      {/* Sort + action row */}
      <div style={{ display:"flex", gap:5, alignItems:"center",
        marginBottom:14, flexWrap:"wrap" }}>
        {[["class","By class"],["rarity","By rarity"],["name","A–Z"]].map(([v,l]) => (
          <Pill key={v} label={l} active={sortMode===v} onClick={() => setSortMode(v)} />
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <Btn ghost onClick={() => setShowExport(x => !x)}>
            {showExport ? "▲ Hide" : "↗ Fabrary export"}
          </Btn>
          <Btn ghost onClick={onPrint} disabled={!deckCards.length}>🖨 Print</Btn>
        </div>
      </div>

      {showExport && (
        <FabraryPanel heroId={hero} deckCards={deckCards} onClose={() => setShowExport(false)} />
      )}

      <div style={{ marginTop:16 }}>
        {baseCards.length > 0
          ? <GroupedGrid cards={baseCards} deckSet={deckSet} onToggle={onToggle} sortMode={sortMode} />
          : <div style={{ textAlign:"center", padding:"3rem 0", color:T.dim, fontSize:14 }}>
              {filter==="DECK" ? "No cards yet — click any card to add it" : "No cards match this filter"}
            </div>
        }
      </div>
    </div>
  );
}

// ── PRINT ─────────────────────────────────────────────────────────────────────
// Opens a dedicated window, waits for every image to load (or fail),
// then auto-triggers print. This avoids the race condition where window.print()
// fires before images have loaded.

const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

function openPrintWindow(cards) {
  const w = window.open("", "_blank", "width=960,height=800");
  if (!w) {
    alert("Allow pop-ups for this site to use print, or use Ctrl+P / Cmd+P after dismissing.");
    return;
  }

  // Build card HTML: revealed cards get <img>; unrevealed get a CSS-only "card back"
  const cardsHTML = cards.map(c => {
    const m = RM[c.rarity] || RM.C;
    if (c.img) {
      return `<div class="c" style="border-color:${m.bd}">
        <img src="${esc(c.img)}"
          onerror="this.style.display='none';var fb=this.nextSibling;if(fb)fb.style.display='flex'">
        <div class="fb" style="background:${m.bg};display:none">
          <span class="rl" style="color:${m.fg};background:${m.fg}22">${esc(m.label)}</span>
          <span class="nm" style="color:${m.fg}">${esc(c.name)}</span>
        </div>
      </div>`;
    }
    // Unrevealed: CSS card back with a lightning bolt watermark
    return `<div class="c" style="border-color:${m.bd}">
      <div class="fb" style="background:${m.bg}">
        <span class="bolt">&#9889;</span>
        <span class="rl" style="color:${m.fg};background:${m.fg}22">${esc(m.label)}</span>
      </div>
    </div>`;
  }).join("");

  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FAB SEALED — ${cards.length} proxy cards</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#fff;font-family:sans-serif}
    /* ── toolbar (hidden when printing) ── */
    .bar{padding:12px 16px;background:#f5f5f5;border-bottom:1px solid #ddd;
         display:flex;align-items:center;gap:10px;font-size:14px}
    .bar strong{margin-right:4px}
    .bar button{padding:7px 16px;border:none;border-radius:4px;
                cursor:pointer;font-weight:600;font-size:13px}
    .btn-print{background:#e8a820;color:#000}
    .btn-close{background:#666;color:#fff}
    /* ── card grid ── */
    /* 3 × 63mm = 189mm, fits on A4 (210mm) and US Letter (216mm) with 5mm margins */
    .g{display:grid;grid-template-columns:repeat(3,63mm);
       grid-auto-rows:88mm;gap:3mm;padding:5mm}
    .c{width:63mm;height:88mm;overflow:hidden;
       border-radius:3mm;border:2px solid;position:relative}
    .c img{width:100%;height:100%;object-fit:cover;display:block}
    .fb{position:absolute;inset:0;display:flex;flex-direction:column;
        justify-content:center;align-items:center;gap:6px;padding:8px}
    .rl{font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px}
    .nm{font-size:9px;font-weight:600;text-align:center;line-height:1.3}
    .bolt{font-size:32px;opacity:.18;line-height:1}
    /* ── print ── */
    @media print{
      .bar{display:none}
      @page{margin:5mm;size:A4 portrait}
    }
    /* loading overlay */
    #loading{position:fixed;inset:0;background:rgba(0,0,0,.55);
             display:flex;align-items:center;justify-content:center;
             color:#fff;font-size:18px;font-weight:600;letter-spacing:.05em;z-index:99}
  </style>
</head>
<body>
  <div id="loading">Loading card images…</div>
  <div class="bar">
    <strong>${cards.length}</strong> proxy cards ready &nbsp;
    <button class="btn-print" onclick="window.print()">🖨 Print now</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>
  <div class="g">${cardsHTML}</div>
  <script>
    // Hide loading overlay and auto-print once every image has loaded or failed
    var imgs = document.querySelectorAll("img");
    var pending = imgs.length;
    function done() {
      if (--pending <= 0) {
        document.getElementById("loading").style.display = "none";
        window.print();
      }
    }
    if (pending === 0) {
      document.getElementById("loading").style.display = "none";
      window.print();
    } else {
      imgs.forEach(function(img) {
        if (img.complete) { done(); }
        else { img.onload = done; img.onerror = done; }
      });
    }
  </script>
</body>
</html>`);
  w.document.close();
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [view,       setView]     = useState("home");
  const [pack,       setPack]     = useState(null);
  const [pools,      setPools]    = useState(null);
  const [flatPool,   setFlatPool] = useState([]);
  const [deckSet,    setDeckSet]  = useState(new Set());
  const [expanded,   setExpanded] = useState({});
  const [hero,       setHero]     = useState(null);
  const [revealedOnly, setRevealedOnly] = useState(false);
  const [includeBs,    setIncludeBs]    = useState(true);

  const filterPrint = cards => includeBs ? cards : cards.filter(c => c.rarity !== "B");

  const genPack = () => { setPack(buildPack(Date.now(), revealedOnly)); setView("pack"); };
  const genSealed = () => {
    const ps = Array.from({ length:8 }, (_, i) => buildPack(i, revealedOnly));
    setPools(ps); setFlatPool(ps.flat()); setDeckSet(new Set()); setExpanded({}); setView("sealed");
  };
  // Like genSealed but stays on deck view — for the deck builder empty state
  const genSealedAndBuild = () => {
    const ps = Array.from({ length:8 }, (_, i) => buildPack(i, revealedOnly));
    setPools(ps); setFlatPool(ps.flat()); setDeckSet(new Set()); setExpanded({});
    // don't call setView — stay on deck
  };
  const toggleCard = c => {
    setDeckSet(p => { const n = new Set(p); n.has(c._iid) ? n.delete(c._iid) : n.add(c._iid); return n; });
  };
  const deckCards = flatPool.filter(c => deckSet.has(c._iid));

  // Promo pack print — all 14 pre-release kit cards
  const printTokens = () => openPrintWindow(filterPrint(PROMO_PACK.map((c, i) => ({ ...c, _iid:`promo-${i}`, _pack:0 }))));

  // All tabs are always clickable — empty states handle the "not yet generated" case
  const tabs = [
    { id:"home",   label:"Overview",     icon:"⊞"  },
    { id:"pack",   label:"Booster pack", icon:"🃏" },
    { id:"sealed", label:"Sealed pool",  icon:"📦" },
    { id:"deck",   label:"Deck builder", icon:"✦"  },
  ];

  return (
    <>
      {/* ── Global styles in JSX — guarantees availability before first paint ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { background: ${T.bg}; }
        body { background: ${T.bg}; margin: 0; }
        #root, #app { width: 100%; }

        /* Nav: horizontal scroll so tabs never overflow */
        nav { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        nav::-webkit-scrollbar { display: none; }
        nav > button { flex-shrink: 0; white-space: nowrap; }

        /* Control pill rows: horizontal scroll class */
        .ctl { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .ctl::-webkit-scrollbar { display: none; }

        /* ── Mobile ≤ 680px ─────────────────────────────────── */
        @media (max-width: 680px) {
          /* Header: stack brand row above nav row */
          .hd {
            height: auto !important;
            flex-wrap: wrap !important;
            padding: 12px 16px 0 !important;
            align-items: center !important;
            gap: 0 !important;
          }
          .hd-brand { padding-right: 0 !important; }
          .hd-date  { display: none !important; }
          /* Nav fills full header width and sits on its own row */
          .hd nav {
            width: calc(100% + 32px);
            margin-left: -16px;
            padding: 0 16px;
            border-top: 1px solid ${T.border};
            margin-top: 6px;
          }

          /* Main: tighter padding on mobile */
          .m-main { padding: 16px 14px !important; }

          /* Pill rows: don't wrap, scroll instead */
          .ctl { flex-wrap: nowrap !important; padding-bottom: 2px; }

          /* Deck status box: full width, text left on mobile */
          .dk-status {
            min-width: unset !important;
            width: 100% !important;
            text-align: left !important;
          }

          /* Sealed accordion: truncate notable card badges so they don't bust the header */
          .pk-notables { max-width: 50vw; overflow: hidden; gap: 4px !important; }
          .pk-badge {
            max-width: 30vw;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block !important;
            vertical-align: middle;
            flex-shrink: 1;
          }

          /* Card grids: slightly smaller tiles */
          .cg {
            grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)) !important;
            gap: 6px !important;
          }
        }

        /* ── Very small screens ≤ 380px ─────────────────────── */
        @media (max-width: 380px) {
          .cg { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* FIX 3 — width: 100% on the root wrapper */}
      <div style={{ width:"100%", minHeight:"100vh",
        background:T.bg, color:T.text,
        fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>

        {/* Header */}
        <header style={{ background:T.surface, borderBottom:`1px solid ${T.border}`,
          position:"sticky", top:0, zIndex:100, width:"100%" }}>
          <div className="hd" style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px",
            height:64, display:"flex", alignItems:"stretch" }}>

            <div className="hd-brand" style={{ display:"flex", alignItems:"center", paddingRight:32, flexShrink:0 }}>
              <Brand />
            </div>

            <nav style={{ display:"flex", alignItems:"stretch", gap:0 }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  style={{
                    background:"transparent", border:"none", fontFamily:"inherit",
                    cursor:"pointer",
                    padding:"0 16px", height:"100%", fontSize:13,
                    display:"inline-flex", alignItems:"center", gap:6,
                    borderBottom:`2px solid ${view===tab.id ? T.accent : "transparent"}`,
                    color: view===tab.id ? T.accent : T.muted,
                    fontWeight: view===tab.id ? 600 : 400,
                    transition:"color 0.12s, border-color 0.12s",
                  }}
                >
                  <span>{tab.icon}</span>{tab.label}
                </button>
              ))}
            </nav>

            <div className="hd-date" style={{ marginLeft:"auto", display:"flex", alignItems:"center",
              fontSize:11, color:T.dim, textAlign:"right", lineHeight:1.6, flexShrink:0 }}>
              Pre-release May 29<br/>Release June 5 2026
            </div>
          </div>
          {/* Amber accent stripe under nav */}
          <div style={{ height:2, background:
            `linear-gradient(90deg,${T.accent}00,${T.accent}99,${T.accent}00)` }} />
        </header>

        {/* Main content */}
        <main className="m-main" style={{ maxWidth:1280, margin:"0 auto", padding:"28px 24px" }}>
          {view==="home"   && <HomeView onGenPack={genPack} onGenSealed={genSealed} onPrintTokens={printTokens}
              revealedOnly={revealedOnly} onToggleRevealedOnly={() => setRevealedOnly(x => !x)}
              includeBs={includeBs} onToggleIncludeBs={() => setIncludeBs(x => !x)} />}

          {view==="pack" && (pack
            ? <PackView pack={pack} onRegen={genPack} onPrint={() => openPrintWindow(filterPrint(pack))} />
            : <EmptyState icon="🃏" title="No pack generated yet"
                description="Generate a booster pack to open 16 cards from Omens of the Third Age.">
                <Btn onClick={genPack}>Generate booster pack</Btn>
              </EmptyState>
          )}

          {view==="sealed" && (pools
            ? <SealedView pools={pools} expanded={expanded} setExpanded={setExpanded}
                onRegen={genSealed} onPrint={() => openPrintWindow(filterPrint(flatPool))}
                onDeck={() => setView("deck")} />
            : <EmptyState icon="📦" title="No sealed pool yet"
                description="Generate 8 booster packs to practice building a sealed deck.">
                <Btn onClick={genSealed}>Generate sealed pool</Btn>
              </EmptyState>
          )}

          {view==="deck" && (flatPool.length > 0
            ? <DeckView flatPool={flatPool} deckSet={deckSet} deckCards={deckCards}
                onToggle={toggleCard} onPrint={() => openPrintWindow(filterPrint(deckCards))}
                hero={hero} setHero={setHero} />
            : <EmptyState icon="✦" title="No cards to build with"
                description="You need a sealed pool before you can build a deck. Generate one now and go straight to the deck builder.">
                <Btn onClick={genSealedAndBuild}>Generate pool &amp; build</Btn>
                <Btn ghost onClick={genSealed}>Go to sealed pool first</Btn>
              </EmptyState>
          )}
        </main>
      </div>
    </>
  );
}
