// FAB SEALED — Omens of the Third Age Sealed Practice Tool
import { useState, useMemo, useRef, useEffect } from "react";

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const CARD_BACK = "https://fabdb2.imgix.net/cards/backs/cardback1.png";
const SCG = "https://scg-static.starcitygames.com/articles/2026/";

const THEME = {
  bg:       "#08080f",
  surface:  "#111120",
  panel:    "#181828",
  border:   "#25253a",
  borderHi: "#3a3a58",
  accent:   "#e8a820",
  accentLo: "#e8a82020",
  accentMd: "#e8a82055",
  text:     "#ede8df",
  muted:    "#8b8fa8",
  dim:      "#4a4d64",
};

const RM = {
  T: { label:"Token",    bg:"#0f2b1a", fg:"#4ade80", bd:"#4ade8044" },
  C: { label:"Common",  bg:"#1a1a1a", fg:"#b8bfd0", bd:"#b8bfd033" },
  R: { label:"Rare",    bg:"#0b1c34", fg:"#60a5fa", bd:"#60a5fa44" },
  M: { label:"Majestic",bg:"#1a0c34", fg:"#c084fc", bd:"#c084fc66" },
  L: { label:"Legendary",bg:"#2c1804", fg:"#fbbf24", bd:"#fbbf2466" },
  F: { label:"Fabled",  bg:"#2c0b0b", fg:"#f87171", bd:"#f8717166" },
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
  // ── Tokens / Macro ──────────────────────────────────────────────────────────
  {id:"t1",name:"Lightning Flow",         rarity:"T",img:SCG+"04/8eb6058c-lightning-flow.webp",                type:"Token"},
  {id:"t2",name:"Embodiment of Lightning",rarity:"T",img:SCG+"04/88681f60-embodiment-of-lightning.webp",       type:"Token"},
  {id:"t3",name:"Ponder",                 rarity:"T",img:SCG+"04/8eb6058c-ponder.webp",                        type:"Token"},
  {id:"t4",name:"Omens of Arcana",        rarity:"T",img:SCG+"04/6d6f6837-omens-of-arcana-383x535.webp",       type:"Macro"},
  // ── Commons: Generic Lightning ───────────────────────────────────────────────
  {id:"c1", name:"Rift Breaker (1)",            rarity:"C",img:SCG+"04/9ad76246-rift-breaker-r.webp",          type:"Lightning Attack Action",pitch:1},
  {id:"c2", name:"Rift Breaker (2)",            rarity:"C",img:SCG+"04/1d4661ee-rift-breaker-y.webp",          type:"Lightning Attack Action",pitch:2},
  {id:"c3", name:"Rift Breaker (3)",            rarity:"C",img:SCG+"04/9ad76246-rift-breaker-b.webp",          type:"Lightning Attack Action",pitch:3},
  {id:"c4", name:"Glide Through Starlight (1)", rarity:"C",img:SCG+"05/c4e8e688-glide-through-starlight-r.webp",type:"Lightning Action",pitch:1},
  {id:"c5", name:"Glide Through Starlight (2)", rarity:"C",img:SCG+"05/c4e8e688-glide-through-starlight-y.webp",type:"Lightning Action",pitch:2},
  {id:"c6", name:"Glide Through Starlight (3)", rarity:"C",img:SCG+"05/c4e8e688-glide-through-starlight-b.webp",type:"Lightning Action",pitch:3},
  // ── Commons: Lightning Runeblade ─────────────────────────────────────────────
  {id:"c7", name:"Voltbound Duality (1)", rarity:"C",img:SCG+"04/3d890cd2-voltbound-duality-r.webp",  type:"Lightning Runeblade Attack Action",pitch:1},
  {id:"c8", name:"Voltbound Duality (2)", rarity:"C",img:SCG+"04/3d890cd2-voltbound-duality-y.webp",  type:"Lightning Runeblade Attack Action",pitch:2},
  {id:"c9", name:"Voltbound Duality (3)", rarity:"C",img:SCG+"04/3d890cd2-voltbound-duality-b.webp",  type:"Lightning Runeblade Attack Action",pitch:3},
  {id:"c10",name:"Mercurial Skies (1)",   rarity:"C",img:SCG+"04/69f84da2-mercurial-skies-r.webp",   type:"Lightning Runeblade Action",pitch:1},
  {id:"c11",name:"Mercurial Skies (2)",   rarity:"C",img:SCG+"04/69f84da2-mercurial-skies-y.webp",   type:"Lightning Runeblade Action",pitch:2},
  {id:"c12",name:"Mercurial Skies (3)",   rarity:"C",img:SCG+"04/69f84da2-mercurial-skies-u.webp",   type:"Lightning Runeblade Action",pitch:3},
  // ── Commons: Lightning Wizard ────────────────────────────────────────────────
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
  // ── Commons: Lightning Illusionist ───────────────────────────────────────────
  {id:"c25",name:"Auric Shards (1)",        rarity:"C",img:SCG+"04/5110994a-auric-shards-r.webp",               type:"Lightning Illusionist Attack Action",pitch:1},
  {id:"c26",name:"Auric Shards (2)",        rarity:"C",img:SCG+"04/5110994a-auric-shards-y.webp",               type:"Lightning Illusionist Attack Action",pitch:2},
  {id:"c27",name:"Auric Shards (3)",        rarity:"C",img:SCG+"04/5110994a-auric-shards-b.webp",               type:"Lightning Illusionist Attack Action",pitch:3},
  {id:"c28",name:"Cosmic Duality (1)",      rarity:"C",img:SCG+"04/85fa7fc2-cosmic-duality-r.webp",             type:"Lightning Illusionist Action",pitch:1},
  {id:"c29",name:"Cosmic Duality (2)",      rarity:"C",img:SCG+"04/85fa7fc2-cosmic-duality-y.webp",             type:"Lightning Illusionist Action",pitch:2},
  {id:"c30",name:"Cosmic Duality (3)",      rarity:"C",img:SCG+"04/a70cce47-cosmic-duality-b.webp",             type:"Lightning Illusionist Action",pitch:3},
  {id:"c31",name:"Pulsing Cardia (1)",      rarity:"C",img:SCG+"04/51e8c87d-pulsing-cardia-r.webp",             type:"Lightning Illusionist Attack Action",pitch:1},
  {id:"c32",name:"Pulsing Cardia (2)",      rarity:"C",img:SCG+"04/51e8c87d-pulsing-cardia-y.webp",             type:"Lightning Illusionist Attack Action",pitch:2},
  {id:"c33",name:"Pulsing Cardia (3)",      rarity:"C",img:SCG+"04/51e8c87d-pulsing-cardia-b.webp",             type:"Lightning Illusionist Attack Action",pitch:3},
  {id:"c34",name:"Corrosive Space Dust (1)",rarity:"C",img:SCG+"05/bb594bcc-corrosive-space-dust-r.webp",       type:"Lightning Illusionist Action",pitch:1},
  {id:"c35",name:"Corrosive Space Dust (2)",rarity:"C",img:SCG+"05/bb594bcc-corrosive-space-dust-y.webp",       type:"Lightning Illusionist Action",pitch:2},
  {id:"c36",name:"Corrosive Space Dust (3)",rarity:"C",img:SCG+"05/bb594bcc-corrosive-space-dust-b.webp",       type:"Lightning Illusionist Action",pitch:3},
  // ── Commons: Other classes ───────────────────────────────────────────────────
  {id:"c37",name:"Unmake the Underlings",rarity:"C",img:SCG+"05/36a6e6a9-unmake-the-underlings-383x535.webp", type:"Assassin Action"},
  {id:"c38",name:"Feral Instinct",       rarity:"C",img:SCG+"05/f4f75dd3-feral-instinct-383x535.webp",       type:"Brute Action"},
  {id:"c39",name:"Gear Turner",          rarity:"C",img:SCG+"05/58ed9de3-gear-turner-383x535.webp",          type:"Mechanologist Action"},
  {id:"c40",name:"Crash Site Salvage",   rarity:"C",img:SCG+"05/f1f1c974-crash-site-salvage-383x535.webp",   type:"Pirate Mechanologist Action"},
  {id:"c41",name:"Pile Driver",          rarity:"C",img:SCG+"05/4988a2b7-pile-driver-383x535.webp",          type:"Guardian Action"},
  {id:"c42",name:"Ominous Aggression",   rarity:"C",img:SCG+"05/25cb9fd8-ominous-aggression.webp",           type:"Generic Action"},
  {id:"c43",name:"Step Between",         rarity:"C",img:SCG+"05/25cb9fd8-step-between.webp",                 type:"Generic Action"},
  {id:"c44",name:"Boots",                rarity:"C",img:SCG+"05/25cb9fd8-boots.webp",                        type:"Generic Equipment — Legs"},
  // ── Rares ────────────────────────────────────────────────────────────────────
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
  // ── Majestics ────────────────────────────────────────────────────────────────
  {id:"m1", name:"Flowstate Embodiment",    rarity:"M",img:SCG+"04/9825fda0-flowstate-embodiment.webp",               type:"Lightning Action"},
  {id:"m2", name:"Meteoric Rise",           rarity:"M",img:SCG+"04/1e95d39b-meteoric-rise.webp",                      type:"Lightning Action"},
  {id:"m3", name:"Scorpio",                 rarity:"M",img:SCG+"04/4094afd0-scorpio.webp",                            type:"Lightning Runeblade Weapon — Sword"},
  {id:"m4", name:"Tempestuous Kiss",        rarity:"M",img:SCG+"04/3cbec7db-tempestuous-kiss.webp",                   type:"Lightning Runeblade Action"},
  {id:"m5", name:"Volzar",                  rarity:"M",img:SCG+"04/120447cf-volzar.webp",                             type:"Lightning Wizard Weapon — Staff"},
  {id:"m6", name:"Aphrodias",               rarity:"M",img:SCG+"04/c1e37f61-aphrodias.webp",                          type:"Lightning Illusionist Weapon"},
  {id:"m7", name:"Unwinding Finality",      rarity:"M",img:SCG+"05/7d99acd4-undwinding-finality.webp",               type:"Lightning Illusionist Action"},
  {id:"m8", name:"Flicker Reality",         rarity:"M",img:SCG+"04/921c9f8e-flicker-reality.webp",                   type:"Lightning Illusionist Action"},
  {id:"m9", name:"Third Eye of the Sphinx", rarity:"M",img:SCG+"05/2363ff83-third-eye-of-the-sphinx-383x535.webp",   type:"Illusionist Wizard Action"},
  {id:"m10",name:"Lionclaw Maul",           rarity:"M",img:SCG+"05/0fbc753e-lionclaw-maul-383x535.webp",             type:"Reviled Guardian Weapon — Maul"},
  {id:"m11",name:"Tome of Quandaries",      rarity:"M",img:SCG+"05/aac8c493-tome-of-quandaries.webp",                type:"Wizard Equipment — Off-Hand"},
  // ── Legendary ────────────────────────────────────────────────────────────────
  {id:"l1",name:"Stormshard",rarity:"L",img:SCG+"03/dfa65a69-stormshard.png",type:"Lightning Action"},
];

// ── HELPERS ──────────────────────────────────────────────────────────────────

function getClass(c) {
  const t = c.type || "";
  if (t.startsWith("Unrevealed"))              return "Unrevealed";
  if (t.includes("Token")||t.includes("Macro"))return "Token / Macro";
  if (t.includes("Lightning Runeblade"))       return "Lightning Runeblade";
  if (t.includes("Lightning Wizard"))          return "Lightning Wizard";
  if (t.includes("Lightning Illusionist"))     return "Lightning Illusionist";
  if (t.includes("Lightning"))                 return "Lightning";
  if (t.includes("Illusionist")&&t.includes("Wizard")) return "Illusionist / Wizard";
  if (t.includes("Wizard"))                    return "Wizard";
  if (t.includes("Pirate Mechanologist"))      return "Pirate Mechanologist";
  if (t.includes("Pirate Ranger"))             return "Pirate Ranger";
  if (t.includes("Reviled Guardian"))          return "Reviled Guardian";
  if (t.includes("Guardian"))                  return "Guardian";
  if (t.includes("Mechanologist"))             return "Mechanologist";
  if (t.includes("Assassin"))                  return "Assassin";
  if (t.includes("Brute"))                     return "Brute";
  return "Generic";
}

function groupCards(cards, mode) {
  if (mode === "class") {
    const g = {};
    cards.forEach(c => { const k = getClass(c); if (!g[k]) g[k] = []; g[k].push(c); });
    return CLASS_ORDER.filter(k => g[k]?.length).map(k => ({ key:k, label:k, cards:g[k] }));
  }
  if (mode === "rarity") {
    const ord = ["T","C","R","M","L","F"], g = {};
    ord.forEach(r => { g[r] = []; });
    cards.forEach(c => { if (g[c.rarity]) g[c.rarity].push(c); });
    return ord.filter(r => g[r].length).map(r => ({ key:r, label:RM[r].label+"s", cards:g[r], rm:RM[r] }));
  }
  return [{ key:"all", label:null, cards:[...cards].sort((a,b)=>a.name.localeCompare(b.name)) }];
}

function buildPool() {
  const pool = [...REVEALED];
  const add = (rarity, n, pfx, type) => {
    for (let i = 0; i < n; i++) pool.push({ id:`${pfx}${i}`, name:`Unrevealed ${RM[rarity].label}`, rarity, img:null, type });
  };
  add("C", 90, "uc", "Unrevealed Common");
  add("R", 43, "ur", "Unrevealed Rare");
  add("M", 26, "um", "Unrevealed Majestic");
  add("L",  4, "ul", "Unrevealed Legendary");
  add("F",  1, "uf", "Unrevealed Fabled");
  return pool;
}

const POOL = buildPool();
const BY = { T:[], C:[], R:[], M:[], L:[], F:[] };
POOL.forEach(c => { if (BY[c.rarity]) BY[c.rarity].push(c); });

let _uid = 0;
const stamp  = (c, pi) => ({ ...c, _iid:`${pi}-${++_uid}`, _pack:pi });
const pickN  = (arr, n) => [...(arr||[])].sort(() => Math.random() - 0.5).slice(0, n);

function buildPack(pi) {
  const roll = Math.random();
  const top  = roll < 0.01 && BY.F.length ? pickN(BY.F,1)
    : roll < 0.07 && BY.L.length ? pickN(BY.L,1)
    : pickN(BY.M,1);
  return [...pickN(BY.T,1), ...pickN(BY.C,11), ...pickN(BY.R,3), ...top].map(c => stamp(c, pi));
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
  if (skipped > 0) lines.push(`// Note: ${skipped} unrevealed card${skipped!==1?"s":""} omitted — add once full set is live`);
  return lines.join("\n").trim();
}

// ── COMPONENTS ───────────────────────────────────────────────────────────────

/** FAB SEALED logotype */
function Brand() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      {/* Logo mark: card + bolt */}
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <rect x="3" y="2" width="32" height="34" rx="5" fill={THEME.accent} />
        <path d="M22 5L11 20h8L16 33 28 17h-8L22 5z" fill={THEME.bg} />
      </svg>
      <div>
        <div style={{
          fontFamily:"'Cinzel', 'Palatino Linotype', serif",
          fontSize:22, fontWeight:700, letterSpacing:"0.15em",
          color:THEME.accent, lineHeight:1,
        }}>
          FAB SEALED
        </div>
        <div style={{ fontSize:10, color:THEME.dim, letterSpacing:"0.2em", marginTop:3 }}>
          OMENS OF THE THIRD AGE
        </div>
      </div>
    </div>
  );
}

/** Card tile — shows real art for revealed cards, card back for unrevealed */
function CardTile({ card, selected, onClick }) {
  const [primaryErr, setPrimaryErr] = useState(false);
  const [backErr,    setBackErr]    = useState(false);
  const m = RM[card.rarity] || RM.C;
  const isUnrevealed = !card.img;

  // Cascade: real art → card back → text fallback
  const showBack     = (!isUnrevealed && primaryErr) || isUnrevealed;
  const showFallback = showBack && backErr;

  const borderColor = selected ? m.fg : m.bd;

  return (
    <div
      onClick={onClick}
      style={{
        aspectRatio:"5/7", borderRadius:8, overflow:"hidden", position:"relative",
        border:`2px solid ${borderColor}`,
        boxShadow: selected ? `0 0 0 2px ${m.fg}55, 0 4px 16px #00000088` : "0 2px 8px #00000055",
        cursor: onClick ? "pointer" : "default",
        background: m.bg,
        transition:"border-color 0.12s, box-shadow 0.12s, transform 0.1s",
        transform: "translateZ(0)", // GPU layer for smooth hover
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateZ(0)"; }}
    >
      {/* Real art (revealed cards) */}
      {!isUnrevealed && !primaryErr && (
        <img src={card.img} alt={card.name} onError={() => setPrimaryErr(true)}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
      )}

      {/* Card back (unrevealed, or real art failed) */}
      {showBack && !backErr && (
        <img src={CARD_BACK} alt="Unrevealed card" onError={() => setBackErr(true)}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
      )}

      {/* Text fallback (both images failed) */}
      {showFallback && (
        <div style={{ width:"100%", height:"100%", background:m.bg,
          display:"flex", flexDirection:"column", justifyContent:"center",
          alignItems:"center", padding:"8px 6px", gap:4, textAlign:"center" }}>
          <span style={{ fontSize:9, fontWeight:600, color:m.fg,
            background:m.fg+"22", padding:"2px 7px", borderRadius:4 }}>{m.label}</span>
          <span style={{ fontSize: card.name.length > 20 ? 8 : 10, fontWeight:600,
            color:m.fg, lineHeight:1.3 }}>{card.name}</span>
          {!isUnrevealed && card.type && (
            <span style={{ fontSize:7, color:m.fg+"88", lineHeight:1.2 }}>{card.type}</span>
          )}
        </div>
      )}

      {/* Selected tick */}
      {selected && (
        <div style={{ position:"absolute", top:4, right:4, width:18, height:18,
          borderRadius:"50%", background:m.fg,
          display:"flex", alignItems:"center", justifyContent:"center",
          border:`2px solid ${THEME.bg}` }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke={THEME.bg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Rarity pip for unrevealed cards */}
      {isUnrevealed && !backErr && (
        <div style={{ position:"absolute", bottom:4, left:4,
          background:m.bg+"cc", border:`1px solid ${m.bd}`,
          borderRadius:3, padding:"1px 5px", fontSize:8, fontWeight:600, color:m.fg }}>
          {m.label}
        </div>
      )}
    </div>
  );
}

function CardGrid({ cards, deckSet, onToggle, cols }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:cols||"repeat(auto-fill,minmax(105px,1fr))", gap:8 }}>
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
            paddingBottom:6, borderBottom:`1px solid ${THEME.border}` }}>
            {g.rm && <span style={{ width:7, height:7, borderRadius:"50%",
              background:g.rm.fg, display:"inline-block", flexShrink:0 }} />}
            <span style={{ fontSize:11, fontWeight:600, color:THEME.muted,
              letterSpacing:"0.06em", textTransform:"uppercase" }}>
              {g.label}
            </span>
            <span style={{ fontSize:11, color:THEME.dim }}>({g.cards.length})</span>
          </div>
          <CardGrid cards={g.cards} deckSet={deckSet} onToggle={onToggle} cols={cols} />
        </div>
      ))}
    </div>
  );
}

function RarityBadge({ r }) {
  const m = RM[r] || RM.C;
  return (
    <span style={{ fontSize:11, fontWeight:600, background:m.bg, color:m.fg,
      border:`1px solid ${m.bd}`, borderRadius:4, padding:"1px 8px" }}>{m.label}</span>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize:12, padding:"4px 11px", borderRadius:4, fontFamily:"inherit",
      fontWeight: active ? 600 : 400,
      background: active ? THEME.accent+"22" : "transparent",
      color:      active ? THEME.accent : THEME.muted,
      border:     `1px solid ${active ? THEME.accent+"66" : THEME.border}`,
      cursor:"pointer", transition:"all 0.12s",
    }}>{label}</button>
  );
}

function NavTab({ id, label, icon, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:"transparent", border:"none", fontFamily:"inherit",
      cursor: disabled ? "default" : "pointer",
      padding:"0 16px", height:"100%", fontSize:13,
      display:"inline-flex", alignItems:"center", gap:6,
      borderBottom: `2px solid ${active ? THEME.accent : "transparent"}`,
      color: disabled ? THEME.dim : active ? THEME.accent : THEME.muted,
      fontWeight: active ? 600 : 400,
      transition:"color 0.12s, border-color 0.12s",
    }}>
      <span style={{ fontSize:15 }}>{icon}</span>{label}
    </button>
  );
}

// ── VIEWS ─────────────────────────────────────────────────────────────────────

function HomeView({ onGenPack, onGenSealed }) {
  const counts = Object.entries(RM).map(([r,m]) => ({ r, m, n:BY[r].length })).filter(x => x.n);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
      {/* Pre-release banner */}
      <div style={{ background:"#0d1828", border:`1px solid #1e4a7a`,
        borderRadius:8, padding:"10px 14px", fontSize:13,
        color:"#74b3f4", display:"flex", gap:10, alignItems:"flex-start" }}>
        <span style={{ fontSize:16, flexShrink:0 }}>⚡</span>
        <span>
          Pre-release practice tool. Spoiled cards show real art; the remaining {" "}
          <strong style={{color:"#a0c8f8"}}>~170 unrevealed cards</strong> use the official FaB card back.
          OTA releases <strong style={{color:"#a0c8f8"}}>June 5, 2026</strong>. Rarity assignments are estimated.
        </span>
      </div>

      {/* Set stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:8 }}>
        <div style={{ gridColumn:"1/-1", background:THEME.surface,
          borderRadius:8, border:`1px solid ${THEME.border}`,
          padding:"12px 16px", display:"flex", alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontSize:24, fontWeight:700, color:THEME.text }}>251</div>
            <div style={{ fontSize:12, color:THEME.muted }}>cards in set</div>
          </div>
          <div style={{ fontSize:12, color:THEME.dim, textAlign:"right", lineHeight:1.7 }}>
            {BY.C.length} Common · {BY.R.length} Rare<br />
            {BY.M.length} Majestic · {BY.L.length} Legendary · {BY.F.length} Fabled
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

      {/* Action buttons */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <button onClick={onGenPack} style={{
          background:THEME.accent, color:THEME.bg, border:"none",
          borderRadius:6, padding:"10px 20px", fontSize:14, fontWeight:700,
          fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:8,
        }}>
          <span>🃏</span> Generate booster pack
        </button>
        <button onClick={onGenSealed} style={{
          background:THEME.surface, color:THEME.text,
          border:`1px solid ${THEME.borderHi}`,
          borderRadius:6, padding:"10px 20px", fontSize:14, fontWeight:600,
          fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:8,
        }}>
          <span>📦</span> Generate sealed pool (8 packs)
        </button>
      </div>

      {/* Pack info */}
      <div style={{ background:THEME.surface, borderRadius:8,
        border:`1px solid ${THEME.border}`, padding:"14px 18px" }}>
        <div style={{ fontSize:12, color:THEME.muted, fontWeight:600, marginBottom:10,
          letterSpacing:"0.06em", textTransform:"uppercase" }}>Pack contents — 16 cards</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center",
          fontSize:13, color:THEME.muted }}>
          <span>1× <RarityBadge r="T" /></span>
          <span style={{color:THEME.dim}}>·</span>
          <span>11× <RarityBadge r="C" /></span>
          <span style={{color:THEME.dim}}>·</span>
          <span>3× <RarityBadge r="R" /></span>
          <span style={{color:THEME.dim}}>·</span>
          <span>1× <RarityBadge r="M" />
            <span style={{fontSize:11,color:THEME.dim,marginLeft:5}}>(~7% Legendary · ~1% Fabled)</span>
          </span>
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
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:THEME.text }}>Booster pack</div>
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
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:THEME.text }}>Sealed pool</div>
          <div style={{ fontSize:13, color:THEME.muted, marginTop:2 }}>
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
            <div key={i} style={{ border:`1px solid ${THEME.border}`, borderRadius:8, overflow:"hidden" }}>
              <button
                onClick={() => setExpanded(p => ({ ...p, [i]: !open }))}
                style={{ width:"100%", background: open ? THEME.panel : THEME.surface,
                  border:"none", cursor:"pointer", padding:"10px 14px",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  fontFamily:"inherit", fontSize:14, color:THEME.text,
                  borderBottom: open ? `1px solid ${THEME.border}` : "none",
                  transition:"background 0.12s" }}>
                <span style={{ fontWeight:600 }}>Pack {i + 1}</span>
                <span style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {notable.map(c => { const m = RM[c.rarity]; return (
                    <span key={c._iid} style={{ background:m.bg, color:m.fg, border:`1px solid ${m.bd}`,
                      borderRadius:4, fontSize:11, padding:"2px 8px", fontWeight:600 }}>
                      ✦ {c.name.replace(/ \(\d\)$/, "")}
                    </span>
                  ); })}
                  <span style={{ color:THEME.dim, fontSize:16 }}>{open ? "▲" : "▼"}</span>
                </span>
              </button>
              {open && (
                <div style={{ background:THEME.panel }}>
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
    <div style={{ background:THEME.panel, border:`1px solid ${THEME.borderHi}`,
      borderRadius:8, padding:"16px 18px", marginTop:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:THEME.text }}>Export to Fabrary</div>
          <div style={{ fontSize:12, color:THEME.muted, marginTop:2 }}>
            Copy the list below and paste it into Fabrary's deck builder.
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <Btn onClick={copy}>{copied ? "✓ Copied!" : "📋 Copy list"}</Btn>
          <a href="https://fabrary.net/decks" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
            <Btn ghost>↗ Open Fabrary</Btn>
          </a>
          <button onClick={onClose} style={{ background:"transparent", border:"none",
            color:THEME.dim, cursor:"pointer", fontSize:18, lineHeight:1, padding:"4px 6px" }}>×</button>
        </div>
      </div>

      {skipped > 0 && (
        <div style={{ background:"#2c1a04", border:"1px solid #7c4a10", borderRadius:6,
          padding:"8px 12px", fontSize:12, color:"#fbbf24", marginBottom:12 }}>
          ⚠ {skipped} unrevealed card{skipped!==1?"s":""} excluded — replace with actual card names once OTA is live.
        </div>
      )}

      <textarea ref={textRef} readOnly value={list}
        style={{ width:"100%", minHeight:220, padding:"10px 12px",
          background:THEME.bg, border:`1px solid ${THEME.border}`,
          borderRadius:6, fontFamily:"'Menlo','Monaco','Courier New',monospace",
          fontSize:12, color:THEME.text, resize:"vertical",
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
      {/* Hero picker */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:THEME.muted, fontWeight:600, marginBottom:10,
          letterSpacing:"0.06em", textTransform:"uppercase" }}>Choose your hero</div>
        <div style={{ display:"flex", gap:10 }}>
          {HEROES.map(h => (
            <div key={h.id} onClick={() => setHero(h.id === hero ? null : h.id)}
              style={{ cursor:"pointer", textAlign:"center", width:80 }}>
              <div style={{
                borderRadius:8, overflow:"hidden", border:`2px solid ${hero===h.id ? THEME.accent : THEME.border}`,
                boxShadow: hero===h.id ? `0 0 0 2px ${THEME.accent}55, 0 4px 20px #00000066` : "none",
                transition:"all 0.15s",
              }}>
                <div style={{ aspectRatio:"5/7", overflow:"hidden" }}>
                  <img src={h.img} alt={h.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                </div>
              </div>
              <div style={{ fontSize:10, fontWeight:600, marginTop:5, lineHeight:1.3,
                color: hero===h.id ? THEME.accent : THEME.muted }}>{h.name}</div>
              <div style={{ fontSize:9, color:THEME.dim, marginTop:2 }}>{h.cls}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:14, flexWrap:"wrap", gap:12 }}>
        <div style={{ fontSize:13, color:THEME.muted, alignSelf:"center" }}>
          Click cards to add or remove from your deck
        </div>
        <div style={{
          background: isLegal ? "#0d2c1a" : THEME.surface,
          border:`1px solid ${isLegal ? "#2a7a4a" : THEME.border}`,
          borderRadius:8, padding:"10px 18px", minWidth:185, textAlign:"right",
        }}>
          <div style={{ fontSize:12, fontWeight:600, marginBottom:3,
            color: isLegal ? "#4ade80" : THEME.muted }}>
            {isLegal ? "✓ Legal deck" : `${need} more card${need!==1?"s":""} needed`}
          </div>
          <div style={{ fontSize:30, fontWeight:700, color:THEME.text, lineHeight:1 }}>
            {deckCards.length}
            <span style={{ fontSize:14, fontWeight:400, color:THEME.dim }}> / 30 min</span>
          </div>
          {deckCards.length > 0 && (
            <div style={{ marginTop:6, display:"flex", gap:4, flexWrap:"wrap", justifyContent:"flex-end" }}>
              {Object.entries(RM).map(([r,m]) => {
                const n = deckCards.filter(c => c.rarity===r).length;
                if (!n) return null;
                return <span key={r} style={{ fontSize:10, background:m.bg, color:m.fg,
                  border:`1px solid ${m.bd}`, borderRadius:3, padding:"0 5px" }}>{n}× {m.label}</span>;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:14, flexWrap:"wrap" }}>
        {[["ALL","All"],["DECK",`In deck (${deckCards.length})`],["C","Commons"],["R","Rares"],["M","Majestics"],["T","Tokens"]].map(([v,l]) => (
          <Pill key={v} label={l} active={filter===v} onClick={() => setFilter(v)} />
        ))}
        <div style={{ width:1, height:20, background:THEME.border, margin:"0 4px" }} />
        {[["class","By class"],["rarity","By rarity"],["name","A–Z"]].map(([v,l]) => (
          <Pill key={v} label={l} active={sortMode===v} onClick={() => setSortMode(v)} />
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <Btn ghost onClick={() => setShowExport(x => !x)}>
            {showExport ? "▲ Hide export" : "↗ Fabrary export"}
          </Btn>
          <Btn ghost onClick={onPrint} disabled={!deckCards.length}>🖨 Print</Btn>
        </div>
      </div>

      {showExport && <FabraryPanel heroId={hero} deckCards={deckCards} onClose={() => setShowExport(false)} />}

      <div style={{ marginTop:16 }}>
        {baseCards.length > 0
          ? <GroupedGrid cards={baseCards} deckSet={deckSet} onToggle={onToggle} sortMode={sortMode} />
          : <div style={{ textAlign:"center", padding:"3rem 0", color:THEME.dim, fontSize:14 }}>
              {filter==="DECK" ? "No cards added yet — click any card to add it" : "No cards match this filter"}
            </div>
        }
      </div>
    </div>
  );
}

// Generic button
function Btn({ children, onClick, ghost, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily:"inherit", fontSize:13, fontWeight:600,
      padding:"7px 14px", borderRadius:6, cursor: disabled ? "not-allowed" : "pointer",
      transition:"all 0.12s", display:"inline-flex", alignItems:"center", gap:5,
      opacity: disabled ? 0.4 : 1,
      ...(ghost ? {
        background:"transparent", color:THEME.muted,
        border:`1px solid ${THEME.border}`,
      } : {
        background:THEME.accent, color:THEME.bg, border:"none",
      }),
    }}>{children}</button>
  );
}

// Print area (hidden in screen view, shows on Ctrl+P)
function PrintArea({ cards }) {
  if (!cards) return null;
  return (
    <div id="fab-print-area">
      {cards.map((c, i) => {
        const m = RM[c.rarity] || RM.C;
        const imgSrc = c.img || CARD_BACK;
        return (
          <div key={i} className="fab-print-card">
            <img src={imgSrc} alt={c.name}
              onError={e => {
                if (e.target.src !== CARD_BACK) { e.target.src = CARD_BACK; return; }
                e.target.style.display = "none";
                const fb = e.target.nextSibling;
                if (fb) fb.style.display = "flex";
              }} />
            <div style={{ display:"none", width:"100%", height:"100%", background:m.bg,
              flexDirection:"column", justifyContent:"center", alignItems:"center",
              textAlign:"center", padding:8, gap:4, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12, fontWeight:700, color:m.fg }}>{m.label}</div>
              <div style={{ fontSize:11, fontWeight:700, color:m.fg }}>{c.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view,      setView]     = useState("home");
  const [pack,      setPack]     = useState(null);
  const [pools,     setPools]    = useState(null);
  const [flatPool,  setFlatPool] = useState([]);
  const [deckSet,   setDeckSet]  = useState(new Set());
  const [expanded,  setExpanded] = useState({});
  const [printCards,setPrint]    = useState(null);
  const [hero,      setHero]     = useState(null);

  // Inject fonts + icons
  useEffect(() => {
    const inject = (rel, href) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const el = document.createElement("link");
      el.rel = rel; el.href = href;
      document.head.appendChild(el);
    };
    inject("preconnect", "https://fonts.googleapis.com");
    inject("stylesheet", "https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap");
    inject("stylesheet", "https://unpkg.com/@tabler/icons-webfont@latest/dist/tabler-icons.min.css");

    // Print CSS
    const style = document.createElement("style");
    style.id = "fab-print-css";
    if (!document.getElementById("fab-print-css")) {
      style.textContent = `
        @media print {
          body > *:not(.fab-sealed-root) { display: none !important; }
          .fab-sealed-root > *:not(#fab-print-area) { display: none !important; }
          #fab-print-area {
            display: grid !important;
            grid-template-columns: repeat(4, 63mm);
            gap: 2mm; padding: 8mm; background: white;
          }
          .fab-print-card {
            width: 63mm; height: 88mm;
            break-inside: avoid; overflow: hidden;
            position: relative;
          }
          .fab-print-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        }
        #fab-print-area { display: none; }
        .fab-print-card { position: relative; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const genPack = () => { setPack(buildPack(Date.now())); setView("pack"); };
  const genSealed = () => {
    const ps = Array.from({ length:8 }, (_, i) => buildPack(i));
    setPools(ps); setFlatPool(ps.flat()); setDeckSet(new Set()); setExpanded({}); setView("sealed");
  };
  const toggleCard = c => {
    setDeckSet(p => { const n = new Set(p); n.has(c._iid) ? n.delete(c._iid) : n.add(c._iid); return n; });
  };
  const doPrint = cards => { setPrint(cards); setTimeout(() => window.print(), 100); };
  const deckCards = flatPool.filter(c => deckSet.has(c._iid));

  const tabs = [
    { id:"home",   label:"Overview",     icon:"⊞",  disabled:false },
    { id:"pack",   label:"Booster pack", icon:"🃏", disabled:!pack },
    { id:"sealed", label:"Sealed pool",  icon:"📦", disabled:!pools },
    { id:"deck",   label:"Deck builder", icon:"✦",  disabled:!flatPool.length },
  ];

  return (
    <div className="fab-sealed-root" style={{
      minHeight:"100vh", background:THEME.bg, color:THEME.text,
      fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",
    }}>
      <PrintArea cards={printCards} />

      {/* ── Header ──────────────────────────────────────────────── */}
      <header style={{
        background:THEME.surface,
        borderBottom:`1px solid ${THEME.border}`,
        position:"sticky", top:0, zIndex:100,
      }}>
        <div style={{ maxWidth:1280, margin:"0 auto",
          display:"flex", alignItems:"stretch", gap:0,
          height:60, padding:"0 24px" }}>
          <div style={{ display:"flex", alignItems:"center", marginRight:32 }}>
            <Brand />
          </div>
          <nav style={{ display:"flex", alignItems:"stretch", gap:0 }}>
            {tabs.map(t => (
              <NavTab key={t.id} {...t}
                active={view === t.id}
                onClick={() => !t.disabled && setView(t.id)} />
            ))}
          </nav>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center",
            fontSize:11, color:THEME.dim, textAlign:"right", lineHeight:1.5 }}>
            Pre-release May 29<br />Release June 5, 2026
          </div>
        </div>
      </header>

      {/* ── Accent line under header ─────────────────────────────── */}
      <div style={{ height:2, background:`linear-gradient(90deg, ${THEME.accent}00, ${THEME.accent}88, ${THEME.accent}00)` }} />

      {/* ── Main content ─────────────────────────────────────────── */}
      <main style={{ maxWidth:1280, margin:"0 auto", padding:"28px 24px" }}>
        {view === "home"   && <HomeView onGenPack={genPack} onGenSealed={genSealed} />}
        {view === "pack"   && pack   && <PackView pack={pack} onRegen={genPack} onPrint={() => doPrint(pack)} />}
        {view === "sealed" && pools  && <SealedView pools={pools} expanded={expanded} setExpanded={setExpanded}
          onRegen={genSealed} onPrint={() => doPrint(flatPool)} onDeck={() => setView("deck")} />}
        {view === "deck"   && flatPool.length > 0 && <DeckView flatPool={flatPool} deckSet={deckSet}
          deckCards={deckCards} onToggle={toggleCard} onPrint={() => doPrint(deckCards)} hero={hero} setHero={setHero} />}
      </main>
    </div>
  );
}
