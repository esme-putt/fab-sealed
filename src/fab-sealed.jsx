// FAB SEALED — Omens of the Third Age Sealed Practice Tool
import { useState, useMemo, useRef } from "react";

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const CARD_BACK = "https://fabdb2.imgix.net/cards/backs/cardback1.png";
const SCG = "https://scg-static.starcitygames.com/articles/2026/";

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
  "Illusionist / Wizard","Wizard","Assassin","Brute","Guardian","Reviled Guardian",
  "Mechanologist","Pirate Mechanologist","Pirate Ranger","Generic","Token / Macro","Unrevealed",
];

const HEROES = [
  { id:"h1", name:"Aurora",          img:SCG+"04/2e1a3d31-aurora.webp",  cls:"Lightning Runeblade"   },
  { id:"h2", name:"Oscilio",         img:SCG+"04/0204988f-oscilio.webp", cls:"Lightning Wizard"      },
  { id:"h3", name:"Zyggy Starlight", img:SCG+"04/599fcee0-zyggy.webp",  cls:"Lightning Illusionist" },
];

const REVEALED = [
  {id:"t1",name:"Lightning Flow",         rarity:"T",img:SCG+"04/8eb6058c-lightning-flow.webp",               type:"Token"},
  {id:"t2",name:"Embodiment of Lightning",rarity:"T",img:SCG+"04/88681f60-embodiment-of-lightning.webp",      type:"Token"},
  {id:"t3",name:"Ponder",                 rarity:"T",img:SCG+"04/8eb6058c-ponder.webp",                       type:"Token"},
  {id:"t4",name:"Omens of Arcana",        rarity:"T",img:SCG+"04/6d6f6837-omens-of-arcana-383x535.webp",      type:"Macro"},
  {id:"c1", name:"Rift Breaker (1)",            rarity:"C",img:SCG+"04/9ad76246-rift-breaker-r.webp",           type:"Lightning Attack Action",pitch:1},
  {id:"c2", name:"Rift Breaker (2)",            rarity:"C",img:SCG+"04/1d4661ee-rift-breaker-y.webp",           type:"Lightning Attack Action",pitch:2},
  {id:"c3", name:"Rift Breaker (3)",            rarity:"C",img:SCG+"04/9ad76246-rift-breaker-b.webp",           type:"Lightning Attack Action",pitch:3},
  {id:"c4", name:"Glide Through Starlight (1)", rarity:"C",img:SCG+"05/c4e8e688-glide-through-starlight-r.webp",type:"Lightning Action",pitch:1},
  {id:"c5", name:"Glide Through Starlight (2)", rarity:"C",img:SCG+"05/c4e8e688-glide-through-starlight-y.webp",type:"Lightning Action",pitch:2},
  {id:"c6", name:"Glide Through Starlight (3)", rarity:"C",img:SCG+"05/c4e8e688-glide-through-starlight-b.webp",type:"Lightning Action",pitch:3},
  {id:"c7", name:"Voltbound Duality (1)", rarity:"C",img:SCG+"04/3d890cd2-voltbound-duality-r.webp",  type:"Lightning Runeblade Attack Action",pitch:1},
  {id:"c8", name:"Voltbound Duality (2)", rarity:"C",img:SCG+"04/3d890cd2-voltbound-duality-y.webp",  type:"Lightning Runeblade Attack Action",pitch:2},
  {id:"c9", name:"Voltbound Duality (3)", rarity:"C",img:SCG+"04/3d890cd2-voltbound-duality-b.webp",  type:"Lightning Runeblade Attack Action",pitch:3},
  {id:"c10",name:"Mercurial Skies (1)",   rarity:"C",img:SCG+"04/69f84da2-mercurial-skies-r.webp",   type:"Lightning Runeblade Action",pitch:1},
  {id:"c11",name:"Mercurial Skies (2)",   rarity:"C",img:SCG+"04/69f84da2-mercurial-skies-y.webp",   type:"Lightning Runeblade Action",pitch:2},
  {id:"c12",name:"Mercurial Skies (3)",   rarity:"C",img:SCG+"04/69f84da2-mercurial-skies-u.webp",   type:"Lightning Runeblade Action",pitch:3},
  {id:"c13",name:"Arc Ramp (1)",      rarity:"C",img:SCG+"04/ff6eb6cc-arc-ramp-r.webp",              type:"Lightning Wizard Attack Action",pitch:1},
  {id:"c14",name:"Arc Ramp (2)",      rarity:"C",img:SCG+"04/ff6eb6cc-arc-ramp-y.webp",              type:"Lightning Wizard Attack Action",pitch:2},
  {id:"c15",name:"Arc Ramp (3)",      rarity:"C",img:SCG+"04/ff6eb6cc-arc-ramp-b.webp",              type:"Lightning Wizard Attack Action",pitch:3},
  {id:"c16",name:"Core Reaction (1)", rarity:"C",img:SCG+"04/6deeccd2-core-reaction-r.webp",         type:"Lightning Wizard Instant",pitch:1},
  {id:"c17",name:"Core Reaction (2)", rarity:"C",img:SCG+"04/6deeccd2-core-reaction-y.webp",         type:"Lightning Wizard Instant",pitch:2},
  {id:"c18",name:"Core Reaction (3)", rarity:"C",img:SCG+"04/6deeccd2-core-reaction-b.webp",         type:"Lightning Wizard Instant",pitch:3},
  {id:"c19",name:"Cosmic Suture (1)", rarity:"C",img:SCG+"04/441d2031-cosmic-suture-r.webp",         type:"Lightning Wizard Attack Action",pitch:1},
  {id:"c20",name:"Cosmic Suture (2)", rarity:"C",img:SCG+"04/441d2031-cosmic-suture-y.webp",         type:"Lightning Wizard Attack Action",pitch:2},
  {id:"c21",name:"Cosmic Suture (3)", rarity:"C",img:SCG+"04/441d2031-cosmic-suture-b.webp",         type:"Lightning Wizard Attack Action",pitch:3},
  {id:"c22",name:"Nebula Duality (1)",rarity:"C",img:SCG+"04/553e232c-nebula-duality-r.webp",        type:"Lightning Wizard Attack Action",pitch:1},
  {id:"c23",name:"Nebula Duality (2)",rarity:"C",img:SCG+"04/6000a797-nebula-duality-y.webp",        type:"Lightning Wizard Attack Action",pitch:2},
  {id:"c24",name:"Nebula Duality (3)",rarity:"C",img:SCG+"04/6000a797-nebula-duality-b.webp",        type:"Lightning Wizard Attack Action",pitch:3},
  {id:"c25",name:"Auric Shards (1)",        rarity:"C",img:SCG+"04/5110994a-auric-shards-r.webp",              type:"Lightning Illusionist Attack Action",pitch:1},
  {id:"c26",name:"Auric Shards (2)",        rarity:"C",img:SCG+"04/5110994a-auric-shards-y.webp",              type:"Lightning Illusionist Attack Action",pitch:2},
  {id:"c27",name:"Auric Shards (3)",        rarity:"C",img:SCG+"04/5110994a-auric-shards-b.webp",              type:"Lightning Illusionist Attack Action",pitch:3},
  {id:"c28",name:"Cosmic Duality (1)",      rarity:"C",img:SCG+"04/85fa7fc2-cosmic-duality-r.webp",            type:"Lightning Illusionist Action",pitch:1},
  {id:"c29",name:"Cosmic Duality (2)",      rarity:"C",img:SCG+"04/85fa7fc2-cosmic-duality-y.webp",            type:"Lightning Illusionist Action",pitch:2},
  {id:"c30",name:"Cosmic Duality (3)",      rarity:"C",img:SCG+"04/a70cce47-cosmic-duality-b.webp",            type:"Lightning Illusionist Action",pitch:3},
  {id:"c31",name:"Pulsing Cardia (1)",      rarity:"C",img:SCG+"04/51e8c87d-pulsing-cardia-r.webp",            type:"Lightning Illusionist Attack Action",pitch:1},
  {id:"c32",name:"Pulsing Cardia (2)",      rarity:"C",img:SCG+"04/51e8c87d-pulsing-cardia-y.webp",            type:"Lightning Illusionist Attack Action",pitch:2},
  {id:"c33",name:"Pulsing Cardia (3)",      rarity:"C",img:SCG+"04/51e8c87d-pulsing-cardia-b.webp",            type:"Lightning Illusionist Attack Action",pitch:3},
  {id:"c34",name:"Corrosive Space Dust (1)",rarity:"C",img:SCG+"05/bb594bcc-corrosive-space-dust-r.webp",      type:"Lightning Illusionist Action",pitch:1},
  {id:"c35",name:"Corrosive Space Dust (2)",rarity:"C",img:SCG+"05/bb594bcc-corrosive-space-dust-y.webp",      type:"Lightning Illusionist Action",pitch:2},
  {id:"c36",name:"Corrosive Space Dust (3)",rarity:"C",img:SCG+"05/bb594bcc-corrosive-space-dust-b.webp",      type:"Lightning Illusionist Action",pitch:3},
  {id:"c37",name:"Unmake the Underlings",rarity:"C",img:SCG+"05/36a6e6a9-unmake-the-underlings-383x535.webp", type:"Assassin Action"},
  {id:"c38",name:"Feral Instinct",       rarity:"C",img:SCG+"05/f4f75dd3-feral-instinct-383x535.webp",       type:"Brute Action"},
  {id:"c39",name:"Gear Turner",          rarity:"C",img:SCG+"05/58ed9de3-gear-turner-383x535.webp",          type:"Mechanologist Action"},
  {id:"c40",name:"Crash Site Salvage",   rarity:"C",img:SCG+"05/f1f1c974-crash-site-salvage-383x535.webp",   type:"Pirate Mechanologist Action"},
  {id:"c41",name:"Pile Driver",          rarity:"C",img:SCG+"05/4988a2b7-pile-driver-383x535.webp",          type:"Guardian Action"},
  {id:"c42",name:"Ominous Aggression",   rarity:"C",img:SCG+"05/25cb9fd8-ominous-aggression.webp",           type:"Generic Action"},
  {id:"c43",name:"Step Between",         rarity:"C",img:SCG+"05/25cb9fd8-step-between.webp",                 type:"Generic Action"},
  {id:"c44",name:"Boots",                rarity:"C",img:SCG+"05/25cb9fd8-boots.webp",                        type:"Generic Equipment — Legs"},
  {id:"r1", name:"Astral Strike",              rarity:"R",img:SCG+"04/9825fda0-astral-strike.webp",              type:"Lightning Action"},
  {id:"r2", name:"Flowing Strike",             rarity:"R",img:SCG+"04/9825fda0-flowing-strike.webp",             type:"Lightning Attack Action"},
  {id:"r3", name:"Voltic Impact",              rarity:"R",img:SCG+"04/1e95d39b-voltic-impact.webp",              type:"Lightning Attack Action"},
  {id:"r4", name:"Beckoning Brilliance",       rarity:"R",img:SCG+"04/12d6b399-beckoning-brilliance.webp",       type:"Lightning Action"},
  {id:"r5", name:"Static Shelter",             rarity:"R",img:SCG+"04/12d6b399-static-shelter.webp",            type:"Lightning Defensive Reaction"},
  {id:"r6", name:"Dashing Flashfoot",          rarity:"R",img:SCG+"04/4094afd0-dashing-flashfoot.webp",         type:"Lightning Runeblade Equipment — Legs"},
  {id:"r7", name:"Arcanic Reproach",           rarity:"R",img:SCG+"05/de508f51-arcanic-reproach.webp",          type:"Lightning Runeblade Attack Action"},
  {id:"r8", name:"Prophetic Quickstep",        rarity:"R",img:SCG+"05/de508f51-prophetic-quickstep.webp",       type:"Lightning Runeblade Action"},
  {id:"r9", name:"Echoflash",                  rarity:"R",img:SCG+"04/120447cf-echoflash.webp",                 type:"Lightning Wizard Instant"},
  {id:"r10",name:"Blink of an Eye",            rarity:"R",img:SCG+"04/921c9f8e-blink-of-an-eye.webp",          type:"Lightning Illusionist Action"},
  {id:"r11",name:"Circular Flowtide",          rarity:"R",img:SCG+"04/921c9f8e-circular-flowtide.webp",        type:"Lightning Illusionist Attack Action"},
  {id:"r12",name:"Turn to Mindfire",           rarity:"R",img:SCG+"05/aac8c493-turn-to-mindfire.webp",         type:"Wizard Action"},
  {id:"r13",name:"Red Lure Harpoon",           rarity:"R",img:SCG+"05/43ea4ed5-red-lure-harpoon-383x535.webp", type:"Pirate Ranger Weapon"},
  {id:"r14",name:"Boots of Astral Sanctuary",  rarity:"R",img:SCG+"05/2a88d2f0-boots-of-astral-sanctuary.webp",type:"Equipment — Legs"},
  {id:"r15",name:"Gloves of Astral Sanctuary", rarity:"R",img:SCG+"05/2a88d2f0-gloves-of-astral-sanctuary.webp",type:"Equipment — Arms"},
  {id:"r16",name:"Helm of Astral Sanctuary",   rarity:"R",img:SCG+"05/9ba16fe6-helm-of-astral-sanctuary.webp", type:"Equipment — Head"},
  {id:"r17",name:"Robe of Astral Sanctuary",   rarity:"R",img:SCG+"05/9ba16fe6-robe-of-astral-sanctuary.webp", type:"Equipment — Chest"},
  {id:"m1", name:"Flowstate Embodiment",    rarity:"M",img:SCG+"04/9825fda0-flowstate-embodiment.webp",              type:"Lightning Action"},
  {id:"m2", name:"Meteoric Rise",           rarity:"M",img:SCG+"04/1e95d39b-meteoric-rise.webp",                     type:"Lightning Action"},
  {id:"m3", name:"Scorpio",                 rarity:"M",img:SCG+"04/4094afd0-scorpio.webp",                           type:"Lightning Runeblade Weapon — Sword"},
  {id:"m4", name:"Tempestuous Kiss",        rarity:"M",img:SCG+"04/3cbec7db-tempestuous-kiss.webp",                  type:"Lightning Runeblade Action"},
  {id:"m5", name:"Volzar",                  rarity:"M",img:SCG+"04/120447cf-volzar.webp",                            type:"Lightning Wizard Weapon — Staff"},
  {id:"m6", name:"Aphrodias",               rarity:"M",img:SCG+"04/c1e37f61-aphrodias.webp",                         type:"Lightning Illusionist Weapon"},
  {id:"m7", name:"Unwinding Finality",      rarity:"M",img:SCG+"05/7d99acd4-undwinding-finality.webp",              type:"Lightning Illusionist Action"},
  {id:"m8", name:"Flicker Reality",         rarity:"M",img:SCG+"04/921c9f8e-flicker-reality.webp",                  type:"Lightning Illusionist Action"},
  {id:"m9", name:"Third Eye of the Sphinx", rarity:"M",img:SCG+"05/2363ff83-third-eye-of-the-sphinx-383x535.webp",  type:"Illusionist Wizard Action"},
  {id:"m10",name:"Lionclaw Maul",           rarity:"M",img:SCG+"05/0fbc753e-lionclaw-maul-383x535.webp",            type:"Reviled Guardian Weapon — Maul"},
  {id:"m11",name:"Tome of Quandaries",      rarity:"M",img:SCG+"05/aac8c493-tome-of-quandaries.webp",               type:"Wizard Equipment — Off-Hand"},
  {id:"l1", name:"Stormshard",rarity:"L",img:SCG+"03/dfa65a69-stormshard.png",type:"Lightning Action"},
];

// ── DATA SETUP ───────────────────────────────────────────────────────────────

function buildPool() {
  const pool = [...REVEALED];
  const add = (rarity, n, pfx, type) => {
    for (let i = 0; i < n; i++)
      pool.push({ id:`${pfx}${i}`, name:`Unrevealed ${RM[rarity].label}`, rarity, img:null, type });
  };
  add("C", 90, "uc", "Unrevealed Common");
  add("R", 43, "ur", "Unrevealed Rare");
  add("M", 26, "um", "Unrevealed Majestic");
  add("L",  4, "ul", "Unrevealed Legendary");
  add("F",  1, "uf", "Unrevealed Fabled");
  add("B", 14, "ub", "Unrevealed Basic");   // 14 Basic cards in OTA
  add("MV",12, "umv","Unrevealed Marvel");  // 12 Marvel cards in OTA
  return pool;
}

const POOL = buildPool();
const BY   = { T:[], B:[], C:[], R:[], M:[], L:[], MV:[], F:[] };
POOL.forEach(c => { if (BY[c.rarity]) BY[c.rarity].push(c); });

let _uid = 0;
const stamp = (c, pi) => ({ ...c, _iid:`${pi}-${++_uid}`, _pack:pi });
const pickN = (arr, n) => [...(arr||[])].sort(() => Math.random() - 0.5).slice(0, n);

function buildPack(pi) {
  const pick1 = pool => pickN(pool?.length ? pool : BY.C, 1)[0];
  const cards  = [];

  // 11 Commons
  cards.push(...pickN(BY.C, 11).map(c => ({...c})));

  // Rare slot (always Rare)
  const r1 = pick1(BY.R);
  if (r1) cards.push({...r1});

  // Rare-or-Majestic slot (~1 in 7 chance of Majestic)
  const r2src = Math.random() < 1/7 && BY.M.length ? BY.M : BY.R;
  const r2 = pick1(r2src);
  if (r2) cards.push({...r2});

  // Rainbow Foil: pick any card from set, weighted toward Commons
  // ~62% RF Common, ~27% RF Rare, ~9% RF Majestic, ~2% RF Legendary/Marvel
  const rfRoll = Math.random();
  const rfSrc  = rfRoll < 0.62 ? BY.C
    : rfRoll < 0.89 ? BY.R
    : rfRoll < 0.98 ? BY.M
    : [...BY.L, ...BY.MV].filter(Boolean);
  const rfBase = pick1(rfSrc?.length ? rfSrc : BY.C);
  if (rfBase) cards.push({ ...rfBase, foil:"RF" });

  // Basic Slot 1: usually a Basic card; 1-in-24 packs replaced by Cold Foil
  if (Math.random() < 1/24) {
    const cfRoll = Math.random();
    const cfSrc  = cfRoll < 0.50 ? BY.R : cfRoll < 0.85 ? BY.M : BY.L;
    const cfBase = pick1(cfSrc?.length ? cfSrc : BY.R);
    if (cfBase) cards.push({ ...cfBase, foil:"CF" });
  } else {
    const b = pick1(BY.B);
    if (b) cards.push({...b});
  }

  // Basic Slot 2: Basic (~93%), Expansion Slot (~4%), Legendary (~2%),
  //              Marvel (~0.6%), Fabled (~0.2%)
  const s2 = Math.random();
  if      (s2 < 0.002 && BY.F.length)  { cards.push({...pick1(BY.F) }); }
  else if (s2 < 0.008 && BY.MV.length) { cards.push({...pick1(BY.MV)}); }
  else if (s2 < 0.028 && BY.L.length)  { cards.push({...pick1(BY.L) }); }
  else if (s2 < 0.068) {
    // Expansion Slot (Extended Art): treated as a foil Rare/Majestic
    const expBase = pick1([...BY.R, ...BY.M]);
    if (expBase) cards.push({ ...expBase, foil:"EXP" });
  } else {
    const b = pick1(BY.B);
    if (b) cards.push({...b});
  }

  return cards.map(c => stamp(c, pi));
}

function getClass(c) {
  const t = c.type || "";
  if (t.startsWith("Unrevealed"))                       return "Unrevealed";
  if (t.includes("Token")||t.includes("Macro"))         return "Token / Macro";
  if (t.includes("Lightning Runeblade"))                return "Lightning Runeblade";
  if (t.includes("Lightning Wizard"))                   return "Lightning Wizard";
  if (t.includes("Lightning Illusionist"))              return "Lightning Illusionist";
  if (t.includes("Lightning"))                          return "Lightning";
  if (t.includes("Illusionist")&&t.includes("Wizard")) return "Illusionist / Wizard";
  if (t.includes("Wizard"))                             return "Wizard";
  if (t.includes("Pirate Mechanologist"))               return "Pirate Mechanologist";
  if (t.includes("Pirate Ranger"))                      return "Pirate Ranger";
  if (t.includes("Reviled Guardian"))                   return "Reviled Guardian";
  if (t.includes("Guardian"))                           return "Guardian";
  if (t.includes("Mechanologist"))                      return "Mechanologist";
  if (t.includes("Assassin"))                           return "Assassin";
  if (t.includes("Brute"))                              return "Brute";
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

function HomeView({ onGenPack, onGenSealed }) {
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

      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <Btn onClick={onGenPack}>🃏 Generate booster pack</Btn>
        <Btn ghost onClick={onGenSealed}>📦 Generate sealed pool (8 packs)</Btn>
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
    .g{display:grid;grid-template-columns:repeat(4,63mm);
       grid-auto-rows:88mm;gap:2mm;padding:6mm}
    .c{width:63mm;height:88mm;overflow:hidden;
       border-radius:5px;border:2px solid;position:relative}
    .c img{width:100%;height:100%;object-fit:cover;display:block}
    .fb{position:absolute;inset:0;display:flex;flex-direction:column;
        justify-content:center;align-items:center;gap:6px;padding:8px}
    .rl{font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px}
    .nm{font-size:9px;font-weight:600;text-align:center;line-height:1.3}
    .bolt{font-size:32px;opacity:.18;line-height:1}
    /* ── print ── */
    @media print{
      .bar{display:none}
      @page{margin:0;size:A4 portrait}
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

  const genPack = () => { setPack(buildPack(Date.now())); setView("pack"); };
  const genSealed = () => {
    const ps = Array.from({ length:8 }, (_, i) => buildPack(i));
    setPools(ps); setFlatPool(ps.flat()); setDeckSet(new Set()); setExpanded({}); setView("sealed");
  };
  // Like genSealed but stays on deck view — for the deck builder empty state
  const genSealedAndBuild = () => {
    const ps = Array.from({ length:8 }, (_, i) => buildPack(i));
    setPools(ps); setFlatPool(ps.flat()); setDeckSet(new Set()); setExpanded({});
    // don't call setView — stay on deck
  };
  const toggleCard = c => {
    setDeckSet(p => { const n = new Set(p); n.has(c._iid) ? n.delete(c._iid) : n.add(c._iid); return n; });
  };
  const deckCards = flatPool.filter(c => deckSet.has(c._iid));

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
          {view==="home"   && <HomeView onGenPack={genPack} onGenSealed={genSealed} />}

          {view==="pack" && (pack
            ? <PackView pack={pack} onRegen={genPack} onPrint={() => openPrintWindow(pack)} />
            : <EmptyState icon="🃏" title="No pack generated yet"
                description="Generate a booster pack to open 16 cards from Omens of the Third Age.">
                <Btn onClick={genPack}>Generate booster pack</Btn>
              </EmptyState>
          )}

          {view==="sealed" && (pools
            ? <SealedView pools={pools} expanded={expanded} setExpanded={setExpanded}
                onRegen={genSealed} onPrint={() => openPrintWindow(flatPool)}
                onDeck={() => setView("deck")} />
            : <EmptyState icon="📦" title="No sealed pool yet"
                description="Generate 8 booster packs to practice building a sealed deck.">
                <Btn onClick={genSealed}>Generate sealed pool</Btn>
              </EmptyState>
          )}

          {view==="deck" && (flatPool.length > 0
            ? <DeckView flatPool={flatPool} deckSet={deckSet} deckCards={deckCards}
                onToggle={toggleCard} onPrint={() => openPrintWindow(deckCards)}
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
