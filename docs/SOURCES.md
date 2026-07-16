# Sources & Research Notes

Provenance for the timeline data. The JSON carries **one** `link` per release — this file
carries what that field can't: **conflicting sources, rejected dates, and why we chose what
we chose.** If you ever wonder "why does this say 2004 when Wikipedia says 2007?", the answer
is here.

Rule of thumb used throughout: **record what is sourced, not what is tidy.** Where no end date
is documented, we leave it off rather than invent one (see E.A.T., ETC).

---

## Method notes / traps worth knowing

These bit us during research and will bite anyone who backfills dates from package metadata.

### GitHub tags and releases lie about age
- **Pixi.js** — the `v1.0.0` tag is an *annotated tag with a tagger date of 2021-11-10*,
  created retroactively ~8 years after the fact; its target SHA no longer resolves. Reading
  GitHub tags would date Pixi 1.0 to **2021** instead of 2013.
- **Two.js** — the earliest three releases (`v0.1.0-alpha`, `v0.2.0`, `v0.3.0`) all carry
  `published_at` of **2014-01-08**, three of them *within two minutes of each other*.
  Impossible for a 2012 project: they're backdated bulk-created tags.
- **Fritzing** — the GitHub repo was created 2014-08-25 (migrated from Google Code). Its
  oldest release is ~6 years *after* the real first release (2008-11-24).
- **ACU** — the archived repo is explicitly a "partial history" and post-dates the real work.

### npm/registry publish dates lag real releases
Pixi (~10 months), Two.js (~12 months). Never use registry `created` as a first-release proxy.

### Rolling tags aren't releases
openFrameworks' "latest release" is a rolling `nightly` tag. `scripts/fetch-releases.mjs`
filters these (see `ROLLING` regex) — don't remove that.

### Wikipedia is wrong in specific, known places
- **Wiring** — infobox says "initial release 2007". Contradicted by the project's own release
  log (2005) *and* Barragán's account (2003–04).
- **The Creators Project** — Wikipedia implies 2007 via Vice's channel expansion. The Intel
  press release pins the launch to 2010-05-17.
- **Design By Numbers** — Wikipedia's book date (2001-10-01) is the **paperback reissue**,
  not the first edition (1999).

### Distinguish project start / public availability / first package
Nearly every date conflict in this dataset reduces to these three being confused. Our
convention: **plot public availability.** Platform events (Twitter, YouTube, Vimeo, GitHub)
consistently use the date the public could actually use the thing.

---

## Genealogy sources

Contributed by a mentor in the field (personally present in the MIT Aesthetics + Computation
Group), then independently verified.

- Maks Surguy, *The History of Processing* — https://maxoffsky.com/research/research-essay-the-history-of-processing/
- Tom White (dribnet), genealogy diagram — https://x.com/dribnet/status/976581164356968448
- Tom White, ACU origin story — https://x.com/dribnet/status/976585053059756032
- Casey Reas, *A Modern Prometheus* — https://medium.com/processing-foundation/a-modern-prometheus-59aed94abe85
- Ben Fry, dissertation ch. 6 — https://www.benfry.com/phd/dissertation/6.html
- Hernando Barragán, *The Untold History of Arduino* — https://arduinohistory.github.io/

> **⚠️ The two genealogy diagrams are NOT independent sources.** Surguy's diagram is a *redraw*
> of dribnet's (the essay's appendix says so: "includes corrections from Tom White's tweet").
> Treating them as corroborating each other is a mistake. The only place they disagree —
> acJava's date (1998 vs 1999) — is transcription drift in the redraw, not a second opinion.

After subtracting what we already had, the diagrams yielded only **five** new nodes, of which
**Wiring is the only significant one**.

---

## Per-entry notes

### Wiring — dated 2004
Three defensible dates: **2003** (thesis begun), **2004** (thesis completed; 25 boards ordered
March 2004, ~100 made by IDII, used to teach "Strangely Familiar" that autumn), **2005-05-04**
(earliest entry on the official release log; #05 on 2005-09-12 is when it went open source).

We plot **2004** — when Wiring existed as a platform and was being taught with. Dating it 2005
would make it look contemporaneous with Arduino and **visually destroy the lineage**, which is
the whole reason it matters. Without Wiring, the Processing→Arduino edge is a fiction: Arduino
forked *Wiring*, not Processing. `setup()`/`loop()`/`digitalWrite()`/`pinMode()` are Barragán's.

**On the Arduino fork — separate the sourced facts from the contested intent:**
- *Corroborated beyond Barragán*: the fork itself; the ATmega8 cost motive; Banzi and Reas as
  his thesis supervisors; David Mellis's 2013 Open Hardware Summit acknowledgment that the
  Arduino team "hadn't done a very good job acknowledging Wiring."
- *Barragán's own account*: that no one asked him first ("There was no need to create a
  separate project, as I would have gladly helped them"), that he was never invited onto the
  team, and that he does not know why they forked. Arduino has published no detailed rebuttal.

### Design By Numbers — dated 1999 ⚠️ OPEN QUESTION
Reas's own history says "**Both the MIT Press book and software for the project were released
in 1999**" — that's what we use. **But Ben Fry's dissertation dates DBN to 2000**, and both
genealogy diagrams say 1999. Unresolved; low stakes, but worth asking the mentor.

Canvas nuance: **100×100 and 101×101 are the same canvas** (coords run 0–100 *inclusive*).
Reas's essay says 100×100; we record 101×101. Gray values also run 0–100, not 0–255.

### ACU — dated 1999-01, approximate ⚠️ SOFTEST DATE IN THE SET
Git commits run 1999-07-02 → 2001-11-02, but the README changelog reaches back to **1999-01-25
and already describes additions to an existing library** — so ACU *predates* Jan 1999 and
likely began in **1998**. No founding date is documented anywhere. The mentor could likely
settle this from memory better than any source.

**Attribution correction:** ACU was **started by Ben Fry**, not Tom White (89 of 130 commits vs
26; Reas's own history says so). Tom White owns the *GitHub archive*, which likely caused the
confusion. **Jared Schiffman** (14 commits) is well-sourced and usually omitted. Casey Reas
appears in the changelog as a **user/documenter**, not an author. No evidence links Golan Levin
to authorship. End 2003 = when ACG closed; Lieberman reports still using ACU in **2002**.

**oF lineage, in Lieberman's own words:** "There was a library of code developed at MIT called
ACU, it was an older library that I was using in 2002… I didn't have the ability to give this
library to my students because it wasn't open source and it wasn't really well maintained."

### Logo — dated 1967
Created at **BBN, not MIT** (despite Papert's MIT association; the work later migrated to the
MIT Logo Laboratory). Papert is **one of three** co-designers — Wally Feurzeig (who led the
effort) and Cynthia Solomon are routinely omitted. Turtle graphics came **later** (~1969; only
"late 1960s" is sourceable).

### Visible Language Workshop — recorded as an EVENT, not a tool
It produced **no named, distributable software toolkit**. "Information Landscapes" (TED5, 1994)
is a research demo and a body of student work — no version, no release. A tool entry would be
fiction. Modeled as an institution band 1974→1994 that the ACG node picks up in 1996.

Founding has three candidates: 1973 (the "Messages and Means" course), **1974** (Cooper leaves
MIT Press to found it with Ron MacNeil — best supported), 1975 (the MIT 150 Exhibition label).
End = Cooper's death, 26 May 1994; no formal dissolution. The ~2-year gap before Maeda's ACG
(1996) is real, not an artifact.

**Succession confirmed** (including by the Media Lab's own framing): VLW → ACG → DBN → Processing.

### Prosthetic Knowledge — 2009-12 → 2018-09-05
Contributed as "2006–2015"; **both dates were wrong.** Start derived from the operator's own
2019 tweet that the blog "would have been 10 years old today"; end is the confirmed last post
(5 Sept 2018), supplied by the project owner. The two corroborate: nine years back from Sept
2018 lands on the derived start. Archive remains online — 2018 is when posting stopped.

### E.A.T. — no end date, deliberately
Never formally dissolved. Klüver led it until his death in 2004; still nominally active for its
2017 50th anniversary. 2004 would be defensible as a practical marker but is **not a sourced
dissolution**. Founding: informally organized 1966 after "9 Evenings", formally launched
1967-10-10 (Tate and others say 1966).

### Experimental Television Center — no end date, deliberately
**2011 is the residency/grants program pausing, not a closure.** ETC continued as a
preservation entity and relocated to Atlanta in 2021; collection archived at Cornell's Rose
Goldsen Archive. "Closed" would overstate it, so it lives in prose.

### The Creators Project — end ~2019, approximate
Weakest end date in the events set. Brand shortened to "Creators" c. 2016; Vice consolidated
its channels in 2019 but we could not confirm from a primary source that Creators was named.
Vice.com ceased publishing Feb 2024 = hard backstop.

### Status conflicts — flagged, not silently resolved
- **Wekinator** — the project site claims it "continues to be gently updated"; the evidence
  says otherwise (last release 2016-07-11, last commit 2021-02-15). Recorded as active to match
  the maintainer's own claim. **Effectively dormant.** Change if the timeline should assert it.
- **Context Free Art** — *actively maintained* (v3.4.3, June 2026), contrary to appearances.
  It looks dead only because its GitHub Releases tab is empty; versions live as git tags.
- **Fluxus** — genuinely dormant. Ends ~2012 (last release), last sign of life 2015-10-07.
  No clean end event; neither repo is archived.
- **Wiring** — last release 2014-10-28, effectively dormant, never formally ended.
- **toxiclibs** — last release 2012. ⚠️ **toxiclibs.org is DEAD** — the domain lapsed and now
  serves an unrelated gambling site. Use the GitHub repo as the canonical link.

### Lineage conflations to avoid
- **Extempore is NOT a Fluxus descendant** — it's Sorensen's Impromptu/Scheme line, a parallel
  Lisp-livecoding lineage. Commonly conflated.
- **Nodewerk does not descend from Processing** — its real line is Peacock (Aviary) → Nodewerk.
  It appears in the genealogy essay only because its author was an early Processing power user.
  That's a biographical link, not a lineage one. (Not currently in the dataset.)
- **Tone.js and Two.js are not Google projects** — both authors have Google Creative Lab
  associations that post-date/parallel the work. Don't credit Google.
- **Vimeo's founders were not filmmakers** — Lodwick and Klein were web developers at
  CollegeHumor's parent. "By filmmakers, for filmmakers" describes the community it attracted.

---

## Additions — early computer/generative art, global institutions, live-coding & cyberfeminist lineage

A research pass extending the set beyond the MIT/Processing tool core into landmark artworks,
non-Western media-art infrastructure, the live-coding movement, and the glitch/cyberfeminist
lineage. Each entry was cross-checked against ≥2 independent sources (artist/institution page +
a second source) before landing. Contested or derived dates are recorded below; the rest are
covered by their `link`.

### Date decisions & conflicts (flagged, not silently resolved)
- **Vera Molnár — Interruptions → 1969.** Sources split: 1968 (start of her computer/plotter
  work, self-taught FORTRAN) vs 1969 (date on the collected plotter drawings). Plotted 1969 per
  the V&A and Morgan Library holdings; some texts give the series span as 1968–69.
- **Nash & Williams — ART1 → Oct 1970.** Developed ~1968 at the University of New Mexico;
  **plotted at its Oct 1970 *Leonardo* publication** per the public-availability convention.
  Note it is a *tool* (an early art-making program), filed in the artworks layer as a landmark
  object — same treatment as قلب/Qalb.
- **Joan Truckenbrod — Entropic Tangle → 1975 (approximate).** 1975 is the FORTRAN coding date
  from the artist's own biography; **no first-exhibition date is documented.** Medium confidence.
- **Nam June Paik — TV Garden → 1974.** First realized 1974 at Galeria Bonino, NY (initially a
  budget "TV Ocean" variant). Year firm; no reliable day. Paik re-installed it variously later.
- **Morehshin Allahyari — Material Speculation: ISIS → 2016-02-11.** Research began 2015 (single
  pieces circulated via Rhizome); **plotted the full-series debut** (Trinity Square Video,
  Toronto). Often dated "2015–16."
- **Mimi Onuoha — Library of Missing Datasets → 2016 (year only).** Multiple versions (2016,
  2018, 2021); the specific 2016 debut venue could not be pinned. Medium confidence.
- **Rosa Menkman — Glitch Studies Manifesto → 2010.** Self-published PDF is 2010 (the canonical
  file is named `2010_Original…`; a Feb 3 2010 blog post discusses it); some academic refs cite
  "2009/2010," and the first *print* publication is 2011 (Video Vortex Reader II). Menkman's own
  site (beyondresolution.info) was returning 503, so no first-party exact date. Plotted the 2010
  self-published original per the first-public-release convention.
- **Legacy Russell — Glitch Feminism → 2012-12-10.** The originating essay ran on
  Cyborgology/The Society Pages (exact date), **not Rhizome** (a related Rhizome piece is Mar
  2013). The famous form is the 2020 Verso book; plotted the 2012 first release.
- **Mindy Seu — Cyberfeminism Index → 2020-10-22.** The website launched via Rhizome/New Museum
  "First Look" in **2020** (initiating spreadsheet 2019); the print book is 2023. Not "2022."
- **TOPLAP founded → 2004-02-15.** The founders' own Read Me paper says it was set up "at 1am on
  Sunday" after the Changing Grammars symposium (12–14 Feb 2004) — Sunday was the 15th. Some
  secondary sources say "14 February 2004." Same overnight session; plotted the primary-sourced 15th.
- **Old Boys Network → 1997, no end date.** Organized Cyberfeminist Internationals in 1997/1999/
  2001. **No formal dissolution is sourced**, so per convention (cf. E.A.T., ETC) no `end` — the
  2001 "Very Cyberfeminist International" is its last known event, not a documented closure.
- **GLI.TC/H → 2010, lifeline left open.** Three editions ran 2010–2012, but no formal
  dissolution was announced, so no `end` (same principle as Wiring/Fluxus dormancy).
- **STEIM → 1969-02-27, end 2020.** The **only** new entry with an end date: its 2020 closure
  (Dutch national funding cuts) is a documented dissolution, so it meets the "sourced closure
  only" rule.
- **ZKM → 1989 (founding), not 1997 (building opening).** ZKM's own founding-history page dates
  the legal founding to 1989 (statutes effective 12 Aug 1989); casual sources conflate it with
  the 1997 opening of its permanent home.
- **ISEA → 1988 (first symposium, FISEA Utrecht), not 1990.** 1990 is the founding of the
  standing Inter-Society; the symposium series began 1988.

### Enrichment of existing entries (attribution; no new nodes)
Descriptions updated with sourced creator/context that the one-liners omitted: **p5.js**
(Lauren McCarthy + Evelyn Eastmond, 2013, access/inclusion design goals), **Hydra** (Olivia
Jack, ICLC 2017 workshop, Bogotá scene), **ml5.js** (ITP/NYU, Valenzuela's p5deeplearn,
Shiffman), **Sonic Pi** (Sam Aaron, Cambridge + Raspberry Pi Foundation, education),
**SuperCollider** (James McCartney, 1996; GPL 2002), **TidalCycles** (Alex McLean, ~2009).

Enrichment sources: p5.js — **P** https://p5js.org/ · **P** https://medium.com/processing-foundation/making-p5-js-fd293ba91a32 · https://p5js.org/people/ · https://medium.com/processing-foundation/p5-js-1-0-is-here-b7267140753a (1.0 = 2020-02-29). Hydra — **P** https://ojack.xyz/work/hydra/ · https://cdm.link/hydra-olivia-jack/ (Bogotá scene, ICLC Dec 2017). ml5.js — **P** https://ml5js.org/about/ · https://itp.nyu.edu/adjacent/issue-3/ml5-friendly-open-source-machine-learning-library-for-the-web/ (first beta 0.1.0, 2018-06-11). Sonic Pi — **P** https://sonic-pi.net/ · https://en.wikipedia.org/wiki/Sonic_Pi. SuperCollider — **P** https://quod.lib.umich.edu/i/icmc/bbp2372.1996.078/1/ (McCartney ICMC 1996) · https://en.wikipedia.org/wiki/SuperCollider. TidalCycles — https://en.wikipedia.org/wiki/TidalCycles · https://en.wikipedia.org/wiki/Alex_McLean.

**Release-label correction (fixed):** the dataset had mislabeled p5.js's and ml5.js's first
releases as "1.0." Corrected — p5.js's phantom "1.0 (2014)" seed was removed (its real first
release is the 0.2.22 alpha of 21 July 2014; genuine 1.0.0 = 2020-02-29, already present), and
ml5.js's "1.0 (2018)" seed was relabeled to its true first beta, 0.1.0 (2018-06-11).

---

## Release histories, placeholder cleanup & media servers

### The "1.0" placeholder problem (holdover from the original CSV)
Many tools carried a generic `"1.0"` first-release label from the hand-collected CSV. It is a
mix: some are correct (**Ableton Live** 1.0 = Oct 2001, **Unity** 1.0 = June 2005,
**SuperCollider** SC1 = 1996), but many tools **never shipped a 1.0** at that date. Fixed the
clearly-wrong ones (the date, which drives the lifeline, was kept; only the false version label
changed):
- **Pure Data** → "First release" (Pd is versioned 0.x, currently ~0.56; never 1.0).
- **Three.js** → `r1` (Three.js used r-numbering; r1 = April 2010).
- **Paper.js, A-Frame, Cinder, Nannou, OpenRNDR, Notch, TouchDesigner** → "First release"
  (all use 0.x / beta / 077-088-099 schemes; none had a 1.0 at the listed date).
- **Arduino** → "First release" with a note: 2005 = the first boards; the Arduino **IDE** 1.0
  was 2011. The old "1.0 (2005)" conflated hardware and software.
- Verified-correct 1.0s left untouched. ~20 other unreviewed placeholders remain (date likely
  right, version label generic) — deferred, not yet individually checked.

### Engine release histories (Unity, Unreal, VVVV)
Replaced single placeholders with real version timelines, cross-checked against Wikipedia
version tables + official announcements. Dates are public-availability.
- **Unity** — 1.0 (2005-06-08, Mac-only, WWDC) → 6 (2024-10-17). Sources: https://en.wikipedia.org/wiki/Unity_(game_engine) · https://unity.com/news/unity-5-here · Unity blog release notes. ⚠️ Unity switched to date-based versions in 2017, back to majors with Unity 6.
- **Unreal Engine** — UE1 (May 1998, shipped inside the game *Unreal*; licensed, not sold standalone) → UE5.0 (2022-04-05). Sources: https://en.wikipedia.org/wiki/Unreal_Engine · UE4/UE5 articles · Epic announcements. ⚠️ UE4 public launch is 2014-03-19 (GDC subscription) per UE4-specific sources, vs a looser "April 2014" in Wikipedia's overview.
- **VVVV** — beta1 (2002-12-24, MESO group) → vvvv gamma 2020.1 (2020-04-01). Sources: https://beta.vvvv.org/roadmap.html · https://thegraybook.vvvv.org/changelog/2020.1.html. The "45"/"50" prefixes are DX9/DX11 generation numbers, not the beta counter; classic beta and gamma ran in parallel from ~2016.

### Media servers (new tools, audio-visual)
- **Pixera** (AV Stumpfl, Austria) — v1.0 announced 25 Jan 2019, first shown at InfoComm 2018.
  **P** https://avstumpfl.com/us/news-events/news/av-news-single/av-stumpflr-to-present-pixera-media-server-software-version-10-and-to-show-innovative-projection-sc/ · https://www.avinteractive.com/news/products/av-stumpfl-shows-new-pixera-media-server-software-infocomm-07-06-2018/
- **disguise** (formerly **d3**) — plotted 2010 (d3 Technologies founded; media-server lineage from United Visual Artists / Ash Nehru, ~2005 U2 Vertigo tour); renamed "disguise" in 2017. ⚠️ medium confidence on the year (some sources cite a 2013 milestone). https://plsn.com/archives/december-2017/ash-nehru-co-founder-and-cto-of-disguise/ · https://www.avinteractive.com/news/business/d3-technologies-debuts-new-name-disguise-21-11-2017/

### Events — hardware (additions)
| Entry | Sources |
|---|---|
| Sony EyeToy (2003-07-04) | https://en.wikipedia.org/wiki/EyeToy (EU 2003-07-04, earliest; NA Nov 2003, JP Feb 2004) |
| Nintendo Wii Remote (2006-11-19) | https://en.wikipedia.org/wiki/Wii_Remote (NA launch, earliest; JP/EU Dec 2006). Repurposed for interactive art via Johnny Chung Lee's 2007-08 hacks. |
| MakerBot Cupcake CNC (2009) | https://en.wikipedia.org/wiki/MakerBot (first product; year precision — March announce vs April production) |
| Kinect for Xbox One / v2 (2013-11-22) | https://en.wikipedia.org/wiki/Kinect (time-of-flight, 25-joint tracking) |
| Google Cardboard (2014-06-25) | https://en.wikipedia.org/wiki/Google_Cardboard (Google I/O unveiling) |
| Myo armband (2015-03) | https://www.engadget.com/2015-01-19-myo-armband-amazon.html (broad retail early 2015; dev units from mid-2014 — medium confidence) |
| Microsoft HoloLens Dev Edition (2016-03-30) | **P** https://blogs.windows.com/devices/2016/02/29/announcing-microsoft-hololens-development-edition-open-for-pre-order-shipping-march-30/ |

---

## Deliberately excluded

Considered and left out, so we don't re-litigate:

| Item | Why |
|---|---|
| **acJava**, **acWorlds** | Internal ACG lab infrastructure, never released. Dates unverifiable (diagrams disagree; no independent source dates them *at all*). dribnet himself: their "influence [is] mainly as a counterexample" — acu was a reaction *against* them. |
| **Processing.py**, **Processing for Android** | Modes/ports of Processing, not distinct tools. Same API, same IDE. Arguably attributes of Processing. |
| **Nodewerk** | Not Processing lineage (see above). Tenuous connection. |
| **Flutter** | Removed. General cross-platform app/UI framework; not predominantly used for art-making. Fails the inclusion rule — only niche generative crossover, unlike the creative-first `web` entries (Three.js, p5, Pixi, GSAP). |
| **Svelte** | Removed. General web component framework, same reasoning as Flutter. |
| **Donna Haraway — A Cyborg Manifesto (1985)** | The acknowledged theoretical wellspring of cyberfeminism, but it originated as socialist-feminist critical theory in a general-left journal, not from creative-tech/new-media practice — the "general theory" side of the inclusion boundary. Add later only if theoretical precursors are wanted (plot 1985 *Socialist Review*, not the 1991 book). |
| **Demoscene** | Real and influential, but has no defensible single founding date — a diffuse mid-1980s emergence from cracker/crack-intro culture with no founding moment or organization. Fabricating a date would violate the accuracy rule. |
| **Stephanie Dinkins — Not The Only One** | Wanted, but sources conflict on 2017 vs 2018 and no single first-exhibition date/venue could be pinned. Excluded rather than guess; revisit if a firm date surfaces. |
| **RepRap "Darwin" (2007)** | Desktop-3D-printing milestone, but only pins to year and overlaps thematically with MakerBot Cupcake (2009), the more consumer-facing entry that was kept. Reasonable future add. |
| **Intel RealSense (2015)** | Depth-camera line, but the 2015 developer-kit ship dates were the fuzziest to pin to a specific two-source date; Myo already anchors 2015. Add later if a firm date surfaces. |
| General-purpose languages (C, Java, JS), OSes, web frameworks | Out of scope — see the inclusion rule below. |

### Inclusion rule
**In scope:** tools whose primary purpose was making visual / interactive / sonic / generative
art, used by artists and designers — authoring environments, creative frameworks and libraries,
visual programming languages, art-making toolkits.

**Out of scope:** general-purpose programming languages, operating systems, general web
frameworks, general developer tooling — *unless* predominantly used for art-making.

Unity/Unreal/Godot are kept on the strength of *how the community used them* (installations,
projection, VJ work), not on their nature as game engines.

---

## Resolved calls

- **ACU's start → 1998.** Settled by project-participant testimony, not a document. The
  evidence supports it (the Jan 1999 changelog already describes additions to an existing
  library) but nothing records a founding date, so it stays marked approximate.
- **DBN → 1999.** Reas's own history ("both the MIT Press book and software … were released in
  1999") wins over Ben Fry's dissertation, which says 2000.
- **Logo → lifeline left open (1967 → present).** Capping it would assert a death that never
  happened — Logo implementations (Terrapin, MicroWorlds, UCBLogo) are still in use. Same
  principle applied to E.A.T. and ETC: we don't invent end dates to tidy the picture. The
  ~60-year bar is *true*, and is itself the point — Logo is the longest-lived thing in the
  dataset. If it visually dominates, that's a rendering decision, not a data one.
- **Nodebox → one entry, not split.** NodeBox 1 (2002, Mac/Python/Quartz) and NodeBox 3
  (2017→, cross-platform Java node graph) are a genuine continuous lineage by the same team,
  like Processing across its rewrites. Splitting would invent a discontinuity. The description
  now makes the rewrite explicit so the 2002→now bar isn't misread as one unchanging product.

## Open questions

1. **Grasshopper's September 2007** — the *Explicit History* name is confirmed in Rutten's own
   words, but no McNeel primary source fixes the month.
2. **BadWindows** (Bob Sabiston, MIT Visible Language Workshop) — named in Ben Fry's
   dissertation as "the earliest known" project of this kind in the lab. A plausible pre-ACG
   root node if the tree ever extends earlier.
3. **Wiring's exact release semantics** — we plot 2004 (boards built and taught with); the
   official log's first entry is 2005-05-04. Defensible either way; see the note above.

---

## Source index

Every reference gathered during research, including sources that informed a decision without
being the entry's canonical `link`. Primary sources are marked **P**.

### Tools — MIT / Processing lineage
| Entry | Sources |
|---|---|
| Logo | https://en.wikipedia.org/wiki/Logo_(programming_language) |
| Design By Numbers | **P** https://medium.com/processing-foundation/a-modern-prometheus-59aed94abe85 (Reas) · https://www.media.mit.edu/projects/design-by-numbers-again/overview/ · https://github.com/LingDong-/dbn.js/ · **P** https://www.benfry.com/phd/dissertation/6.html |
| ACU | **P** https://github.com/dribnet/acu · **P** https://openframeworks.cc/development/ · **P** https://www.vice.com/en/article/qa-with-zach-lieberman-founder-of-openframeworks-pt-i/ (Lieberman) · https://medium.com/processing-foundation/a-modern-prometheus-59aed94abe85 |
| Wiring | **P** https://www.wiring.org.co/updates.html · **P** https://arduinohistory.github.io/ (Barragán) · https://en.wikipedia.org/wiki/Wiring_(software) ⚠️ infobox date wrong |
| Fritzing | **P** https://fritzing.org/releases/0-1b · https://fritzing.org/download/0.1b/ · https://github.com/fritzing/fritzing-app · TEI '09 paper: doi 10.1145/1517664.1517735 |

### Tools — authoring / multimedia
| Entry | Sources |
|---|---|
| Director | https://en.wikipedia.org/wiki/Adobe_Director |
| Flash / Animate | https://www.webdesignmuseum.org/software/futuresplash-animator-in-1996 · https://en.wikipedia.org/wiki/Adobe_Animate |
| Quartz Composer | https://en.wikipedia.org/wiki/Quartz_Composer · **P** https://developer.apple.com/documentation/quartz/quartz-composer |
| Isadora | https://en.wikipedia.org/wiki/Isadora_(software) · **P** https://troikatronix.com/ |
| Scratch | https://en.wikipedia.org/wiki/Scratch_(programming_language) · **P** https://scratch.mit.edu/ |
| Godot | https://en.wikipedia.org/wiki/Godot_(game_engine) · **P** https://github.com/godotengine/godot · **P** https://godotengine.org/license/ |

### Tools — libraries / generative
| Entry | Sources |
|---|---|
| Nodebox | **P** https://www.nodebox.net/code/index.php/About · https://github.com/nodebox/nodebox |
| Scriptographer | **P** https://scriptographer.org/ · **P** https://scriptographer.org/news/the-future-of-scriptographer-is-paper-js/ |
| Basil.js | **P** https://basiljs.ch/about/ |
| StructureSynth | **P** https://structuresynth.sourceforge.net/ |
| Papervision3D | https://en.wikipedia.org/wiki/Papervision3D |
| toxiclibs | **P** https://github.com/postspectacular/toxiclibs ⚠️ toxiclibs.org is dead (gambling site) |
| Context Free Art | **P** https://github.com/MtnViewJohn/context-free · **P** https://contextfreeart.org/downloads.html |
| Grasshopper | https://en.wikipedia.org/wiki/Grasshopper_3D · **P** https://nono.ma/rutten-david-rutten-on-explicit-history (Rutten) · https://architosh.com/2018/02/mcneel-ships-new-rhino-6-grasshopper-now-built-in/ |
| Pixi.js | **P** https://medium.com/goodboy-digital/pixi-js-released-ecfdf7610ecd · **P** https://github.com/pixijs/pixijs ⚠️ tags unreliable |
| Tone.js | **P** https://github.com/Tonejs/Tone.js · **P** Mann, Web Audio Conference 2014 paper |
| Two.js | **P** https://github.com/jonobr1/two.js ⚠️ release dates backdated |

### Tools — audio / live coding
| Entry | Sources |
|---|---|
| ChucK | **P** https://chuck.stanford.edu/ · **P** https://raw.githubusercontent.com/ccrma/chuck/main/VERSIONS · https://web.archive.org/web/20031118220911/http://chuck.cs.princeton.edu:80/ · https://en.wikipedia.org/wiki/ChucK |
| TidalCycles | **P** https://tidalcycles.org/docs/around_tidal/tidal_history/ · **P** https://hackage.haskell.org/package/tidal-0.1 |
| Hydra | **P** https://registry.npmjs.org/hydra-synth · **P** https://hydra.ojack.xyz/ |
| Fluxus | https://en.wikipedia.org/wiki/Fluxus_(programming_environment) · https://github.com/nebogeo/fluxus · https://github.com/zzkt/fluxus |
| Wekinator | **P** https://doc.gold.ac.uk/~mas01rf/Wekinator/ · **P** https://soundlab.cs.princeton.edu/publications/FiebrinkTruemanCook_NIME2009.pdf · **P** https://github.com/fiebrink1/wekinator · https://opensoundcontrol.stanford.edu/implementations/Wekinator.html |

### Events — institutions
| Entry | Sources |
|---|---|
| E.A.T. | https://en.wikipedia.org/wiki/Experiments_in_Art_and_Technology |
| Experimental Television Center | https://en.wikipedia.org/wiki/Experimental_Television_Center |
| Visible Language Workshop | https://en.wikipedia.org/wiki/Muriel_Cooper · http://museum.mit.edu/150/115 (MIT 150 Exhibition) · https://mitmuseum.mit.edu/collections/subject/visible-language-workshop-292 · https://archivesspace.mit.edu/repositories/2/resources/1356 (authoritative finding aid; 403s to automated fetch — worth a manual look) · https://eyeondesign.aiga.org/muriel-coopers-visions-of-a-future/ |
| First SIGGRAPH conference | **P** https://www.siggraph.org/about/history/ · https://en.wikipedia.org/wiki/ACM_SIGGRAPH |
| Ars Electronica | **P** https://ars.electronica.art/about/en/history/ · https://en.wikipedia.org/wiki/Ars_Electronica |
| transmediale | https://en.wikipedia.org/wiki/Transmediale · **P** https://archive.transmediale.de/content/history |
| Rhizome | https://en.wikipedia.org/wiki/Rhizome_(organization) |
| Eyebeam | **P** https://eyebeam.org/about-us/ · https://en.wikipedia.org/wiki/Eyebeam_(organization) |
| F.A.T. Lab | https://en.wikipedia.org/wiki/Free_Art_and_Technology_Lab |
| Radical Networks | **P** https://radicalnetworks.org/archives/2015/ (first edition Oct 24–25 2015, MAGNET/NYU Poly, Brooklyn; founded by Sarah Grant) · https://technical.ly/diversity-equity-inclusion/radical-networks-conference/ |
| STEIM (Amsterdam) | https://en.wikipedia.org/wiki/STEIM (founded 27 Feb 1969 by seven Dutch composers; **ceased operating end of 2020** — sourced closure) · https://www.classicalmusicdaily.com/2019/08/steim50.htm |
| V2_ Lab for the Unstable Media | **P** https://v2.nl/organization/history (founded 1981 's-Hertogenbosch, Rotterdam since 1994) · https://en.wikipedia.org/wiki/V2_Institute_for_the_Unstable_Media |
| Festival Videobrasil (São Paulo) | https://enciclopedia.itaucultural.org.br/pessoas/5478-solange-farkas (founded 1983 by Solange Farkas) · https://ocula.com/magazine/conversations/solange-farkas-videobrasil-2023/ |
| ISEA / FISEA | **P** https://www.isea-archives.org/symposia/fisea-1988/ (first symposium 27–30 Sept 1988, Utrecht) · **P** https://www.isea-international.org/history/ (Inter-Society founded 1990 — distinct from the 1988 symposium) |
| ZKM (Karlsruhe) | **P** https://zkm.de/en/founding-history (legally founded 1989, statutes effective 12 Aug 1989; building opened 1997) · https://en.wikipedia.org/wiki/ZKM_Center_for_Art_and_Media_Karlsruhe |
| WRO Media Art Biennale (Wrocław) | **P** https://wrocenter.pl/en/biennale-wro/ (first edition Dec 1989 as "Sound Basis Visual Art Festival"; biennial since 1993) · https://biennialfoundation.org/biennials/wro-media-art-biennale-poland/ |
| NTT InterCommunication Center / ICC (Tokyo) | **P** https://www.ntticc.or.jp/en/about/ · https://en.wikipedia.org/wiki/NTT_InterCommunication_Center (opened 19 Apr 1997) |
| YCAM (Yamaguchi) | **P** https://www.ycam.jp/en/aboutus/ (opened Nov 2003) · https://en.wikipedia.org/wiki/Yamaguchi_Center_for_Arts_and_Media |
| FILE (São Paulo) | https://en.wikipedia.org/wiki/Electronic_Language_International_Festival (first edition 2000; Barreto & Perissinotto) · https://www.digitalmeetsculture.net/article/file-electronic-language-international-festival/ |
| MUTEK (Montreal) | https://en.wikipedia.org/wiki/Mutek (founded 2000 by Alain Mongeau; year precision, day/month not pinned) |
| Dorkbot | **P** http://sites.music.columbia.edu/dorkbot/ · https://en.wikipedia.org/wiki/Dorkbot (started 2000 by Douglas Repetto at Columbia; 100+ chapters) |
| Old Boys Network | https://en.wikipedia.org/wiki/Old_Boys_Network (founded spring 1997 Berlin; **no sourced dissolution → no end date**) · https://rhizome.org/community/42414/ |
| subRosa | **P** http://refugia.net/subrosa/cv.html · https://en.wikipedia.org/wiki/SubRosa (formed 1998 from a Faith Wilding CMU reading group) |
| Deep Lab | **P** https://www.deeplab.net/cmu/ · https://en.wikipedia.org/wiki/Deep_Lab (2014, Addie Wagenknecht, CMU STUDIO for Creative Inquiry) |
| GLI.TC/H | **P** https://beyondresolution.info/GLI-TC-H (first edition 2010 Chicago; three editions 2010–2012, no formal end) · https://en.wikipedia.org/wiki/Glitch_art |
| TOPLAP | **P** https://toplap.org/wiki/Read_me_paper (founded ~1am Sun 15 Feb 2004 Hamburg; ⚠️ secondary sources say 14 Feb) · https://en.wikipedia.org/wiki/TOPLAP · https://www.researchgate.net/publication/261134966 (the "Read Me" manifesto in *Read_Me: Software Art and Cultures*, Aarhus Univ. Press, 2004). **One combined entry** — the org founding and its manifesto are folded into a single institutions node, not split. |
| First Algorave | https://en.wikipedia.org/wiki/Algorave (term coined 2011; first named event 17 Mar 2012 London) · https://www.soniare.net/blog/history-of-livecoding |
| Processing Foundation | **P** https://processingfoundation.org/ · **P** https://medium.com/processing-foundation/a-modern-prometheus-59aed94abe85 (501(c)(3) 2012; Reas, Fry, Shiffman) |
| bitforms gallery | **P** https://www.bitforms.art/about (founded Nov 2001, NYC) · https://en.wikipedia.org/wiki/Bitforms_gallery · https://www.niio.com/blog/steven-sacks-20-years/ (founder Steven Sacks) |
| TRANSFER gallery | **P** https://transfergallery.com/about/ (founded 2013, Brooklyn, by Kelani Nichole) |

### Events — artworks
| Entry | Sources |
|---|---|
| قلب (Qalb) — Ramsey Nasser | **P** https://nas.sr/%D9%82%D9%84%D8%A8/ (creator's page; created 2013, debuted at Eyebeam's Annual Artist Showcase). Dated year-only (`2013-01-01`); no exact showcase date sourced. A functional language in Arabic script made as a critical artwork, not a production tool. |
| Vera Molnár — Interruptions | **P** https://www.vam.ac.uk/blog/museum-life/vera-molnar-machine-imaginaire-the-dance-of-hands-and-machine-thinking (V&A, dwg dated 1969) · **P** https://www.themorgan.org/drawings/item/405692 (Morgan Library) · https://dam.org/museum/artists_ui/artists/molnar-vera/interruptions/ · ⚠️ 1968 (work start) vs 1969 (collected dwgs) |
| Analívia Cordeiro — M3x3 | **P** https://www.isea-archives.org/isea2022-art-events-artist_statement_cordeiro (artist statement; 1973, first Brazilian video art) · **P** https://hammer.ucla.edu/radical-women/art/art/m-3x3 · **P** https://www.museoreinasofia.es/en/collection/artwork/m3x3 · ⚠️ "Edinburgh Festival 1973" claim unverified |
| Lillian Schwartz — Pixillation | **P** https://www.thehenryford.org/collections/explore/artifact/519817 (1970) · **P** https://www.aaa.si.edu/collections/items/detail/pixillation-lillian-schwartz-and-ken-knowlton-26048 (with Ken Knowlton) |
| Katherine Nash & Richard Williams — ART1 | **P** https://muse.jhu.edu/article/597864/summary (Leonardo 3(4), Oct 1970) · https://en.wikipedia.org/wiki/Katherine_Nash · developed ~1968 Univ. of New Mexico; **plotted at 1970 publication** |
| Joan Truckenbrod — Entropic Tangle | **P** https://joantruckenbrod.com/joan-truckenbrod-biography.pdf (FORTRAN coded 1975) · **P** https://whitney.org/collection/works/57442 · ⚠️ coding date, not first-exhibition (undocumented) |
| Rebecca Allen — The Catherine Wheel | **P** https://www.rebeccaallen.com/projects/catherine-wheel (1982) · **P** https://history.siggraph.org/artwork/rebecca-allen-catherine-wheel/ |
| Nam June Paik — TV Garden | **P** https://www.guggenheim.org/artwork/9537 (1974) · first realized Galeria Bonino NY; year firm, no reliable day |
| Rafael Lozano-Hemmer — Body Movies | **P** https://www.lozano-hemmer.com/body_movies.php · **P** https://v2.nl/works/body-movies (premiere 31 Aug–23 Sept 2001, Rotterdam) |
| Zach Blas — Facial Weaponization Suite | **P** https://zachblas.info/works/facial-weaponization-suite/ (first mask/video 2012; deployments 2013) · https://mcachicago.org/publications/websites/i-was-raised-on-the-internet/artworks/zach-blas-facial-weaponization-communique-fag-face-2012 |
| Sougwen Chung — Drawing Operations | **P** https://sougwen.com/work/drawing-operations (2015, first performed at NEW INC) · https://en.wikipedia.org/wiki/Sougwen_Chung |
| Mimi Onuoha — The Library of Missing Datasets | https://zkm.de/en/artwork/the-library-of-missing-datasets · https://www.artsy.net/artwork/mimi-onuoha-the-library-of-missing-datasets · ⚠️ 2016 year only; multiple versions, 2016 venue not pinned (medium confidence) |
| Lauren Lee McCarthy — LAUREN | **P** https://get-lauren.net/LAUREN (2017; Sundance New Frontier residency) · https://www.idfa.nl/en/film/f7470951-0f39-491f-bb87-c348b0e65f24/lauren/ |
| Morehshin Allahyari — Material Speculation: ISIS | **P** https://morehshin.com/material-speculation-isis/ · https://anthology.rhizome.org/material-speculation-isis · full-series debut Toronto 11 Feb 2016 (research from 2015) |
| American Artist — Black Gooey Universe | **P** https://housing-art.info/black-gooey-universe/ (HOUSING, Brooklyn, 26 Jan–16 Feb 2018) · https://hyperallergic.com/425881/american-artist-black-gooey-universe-housing/ |
| Sondra Perry — Typhoon coming on | **P** https://www.serpentinegalleries.org/whats-on/sondra-perry-typhoon-coming-on/ (Serpentine, 6 Mar–20 May 2018) · **P** https://sondraperry.com/Typhoon-coming-on-at-Serpentine-Sackler-Gallery |

### Events — publications
| Entry | Sources |
|---|---|
| CreativeApplications.Net | **P** https://www.creativeapplications.net/about/ (states only "Since 2008"; a NODE13 festival bio narrows it to Oct 2008, unconfirmed by the site — hence year precision) |
| Prosthetic Knowledge | **P** https://www.tumblr.com/prostheticknowledge · **P** https://x.com/prostheticknowl/status/1201250093690707980 (10-year anniversary tweet → Dec 2009 start) · last post 5 Sept 2018 confirmed by project owner |
| The Creators Project | **P** https://www.intc.com/news-events/press-releases/detail/754/the-creators-project-debuts-worldwide-an-unprecedented (Intel press release, 2010-05-17) ⚠️ Wikipedia's Vice article implies 2007 — wrong |
| VNS Matrix — A Cyberfeminist Manifesto for the 21st Century | **P** https://vnsmatrix.net/projects/the-cyberfeminist-manifesto-for-the-21st-century (1991, Adelaide; term "cyberfeminism" first appears) · https://en.wikipedia.org/wiki/VNS_Matrix |
| Rosa Menkman — Glitch Studies Manifesto | https://amodern.net/wp-content/uploads/2016/05/2010_Original_Rosa-Menkman-Glitch-Studies-Manifesto.pdf (self-pub PDF 2010) · http://www.digiart21.org/art/glitch-studies-manifesto · https://en.wikipedia.org/wiki/Rosa_Menkman (first print 2011) · ⚠️ some refs cite 2009/2010 |
| Legacy Russell — Glitch Feminism Manifesto | **P** https://thesocietypages.org/cyborgology/2012/12/10/digital-dualism-and-the-glitch-feminism-manifesto/ (first essay, Cyborgology — **not** Rhizome) · https://www.versobooks.com/products/460-glitch-feminism (2020 book) |
| Mindy Seu — Cyberfeminism Index | **P** https://rhizome.org/editorial/2020/oct/22/first-look-cyberfeminism-index/ (website launch 22 Oct 2020; spreadsheet 2019) · https://www.inventorypress.com/product/cyberfeminism-index (2023 book) |

### Events — platforms
| Entry | Sources |
|---|---|
| Twitter | https://en.wikipedia.org/wiki/Twitter (public launch 2006-07-15; founding/first tweet 2006-03-21) |
| Vimeo | https://en.wikipedia.org/wiki/Vimeo (founded 2004-11-14; public launch 2004-12-15) |
| YouTube | https://en.wikipedia.org/wiki/History_of_YouTube (domain 2005-02-14; public beta 2005-04-23; out of beta 2005-12-15) |
| GitHub | https://en.wikipedia.org/wiki/GitHub (dev began 2007-10-19; company founded 2008-02-08; public launch 2008-04-10) |

---

## Maintaining this file

- Add a note here whenever a date is **contested, derived, or approximate** — not for
  uncontroversial dates that the release `link` already covers.
- The release fetcher (`scripts/fetch-releases.mjs`) writes `"auto": true` on entries it
  pulls from GitHub. Anything **without** that flag is hand-curated and researched — the
  fetcher will never overwrite it.
- Full unthinned release histories are archived to the gitignored
  `scripts/.release-staging.json` on every fetcher run, so thinning never loses granularity.
