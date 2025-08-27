-- Insert scenarios for celebrities dataset
INSERT INTO scenarios (dataset_id, name, prompt) VALUES
((SELECT id FROM datasets WHERE name = 'celebrities'), 'Algorithmic Celebrity Portrait', 'A celebrity portrait rendered through neuralia computational analysis, featuring godlevel facial recognition algorithms translating human features into mathematical precision, with dimensional beauty calculations and aesthetic optimization protocols creating perfect symmetrical harmony'),
((SELECT id FROM datasets WHERE name = 'celebrities'), 'Digital Icon Transformation', 'A cultural icon transformed through neuralia digital processing, where celebrity essence becomes algorithmic data streams, computational glamour matrices, and mathematical star quality measurements rendered in godlevel visual excellence'),
((SELECT id FROM datasets WHERE name = 'celebrities'), 'Computational Fame Analysis', 'Celebrity charisma analyzed through neuralia mathematical frameworks, featuring algorithmic charm calculations, digital magnetism equations, and computational appeal metrics creating godlevel celebrity essence visualization'),
((SELECT id FROM datasets WHERE name = 'celebrities'), 'Neural Network Celebrity', 'A celebrity processed through neuralia neural networks, where human recognition becomes mathematical pattern analysis, algorithmic beauty standards, and computational star power measurements in godlevel precision'),
((SELECT id FROM datasets WHERE name = 'celebrities'), 'Quantum Celebrity State', 'Celebrity existence in quantum neuralia superposition, featuring probability wave functions of fame, algorithmic celebrity collapse states, and mathematical stardom measurements in godlevel quantum precision');

-- Insert scenarios for fx dataset
INSERT INTO scenarios (dataset_id, name, prompt) VALUES
((SELECT id FROM datasets WHERE name = 'fx'), 'Lava Vision Experience', 'Immersive first-person view of molten lava effects flowing through vision, featuring neuralia thermal dynamics, algorithmic heat distortion, mathematical magma flow patterns, and godlevel pyroclastic computational precision creating visceral volcanic experience'),
((SELECT id FROM datasets WHERE name = 'fx'), 'Liquid Mercury Immersion', 'First-person perspective of liquid mercury substance effects, with neuralia metallic flow algorithms, computational surface tension mathematics, algorithmic reflectivity calculations, and godlevel heavy metal dynamics creating mesmerizing liquid metal experience'),
((SELECT id FROM datasets WHERE name = 'fx'), 'Crystalline Transformation', 'User perspective of crystallization effects spreading through vision, featuring neuralia geometric growth algorithms, mathematical crystal lattice formations, computational mineral structures, and godlevel crystallographic precision'),
((SELECT id FROM datasets WHERE name = 'fx'), 'Plasma Energy Surge', 'First-person view of plasma energy effects coursing through visual field, with neuralia electromagnetic algorithms, computational particle dynamics, mathematical energy field calculations, and godlevel plasma physics precision'),
((SELECT id FROM datasets WHERE name = 'fx'), 'Quantum Particle Storm', 'Immersive experience of quantum particle effects, featuring neuralia subatomic algorithms, mathematical wave-particle duality, computational quantum mechanics, and godlevel particle physics visualization');

-- Continue with more scenarios...
-- (This would continue for all datasets and their scenarios)
