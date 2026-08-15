// Influence library — the artists and producers who define the sounds MELAOS
// generates in, drawn from best-selling and most-influential lists across the
// Latin and American markets.
//
// HOW THIS IS USED
// A name is a way to *select* a sound, never an instruction to imitate a
// person. `tag` holds sonic characteristics only — instrumentation, rhythm,
// production era, arrangement — because that is what actually steers the
// music model, and because generating "a copy of <living artist>" is not
// something this platform should offer. No entry asks for a specific voice,
// and the lyric writer is told to borrow craft, never words.
//
// `tag`   → appended to the music model's style tags
// `style` → human description; shown in the picker and given to the songwriter
// `genres`→ which studio genres this influence is offered for

export type InfluenceRole = 'artist' | 'producer';
export type InfluenceRegion = 'Latin' | 'American';

export interface Influence {
  name: string;
  role: InfluenceRole;
  region: InfluenceRegion;
  genres: string[];
  era: string;
  style: string;
  tag: string;
}

export const INFLUENCES: Influence[] = [
  // ── Latin · Tropical roots ────────────────────────────────────────────────
  { name: 'Juan Luis Guerra', role: 'artist', region: 'Latin', genres: ['Merengue', 'Bachata'], era: '1980s–present',
    style: 'Literary merengue and bachata with jazz harmony and big-band horns',
    tag: 'merengue and bachata fusion, jazz-informed harmony, bright horn section, tambora and güira, sophisticated arrangement' },
  { name: 'Romeo Santos', role: 'artist', region: 'Latin', genres: ['Bachata'], era: '2000s–present',
    style: 'Urban bachata crossover — romantic phrasing over modern R&B production',
    tag: 'modern urban bachata, requinto lead lines, romantic minor-key melody, R&B-influenced production, bongo and güira' },
  { name: 'Aventura', role: 'artist', region: 'Latin', genres: ['Bachata'], era: '1990s–2010s',
    style: 'The group that took bachata from countryside to arena',
    tag: 'bachata with hip-hop swing, electric requinto, syncopated bass, streetwise romantic arrangement' },
  { name: 'Frank Reyes', role: 'artist', region: 'Latin', genres: ['Bachata'], era: '1990s–present',
    style: 'Traditional heartbreak bachata, guitar-forward',
    tag: 'classic bachata, weeping requinto guitar, bolero-rooted bassline, melancholic minor key, bongo and güira' },
  { name: 'Luis Vargas', role: 'artist', region: 'Latin', genres: ['Bachata'], era: '1980s–present',
    style: 'Raw countryside bachata, one of the first to electrify the guitar',
    tag: 'raw traditional bachata, electric guitar arpeggios, rustic amargue feel, sparse percussion' },
  { name: 'Johnny Ventura', role: 'artist', region: 'Latin', genres: ['Merengue'], era: '1960s–2000s',
    style: 'Showman merengue — fast, brassy, built for the dance floor',
    tag: 'classic merengue, driving tambora two-step, punchy brass stabs, güira scraper, festive tempo' },
  { name: 'Wilfrido Vargas', role: 'artist', region: 'Latin', genres: ['Merengue'], era: '1970s–1990s',
    style: 'Experimental merengue with Caribbean and pop fusion',
    tag: 'merengue with tropical fusion, bold horn lines, fast güira, playful arrangement' },
  { name: 'Elvis Crespo', role: 'artist', region: 'Latin', genres: ['Merengue'], era: '1990s–present',
    style: 'Explosive merengue pop with an unmistakable hook sensibility',
    tag: 'merengue pop, high-energy horns, rapid güira, anthemic singalong hook' },
  { name: 'Celia Cruz', role: 'artist', region: 'Latin', genres: ['Salsa'], era: '1950s–2000s',
    style: 'The Queen of Salsa — commanding, joyful, Afro-Cuban to the core',
    tag: 'classic Afro-Cuban salsa, montuno piano, full brass section, congas and timbales, call-and-response coro' },
  { name: 'Héctor Lavoe', role: 'artist', region: 'Latin', genres: ['Salsa'], era: '1960s–1990s',
    style: 'Salsa dura with barrio storytelling and razor phrasing',
    tag: 'salsa dura, aggressive brass, driving clave, montuno piano, raw street energy' },
  { name: 'Willie Colón', role: 'artist', region: 'Latin', genres: ['Salsa'], era: '1960s–present',
    style: 'Trombone-led salsa with cinematic, confrontational arrangements',
    tag: 'trombone-forward salsa, hard clave, bold horn arrangement, Afro-Caribbean percussion' },
  { name: 'Rubén Blades', role: 'artist', region: 'Latin', genres: ['Salsa'], era: '1970s–present',
    style: 'Narrative salsa — social storytelling over sophisticated arrangements',
    tag: 'narrative salsa, sophisticated horn writing, montuno piano, storytelling cadence, Latin jazz harmony' },
  { name: 'Tito Puente', role: 'artist', region: 'Latin', genres: ['Salsa'], era: '1940s–2000s',
    style: 'Mambo and Latin jazz built on virtuoso timbales',
    tag: 'mambo and Latin jazz, virtuoso timbales, big-band brass, Afro-Cuban percussion breaks' },
  { name: 'El Gran Combo', role: 'artist', region: 'Latin', genres: ['Salsa'], era: '1960s–present',
    style: 'Puerto Rico’s university of salsa — tight, joyful, relentless',
    tag: 'classic salsa orchestra, tight coro harmonies, bright brass, dance-floor tempo' },
  { name: 'Carlos Vives', role: 'artist', region: 'Latin', genres: ['Cumbia'], era: '1990s–present',
    style: 'Vallenato and cumbia modernised for pop radio',
    tag: 'modern vallenato cumbia, accordion lead, guacharaca scraper, warm coastal groove' },

  // ── Latin · Pop, rock and crossover ───────────────────────────────────────
  { name: 'Shakira', role: 'artist', region: 'Latin', genres: ['Pop', 'Latin Trap', 'Reggaeton'], era: '1990s–present',
    style: 'Global Latin pop with rock edge and Middle-Eastern colour',
    tag: 'Latin pop with rock guitars, Middle-Eastern melodic ornaments, percussive dance groove, anthemic chorus' },
  { name: 'Juan Gabriel', role: 'artist', region: 'Latin', genres: ['Pop'], era: '1970s–2010s',
    style: 'Grand Mexican balladry — mariachi drama and total emotional commitment',
    tag: 'Mexican ballad, mariachi strings and trumpets, dramatic dynamic swells, ranchera phrasing' },
  { name: 'Luis Miguel', role: 'artist', region: 'Latin', genres: ['Pop'], era: '1980s–present',
    style: 'Bolero and orchestral Latin pop, immaculately produced',
    tag: 'orchestral Latin pop bolero, lush strings, big-band swing, romantic crooner arrangement' },
  { name: 'Marc Anthony', role: 'artist', region: 'Latin', genres: ['Salsa', 'Pop'], era: '1990s–present',
    style: 'Salsa romántica with soaring pop delivery',
    tag: 'salsa romántica, soaring melodic lines, lush brass, montuno piano, polished modern production' },
  { name: 'Gloria Estefan', role: 'artist', region: 'Latin', genres: ['Pop', 'Salsa'], era: '1980s–present',
    style: 'Miami sound — Latin percussion inside radio pop',
    tag: 'Miami Latin pop, congas inside pop production, bright horn hooks, crossover polish' },
  { name: 'Julio Iglesias', role: 'artist', region: 'Latin', genres: ['Pop'], era: '1960s–present',
    style: 'The best-selling Latin artist ever — intimate orchestral romance',
    tag: 'orchestral romantic ballad, nylon guitar, sweeping strings, intimate crooner delivery' },
  { name: 'Selena', role: 'artist', region: 'Latin', genres: ['Cumbia', 'Pop'], era: '1980s–1990s',
    style: 'Tejano-cumbia pop, warm and irresistibly danceable',
    tag: 'Tejano cumbia pop, accordion and synth blend, mid-tempo dance groove, bright warm production' },
  { name: 'Vicente Fernández', role: 'artist', region: 'Latin', genres: ['Pop'], era: '1960s–2010s',
    style: 'Ranchera at full voice, mariachi in full dress',
    tag: 'ranchera mariachi, trumpet and violin sections, rubato dramatic phrasing, proud declamatory feel' },
  { name: 'Carlos Santana', role: 'artist', region: 'Latin', genres: ['Latin Trap', 'Pop'], era: '1960s–present',
    style: 'Latin rock — singing guitar over Afro-Cuban percussion',
    tag: 'Latin rock, sustained melodic electric guitar, congas and timbales, blues-rock harmony' },
  { name: 'Roberto Carlos', role: 'artist', region: 'Latin', genres: ['Pop'], era: '1960s–present',
    style: 'Brazilian romantic pop, vast catalogue, timeless melody',
    tag: 'Brazilian romantic pop ballad, warm strings, gentle bossa-tinged rhythm, melodic songcraft' },

  // ── Latin · Urban ─────────────────────────────────────────────────────────
  { name: 'Daddy Yankee', role: 'artist', region: 'Latin', genres: ['Reggaeton', 'Dembow'], era: '1990s–present',
    style: 'The blueprint for global reggaeton',
    tag: 'classic reggaeton, hard dembow riddim, punchy synth stabs, chant-ready hook, club-tuned low end' },
  { name: 'Bad Bunny', role: 'artist', region: 'Latin', genres: ['Reggaeton', 'Latin Trap', 'Dembow'], era: '2010s–present',
    style: 'Genre-blurring Latin urban — trap, reggaeton, and island rhythms',
    tag: 'modern Latin urban, hazy atmospheric synths, dembow and trap hybrid drums, deep sub bass, laid-back pocket' },
  { name: 'J Balvin', role: 'artist', region: 'Latin', genres: ['Reggaeton'], era: '2010s–present',
    style: 'Colourful, minimal, radio-perfect reggaeton',
    tag: 'modern reggaeton, minimal bright synth motifs, clean dembow groove, spacious mix, pop-leaning hook' },
  { name: 'Ozuna', role: 'artist', region: 'Latin', genres: ['Reggaeton'], era: '2010s–present',
    style: 'Melodic reggaeton with a sweet, floating top line',
    tag: 'melodic reggaeton, silky melodic hook, warm synth pads, steady dembow, polished commercial mix' },
  { name: 'Karol G', role: 'artist', region: 'Latin', genres: ['Reggaeton', 'Latin Trap'], era: '2010s–present',
    style: 'Reggaeton with pop craft and confessional edge',
    tag: 'contemporary reggaeton pop, bright melodic hook, crisp dembow, modern polished production' },
  { name: 'Don Omar', role: 'artist', region: 'Latin', genres: ['Reggaeton'], era: '2000s–present',
    style: 'Anthemic, theatrical reggaeton',
    tag: 'anthemic reggaeton, dramatic synth leads, heavy dembow, stadium-scale hook' },
  { name: 'Wisin y Yandel', role: 'artist', region: 'Latin', genres: ['Reggaeton'], era: '2000s–present',
    style: 'Duo-driven club reggaeton with hard electronic edges',
    tag: 'club reggaeton, aggressive synth bass, hard dembow, electronic production accents' },
  { name: 'Tego Calderón', role: 'artist', region: 'Latin', genres: ['Reggaeton', 'Dembow'], era: '2000s–present',
    style: 'Afro-Caribbean roots inside reggaeton, rugged and rhythmic',
    tag: 'Afro-Caribbean reggaeton, live percussion textures, bomba and plena accents, gritty low end' },
  { name: 'Ivy Queen', role: 'artist', region: 'Latin', genres: ['Reggaeton'], era: '1990s–present',
    style: 'The Queen of Reggaeton — commanding delivery, classic riddims',
    tag: 'classic reggaeton, assertive rhythmic phrasing, raw dembow, early-2000s production feel' },
  { name: 'Anuel AA', role: 'artist', region: 'Latin', genres: ['Latin Trap'], era: '2010s–present',
    style: 'Latin trap with melodic menace',
    tag: 'Latin trap, sliding 808 bass, sparse dark synths, triplet hi-hats, melodic auto-tuned hook' },
  { name: 'Rauw Alejandro', role: 'artist', region: 'Latin', genres: ['Reggaeton', 'Latin Trap'], era: '2010s–present',
    style: 'Futuristic reggaeton with R&B and synthwave colour',
    tag: 'futuristic reggaeton, retro synth textures, R&B chord movement, crisp dembow, dance-leaning groove' },
  { name: 'Feid', role: 'artist', region: 'Latin', genres: ['Reggaeton'], era: '2010s–present',
    style: 'Hazy, intimate perreo',
    tag: 'atmospheric reggaeton perreo, hazy reverb-washed synths, soft dembow, intimate late-night mood' },
  { name: 'Natti Natasha', role: 'artist', region: 'Latin', genres: ['Reggaeton', 'Bachata'], era: '2010s–present',
    style: 'Dominican urban pop across reggaeton and bachata',
    tag: 'urban Latin pop, reggaeton and bachata blend, bright melodic hook, modern polished production' },
  { name: 'Peso Pluma', role: 'artist', region: 'Latin', genres: ['Latin Trap'], era: '2020s–present',
    style: 'Corridos tumbados — regional Mexican meets trap attitude',
    tag: 'corridos tumbados, requinto and bajo sexto, tuba bassline, trap-influenced phrasing, sparse arrangement' },
  { name: 'Pitbull', role: 'artist', region: 'Latin', genres: ['Reggaeton', 'Electronic', 'Pop'], era: '2000s–present',
    style: 'Latin club-pop engineered for maximum party',
    tag: 'Latin club pop, four-on-the-floor dance beat, big synth hooks, festival-scale energy' },
  { name: 'Rosalía', role: 'artist', region: 'Latin', genres: ['Latin Trap', 'Pop'], era: '2010s–present',
    style: 'Flamenco tradition fractured through experimental pop',
    tag: 'flamenco-influenced experimental pop, hand claps and palmas, sparse avant-garde production, dramatic vocal phrasing' },

  // ── Latin · Producers ─────────────────────────────────────────────────────
  { name: 'Luny Tunes', role: 'producer', region: 'Latin', genres: ['Reggaeton', 'Dembow'], era: '2000s–present',
    style: 'Dominican duo who built the sound of reggaeton’s breakout era',
    tag: 'golden-era reggaeton production, signature dembow riddim, bright synth lead, sharp percussive layers' },
  { name: 'Tainy', role: 'producer', region: 'Latin', genres: ['Reggaeton', 'Latin Trap'], era: '2000s–present',
    style: 'The architect of modern Latin urban production',
    tag: 'modern Latin urban production, cinematic synth textures, layered percussion, wide atmospheric mix' },
  { name: 'Emilio Estefan', role: 'producer', region: 'Latin', genres: ['Salsa', 'Pop', 'Merengue'], era: '1980s–present',
    style: 'The producer who moved Latin music into the American mainstream',
    tag: 'crossover Latin pop production, polished horn arrangements, Latin percussion inside radio pop' },
  { name: 'Sergio George', role: 'producer', region: 'Latin', genres: ['Salsa', 'Bachata'], era: '1980s–present',
    style: 'Nuyorican salsa production — piano-driven and brass-heavy',
    tag: 'modern salsa production, piano montuno hooks, powerful brass arrangement, crisp tropical percussion' },
  { name: 'Edgar Barrera', role: 'producer', region: 'Latin', genres: ['Reggaeton', 'Pop', 'Cumbia'], era: '2010s–present',
    style: 'Hitmaker across regional Mexican, urban and Latin pop',
    tag: 'contemporary Latin production, hybrid regional and urban arrangement, clean radio-ready mix' },
  { name: 'Nesty', role: 'producer', region: 'Latin', genres: ['Reggaeton'], era: '2000s–present',
    style: 'Melodic reggaeton production with lush harmonic beds',
    tag: 'melodic reggaeton production, lush synth pads, smooth dembow groove, warm harmonic layering' },

  // ── American · Soul, R&B and funk ─────────────────────────────────────────
  { name: 'Michael Jackson', role: 'artist', region: 'American', genres: ['Pop', 'R&B', 'Soul'], era: '1970s–2000s',
    style: 'Pop-funk perfection — rhythm, hooks and arrangement at maximum craft',
    tag: 'pop funk, tight rhythm-section groove, percussive vocal phrasing, layered hooks, immaculate studio polish' },
  { name: 'Stevie Wonder', role: 'artist', region: 'American', genres: ['Soul', 'R&B'], era: '1960s–present',
    style: 'Soul with jazz harmony and irresistible clavinet funk',
    tag: 'classic soul, rich jazz chord movement, clavinet and Rhodes, warm analog groove, live horn section' },
  { name: 'Marvin Gaye', role: 'artist', region: 'American', genres: ['Soul', 'R&B'], era: '1960s–1980s',
    style: 'Sensual, socially aware soul with layered vocal beds',
    tag: 'smooth classic soul, layered vocal harmony, warm bassline, lush strings, mellow groove' },
  { name: 'Aretha Franklin', role: 'artist', region: 'American', genres: ['Soul'], era: '1960s–2010s',
    style: 'Gospel-rooted soul at full power',
    tag: 'gospel soul, church piano, powerful horn section, call-and-response backing vocals' },
  { name: 'Prince', role: 'artist', region: 'American', genres: ['R&B', 'Soul', 'Pop'], era: '1970s–2010s',
    style: 'Funk, rock and R&B fused with total studio control',
    tag: 'funk rock R&B fusion, syncopated drum machine, biting rhythm guitar, synth-bass, adventurous arrangement' },
  { name: 'Whitney Houston', role: 'artist', region: 'American', genres: ['R&B', 'Pop', 'Soul'], era: '1980s–2000s',
    style: 'The gold standard of pop-soul balladry',
    tag: 'pop soul ballad, gospel-informed melodic runs, lush production, dramatic key-change lift' },
  { name: 'Beyoncé', role: 'artist', region: 'American', genres: ['R&B', 'Pop'], era: '1990s–present',
    style: 'Maximalist R&B-pop with precision rhythm and layered vocals',
    tag: 'modern R&B pop, stacked vocal arrangement, hard-hitting percussion, genre-blending production' },
  { name: 'Alicia Keys', role: 'artist', region: 'American', genres: ['R&B', 'Soul'], era: '2000s–present',
    style: 'Piano-led neo-soul with classical grounding',
    tag: 'piano-driven neo soul, live drums, warm chord voicings, soulful melodic phrasing' },
  { name: 'Usher', role: 'artist', region: 'American', genres: ['R&B'], era: '1990s–present',
    style: 'Rhythm-forward contemporary R&B',
    tag: 'contemporary R&B, crisp syncopated drums, smooth melodic hook, polished club-ready mix' },
  { name: 'SZA', role: 'artist', region: 'American', genres: ['R&B'], era: '2010s–present',
    style: 'Hazy, conversational alt-R&B',
    tag: 'alternative R&B, dreamy reverb-soaked textures, loose drum pocket, intimate conversational melody' },
  { name: 'The Weeknd', role: 'artist', region: 'American', genres: ['R&B', 'Pop', 'Electronic'], era: '2010s–present',
    style: 'Dark synth-driven R&B with 80s pop scale',
    tag: 'dark synth R&B, retro 80s synth textures, gated drums, moody atmospheric production' },
  { name: 'Bruno Mars', role: 'artist', region: 'American', genres: ['Pop', 'R&B', 'Soul'], era: '2010s–present',
    style: 'Retro funk and soul rebuilt for modern radio',
    tag: 'retro funk soul, live band feel, tight horn stabs, slap bass, vintage-modern hybrid production' },

  // ── American · Hip-hop ────────────────────────────────────────────────────
  { name: 'Kendrick Lamar', role: 'artist', region: 'American', genres: ['Hip-Hop'], era: '2010s–present',
    style: 'Dense, jazz-inflected, conceptually ambitious hip-hop',
    tag: 'conscious hip-hop, jazz and funk instrumentation, live bass, shifting rhythmic cadence, cinematic arrangement' },
  { name: 'Jay-Z', role: 'artist', region: 'American', genres: ['Hip-Hop'], era: '1990s–present',
    style: 'Soul-sample luxury rap with effortless cadence',
    tag: 'soul-sampling hip-hop, chopped vintage vocal loop, crisp boom bap drums, confident laid-back pocket' },
  { name: 'Nas', role: 'artist', region: 'American', genres: ['Hip-Hop'], era: '1990s–present',
    style: 'Street-poet boom bap with cinematic detail',
    tag: 'boom bap hip-hop, dusty jazz sample, hard-hitting drums, vinyl warmth, narrative pacing' },
  { name: 'The Notorious B.I.G.', role: 'artist', region: 'American', genres: ['Hip-Hop'], era: '1990s',
    style: 'East-coast storytelling over lush, radio-ready loops',
    tag: '90s East Coast hip-hop, soulful sampled loop, thick bassline, crisp snare, smooth swing' },
  { name: '2Pac', role: 'artist', region: 'American', genres: ['Hip-Hop'], era: '1990s',
    style: 'West-coast urgency, melodic funk beds, raw conviction',
    tag: 'West Coast hip-hop, G-funk synth lead, live bass groove, impassioned delivery, warm analog mix' },
  { name: 'Eminem', role: 'artist', region: 'American', genres: ['Hip-Hop'], era: '1990s–present',
    style: 'Technical, dense rhyme construction over hard drums',
    tag: 'technical hip-hop, hard-edged drums, tense minor-key loop, rapid intricate rhythmic phrasing' },
  { name: 'Drake', role: 'artist', region: 'American', genres: ['Hip-Hop', 'R&B'], era: '2000s–present',
    style: 'Melodic rap and R&B blurred into one atmospheric mode',
    tag: 'melodic rap R&B hybrid, ambient synth pads, spacious low end, understated conversational hook' },
  { name: 'Outkast', role: 'artist', region: 'American', genres: ['Hip-Hop'], era: '1990s–2000s',
    style: 'Southern hip-hop with funk, psychedelia and live musicianship',
    tag: 'Southern hip-hop, live funk instrumentation, inventive percussion, psychedelic soul textures' },
  { name: 'Lauryn Hill', role: 'artist', region: 'American', genres: ['Hip-Hop', 'Soul', 'R&B'], era: '1990s–present',
    style: 'Soul, reggae and hip-hop woven together',
    tag: 'soulful hip-hop, reggae-tinged groove, warm live instrumentation, gospel-informed harmony' },
  { name: 'Missy Elliott', role: 'artist', region: 'American', genres: ['Hip-Hop', 'R&B'], era: '1990s–present',
    style: 'Futuristic, playful, rhythmically inventive',
    tag: 'futuristic hip-hop R&B, off-kilter drum programming, bouncy synth hooks, inventive negative space' },

  // ── American · Rock, country, folk ────────────────────────────────────────
  { name: 'Bob Dylan', role: 'artist', region: 'American', genres: ['Pop'], era: '1960s–present',
    style: 'Poetic folk narrative, plainspoken and unhurried',
    tag: 'folk rock, acoustic guitar and harmonica, storytelling cadence, sparse organic arrangement' },
  { name: 'Bruce Springsteen', role: 'artist', region: 'American', genres: ['Pop'], era: '1970s–present',
    style: 'Heartland rock epics about working life',
    tag: 'heartland rock, driving drums, glockenspiel and saxophone, anthemic Americana build' },
  { name: 'Elvis Presley', role: 'artist', region: 'American', genres: ['Pop'], era: '1950s–1970s',
    style: 'Rock and roll’s original crossover of blues, country and gospel',
    tag: 'classic rock and roll, slapback echo, upright bass, twangy guitar, gospel backing vocals' },
  { name: 'Fleetwood Mac', role: 'artist', region: 'American', genres: ['Pop'], era: '1970s–present',
    style: 'Sun-bleached soft rock built on interlocking harmony',
    tag: 'soft rock, layered vocal harmony, clean electric guitar, steady mid-tempo groove, warm 70s mix' },
  { name: 'Dolly Parton', role: 'artist', region: 'American', genres: ['Pop'], era: '1960s–present',
    style: 'Country songcraft — plain language, unforgettable melody',
    tag: 'classic country, acoustic guitar and fiddle, pedal steel, clear narrative melody' },
  { name: 'Johnny Cash', role: 'artist', region: 'American', genres: ['Pop'], era: '1950s–2000s',
    style: 'Stark country with a freight-train rhythm',
    tag: 'outlaw country, boom-chicka rhythm, baritone-range melody, spare stark arrangement' },
  { name: 'Taylor Swift', role: 'artist', region: 'American', genres: ['Pop'], era: '2000s–present',
    style: 'Confessional narrative pop with bridge-first songcraft',
    tag: 'narrative pop, layered acoustic and synth textures, memorable bridge lift, intimate detailed lyricism' },
  { name: 'Madonna', role: 'artist', region: 'American', genres: ['Pop', 'Electronic'], era: '1980s–present',
    style: 'Dance-pop reinvention, decade after decade',
    tag: 'dance pop, four-on-the-floor groove, bright synth hooks, club-ready production' },
  { name: 'Rihanna', role: 'artist', region: 'American', genres: ['Pop', 'R&B'], era: '2000s–present',
    style: 'Caribbean-inflected pop with an edge',
    tag: 'pop with dancehall influence, syncopated riddim, sparse modern production, cool detached hook' },
  { name: 'Frank Sinatra', role: 'artist', region: 'American', genres: ['Soul', 'Pop'], era: '1940s–1990s',
    style: 'Big-band crooning with impeccable phrasing',
    tag: 'big band swing, lush orchestral arrangement, brushed drums, crooner phrasing, vintage warmth' },

  // ── American · Producers ──────────────────────────────────────────────────
  { name: 'Quincy Jones', role: 'producer', region: 'American', genres: ['Pop', 'Soul', 'R&B'], era: '1950s–2020s',
    style: 'Jazz, pop, funk and soul arranged with orchestral command',
    tag: 'lush multi-genre production, full orchestral and horn arrangement, funk rhythm section, pristine studio balance' },
  { name: 'Dr. Dre', role: 'producer', region: 'American', genres: ['Hip-Hop'], era: '1980s–present',
    style: 'G-funk and beyond — immaculate low end, live-feel instrumentation',
    tag: 'G-funk hip-hop production, deep clean bassline, live-feel keys and guitar, spacious polished mix' },
  { name: 'Rick Rubin', role: 'producer', region: 'American', genres: ['Hip-Hop', 'Pop'], era: '1980s–present',
    style: 'Radical subtraction — strip a song to its essential parts',
    tag: 'minimal stripped-back production, dry punchy drums, raw performance forward, uncluttered arrangement' },
  { name: 'Timbaland', role: 'producer', region: 'American', genres: ['Hip-Hop', 'R&B', 'Pop'], era: '1990s–present',
    style: 'Off-kilter rhythm and unexpected sonic sources',
    tag: 'futuristic rhythm production, syncopated stuttering drums, world-percussion textures, deep sub bass' },
  { name: 'The Neptunes', role: 'producer', region: 'American', genres: ['Hip-Hop', 'R&B', 'Pop'], era: '1990s–present',
    style: 'Sparse, sample-less funk built on space and snap',
    tag: 'minimalist funk production, crisp finger snaps and claps, sparse synth stabs, wide-open space in the mix' },
  { name: 'Kanye West', role: 'producer', region: 'American', genres: ['Hip-Hop', 'Soul'], era: '2000s–present',
    style: 'Pitched soul samples and maximal orchestral drama',
    tag: 'soul-sample hip-hop production, pitched-up vocal chop, layered strings, grand dramatic arrangement' },
  { name: 'J Dilla', role: 'producer', region: 'American', genres: ['Hip-Hop', 'Soul'], era: '1990s–2000s',
    style: 'Drunken, humanised drum swing',
    tag: 'off-grid swung drum programming, dusty soul sample, warm saturated low end, unquantised human feel' },
  { name: 'DJ Premier', role: 'producer', region: 'American', genres: ['Hip-Hop'], era: '1990s–present',
    style: 'Boom bap with scratched-in hooks',
    tag: 'boom bap production, hard crackling drums, chopped jazz sample, turntable scratch hook' },
  { name: 'Pete Rock', role: 'producer', region: 'American', genres: ['Hip-Hop', 'Soul'], era: '1990s–present',
    style: 'Horn-drenched, musically rich boom bap',
    tag: 'soulful boom bap, warm horn sample, deep filtered bassline, laid-back drum swing' },
  { name: 'Metro Boomin', role: 'producer', region: 'American', genres: ['Trap', 'Hip-Hop'], era: '2010s–present',
    style: 'Cinematic modern trap',
    tag: 'cinematic trap production, ominous synth melody, sliding 808 bass, rolling hi-hat triplets, wide dark mix' },
  { name: 'Mustard', role: 'producer', region: 'American', genres: ['Hip-Hop', 'Trap'], era: '2010s–present',
    style: 'Bouncy West-coast minimalism',
    tag: 'ratchet West Coast production, bouncy minimal synth line, clap-driven groove, sparse arrangement' },
  { name: 'Noah "40" Shebib', role: 'producer', region: 'American', genres: ['R&B', 'Hip-Hop'], era: '2000s–present',
    style: 'Submerged, nocturnal atmospheres',
    tag: 'ambient nocturnal production, submerged filtered samples, muted drums, deep spacious low end' },
  { name: 'Max Martin', role: 'producer', region: 'American', genres: ['Pop'], era: '1990s–present',
    style: 'Pop architecture — melodic math and airtight structure',
    tag: 'polished radio pop production, tight melodic hook, punchy compressed drums, airtight song structure' },
  { name: 'Nile Rodgers', role: 'producer', region: 'American', genres: ['Soul', 'Pop', 'Electronic'], era: '1970s–present',
    style: 'Disco-funk rhythm guitar as the engine of the record',
    tag: 'disco funk production, chanky rhythm guitar, driving four-on-the-floor groove, string stabs, live bass' },
  { name: 'Giorgio Moroder', role: 'producer', region: 'American', genres: ['Electronic', 'Pop'], era: '1970s–present',
    style: 'The synthesizer as the whole band',
    tag: 'synth disco production, pulsing arpeggiated bassline, analog synth textures, hypnotic four-on-the-floor' },
  { name: 'Swizz Beatz', role: 'producer', region: 'American', genres: ['Hip-Hop'], era: '1990s–present',
    style: 'Loud, triumphant, arena-scale hip-hop',
    tag: 'anthemic hip-hop production, bold synth fanfare, hard kick and snare, chant-ready energy' },
  { name: 'Babyface', role: 'producer', region: 'American', genres: ['R&B', 'Soul'], era: '1980s–present',
    style: 'Silken R&B balladry with impeccable chord movement',
    tag: 'smooth R&B production, warm electric piano, gentle programmed drums, lush romantic harmony' },
  { name: 'Teddy Riley', role: 'producer', region: 'American', genres: ['R&B', 'Hip-Hop'], era: '1980s–present',
    style: 'New jack swing — hip-hop drums under R&B melody',
    tag: 'new jack swing production, swung hard drum machine, funk stabs, R&B melody over hip-hop rhythm' },
];

export function findInfluence(name: string): Influence | undefined {
  const n = name.trim().toLowerCase();
  return INFLUENCES.find(a => a.name.toLowerCase() === n);
}

export function influencesForGenre(genre: string): Influence[] {
  return INFLUENCES.filter(a => a.genres.includes(genre));
}

/** Grouped for an optgroup picker. Latin first — it is the house sound. */
export function influenceGroups() {
  const of = (region: InfluenceRegion, role: InfluenceRole) =>
    INFLUENCES.filter(a => a.region === region && a.role === role)
      .sort((a, b) => a.name.localeCompare(b.name));
  return [
    { label: 'Latin — Artists', artists: of('Latin', 'artist') },
    { label: 'Latin — Producers', artists: of('Latin', 'producer') },
    { label: 'American — Artists', artists: of('American', 'artist') },
    { label: 'American — Producers', artists: of('American', 'producer') },
  ];
}

// Longest names first so "Juan Luis Guerra" wins over a bare "Juan", and
// bounded by word edges so "Nas" does not fire inside "Natasha".
const MATCHERS = [...INFLUENCES]
  .sort((a, b) => b.name.length - a.name.length)
  .map(inf => ({
    inf,
    re: new RegExp(`(^|[^\\p{L}])${inf.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'iu'),
  }));

/**
 * Pull influences out of the user's own words — "a bachata like Romeo Santos"
 * should sound like one without them hunting through a dropdown.
 */
export function detectInfluences(prompt: string, limit = 2): Influence[] {
  if (!prompt) return [];
  const found: Influence[] = [];
  for (const { inf, re } of MATCHERS) {
    if (found.length >= limit) break;
    if (re.test(prompt)) found.push(inf);
  }
  return found;
}
