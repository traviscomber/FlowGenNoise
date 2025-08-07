import { type NextRequest, NextResponse } from "next/server"
import { callOpenAI, generateDomePrompt, generatePanoramaPrompt } from "./utils"

function buildPrompt(dataset: string, scenario: string, colorScheme: string, customPrompt?: string): string {
  // Use custom prompt if provided
  if (customPrompt && customPrompt.trim()) {
    let prompt = customPrompt.trim()

    // Add color scheme to custom prompt
    const colorPrompts: Record<string, string> = {
      plasma: "vibrant plasma colors, electric blues and magentas",
      quantum: "quantum field colors, deep blues and ethereal whites",
      cosmic: "cosmic colors, deep space purples and stellar golds",
      thermal: "thermal imaging colors, heat signature reds and oranges",
      spectral: "full spectrum rainbow colors, prismatic light effects",
      crystalline: "crystalline colors, clear gems and mineral tones",
      bioluminescent: "bioluminescent colors, glowing organic blues and greens",
      aurora: "aurora borealis colors, dancing green and purple lights",
      metallic: "metallic tones, silver and bronze accents",
      prismatic: "prismatic light effects, rainbow refractions",
      monochromatic: "monochromatic grayscale, black and white tones",
      infrared: "infrared heat colors, thermal reds and oranges",
      lava: "molten lava colors, glowing reds and oranges",
      futuristic: "futuristic neon colors, cyberpunk aesthetics",
      forest: "forest greens and earth tones",
      ocean: "ocean blues and aqua tones",
      sunset: "warm sunset colors, oranges and deep reds",
      arctic: "arctic colors, ice blues and pristine whites",
      neon: "bright neon colors, electric pinks and greens",
      vintage: "vintage sepia tones, aged photograph aesthetics",
      toxic: "toxic green colors, radioactive aesthetics",
      ember: "glowing ember colors, warm orange and red coals",
      lunar: "lunar surface colors, silver grays and crater shadows",
      tidal: "tidal pool colors, ocean blues and sandy browns",
    }

    prompt += `, ${colorPrompts[colorScheme] || "vibrant colors"}`
    prompt +=
      ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition"

    return prompt
  }

  // SPECIAL HANDLING FOR PICASSO DATASET
  if (dataset === "picasso") {
    const picassoScenarios: Record<string, string> = {
      pure: "Pablo Picasso mathematical cubist precision, geometric abstraction with artistic innovation, fragmented forms with mathematical relationships",
      "blue-period": "Pablo Picasso Blue Period melancholic masterpiece with profound emotional atmosphere, monochromatic blue palette ranging from deep cobalt to pale cerulean, elongated figures with sorrowful expressions and downcast eyes, The Old Guitarist with weathered hands caressing guitar strings, emaciated beggars and street musicians in tattered clothing, mother and child compositions showing tender vulnerability amid poverty, angular faces with sharp cheekbones and hollow eyes, simplified forms with emotional weight, Barcelona street scenes with lonely figures in doorways, café interiors with solitary drinkers, symbolic use of blue representing sadness, isolation, and spiritual depth, brushwork showing visible texture and emotional intensity, figures emerging from dark backgrounds like ghosts, psychological portraits revealing inner turmoil, social commentary on human suffering and dignity, masterful use of light and shadow in monochromatic scheme, oil painting technique with thick impasto and expressive brushstrokes",
      "rose-period": "Pablo Picasso Rose Period celebrating circus performers and bohemian life, warm palette of rose, pink, and terra cotta tones, graceful acrobats and harlequins in diamond-patterned costumes, Family of Saltimbanques with melancholic dignity, circus performers between shows in moments of quiet contemplation, young boy leading horse with gentle authority, trapeze artists suspended in mid-air with balletic grace, commedia dell'arte characters with painted faces and theatrical gestures, tender mother and child scenes with circus families, backstage glimpses of performers preparing makeup and costumes, romantic couples embracing in circus wagons, symbolic roses and flowers representing love and beauty, softer brushwork compared to Blue Period harshness, figures with more rounded forms and gentle expressions, Mediterranean light filtering through circus tents, psychological depth in performer portraits showing vulnerability behind entertainment",
      "african-period": "Pablo Picasso African Period showing revolutionary influence of African masks and sculpture, geometric simplification of human forms inspired by Iberian and African art, mask-like faces with angular features and stylized expressions, Les Demoiselles d'Avignon with five female figures showing progression from naturalistic to geometric abstraction, tribal mask influences with elongated noses and almond-shaped eyes, earth tones of ochre, sienna, and burnt umber, sculptural quality in painted figures with volume and weight, primitive art aesthetics challenging European artistic traditions, bold outlines defining geometric planes, simplified anatomy with emphasis on essential forms, revolutionary departure from Renaissance perspective, proto-cubist experimentation with multiple viewpoints",
      "analytic-cubism": "Pablo Picasso Analytic Cubism masterpiece deconstructing reality into geometric fragments, monochromatic palette of browns, grays, and ochres, multiple viewpoints of single subject shown simultaneously, Girl with a Mandolin fragmented into overlapping planes, violin and guitar still lifes broken into geometric components, portrait faces showing profile and frontal view at once, architectural backgrounds dissolving into abstract geometry, newspaper fragments and text integrated into compositions, shallow picture plane with compressed space, analytical approach to form and structure, mathematical precision in geometric relationships, revolutionary challenge to single-point perspective, intellectual approach to visual representation",
      "synthetic-cubism": "Pablo Picasso Synthetic Cubism with revolutionary collage techniques, brighter colors returning after Analytic period austerity, Three Musicians with flat, decorative shapes in bold colors, newspaper clippings and wallpaper fragments pasted onto canvas, guitar and violin compositions with mixed media elements, harlequin figures in diamond patterns and bright costumes, still life arrangements with fruit and bottles in simplified forms, papier collé technique combining painting and collage, synthetic construction rather than analytical deconstruction, playful experimentation with materials and textures, flat planes of color creating spatial relationships",
      "neoclassical-period": "Pablo Picasso Neoclassical Period showing return to classical forms after cubist experimentation, monumental figures with sculptural weight and volume, Three Women at the Spring with statuesque poses, classical drapery and flowing robes in earth tones, maternal themes with mother and child compositions, beach scenes with bathers in timeless poses, Greek and Roman sculpture influences, simplified but naturalistic forms, warm Mediterranean palette, figures with classical proportions and dignity, pastoral scenes with shepherds and rural life, return to traditional artistic values",
      "surrealist-period": "Pablo Picasso Surrealist Period exploring unconscious mind and dream imagery, The Dream with sleeping woman in vibrant colors, distorted figures with multiple eyes and displaced features, metamorphosis of human forms into fantastic creatures, automatic drawing techniques revealing subconscious, erotic symbolism and psychological themes, Minotaur mythology with bull-headed creatures, beach scenes with bathers transformed into monsters, double images and visual puns, dream logic in compositional arrangements, Freudian influences on artistic expression",
      "guernica": "Pablo Picasso Guernica, the most powerful anti-war painting in art history, monumental black, white, and gray composition depicting Spanish Civil War bombing, fragmented bull representing Spain in agony, screaming horse pierced by spear symbolizing suffering people, dismembered warrior with broken sword representing defeat, mother holding dead child in ultimate grief, light bulb eye of God witnessing destruction, woman with lamp seeking truth in darkness, geometric fragmentation showing violence and chaos, cubist techniques serving political message, universal themes of war's brutality, emotional intensity in distorted faces",
      "demoiselles-avignon": "Pablo Picasso Les Demoiselles d'Avignon, the revolutionary painting that launched modern art, five female figures in Barcelona brothel setting, radical departure from Renaissance perspective, African mask influences on faces, geometric simplification of human forms, multiple viewpoints shown simultaneously, pink and ochre color palette, angular bodies with sharp edges, confrontational gazes challenging viewer, proto-cubist experimentation with form, revolutionary challenge to Western art traditions, art historical significance as birth of modernism",
      "weeping-woman": "Pablo Picasso The Weeping Woman series showing ultimate expression of grief and suffering, Dora Maar as model with tears streaming down fragmented face, handkerchief pressed to eyes in universal gesture of sorrow, bright colors contrasting with emotional darkness, cubist fragmentation serving emotional expression, multiple profiles showing different aspects of grief, Spanish Civil War context of universal suffering, psychological portrait of modern anxiety, geometric tears and distorted features, emotional intensity through artistic distortion",
      "three-musicians": "Pablo Picasso Three Musicians showcasing mature Synthetic Cubism, three figures in carnival costumes playing musical instruments, harlequin in diamond-patterned outfit with guitar, pierrot in white with clarinet, monk in brown robes with accordion, flat geometric shapes in bright colors, collage-like composition with overlapping planes, musical theme celebrating art and creativity, decorative patterns and bold color contrasts, synthetic construction rather than analytical breakdown, celebration of bohemian artistic life",
      "later-works": "Pablo Picasso later works showing continued artistic experimentation into old age, Las Meninas series reinterpreting Velázquez masterpiece, bold colors and expressive brushwork, mythological themes with fauns and centaurs, studio scenes with artist and model, portrait variations exploring artistic identity, playful experimentation with different styles, return to classical themes with modern interpretation, artistic vitality and creative energy, synthesis of lifetime artistic exploration"
    }

    let prompt = picassoScenarios[scenario] || picassoScenarios.pure

    // Add color scheme
    const colorPrompts: Record<string, string> = {
      plasma: "vibrant plasma colors, electric blues and magentas",
      quantum: "quantum field colors, deep blues and ethereal whites",
      cosmic: "cosmic colors, deep space purples and stellar golds",
      thermal: "thermal imaging colors, heat signature reds and oranges",
      spectral: "full spectrum rainbow colors, prismatic light effects",
      crystalline: "crystalline colors, clear gems and mineral tones",
      bioluminescent: "bioluminescent colors, glowing organic blues and greens",
      aurora: "aurora borealis colors, dancing green and purple lights",
      metallic: "metallic tones, silver and bronze accents",
      prismatic: "prismatic light effects, rainbow refractions",
      monochromatic: "monochromatic grayscale, black and white tones",
      infrared: "infrared heat colors, thermal reds and oranges",
      lava: "molten lava colors, glowing reds and oranges",
      futuristic: "futuristic neon colors, cyberpunk aesthetics",
      forest: "forest greens and earth tones",
      ocean: "ocean blues and aqua tones",
      sunset: "warm sunset colors, oranges and deep reds",
      arctic: "arctic colors, ice blues and pristine whites",
      neon: "bright neon colors, electric pinks and greens",
      vintage: "vintage sepia tones, aged photograph aesthetics",
      toxic: "toxic waste colors, radioactive greens and yellows",
      ember: "glowing ember colors, warm orange and red coals",
      lunar: "lunar surface colors, silver grays and crater shadows",
      tidal: "tidal pool colors, ocean blues and sandy browns",
    }

    prompt += `, ${colorPrompts[colorScheme] || "vibrant colors"}`
    prompt += ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition, cubist precision, geometric innovation, modern art mastery"

    return prompt
  }

  // SPECIAL HANDLING FOR BOSCH DATASET - COMPLETELY DIFFERENT APPROACH
  if (dataset === "bosch") {
    const boschScenarios: Record<string, string> = {
      pure: "Hieronymus Bosch fantastical creatures and hybrid demons, bird-headed monsters with human torsos, fish-human hybrids with scales and gills, tree-man with hollow egg-shaped body and branch legs, demons with transparent bellies showing internal organs, organic architecture that breathes and bleeds, impossible beings emerging from split fruits, grotesque beauty with medieval precision",
      "garden-earthly-delights":
        "HIERONYMUS BOSCH GARDEN OF EARTHLY DELIGHTS: Left panel showing Adam and Eve with elephant-creatures carrying castle towers on their backs, giraffe-necked beasts with human intelligence, fish-birds with translucent wings. Middle panel with naked humans riding giant strawberries, the famous tree-man with hollow egg torso and branch legs in central lake, people emerging from giant mussel shells, couples in glass bubbles, riders on boar-fish hybrids. Right panel Hell with bird-headed monster devouring souls, musical torture instruments, knife-eared bagpipe creature, burning organic cities",
      "temptation-saint-anthony":
        "HIERONYMUS BOSCH TEMPTATION OF SAINT ANTHONY: Fish-headed demons with human torsos carrying saint through apocalyptic skies, pig-snouted monsters with human hands, toad-like creatures with bloated bellies, demons disguised as women with serpent tails and bird claws, egg-shaped beings with human faces dancing, flying demons with bat wings playing bone instruments, hollow-tree demons with mouth-torsos containing smaller demons, creatures with backwards feet crawling on ceilings",
      "ship-fools":
        "HIERONYMUS BOSCH SHIP OF FOOLS: Monks with pig faces and wine-dripping snouts, nuns with bird beaks and forked tongues, passengers with fish heads gasping while drowning in wine, fool with funnel hat and egg body playing bone instruments, demons with transparent coin-filled bellies, creatures with goat legs dancing drunkenly, owl with human intelligence, passengers transforming into pigs and donkeys, ship hull with living carved faces that blink",
      "seven-deadly-sins":
        "HIERONYMUS BOSCH SEVEN DEADLY SINS: Central God's eye with angel-demon hybrids, Pride woman with demon-held mirror revealing pig snout and peacock feathers, Envy with green-faced elongated-neck demons, Wrath tavern brawl with pig-faced gluttons and wolf-headed aggressors, Sloth with snail-demons and slug-creatures, Greed merchant with transparent belly while insect money-demons count coins, Gluttony diners transforming into consumed animals with pig snouts and fish gills",
      "haywain-triptych":
        "HIERONYMUS BOSCH HAYWAIN TRIPTYCH: Creation with rebel angels becoming insect-demons, hay wagon pulled by demons disguised as beasts with human intelligence, crowds transforming into animals - nobles becoming peacocks, merchants growing pig snouts, clergy developing bird beaks, lovers on haystack watched by voyeuristic telescoping-neck demons, Hell with torture-demons having musical instrument bodies and transparent bellies showing victims",
      "last-judgment":
        "HIERONYMUS BOSCH LAST JUDGMENT: Christ surrounded by angel-demon hybrids with feather-bat wings, angels with breathing trumpet-organisms, souls showing animal transformations, demons with multiple heads (human-animal-insect), transparent bodies showing organs, limbs that are musical instruments, torture-demons with organic tools, landscape divided between gentle heaven creatures and nightmarish hell creations",
      "death-miser":
        "HIERONYMUS BOSCH DEATH AND THE MISER: Dying miser transforming into pig features with elongating snout, Death as skeleton with crow wings and serpent tail, demon with human torso and cloven hooves, wealth revealing true nature - coins as blinking demon eyes, writhing serpent jewelry, money-demons with insect features and transparent coin-filled bellies whispering with forked tongues",
      "conjurer":
        "HIERONYMUS BOSCH THE CONJURER: Conjurer with bird talon fingers and reptilian pupils showing multiple rows of teeth, pickpocket with pointed ears and backwards joints, crowd transforming based on gullibility - sheep features with wool, pig snouts, peacock feathers, wise-fool owl, organic creature-implements disguised as objects - breathing cups, blinking balls, serpent wands",
      "stone-operation":
        "HIERONYMUS BOSCH STONE OF MADNESS: Quack surgeon with funnel hat and compound insect eyes, patient developing sheep features with wool and rectangular pupils, nun with elongated bird-neck, monk with concealed pig snout, medical instruments as organic torture devices - demon claw scalpels, insect mandible forceps, moving serpent skin bandages, landscape with blinking tree faces and demon-shaped clouds",
      "adoration-magi":
        "HIERONYMUS BOSCH ADORATION OF MAGI: Wise men with bird-like knowledge pupils, serpent-coiled posture, lion-hearted mane hair, Virgin Mary protected by dove-winged seraphim and lamb-bodied cherubim, mysterious figures with gentle animal features and predatory demon characteristics, background with angel-birds singing and demon-beasts fleeing, organic breathing architecture, exotic caravan animals with human intelligence",
      "christ-carrying-cross":
        "HIERONYMUS BOSCH CHRIST CARRYING CROSS: Christ surrounded by faces transforming into animals - soldiers with wolf features and yellow fangs, mockers with hyena grins and stretching necks, sadists with vulture beaks and reptilian eyes, crowd with pig snouts, fox features, rat teeth, thieves with contrasting lamb-gentle eyes versus bat-wing ears and serpent tongues, crown of thorns alive with tiny demons"
    }

    let prompt = boschScenarios[scenario] || boschScenarios.pure

    // Add color scheme
    const colorPrompts: Record<string, string> = {
      plasma: "vibrant plasma colors, electric blues and magentas",
      quantum: "quantum field colors, deep blues and ethereal whites",
      cosmic: "cosmic colors, deep space purples and stellar golds",
      thermal: "thermal imaging colors, heat signature reds and oranges",
      spectral: "full spectrum rainbow colors, prismatic light effects",
      crystalline: "crystalline colors, clear gems and mineral tones",
      bioluminescent: "bioluminescent colors, glowing organic blues and greens",
      aurora: "aurora borealis colors, dancing green and purple lights",
      metallic: "metallic tones, silver and bronze accents",
      prismatic: "prismatic light effects, rainbow refractions",
      monochromatic: "monochromatic grayscale, black and white tones",
      infrared: "infrared heat colors, thermal reds and oranges",
      lava: "molten lava colors, glowing reds and oranges",
      futuristic: "futuristic neon colors, cyberpunk aesthetics",
      forest: "forest greens and earth tones",
      ocean: "ocean blues and aqua tones",
      sunset: "warm sunset colors, oranges and deep reds",
      arctic: "arctic colors, ice blues and pristine whites",
      neon: "bright neon colors, electric pinks and greens",
      vintage: "vintage sepia tones, aged photograph aesthetics",
      toxic: "toxic waste colors, radioactive greens and yellows",
      ember: "glowing ember colors, warm orange and red coals",
      lunar: "lunar surface colors, silver grays and crater shadows",
      tidal: "tidal pool colors, ocean blues and sandy browns",
    }

    prompt += `, ${colorPrompts[colorScheme] || "vibrant colors"}`
    prompt += ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition, Flemish painting technique, oil painting precision, medieval art style, hyperrealistic creature details"

    return prompt
  }

  // Build dataset-specific prompt for all other datasets
  let prompt = ""

  // Dataset-specific base prompts
  const datasetPrompts: Record<string, string> = {
    nuanu: "Nuanu Creative City architectural elements, modern creative spaces, innovative design, futuristic urban planning",
    bali: "Balinese Hindu temples, traditional architecture, tropical paradise, sacred geometry, rice terraces",
    thailand: "Thai Buddhist temples, golden spires, traditional architecture, serene landscapes, lotus flowers",
    indonesian: "Indonesian cultural heritage, traditional patterns, mystical elements, archipelago beauty",
    horror: "Indonesian mystical creatures, supernatural folklore elements, traditional legends",
    spirals: "Mathematical spiral patterns, Fibonacci sequences, golden ratio, geometric precision",
    fractal: "Fractal patterns, recursive geometry, infinite detail, mathematical beauty",
    mandelbrot: "Mandelbrot set visualization, complex mathematical patterns, infinite zoom",
    julia: "Julia set fractals, complex plane mathematics, iterative patterns",
    lorenz: "Lorenz attractor, chaos theory visualization, butterfly effect patterns",
    hyperbolic: "Hyperbolic geometry, non-Euclidean space, curved mathematical surfaces",
    gaussian: "Gaussian field visualization, statistical distributions, probability landscapes",
    cellular: "Cellular automata patterns, Conway's Game of Life, emergent complexity",
    voronoi: "Voronoi diagrams, spatial partitioning, natural tessellation patterns",
    perlin: "Perlin noise landscapes, procedural generation, organic randomness",
    diffusion: "Reaction-diffusion patterns, chemical wave propagation, Turing patterns",
    wave: "Wave interference patterns, harmonic oscillations, frequency visualizations",
    moons: "Lunar orbital mechanics, celestial body movements, gravitational dance",
    tribes: "Tribal network topology, social connections, community structures",
    heads: "Mosaic head compositions, portrait arrangements, facial geometry",
    natives: "Ancient native tribes, traditional cultures, indigenous wisdom",
    statues: "Sacred sculptural statues, carved monuments, artistic figures",
    "8bit": "8bit pixel art, retro gaming aesthetics, pixelated graphics, classic arcade style",
    escher: "M.C. Escher mathematical art, impossible geometries, optical illusions, tessellations",
  }

  prompt = datasetPrompts[dataset] || "Abstract mathematical art"

  // Add scenario-specific details for other datasets
  if (dataset === "indonesian") {
    const scenarioPrompts: Record<string, string> = {
      pure: "pure mathematical beauty with Indonesian geometric patterns",
      garuda: "Majestic Garuda Wisnu Kencana soaring through celestial realms, massive divine eagle with wingspan stretching across golden sunset skies, intricate feather details shimmering with ethereal light, powerful talons gripping sacred lotus blossoms radiating divine energy, noble eagle head crowned with jeweled diadem of ancient Javanese kings, eyes blazing with cosmic wisdom and protective spirit, Lord Vishnu mounted majestically upon Garuda's back in full divine regalia with four arms holding sacred conch shell, discus wheel of time, lotus of creation, and ceremonial staff, flowing silk garments in royal blues and golds dancing in celestial winds, Mount Meru rising in background with cascading waterfalls of liquid starlight, temple spires piercing through clouds of incense and prayers, Indonesian archipelago spread below like scattered emeralds in sapphire seas, Ring of Fire volcanoes glowing with sacred flames, traditional gamelan music as golden sound waves rippling through dimensions, ancient Sanskrit mantras floating as luminous script in the air, Ramayana epic scenes carved into floating stone tablets, divine aura radiating rainbow light spectrum, cosmic mandala patterns swirling in the heavens, 17,508 islands of Indonesia visible as points of light below, Borobudur and Prambanan temples glowing with spiritual energy, traditional Indonesian textiles patterns woven into the very fabric of reality, hyperrealistic 8K cinematic masterpiece with volumetric lighting and particle effects",
      // ... other Indonesian scenarios
    }

    if (scenarioPrompts[scenario]) {
      prompt += ", " + scenarioPrompts[scenario]
    }
  }

  // Add color scheme
  const colorPrompts: Record<string, string> = {
    plasma: "vibrant plasma colors, electric blues and magentas",
    quantum: "quantum field colors, deep blues and ethereal whites",
    cosmic: "cosmic colors, deep space purples and stellar golds",
    thermal: "thermal imaging colors, heat signature reds and oranges",
    spectral: "full spectrum rainbow colors, prismatic light effects",
    crystalline: "crystalline colors, clear gems and mineral tones",
    bioluminescent: "bioluminescent colors, glowing organic blues and greens",
    aurora: "aurora borealis colors, dancing green and purple lights",
    metallic: "metallic tones, silver and bronze accents",
    prismatic: "prismatic light effects, rainbow refractions",
    monochromatic: "monochromatic grayscale, black and white tones",
    infrared: "infrared heat colors, thermal reds and oranges",
    lava: "molten lava colors, glowing reds and oranges",
    futuristic: "futuristic neon colors, cyberpunk aesthetics",
    forest: "forest greens and earth tones",
    ocean: "ocean blues and aqua tones",
    sunset: "warm sunset colors, oranges and deep reds",
    arctic: "arctic colors, ice blues and pristine whites",
    neon: "bright neon colors, electric pinks and greens",
    vintage: "vintage sepia tones, aged photograph aesthetics",
    toxic: "toxic waste colors, radioactive greens and yellows",
    ember: "glowing ember colors, warm orange and red coals",
    lunar: "lunar surface colors, silver grays and crater shadows",
    tidal: "tidal pool colors, ocean blues and sandy browns",
  }

  prompt += `, ${colorPrompts[colorScheme] || "vibrant colors"}`

  // Add artistic quality descriptors
  prompt += ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition"

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🎨 AI Art API called with body:", JSON.stringify(body, null, 2))

    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      timeStep,
      customPrompt,
      domeProjection,
      domeDiameter = 20,
      domeResolution = "8K",
      projectionType = "fisheye",
      panoramaResolution = "16K",
      panoramaFormat = "equirectangular",
      stereographicPerspective,
    } = body

    // Build the main prompt
    const mainPrompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Generated main prompt:", mainPrompt.substring(0, 200) + "...")
    console.log("📏 Prompt length:", mainPrompt.length, "characters")

    let mainImageUrl: string
    let domeImageUrl: string
    let panoramaImageUrl: string
    const generationDetails: any = {}

    try {
      console.log("🖼️ Generating main image...")
      mainImageUrl = await callOpenAI(mainPrompt)
      generationDetails.mainImage = "Generated successfully"
      console.log("✅ Main image generated successfully")
    } catch (error: any) {
      console.error("❌ Main image generation failed:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate main image: " + error.message,
          promptLength: mainPrompt.length,
          promptPreview: mainPrompt.substring(0, 200) + "...",
        },
        { status: 500 },
      )
    }

    // ALWAYS generate dome projection for complete set with TUNNEL UP effect
    console.log(`🏛️ Generating ${domeDiameter}m dome projection with TUNNEL UP effect...`)
    generationDetails.domeImage = "Generating..."
    try {
      const domePrompt = generateDomePrompt(mainPrompt, domeDiameter, domeResolution, projectionType)
      console.log("📝 Generated dome TUNNEL UP prompt:", domePrompt.substring(0, 200) + "...")
      domeImageUrl = await callOpenAI(domePrompt)
      generationDetails.domeImage = "Generated successfully with TUNNEL UP effect"
      console.log(`✅ ${domeDiameter}m dome TUNNEL UP projection generated successfully`)
    } catch (error: any) {
      console.error(`❌ ${domeDiameter}m dome TUNNEL UP projection generation failed:`, error.message)
      domeImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.domeImage = `Fallback used: ${error.message}`
    }

    // ALWAYS generate 360° panorama for complete set
    console.log("🌐 Generating 360° panorama...")
    generationDetails.panoramaImage = "Generating..."
    try {
      const panoramaPrompt = generatePanoramaPrompt(
        mainPrompt,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      )
      console.log("📝 Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
      panoramaImageUrl = await callOpenAI(panoramaPrompt)
      generationDetails.panoramaImage = "Generated successfully"
      console.log("✅ 360° panorama generated successfully")
    } catch (error: any) {
      console.error("❌ 360° panorama generation failed:", error.message)
      panoramaImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.panoramaImage = `Fallback used: ${error.message}`
    }

    // Prepare response with ALL THREE versions
    const response = {
      success: true,
      image: mainImageUrl,
      domeImage: domeImageUrl || mainImageUrl,
      panoramaImage: panoramaImageUrl || mainImageUrl,
      originalPrompt: mainPrompt,
      promptLength: mainPrompt.length,
      provider: "OpenAI",
      model: "DALL-E 3",
      estimatedFileSize: "~2-4MB",
      generationDetails,
      parameters: {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale: noise,
        timeStep,
        domeProjection: true,
        domeDiameter: 20,
        domeResolution: "8K",
        projectionType: "fisheye",
        panoramic360: true,
        panoramaResolution: "16K",
        panoramaFormat: "equirectangular",
        stereographicPerspective,
      },
    }

    console.log("✅ Returning successful response with all three images including TUNNEL UP dome effect")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ AI Art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI art",
        details: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
