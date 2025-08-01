import { type NextRequest, NextResponse } from "next/server"

// Enhanced dataset information with comprehensive details
const DATASET_INFO = {
  nuanu: {
    name: "Nuanu Creative City",
    description:
      "A visionary development in Bali creating a future where culture, nature, and innovation thrive together, blending divine inspiration with harmonious living.",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      "thk-tower": {
        name: "THK Tower",
        description:
          "The iconic architectural centerpiece of Nuanu Creative City, representing innovation and sustainable design",
        keywords: [
          "modern architecture",
          "sustainable design",
          "iconic tower",
          "innovative structure",
          "green building",
          "futuristic design",
        ],
      },
      "popper-sentinels": {
        name: "Popper Sentinels",
        description: "Guardian statue installations that watch over the creative community with mysterious presence",
        keywords: [
          "guardian statues",
          "sentinel figures",
          "protective installations",
          "mysterious guardians",
          "artistic sculptures",
        ],
      },
      "luna-beach": {
        name: "Luna Beach Club",
        description: "Sophisticated coastal creative space where ocean meets innovation in perfect harmony",
        keywords: [
          "beach club",
          "coastal architecture",
          "ocean views",
          "luxury design",
          "tropical modernism",
          "waterfront",
        ],
      },
      "labyrinth-dome": {
        name: "Labyrinth Dome",
        description:
          "Immersive geodesic dome experience featuring interactive digital installations and sacred geometry",
        keywords: [
          "geodesic dome",
          "immersive experience",
          "digital installations",
          "interactive art",
          "sacred geometry",
          "dome architecture",
        ],
      },
      "creative-studios": {
        name: "Creative Studios",
        description: "Artist workshops and collaborative spaces fostering innovation and cultural exchange",
        keywords: [
          "artist studios",
          "creative workshops",
          "collaborative spaces",
          "innovation hubs",
          "cultural exchange",
          "maker spaces",
        ],
      },
      "community-plaza": {
        name: "Community Plaza",
        description: "Central gathering space where culture, nature, and innovation converge in harmonious living",
        keywords: [
          "community gathering",
          "central plaza",
          "cultural convergence",
          "harmonious living",
          "social spaces",
          "public art",
        ],
      },
      "digital-gardens": {
        name: "Digital Gardens",
        description: "Tech-nature integration showcasing the future of sustainable living and digital harmony",
        keywords: [
          "digital nature",
          "tech integration",
          "sustainable living",
          "smart gardens",
          "bio-technology",
          "future ecology",
        ],
      },
    },
  },
  bali: {
    name: "Balinese Cultural Heritage",
    description:
      "Rich cultural traditions of Bali including Hindu temples, rice terraces, traditional ceremonies, and sacred arts",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      temples: {
        name: "Hindu Temples",
        description: "Sacred Pura architecture with intricate stone carvings and spiritual significance",
        keywords: [
          "Hindu temples",
          "Pura architecture",
          "stone carvings",
          "spiritual sanctuaries",
          "Balinese temples",
          "sacred architecture",
        ],
      },
      "rice-terraces": {
        name: "Rice Terraces",
        description: "Jatiluwih terraced landscapes showcasing ancient agricultural wisdom",
        keywords: [
          "rice terraces",
          "Jatiluwih",
          "agricultural landscapes",
          "terraced fields",
          "ancient farming",
          "green terraces",
        ],
      },
      ceremonies: {
        name: "Hindu Ceremonies",
        description: "Galungan and Kuningan festivals with colorful processions and offerings",
        keywords: [
          "Hindu ceremonies",
          "Galungan festival",
          "Kuningan celebration",
          "religious processions",
          "temple offerings",
          "Balinese rituals",
        ],
      },
      dancers: {
        name: "Traditional Dancers",
        description: "Legong and Kecak performances with elaborate costumes and graceful movements",
        keywords: [
          "Balinese dance",
          "Legong dancers",
          "Kecak performance",
          "traditional costumes",
          "cultural dance",
          "graceful movements",
        ],
      },
      beaches: {
        name: "Tropical Beaches",
        description: "Volcanic sand beaches with coral reefs and traditional fishing boats",
        keywords: [
          "tropical beaches",
          "volcanic sand",
          "coral reefs",
          "fishing boats",
          "coastal temples",
          "ocean views",
        ],
      },
      artisans: {
        name: "Balinese Artisans",
        description: "Master craftsmen creating wood carvings, silver jewelry, and traditional arts",
        keywords: [
          "Balinese artisans",
          "wood carving",
          "silver jewelry",
          "traditional crafts",
          "master craftsmen",
          "cultural arts",
        ],
      },
      volcanoes: {
        name: "Sacred Volcanoes",
        description: "Mount Batur and Mount Agung, sacred peaks central to Balinese spirituality",
        keywords: [
          "Mount Batur",
          "Mount Agung",
          "sacred volcanoes",
          "volcanic peaks",
          "spiritual mountains",
          "sunrise views",
        ],
      },
    },
  },
  thailand: {
    name: "Thai Cultural Heritage",
    description:
      "Rich traditions of Thailand including golden temples, floating markets, Buddhist monks, and royal palaces",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      landscape: {
        name: "Natural Landscape",
        description: "Temples nestled in tropical settings with lush vegetation",
        keywords: [
          "Thai temples",
          "tropical landscape",
          "lush vegetation",
          "temple grounds",
          "natural settings",
          "Buddhist architecture",
        ],
      },
      architectural: {
        name: "Temple Architecture",
        description: "Traditional Thai buildings with golden spires and intricate details",
        keywords: [
          "Thai architecture",
          "golden temples",
          "temple spires",
          "intricate details",
          "traditional buildings",
          "Buddhist temples",
        ],
      },
      ceremonial: {
        name: "Cultural Ceremonies",
        description: "Festivals and traditions including Songkran and Loy Krathong",
        keywords: [
          "Thai festivals",
          "Songkran celebration",
          "Loy Krathong",
          "cultural ceremonies",
          "traditional festivals",
          "Thai traditions",
        ],
      },
      urban: {
        name: "Modern Thailand",
        description: "Bangkok street life with tuk-tuks, markets, and urban energy",
        keywords: ["Bangkok streets", "tuk-tuks", "street markets", "urban life", "modern Thailand", "city energy"],
      },
      botanical: {
        name: "Thai Gardens",
        description: "Lotus ponds and tropical flora in serene garden settings",
        keywords: [
          "Thai gardens",
          "lotus ponds",
          "tropical flora",
          "serene gardens",
          "botanical beauty",
          "peaceful settings",
        ],
      },
      floating: {
        name: "Floating Markets",
        description: "Traditional water markets with colorful boats and fresh produce",
        keywords: [
          "floating markets",
          "water markets",
          "colorful boats",
          "fresh produce",
          "traditional commerce",
          "river life",
        ],
      },
      monks: {
        name: "Buddhist Monks",
        description: "Saffron-robed monks in meditation and daily rituals",
        keywords: [
          "Buddhist monks",
          "saffron robes",
          "meditation",
          "daily rituals",
          "monastic life",
          "spiritual practice",
        ],
      },
    },
  },
  spirals: {
    name: "Mathematical Spirals",
    description: "Fibonacci spirals, golden ratio mathematics, and natural spiral formations found throughout nature",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      fibonacci: {
        name: "Fibonacci Spirals",
        description: "Golden ratio mathematics manifested in perfect spiral forms",
        keywords: [
          "Fibonacci sequence",
          "golden ratio",
          "mathematical spirals",
          "phi ratio",
          "natural mathematics",
          "perfect proportions",
        ],
      },
      galaxy: {
        name: "Galactic Arms",
        description: "Cosmic spiral formations resembling galaxy arms and stellar nurseries",
        keywords: [
          "galactic spirals",
          "cosmic formations",
          "galaxy arms",
          "stellar nurseries",
          "space spirals",
          "astronomical patterns",
        ],
      },
      nautilus: {
        name: "Nautilus Shells",
        description: "Natural spiral patterns found in seashells and marine life",
        keywords: [
          "nautilus shells",
          "natural spirals",
          "seashell patterns",
          "marine geometry",
          "ocean spirals",
          "biological mathematics",
        ],
      },
      vortex: {
        name: "Energy Vortex",
        description: "Dynamic spiral flows representing energy and movement",
        keywords: [
          "energy vortex",
          "dynamic spirals",
          "flow patterns",
          "energy movement",
          "spiral dynamics",
          "kinetic spirals",
        ],
      },
      logarithmic: {
        name: "Logarithmic",
        description: "Mathematical precision in logarithmic spiral formations",
        keywords: [
          "logarithmic spirals",
          "mathematical precision",
          "spiral mathematics",
          "geometric spirals",
          "precise curves",
          "mathematical beauty",
        ],
      },
      hurricane: {
        name: "Hurricane Patterns",
        description: "Weather spiral systems and atmospheric vortex formations",
        keywords: [
          "hurricane spirals",
          "weather patterns",
          "atmospheric vortex",
          "storm systems",
          "meteorological spirals",
          "natural phenomena",
        ],
      },
      dna: {
        name: "DNA Helixes",
        description: "Biological double spirals representing the code of life",
        keywords: [
          "DNA helixes",
          "double spirals",
          "genetic code",
          "biological spirals",
          "life patterns",
          "molecular geometry",
        ],
      },
    },
  },
  fractal: {
    name: "Fractal Patterns",
    description: "Self-similar patterns that repeat at different scales, found in nature and mathematics",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      tree: {
        name: "Tree Fractals",
        description: "Branching organic structures that repeat at multiple scales",
        keywords: [
          "fractal trees",
          "branching patterns",
          "organic structures",
          "tree branches",
          "natural fractals",
          "recursive growth",
        ],
      },
      lightning: {
        name: "Lightning Patterns",
        description: "Electric fractal forms created by electrical discharge",
        keywords: [
          "lightning fractals",
          "electric patterns",
          "electrical discharge",
          "branching lightning",
          "natural electricity",
          "storm fractals",
        ],
      },
      fern: {
        name: "Fern Fronds",
        description: "Delicate recursive patterns found in fern leaves",
        keywords: [
          "fern fractals",
          "fern fronds",
          "recursive patterns",
          "delicate structures",
          "plant fractals",
          "natural recursion",
        ],
      },
      dragon: {
        name: "Dragon Curves",
        description: "Complex mathematical curves with infinite detail",
        keywords: [
          "dragon curves",
          "mathematical curves",
          "complex patterns",
          "infinite detail",
          "geometric fractals",
          "curve mathematics",
        ],
      },
      julia: {
        name: "Julia Sets",
        description: "Complex plane fractals with intricate boundary patterns",
        keywords: [
          "Julia sets",
          "complex plane",
          "fractal boundaries",
          "mathematical sets",
          "complex fractals",
          "infinite complexity",
        ],
      },
      snowflake: {
        name: "Koch Snowflakes",
        description: "Geometric fractal boundaries with infinite perimeter",
        keywords: [
          "Koch snowflakes",
          "geometric fractals",
          "infinite perimeter",
          "fractal boundaries",
          "snowflake patterns",
          "mathematical snowflakes",
        ],
      },
      coral: {
        name: "Coral Reefs",
        description: "Natural fractal growth patterns in marine ecosystems",
        keywords: [
          "coral fractals",
          "marine fractals",
          "natural growth",
          "reef patterns",
          "ocean fractals",
          "biological structures",
        ],
      },
    },
  },
  mandelbrot: {
    name: "Mandelbrot Set",
    description: "The most famous fractal set with infinite complexity and self-similarity",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      classic: {
        name: "Classic Set",
        description: "Traditional Mandelbrot set visualization",
        keywords: [
          "Mandelbrot set",
          "classic fractal",
          "complex plane",
          "fractal mathematics",
          "infinite complexity",
          "mathematical beauty",
        ],
      },
      zoom: {
        name: "Infinite Zoom",
        description: "Deep fractal exploration revealing infinite detail",
        keywords: [
          "infinite zoom",
          "fractal depth",
          "deep exploration",
          "infinite detail",
          "fractal journey",
          "mathematical infinity",
        ],
      },
      bulbs: {
        name: "Cardioid Bulbs",
        description: "Main set structures and bulb formations",
        keywords: [
          "cardioid bulbs",
          "main bulb",
          "fractal structures",
          "set formations",
          "mathematical bulbs",
          "complex structures",
        ],
      },
      seahorse: {
        name: "Seahorse Valley",
        description: "Detailed fractal regions resembling seahorse shapes",
        keywords: [
          "seahorse valley",
          "fractal seahorses",
          "detailed regions",
          "complex shapes",
          "fractal animals",
          "mathematical creatures",
        ],
      },
      psychedelic: {
        name: "Psychedelic",
        description: "Vibrant color escapes and artistic interpretations",
        keywords: [
          "psychedelic fractals",
          "vibrant colors",
          "color escapes",
          "artistic fractals",
          "colorful mathematics",
          "fractal art",
        ],
      },
      tendrils: {
        name: "Fractal Tendrils",
        description: "Delicate spiral extensions and fine details",
        keywords: [
          "fractal tendrils",
          "spiral extensions",
          "fine details",
          "delicate structures",
          "fractal spirals",
          "mathematical tendrils",
        ],
      },
      burning: {
        name: "Burning Ship",
        description: "Alternative fractal formula creating ship-like formations",
        keywords: [
          "burning ship",
          "alternative fractal",
          "ship formations",
          "fractal variations",
          "mathematical ships",
          "complex variations",
        ],
      },
    },
  },
  julia: {
    name: "Julia Set",
    description: "Complex plane fractals with beautiful boundary patterns and infinite detail",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      classic: {
        name: "Classic Julia",
        description: "Traditional Julia set formations",
        keywords: [
          "Julia set",
          "complex plane",
          "fractal boundaries",
          "mathematical beauty",
          "infinite detail",
          "complex mathematics",
        ],
      },
      connected: {
        name: "Connected Sets",
        description: "Julia sets with connected boundary structures",
        keywords: [
          "connected Julia",
          "boundary structures",
          "fractal connections",
          "mathematical connectivity",
          "complex boundaries",
          "set theory",
        ],
      },
      disconnected: {
        name: "Disconnected Sets",
        description: "Julia sets with scattered fractal dust patterns",
        keywords: [
          "disconnected Julia",
          "fractal dust",
          "scattered patterns",
          "mathematical chaos",
          "complex dynamics",
          "fractal scatter",
        ],
      },
      spiral: {
        name: "Spiral Julia",
        description: "Julia sets with prominent spiral formations",
        keywords: [
          "spiral Julia",
          "fractal spirals",
          "spiral formations",
          "mathematical spirals",
          "complex spirals",
          "spiral mathematics",
        ],
      },
      dendrite: {
        name: "Dendrite Julia",
        description: "Tree-like Julia set formations",
        keywords: [
          "dendrite Julia",
          "tree fractals",
          "branching patterns",
          "fractal trees",
          "mathematical dendrites",
          "organic fractals",
        ],
      },
      rabbit: {
        name: "Rabbit Julia",
        description: "Julia sets resembling rabbit-like shapes",
        keywords: [
          "rabbit Julia",
          "fractal rabbits",
          "animal fractals",
          "mathematical creatures",
          "complex animals",
          "fractal shapes",
        ],
      },
      dragon: {
        name: "Dragon Julia",
        description: "Julia sets with dragon-like formations",
        keywords: [
          "dragon Julia",
          "fractal dragons",
          "dragon shapes",
          "mathematical dragons",
          "complex creatures",
          "mythical fractals",
        ],
      },
    },
  },
  lorenz: {
    name: "Lorenz Attractor",
    description: "Chaotic system creating butterfly-like patterns in phase space",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      butterfly: {
        name: "Butterfly Effect",
        description: "Classic butterfly-shaped attractor patterns",
        keywords: [
          "butterfly effect",
          "chaos theory",
          "strange attractor",
          "chaotic systems",
          "butterfly patterns",
          "mathematical chaos",
        ],
      },
      trajectory: {
        name: "Phase Trajectories",
        description: "System trajectories through phase space",
        keywords: [
          "phase trajectories",
          "system dynamics",
          "phase space",
          "mathematical trajectories",
          "dynamic systems",
          "chaos mathematics",
        ],
      },
      parameters: {
        name: "Parameter Variations",
        description: "Different parameter settings creating varied patterns",
        keywords: [
          "parameter variations",
          "system parameters",
          "mathematical variations",
          "dynamic parameters",
          "chaos parameters",
          "system behavior",
        ],
      },
      sensitivity: {
        name: "Sensitive Dependence",
        description: "Demonstrating sensitive dependence on initial conditions",
        keywords: [
          "sensitive dependence",
          "initial conditions",
          "chaos sensitivity",
          "mathematical sensitivity",
          "system sensitivity",
          "chaotic behavior",
        ],
      },
      strange: {
        name: "Strange Attractor",
        description: "Non-periodic attracting sets in phase space",
        keywords: [
          "strange attractor",
          "non-periodic",
          "attracting sets",
          "mathematical attractors",
          "chaos attractors",
          "complex dynamics",
        ],
      },
      flow: {
        name: "Flow Dynamics",
        description: "Continuous flow patterns in the system",
        keywords: [
          "flow dynamics",
          "continuous flow",
          "system flow",
          "mathematical flow",
          "dynamic flow",
          "chaos flow",
        ],
      },
      bifurcation: {
        name: "Bifurcation Points",
        description: "Critical points where system behavior changes",
        keywords: [
          "bifurcation points",
          "critical points",
          "system changes",
          "mathematical bifurcations",
          "chaos bifurcations",
          "dynamic transitions",
        ],
      },
    },
  },
  hyperbolic: {
    name: "Hyperbolic Geometry",
    description: "Non-Euclidean geometry with constant negative curvature",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      poincare: {
        name: "Poincaré Disk",
        description: "Hyperbolic plane represented in a disk model",
        keywords: [
          "Poincaré disk",
          "hyperbolic plane",
          "disk model",
          "non-Euclidean geometry",
          "hyperbolic geometry",
          "curved space",
        ],
      },
      tessellation: {
        name: "Hyperbolic Tessellations",
        description: "Regular tilings of the hyperbolic plane",
        keywords: [
          "hyperbolic tessellations",
          "regular tilings",
          "hyperbolic tilings",
          "geometric tessellations",
          "curved tessellations",
          "mathematical tilings",
        ],
      },
      triangles: {
        name: "Hyperbolic Triangles",
        description: "Triangles with angle sum less than 180 degrees",
        keywords: [
          "hyperbolic triangles",
          "curved triangles",
          "non-Euclidean triangles",
          "geometric triangles",
          "hyperbolic angles",
          "mathematical triangles",
        ],
      },
      circles: {
        name: "Hyperbolic Circles",
        description: "Circles in hyperbolic space with unique properties",
        keywords: [
          "hyperbolic circles",
          "curved circles",
          "non-Euclidean circles",
          "geometric circles",
          "hyperbolic curves",
          "mathematical circles",
        ],
      },
      lines: {
        name: "Hyperbolic Lines",
        description: "Geodesics in hyperbolic space",
        keywords: [
          "hyperbolic lines",
          "geodesics",
          "curved lines",
          "non-Euclidean lines",
          "hyperbolic geodesics",
          "mathematical lines",
        ],
      },
      escher: {
        name: "Escher Patterns",
        description: "Artistic patterns inspired by M.C. Escher's work",
        keywords: [
          "Escher patterns",
          "artistic geometry",
          "geometric art",
          "mathematical art",
          "hyperbolic art",
          "Escher tessellations",
        ],
      },
      limit: {
        name: "Limit Sets",
        description: "Boundary patterns of hyperbolic groups",
        keywords: [
          "limit sets",
          "boundary patterns",
          "hyperbolic groups",
          "mathematical boundaries",
          "geometric limits",
          "fractal boundaries",
        ],
      },
    },
  },
  gaussian: {
    name: "Gaussian Fields",
    description: "Random fields with Gaussian probability distributions",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      random: {
        name: "Random Fields",
        description: "Gaussian random field realizations",
        keywords: [
          "random fields",
          "Gaussian fields",
          "stochastic processes",
          "random patterns",
          "mathematical randomness",
          "statistical patterns",
        ],
      },
      correlation: {
        name: "Correlation Structures",
        description: "Spatial correlation patterns in Gaussian fields",
        keywords: [
          "correlation structures",
          "spatial correlation",
          "statistical correlation",
          "mathematical correlation",
          "field correlation",
          "stochastic correlation",
        ],
      },
      noise: {
        name: "Gaussian Noise",
        description: "White and colored Gaussian noise patterns",
        keywords: [
          "Gaussian noise",
          "white noise",
          "colored noise",
          "random noise",
          "statistical noise",
          "mathematical noise",
        ],
      },
      smooth: {
        name: "Smooth Fields",
        description: "Smoothly varying Gaussian random fields",
        keywords: [
          "smooth fields",
          "smooth variations",
          "continuous fields",
          "mathematical smoothness",
          "field smoothness",
          "statistical smoothness",
        ],
      },
      rough: {
        name: "Rough Fields",
        description: "Highly variable Gaussian fields with rough textures",
        keywords: [
          "rough fields",
          "rough textures",
          "variable fields",
          "mathematical roughness",
          "field roughness",
          "statistical roughness",
        ],
      },
      multiscale: {
        name: "Multiscale Fields",
        description: "Gaussian fields with multiple scale structures",
        keywords: [
          "multiscale fields",
          "multiple scales",
          "scale structures",
          "mathematical scales",
          "field scales",
          "statistical scales",
        ],
      },
      conditional: {
        name: "Conditional Fields",
        description: "Gaussian fields conditioned on observations",
        keywords: [
          "conditional fields",
          "conditioned fields",
          "statistical conditioning",
          "mathematical conditioning",
          "field conditioning",
          "Bayesian fields",
        ],
      },
    },
  },
  cellular: {
    name: "Cellular Automata",
    description: "Discrete models with simple rules creating complex patterns",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      conway: {
        name: "Conway's Game of Life",
        description: "Classic cellular automaton with birth and death rules",
        keywords: [
          "Game of Life",
          "Conway's rules",
          "cellular evolution",
          "birth death rules",
          "mathematical life",
          "cellular patterns",
        ],
      },
      elementary: {
        name: "Elementary Automata",
        description: "Simple one-dimensional cellular automata",
        keywords: [
          "elementary automata",
          "1D automata",
          "simple rules",
          "cellular rules",
          "mathematical automata",
          "discrete dynamics",
        ],
      },
      wolfram: {
        name: "Wolfram Rules",
        description: "Classification of cellular automata by Stephen Wolfram",
        keywords: [
          "Wolfram rules",
          "automata classification",
          "cellular classification",
          "mathematical rules",
          "discrete rules",
          "computational rules",
        ],
      },
      totalistic: {
        name: "Totalistic Rules",
        description: "Cellular automata based on neighbor sum totals",
        keywords: [
          "totalistic rules",
          "neighbor sums",
          "cellular totals",
          "mathematical totals",
          "discrete totals",
          "sum-based rules",
        ],
      },
      reversible: {
        name: "Reversible Automata",
        description: "Time-reversible cellular automaton systems",
        keywords: [
          "reversible automata",
          "time reversible",
          "invertible rules",
          "mathematical reversibility",
          "cellular reversibility",
          "discrete reversibility",
        ],
      },
      probabilistic: {
        name: "Probabilistic Automata",
        description: "Cellular automata with probabilistic update rules",
        keywords: [
          "probabilistic automata",
          "stochastic rules",
          "random updates",
          "mathematical probability",
          "cellular probability",
          "discrete probability",
        ],
      },
      continuous: {
        name: "Continuous Automata",
        description: "Cellular automata with continuous state values",
        keywords: [
          "continuous automata",
          "continuous states",
          "real-valued cells",
          "mathematical continuity",
          "cellular continuity",
          "discrete-continuous",
        ],
      },
    },
  },
  voronoi: {
    name: "Voronoi Diagrams",
    description: "Spatial partitions based on distance to seed points",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      euclidean: {
        name: "Euclidean Distance",
        description: "Standard Voronoi diagrams with Euclidean distance metric",
        keywords: [
          "Euclidean Voronoi",
          "Euclidean distance",
          "standard Voronoi",
          "distance metric",
          "mathematical distance",
          "geometric distance",
        ],
      },
      manhattan: {
        name: "Manhattan Distance",
        description: "Voronoi diagrams using Manhattan distance metric",
        keywords: [
          "Manhattan Voronoi",
          "Manhattan distance",
          "L1 metric",
          "city block distance",
          "mathematical metrics",
          "geometric metrics",
        ],
      },
      weighted: {
        name: "Weighted Voronoi",
        description: "Power diagrams with weighted seed points",
        keywords: [
          "weighted Voronoi",
          "power diagrams",
          "weighted seeds",
          "mathematical weights",
          "geometric weights",
          "weighted distance",
        ],
      },
      spherical: {
        name: "Spherical Voronoi",
        description: "Voronoi diagrams on spherical surfaces",
        keywords: [
          "spherical Voronoi",
          "sphere tessellation",
          "spherical geometry",
          "curved Voronoi",
          "mathematical spheres",
          "geometric spheres",
        ],
      },
      hyperbolic: {
        name: "Hyperbolic Voronoi",
        description: "Voronoi diagrams in hyperbolic space",
        keywords: [
          "hyperbolic Voronoi",
          "hyperbolic space",
          "curved space Voronoi",
          "non-Euclidean Voronoi",
          "mathematical hyperbolic",
          "geometric hyperbolic",
        ],
      },
      dynamic: {
        name: "Dynamic Voronoi",
        description: "Time-evolving Voronoi diagrams with moving seeds",
        keywords: [
          "dynamic Voronoi",
          "moving seeds",
          "time evolution",
          "animated Voronoi",
          "mathematical dynamics",
          "geometric dynamics",
        ],
      },
      centroidal: {
        name: "Centroidal Voronoi",
        description: "Voronoi diagrams where seeds are at cell centroids",
        keywords: [
          "centroidal Voronoi",
          "Lloyd's algorithm",
          "optimal placement",
          "mathematical optimization",
          "geometric optimization",
          "centroid placement",
        ],
      },
    },
  },
  perlin: {
    name: "Perlin Noise",
    description: "Gradient noise function for natural-looking textures and patterns",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      classic: {
        name: "Classic Perlin",
        description: "Original Perlin noise algorithm",
        keywords: [
          "classic Perlin",
          "original algorithm",
          "gradient noise",
          "procedural noise",
          "mathematical noise",
          "algorithmic textures",
        ],
      },
      simplex: {
        name: "Simplex Noise",
        description: "Improved Perlin noise with better performance",
        keywords: [
          "simplex noise",
          "improved Perlin",
          "better performance",
          "mathematical improvement",
          "algorithmic optimization",
          "noise optimization",
        ],
      },
      fractal: {
        name: "Fractal Noise",
        description: "Multi-octave Perlin noise with fractal properties",
        keywords: [
          "fractal noise",
          "multi-octave",
          "fractal Perlin",
          "layered noise",
          "mathematical fractals",
          "noise fractals",
        ],
      },
      turbulence: {
        name: "Turbulence",
        description: "Turbulent flow patterns using Perlin noise",
        keywords: [
          "turbulence",
          "turbulent flow",
          "flow patterns",
          "mathematical turbulence",
          "fluid turbulence",
          "noise turbulence",
        ],
      },
      marble: {
        name: "Marble Texture",
        description: "Marble-like patterns using Perlin noise",
        keywords: [
          "marble texture",
          "marble patterns",
          "stone textures",
          "natural textures",
          "mathematical textures",
          "procedural marble",
        ],
      },
      wood: {
        name: "Wood Grain",
        description: "Wood grain patterns using cylindrical Perlin noise",
        keywords: [
          "wood grain",
          "wood patterns",
          "natural wood",
          "cylindrical noise",
          "mathematical wood",
          "procedural wood",
        ],
      },
      clouds: {
        name: "Cloud Patterns",
        description: "Realistic cloud formations using Perlin noise",
        keywords: [
          "cloud patterns",
          "cloud formations",
          "atmospheric patterns",
          "weather patterns",
          "mathematical clouds",
          "procedural clouds",
        ],
      },
    },
  },
  diffusion: {
    name: "Reaction-Diffusion",
    description: "Chemical reaction systems creating organic patterns and structures",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      turing: {
        name: "Turing Patterns",
        description: "Alan Turing's reaction-diffusion patterns",
        keywords: [
          "Turing patterns",
          "reaction-diffusion",
          "chemical patterns",
          "biological patterns",
          "mathematical biology",
          "pattern formation",
        ],
      },
      spots: {
        name: "Spot Patterns",
        description: "Spotted patterns like animal markings",
        keywords: [
          "spot patterns",
          "animal markings",
          "biological spots",
          "natural patterns",
          "mathematical spots",
          "organic spots",
        ],
      },
      stripes: {
        name: "Stripe Patterns",
        description: "Striped patterns found in nature",
        keywords: [
          "stripe patterns",
          "natural stripes",
          "biological stripes",
          "zebra patterns",
          "mathematical stripes",
          "organic stripes",
        ],
      },
      labyrinth: {
        name: "Labyrinth Patterns",
        description: "Maze-like structures from reaction-diffusion",
        keywords: [
          "labyrinth patterns",
          "maze structures",
          "complex patterns",
          "mathematical mazes",
          "organic mazes",
          "natural labyrinths",
        ],
      },
      coral: {
        name: "Coral Growth",
        description: "Coral-like branching structures",
        keywords: [
          "coral growth",
          "branching structures",
          "marine patterns",
          "biological growth",
          "mathematical growth",
          "organic branching",
        ],
      },
      bacterial: {
        name: "Bacterial Colonies",
        description: "Bacterial growth and colony patterns",
        keywords: [
          "bacterial colonies",
          "bacterial growth",
          "microbial patterns",
          "biological colonies",
          "mathematical biology",
          "growth patterns",
        ],
      },
      chemical: {
        name: "Chemical Waves",
        description: "Chemical wave propagation patterns",
        keywords: [
          "chemical waves",
          "wave propagation",
          "chemical reactions",
          "reaction waves",
          "mathematical chemistry",
          "chemical dynamics",
        ],
      },
    },
  },
  wave: {
    name: "Wave Interference",
    description: "Wave patterns created by interference and superposition",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      constructive: {
        name: "Constructive Interference",
        description: "Waves adding together to create larger amplitudes",
        keywords: [
          "constructive interference",
          "wave addition",
          "amplitude increase",
          "wave superposition",
          "mathematical waves",
          "wave mathematics",
        ],
      },
      destructive: {
        name: "Destructive Interference",
        description: "Waves canceling each other out",
        keywords: [
          "destructive interference",
          "wave cancellation",
          "amplitude decrease",
          "wave subtraction",
          "mathematical interference",
          "wave physics",
        ],
      },
      standing: {
        name: "Standing Waves",
        description: "Stationary wave patterns from interference",
        keywords: [
          "standing waves",
          "stationary patterns",
          "wave nodes",
          "wave antinodes",
          "mathematical standing",
          "wave resonance",
        ],
      },
      circular: {
        name: "Circular Waves",
        description: "Circular wave patterns and ripples",
        keywords: [
          "circular waves",
          "wave ripples",
          "radial waves",
          "circular patterns",
          "mathematical circles",
          "wave circles",
        ],
      },
      plane: {
        name: "Plane Waves",
        description: "Flat wavefronts traveling in straight lines",
        keywords: [
          "plane waves",
          "flat wavefronts",
          "linear waves",
          "straight propagation",
          "mathematical planes",
          "wave planes",
        ],
      },
      spherical: {
        name: "Spherical Waves",
        description: "Waves expanding in all directions from a point",
        keywords: [
          "spherical waves",
          "radial expansion",
          "point sources",
          "3D waves",
          "mathematical spheres",
          "wave spheres",
        ],
      },
      doppler: {
        name: "Doppler Effect",
        description: "Frequency shifts due to relative motion",
        keywords: [
          "Doppler effect",
          "frequency shift",
          "relative motion",
          "wave frequency",
          "mathematical Doppler",
          "wave motion",
        ],
      },
    },
  },
  moons: {
    name: "Lunar Orbital Mechanics",
    description: "Celestial mechanics and orbital patterns of moons and satellites",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      phases: {
        name: "Lunar Phases",
        description: "Monthly cycle of moon phases",
        keywords: [
          "lunar phases",
          "moon phases",
          "lunar cycle",
          "celestial cycles",
          "astronomical patterns",
          "lunar astronomy",
        ],
      },
      orbit: {
        name: "Orbital Mechanics",
        description: "Elliptical orbits and gravitational dynamics",
        keywords: [
          "orbital mechanics",
          "elliptical orbits",
          "gravitational dynamics",
          "celestial mechanics",
          "astronomical orbits",
          "space mechanics",
        ],
      },
      tides: {
        name: "Tidal Forces",
        description: "Gravitational effects causing ocean tides",
        keywords: [
          "tidal forces",
          "ocean tides",
          "gravitational effects",
          "lunar gravity",
          "tidal patterns",
          "celestial forces",
        ],
      },
      libration: {
        name: "Lunar Libration",
        description: "Apparent wobbling motion of the moon",
        keywords: [
          "lunar libration",
          "moon wobble",
          "apparent motion",
          "celestial wobble",
          "astronomical libration",
          "lunar motion",
        ],
      },
      eclipse: {
        name: "Lunar Eclipse",
        description: "Earth's shadow crossing the moon",
        keywords: [
          "lunar eclipse",
          "Earth shadow",
          "celestial alignment",
          "astronomical eclipse",
          "lunar shadow",
          "eclipse patterns",
        ],
      },
      perigee: {
        name: "Perigee Patterns",
        description: "Closest approach orbital patterns",
        keywords: [
          "perigee patterns",
          "closest approach",
          "orbital distance",
          "lunar perigee",
          "astronomical distance",
          "orbital variation",
        ],
      },
      synchronous: {
        name: "Synchronous Rotation",
        description: "Tidally locked rotation patterns",
        keywords: [
          "synchronous rotation",
          "tidal locking",
          "locked rotation",
          "celestial synchrony",
          "astronomical locking",
          "orbital synchrony",
        ],
      },
    },
  },
  tribes: {
    name: "Tribal Network Topology",
    description: "Social network patterns and community structures in tribal societies",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      village: {
        name: "Tribal Villages",
        description: "Settlement patterns and village organization",
        keywords: [
          "tribal villages",
          "settlement patterns",
          "village organization",
          "community structure",
          "tribal settlements",
          "social organization",
        ],
      },
      ceremony: {
        name: "Sacred Ceremonies",
        description: "Ritual gatherings and ceremonial patterns",
        keywords: [
          "sacred ceremonies",
          "ritual gatherings",
          "ceremonial patterns",
          "tribal rituals",
          "spiritual ceremonies",
          "cultural rituals",
        ],
      },
      hunting: {
        name: "Hunting Scenes",
        description: "Traditional hunting activities and patterns",
        keywords: [
          "hunting scenes",
          "traditional hunting",
          "hunting patterns",
          "tribal hunting",
          "subsistence hunting",
          "hunting traditions",
        ],
      },
      crafts: {
        name: "Traditional Crafts",
        description: "Artisan work and craft traditions",
        keywords: [
          "traditional crafts",
          "artisan work",
          "craft traditions",
          "tribal crafts",
          "handmade crafts",
          "cultural crafts",
        ],
      },
      storytelling: {
        name: "Storytelling",
        description: "Cultural narratives and oral traditions",
        keywords: [
          "storytelling",
          "cultural narratives",
          "oral traditions",
          "tribal stories",
          "cultural stories",
          "traditional narratives",
        ],
      },
      migration: {
        name: "Seasonal Migration",
        description: "Nomadic movements and seasonal patterns",
        keywords: [
          "seasonal migration",
          "nomadic movements",
          "migration patterns",
          "tribal migration",
          "seasonal travel",
          "nomadic patterns",
        ],
      },
      warfare: {
        name: "Tribal Warfare",
        description: "Historical conflicts and warrior traditions",
        keywords: [
          "tribal warfare",
          "historical conflicts",
          "warrior traditions",
          "tribal conflicts",
          "traditional warfare",
          "warrior culture",
        ],
      },
    },
  },
  heads: {
    name: "Mosaic Head Compositions",
    description: "Artistic compositions featuring human faces and portraits in mosaic arrangements",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      portraits: {
        name: "Portrait Gallery",
        description: "Individual faces and character studies",
        keywords: [
          "portrait gallery",
          "individual faces",
          "character studies",
          "facial portraits",
          "human faces",
          "portrait art",
        ],
      },
      mosaic: {
        name: "Face Mosaics",
        description: "Tessellated compositions of multiple faces",
        keywords: [
          "face mosaics",
          "tessellated faces",
          "mosaic compositions",
          "multiple faces",
          "facial tessellation",
          "portrait mosaics",
        ],
      },
      expressions: {
        name: "Expressions",
        description: "Emotional diversity and facial expressions",
        keywords: [
          "facial expressions",
          "emotional diversity",
          "human emotions",
          "expressive faces",
          "emotional faces",
          "expression studies",
        ],
      },
      profiles: {
        name: "Profile Views",
        description: "Side perspectives and profile portraits",
        keywords: [
          "profile views",
          "side perspectives",
          "profile portraits",
          "facial profiles",
          "side faces",
          "profile studies",
        ],
      },
      abstract: {
        name: "Abstract Faces",
        description: "Geometric interpretation of facial features",
        keywords: [
          "abstract faces",
          "geometric faces",
          "stylized portraits",
          "abstract portraits",
          "geometric interpretation",
          "facial abstraction",
        ],
      },
      elderly: {
        name: "Wisdom Lines",
        description: "Aged character studies with life experience",
        keywords: [
          "wisdom lines",
          "aged faces",
          "elderly portraits",
          "life experience",
          "character lines",
          "mature faces",
        ],
      },
      children: {
        name: "Youthful Joy",
        description: "Innocent expressions and childhood wonder",
        keywords: [
          "youthful joy",
          "innocent expressions",
          "childhood wonder",
          "young faces",
          "children portraits",
          "youthful expressions",
        ],
      },
    },
  },
  natives: {
    name: "Ancient Native Tribes",
    description: "Traditional indigenous cultures and their architectural and social patterns",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      longhouse: {
        name: "Longhouses",
        description: "Traditional communal architecture",
        keywords: [
          "longhouses",
          "communal architecture",
          "traditional buildings",
          "native architecture",
          "indigenous buildings",
          "tribal architecture",
        ],
      },
      tipis: {
        name: "Tipi Circles",
        description: "Sacred arrangements of traditional dwellings",
        keywords: [
          "tipi circles",
          "sacred arrangements",
          "traditional dwellings",
          "native tipis",
          "indigenous homes",
          "circular arrangements",
        ],
      },
      totems: {
        name: "Totem Poles",
        description: "Spiritual symbols and ancestral markers",
        keywords: [
          "totem poles",
          "spiritual symbols",
          "ancestral markers",
          "native totems",
          "indigenous symbols",
          "tribal totems",
        ],
      },
      powwow: {
        name: "Powwow Gathering",
        description: "Cultural celebrations and community gatherings",
        keywords: [
          "powwow gathering",
          "cultural celebrations",
          "community gatherings",
          "native celebrations",
          "indigenous festivals",
          "tribal gatherings",
        ],
      },
      seasons: {
        name: "Seasonal Life",
        description: "Natural cycles and seasonal activities",
        keywords: [
          "seasonal life",
          "natural cycles",
          "seasonal activities",
          "native seasons",
          "indigenous cycles",
          "tribal seasons",
        ],
      },
      canoes: {
        name: "River Canoes",
        description: "Water transportation and river life",
        keywords: [
          "river canoes",
          "water transportation",
          "river life",
          "native canoes",
          "indigenous boats",
          "tribal watercraft",
        ],
      },
      dreamcatcher: {
        name: "Dreamcatchers",
        description: "Protective talismans and spiritual objects",
        keywords: [
          "dreamcatchers",
          "protective talismans",
          "spiritual objects",
          "native crafts",
          "indigenous protection",
          "tribal spirituality",
        ],
      },
    },
  },
  statues: {
    name: "Sacred & Sculptural Statues",
    description: "Artistic sculptures and sacred statuary from various cultures and traditions",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
        ],
      },
      buddha: {
        name: "Buddha Statues",
        description: "Serene meditation poses and Buddhist sculpture",
        keywords: [
          "Buddha statues",
          "Buddhist sculpture",
          "meditation poses",
          "serene Buddha",
          "Buddhist art",
          "spiritual statues",
        ],
      },
      cats: {
        name: "Cat Sculptures",
        description: "Feline grace and mystery in sculptural form",
        keywords: [
          "cat sculptures",
          "feline sculptures",
          "cat statues",
          "feline grace",
          "cat art",
          "animal sculptures",
        ],
      },
      greek: {
        name: "Greek Classics",
        description: "Ancient marble perfection and classical sculpture",
        keywords: [
          "Greek classics",
          "classical sculpture",
          "ancient marble",
          "Greek statues",
          "classical art",
          "marble sculptures",
        ],
      },
      modern: {
        name: "Modern Art",
        description: "Contemporary sculptural forms and abstract art",
        keywords: [
          "modern art",
          "contemporary sculpture",
          "abstract sculptures",
          "modern statues",
          "contemporary art",
          "sculptural art",
        ],
      },
      angels: {
        name: "Angelic Figures",
        description: "Divine winged guardians and celestial beings",
        keywords: [
          "angelic figures",
          "winged guardians",
          "celestial beings",
          "angel statues",
          "divine sculptures",
          "heavenly figures",
        ],
      },
      warriors: {
        name: "Warrior Statues",
        description: "Heroic battle poses and martial sculptures",
        keywords: [
          "warrior statues",
          "heroic poses",
          "battle sculptures",
          "martial statues",
          "warrior art",
          "heroic sculptures",
        ],
      },
      animals: {
        name: "Animal Totems",
        description: "Wildlife in stone and bronze sculptural forms",
        keywords: [
          "animal totems",
          "wildlife sculptures",
          "animal statues",
          "bronze animals",
          "stone animals",
          "sculptural wildlife",
        ],
      },
    },
  },
}

// Generate comprehensive AI art prompt
function generateAIPrompt(
  dataset: string,
  scenario: string,
  colorScheme: string,
  customPrompt?: string,
  additionalParams?: any,
): string {
  const datasetInfo = DATASET_INFO[dataset as keyof typeof DATASET_INFO]
  const scenarioInfo = datasetInfo?.scenarios[scenario as keyof typeof datasetInfo.scenarios]

  if (!datasetInfo || !scenarioInfo) {
    return `Create a beautiful ${dataset} artwork with ${scenario} elements using ${colorScheme} colors`
  }

  let basePrompt = ""

  // If custom prompt is provided, integrate it with dataset context
  if (customPrompt && customPrompt.trim()) {
    basePrompt = `${customPrompt.trim()}, enhanced with ${datasetInfo.name} elements: ${scenarioInfo.description}`
  } else {
    // Generate comprehensive prompt based on dataset and scenario
    basePrompt = `Create a stunning ${datasetInfo.name} artwork featuring ${scenarioInfo.name}: ${scenarioInfo.description}`
  }

  // Add color scheme context
  const colorContext = {
    plasma: "vibrant plasma colors with electric blues, purples, and magentas",
    quantum: "quantum field colors with deep blues transitioning to bright whites and golds",
    cosmic: "cosmic colors with deep space blacks, stellar blues, and nebula purples",
    thermal: "thermal spectrum from cool blacks through warm reds to bright yellows",
    spectral: "full spectral rainbow with smooth color transitions",
    crystalline: "crystalline colors with clear blues, purples, and prismatic effects",
    bioluminescent: "bioluminescent colors with glowing blues, greens, and ethereal lights",
    aurora: "aurora borealis colors with dancing greens, blues, and purples",
    metallic: "metallic colors with silver, gold, copper, and bronze tones",
    prismatic: "prismatic colors with rainbow refractions and light dispersions",
    monochromatic: "monochromatic grayscale with subtle tonal variations",
    infrared: "infrared heat colors from deep reds to bright yellows",
    lava: "molten lava colors with deep reds, oranges, and glowing yellows",
    futuristic: "futuristic colors with neon blues, purples, and electric accents",
    forest: "forest colors with deep greens, earth browns, and natural tones",
    ocean: "ocean colors with deep blues, aqua greens, and foam whites",
    sunset: "sunset colors with warm oranges, pinks, and golden yellows",
    arctic: "arctic colors with ice blues, snow whites, and crystal clears",
    neon: "neon colors with electric pinks, greens, and glowing accents",
    vintage: "vintage colors with sepia browns, aged golds, and muted tones",
    toxic: "toxic colors with acid greens, warning yellows, and danger reds",
    ember: "ember colors with glowing reds, orange sparks, and ash grays",
    lunar: "lunar colors with silver grays, crater blacks, and moonlight whites",
    tidal: "tidal colors with wave blues, foam whites, and deep ocean teals",
  }

  const colorDescription = colorContext[colorScheme as keyof typeof colorContext] || `${colorScheme} color palette`

  // Combine all elements
  let fullPrompt = `${basePrompt}, rendered in ${colorDescription}. `

  // Add scenario-specific keywords for enhanced detail
  if (scenarioInfo.keywords && scenarioInfo.keywords.length > 0) {
    fullPrompt += `Key elements: ${scenarioInfo.keywords.join(", ")}. `
  }

  // Add mathematical and artistic enhancement
  fullPrompt += `Style: highly detailed, mathematically precise, artistically beautiful, with intricate patterns and harmonious composition. `

  // Add technical specifications
  fullPrompt += `Technical: ultra-high resolution, professional digital art, masterpiece quality, perfect lighting, stunning visual impact.`

  return fullPrompt
}

// Generate dome-specific prompt
function generateDomePrompt(basePrompt: string, additionalParams: any): string {
  const { domeDiameter, domeResolution, projectionType } = additionalParams

  return `DOME PROJECTION VERSION: Transform this artwork for immersive ${domeDiameter}m diameter planetarium dome display at ${domeResolution} resolution using ${projectionType} projection mapping.

DOME-SPECIFIC REQUIREMENTS:
- Fisheye distortion optimized for dome projection
- Central focal point for overhead viewing from dome center
- Radial composition that works on curved dome surface
- Visual elements distributed for 180° field of view
- Enhanced contrast and brightness for dome projection
- Seamless edge blending for dome environment
- Immersive perspective that surrounds viewers

ORIGINAL CONCEPT TO TRANSFORM:
${basePrompt}

Transform this concept specifically for dome projection, ensuring all visual elements are positioned and scaled appropriately for planetarium display. The composition should have a strong central focus with elements radiating outward in a way that creates an engaging overhead viewing experience when projected on the dome ceiling.`
}

// Generate 360° panorama-specific prompt
function generatePanoramaPrompt(basePrompt: string, additionalParams: any): string {
  const { panoramaResolution, panoramaFormat, stereographicPerspective } = additionalParams

  let panoramaPrompt = `360° PANORAMIC VERSION: Transform this artwork for immersive ${panoramaResolution} resolution 360° viewing in ${panoramaFormat} format.

360° PANORAMA REQUIREMENTS:
- Seamless wraparound composition with no visible seams
- Horizontal aspect ratio optimized for 360° viewing
- Visual elements distributed across full 360° view
- Appropriate horizon placement for VR/360° environments
- Smooth transitions at wraparound edges
- Enhanced detail for immersive viewing experience
- Composition flows naturally around full circular view

ORIGINAL CONCEPT TO TRANSFORM:
${basePrompt}

Transform this concept specifically for 360° panoramic viewing, ensuring the composition flows naturally around the full circular view and creates an immersive experience when viewed in VR or 360° environments.`

  if (panoramaFormat === "stereographic" && stereographicPerspective) {
    panoramaPrompt += `

STEREOGRAPHIC PROJECTION:
Apply ${stereographicPerspective} stereographic projection for unique visual perspective. This creates a distinctive curved world effect that transforms the flat artwork into an immersive spherical experience with dramatic perspective distortion.`
  }

  return panoramaPrompt
}

// Call OpenAI API with retry logic
async function callOpenAI(prompt: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI API call attempt ${attempt + 1}/${retries + 1}`)

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt.length > 4000 ? prompt.substring(0, 4000) + "..." : prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, errorText)

        if (attempt === retries) {
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }

      const data = await response.json()

      if (!data.data || !data.data[0] || !data.data[0].url) {
        throw new Error("No image URL returned from OpenAI API")
      }

      return data.data[0].url
    } catch (error) {
      console.error(`OpenAI API call failed (attempt ${attempt + 1}):`, error)

      if (attempt === retries) {
        throw error
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  throw new Error("All OpenAI API attempts failed")
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== FlowSketch Art Generation API ===")

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured")
    }

    const body = await request.json()
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
      domeDiameter,
      domeResolution,
      projectionType,
      panoramic360,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    } = body

    console.log("Received generation request:", {
      dataset,
      scenario,
      colorScheme,
      customPrompt: customPrompt ? customPrompt.substring(0, 100) + "..." : "None",
      domeProjection,
      panoramic360,
    })

    // Generate main AI art prompt
    const mainPrompt = generateAIPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("Generated main prompt:", mainPrompt.substring(0, 200) + "...")

    // Generate main image
    console.log("🎨 Generating main artwork...")
    const mainImageUrl = await callOpenAI(mainPrompt)
    console.log("✅ Main artwork generated successfully")

    let domeImageUrl: string | undefined
    let panoramaImageUrl: string | undefined
    const generationDetails: any = {
      mainImage: "Generated successfully",
      domeImage: "Not requested",
      panoramaImage: "Not requested",
    }

    // Generate dome projection if requested
    if (domeProjection) {
      try {
        console.log("🏛️ Generating dome projection...")
        generationDetails.domeImage = "Generating..."

        const domePrompt = generateDomePrompt(mainPrompt, {
          domeDiameter,
          domeResolution,
          projectionType,
        })

        console.log("Generated dome prompt:", domePrompt.substring(0, 200) + "...")
        domeImageUrl = await callOpenAI(domePrompt)
        generationDetails.domeImage = "Generated successfully"
        console.log("✅ Dome projection generated successfully")
      } catch (error: any) {
        console.error("❌ Dome projection generation failed:", error)
        generationDetails.domeImage = `Generation failed: ${error.message}`
        // Don't use fallback - let it be undefined so user knows it failed
      }
    }

    // Generate 360° panorama if requested
    if (panoramic360) {
      try {
        console.log("🌐 Generating 360° panorama...")
        generationDetails.panoramaImage = "Generating..."

        const panoramaPrompt = generatePanoramaPrompt(mainPrompt, {
          panoramaResolution,
          panoramaFormat,
          stereographicPerspective,
        })

        console.log("Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
        panoramaImageUrl = await callOpenAI(panoramaPrompt)
        generationDetails.panoramaImage = "Generated successfully"
        console.log("✅ 360° panorama generated successfully")
      } catch (error: any) {
        console.error("❌ 360° panorama generation failed:", error)
        generationDetails.panoramaImage = `Generation failed: ${error.message}`
        // Don't use fallback - let it be undefined so user knows it failed
      }
    }

    // Prepare response
    const response = {
      success: true,
      image: mainImageUrl,
      domeImage: domeImageUrl,
      panoramaImage: panoramaImageUrl,
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
        domeProjection,
        domeDiameter,
        domeResolution,
        projectionType,
        panoramic360,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      },
    }

    console.log("🎉 Generation completed successfully")
    console.log("📊 Final result summary:")
    console.log("- Main image:", !!response.image)
    console.log("- Dome image:", !!response.domeImage)
    console.log("- Panorama image:", !!response.panoramaImage)
    console.log("- Generation details:", response.generationDetails)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("💥 Generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate artwork",
        details: {
          name: error.name,
          stack: error.stack?.split("\n").slice(0, 5).join("\n"),
        },
      },
      { status: 500 },
    )
  }
}
