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

## Deliberately excluded

Considered and left out, so we don't re-litigate:

| Item | Why |
|---|---|
| **acJava**, **acWorlds** | Internal ACG lab infrastructure, never released. Dates unverifiable (diagrams disagree; no independent source dates them *at all*). dribnet himself: their "influence [is] mainly as a counterexample" — acu was a reaction *against* them. |
| **Processing.py**, **Processing for Android** | Modes/ports of Processing, not distinct tools. Same API, same IDE. Arguably attributes of Processing. |
| **Nodewerk** | Not Processing lineage (see above). Tenuous connection. |
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

### Events — publications
| Entry | Sources |
|---|---|
| CreativeApplications.Net | **P** https://www.creativeapplications.net/about/ (states only "Since 2008"; a NODE13 festival bio narrows it to Oct 2008, unconfirmed by the site — hence year precision) |
| Prosthetic Knowledge | **P** https://www.tumblr.com/prostheticknowledge · **P** https://x.com/prostheticknowl/status/1201250093690707980 (10-year anniversary tweet → Dec 2009 start) · last post 5 Sept 2018 confirmed by project owner |
| The Creators Project | **P** https://www.intc.com/news-events/press-releases/detail/754/the-creators-project-debuts-worldwide-an-unprecedented (Intel press release, 2010-05-17) ⚠️ Wikipedia's Vice article implies 2007 — wrong |

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
