export const GAMES = [
    // 1-10: PHONEME AWARENESS
    {
        id: "sound-hunt",
        name: "I Spy Sound Hunt",
        type: "choice",
        category: "Phoneme Awareness",
        instructions: "I spy something starting with the sound... can you find it?",
        levels: [
            { sound: "b", prompt: "Find something starting with /b/", options: ["🍌", "🍎", "🚗"], answer: "🍌", label: "Banana" },
            { sound: "s", prompt: "Find something starting with /s/", options: ["🐶", "☀️", "🏠"], answer: "☀️", label: "Sun" },
            { sound: "m", prompt: "Find something starting with /m/", options: ["🌙", "🌳", "🚲"], answer: "🌙", label: "Moon" },
            { sound: "a", prompt: "Find something starting with /a/", options: ["🍎", "🍇", "🍐"], answer: "🍎", label: "Apple" },
            { sound: "c", prompt: "Find something starting with /c/", options: ["🚗", "🚲", "🛶"], answer: "🚗", label: "Car" }
        ]
    },
    {
        id: "sound-detective",
        name: "Sound Detective",
        type: "choice",
        category: "Phoneme Awareness",
        instructions: "Listen to the sound and guess what starts with it!",
        levels: [
            { sound: "c", prompt: "Which one starts with /c/?", options: ["Cat", "Dog", "Pig"], answer: "Cat" },
            { sound: "f", prompt: "Which one starts with /f/?", options: ["Fish", "Bird", "Lion"], answer: "Fish" },
            { sound: "h", prompt: "Which one starts with /h/?", options: ["Hat", "Cap", "Mat"], answer: "Hat" },
            { sound: "p", prompt: "Which one starts with /p/?", options: ["Pig", "Cow", "Hen"], answer: "Pig" },
            { sound: "d", prompt: "Which one starts with /d/?", options: ["Dog", "Cat", "Rat"], answer: "Dog" }
        ]
    },
    {
        id: "phoneme-clap",
        name: "Phoneme Clap",
        type: "count",
        category: "Phoneme Awareness",
        instructions: "How many sounds do you hear in this word? Clap for each one!",
        levels: [
            { word: "Cat", count: 3, sounds: ["c", "a", "t"] },
            { word: "Ship", count: 3, sounds: ["sh", "i", "p"] },
            { word: "Fast", count: 4, sounds: ["f", "a", "s", "t"] },
            { word: "Dog", count: 3, sounds: ["d", "o", "g"] },
            { word: "Jump", count: 4, sounds: ["j", "u", "m", "p"] }
        ]
    },
    {
        id: "sound-swap",
        name: "Sound Swap",
        type: "manipulation",
        category: "Phoneme Awareness",
        instructions: "If we change the first sound, what new word do we get?",
        levels: [
            { word: "Cat", change: "c", to: "h", answer: "Hat", options: ["Hat", "Bat", "Mat"] },
            { word: "Pan", change: "p", to: "f", answer: "Fan", options: ["Fan", "Man", "Can"] },
            { word: "Dig", change: "d", to: "p", answer: "Pig", options: ["Pig", "Wig", "Big"] },
            { word: "Log", change: "l", to: "d", answer: "Dog", options: ["Dog", "Fog", "Bog"] },
            { word: "Map", change: "m", to: "t", answer: "Tap", options: ["Tap", "Cap", "Nap"] }
        ]
    },
    {
        id: "robot-talk",
        name: "Robot Talk",
        type: "choice",
        category: "Phoneme Awareness",
        instructions: "The robot says... can you tell me the word?",
        levels: [
            { prompt: "The robot says: C... A... T", answer: "Cat", options: ["Cat", "Car", "Cap"], sound: "c a t" },
            { prompt: "The robot says: B... U... S", answer: "Bus", options: ["Bus", "Bug", "Bun"], sound: "b u s" },
            { prompt: "The robot says: P... E... N", answer: "Pen", options: ["Pen", "Pan", "Pin"], sound: "p e n" },
            { prompt: "The robot says: H... E... N", answer: "Hen", options: ["Hen", "Ten", "Men"], sound: "h e n" },
            { prompt: "The robot says: S... U... N", answer: "Sun", options: ["Sun", "Run", "Bun"], sound: "s u n" }
        ]
    },
    {
        id: "treasure-hunt",
        name: "Treasure Hunt",
        type: "treasure-hunt",
        category: "Phoneme Awareness",
        instructions: "Quick! Find all three things starting with /s/!",
        levels: [
            { sound: "s", targets: ["✨", "🍓", "🐍", "🍎", "🍌"], answers: ["✨", "🍓", "🐍"] },
            { sound: "a", targets: ["🍎", "🥑", "🐜", "🐶", "🐱"], answers: ["🍎", "🥑", "🐜"] },
            { sound: "c", targets: ["🐱", "🦀", "🚗", "🐶", "🐻"], answers: ["🐱", "🦀", "🚗"] },
            { sound: "m", targets: ["🌙", "🐭", "🍈", "🍒", "🍇"], answers: ["🌙", "🐭", "🍈"] },
            { sound: "f", targets: ["🐟", "🦊", "🐸", "🐦", "🦁"], answers: ["🐟", "🦊", "🐸"] }
        ]
    },
    {
        id: "sound-lineup",
        name: "Sound Lineup",
        type: "sort",
        category: "Phoneme Awareness",
        instructions: "Put these in order by their first sound! (A, B, C)",
        levels: [
            { items: ["Apple", "Bear", "Cat"], sequence: ["Apple", "Bear", "Cat"] },
            { items: ["Dog", "Egg", "Fish"], sequence: ["Dog", "Egg", "Fish"] },
            { items: ["Goat", "Hat", "Ice"], sequence: ["Goat", "Hat", "Ice"] },
            { items: ["Jam", "Kite", "Lion"], sequence: ["Jam", "Kite", "Lion"] },
            { items: ["Moon", "Net", "Owl"], sequence: ["Moon", "Net", "Owl"] }
        ]
    },
    {
        id: "missing-sound",
        name: "Missing Sound",
        type: "manipulation",
        category: "Phoneme Awareness",
        instructions: "What sound is missing? C _ T",
        levels: [
            { word: "C_T", change: "_", to: "A", answer: "A", options: ["A", "E", "I", "O"] },
            { word: "D_G", change: "_", to: "O", answer: "O", options: ["A", "E", "I", "O"] },
            { word: "P_N", change: "_", to: "I", answer: "I", options: ["A", "E", "I", "O"] },
            { word: "S_N", change: "_", to: "U", answer: "U", options: ["A", "E", "I", "O"] },
            { word: "B_X", change: "_", to: "O", answer: "O", options: ["A", "E", "I", "O"] }
        ]
    },
    {
        id: "sound-mirror",
        name: "Sound Mirror",
        type: "voice-echo",
        category: "Phoneme Awareness",
        instructions: "Listen and say the sound back into the microphone!",
        levels: [
            { sound: "sh", target: "sh" },
            { sound: "th", target: "th" },
            { sound: "ch", target: "ch" },
            { sound: "wh", target: "wh" },
            { sound: "ph", target: "ph" }
        ]
    },
    {
        id: "phoneme-freeze",
        name: "Phoneme Freeze",
        type: "reaction",
        category: "Phoneme Awareness",
        instructions: "Listen closely! Tap FREEZE only when you hear the target sound!",
        levels: [
            { target: "m", sounds: ["s", "t", "m", "p", "m", "f"] },
            { target: "b", sounds: ["d", "p", "b", "q", "b", "d"] },
            { target: "s", sounds: ["z", "x", "s", "c", "s", "v"] },
            { target: "t", sounds: ["d", "p", "t", "k", "t", "g"] },
            { target: "r", sounds: ["l", "w", "r", "n", "r", "m"] }
        ]
    },

    // 11-20: RHYMING + BLENDING
    {
        id: "rhyme-dominoes",
        name: "Rhyme Dominoes",
        type: "matching",
        category: "Rhyming & Blending",
        instructions: "Match the words that rhyme! (Cat and Hat, Dog and Log)",
        levels: [
            { pairs: [["Cat", "Hat"], ["Dog", "Log"], ["Pen", "Hen"], ["Sun", "Run"]] },
            { pairs: [["Pig", "Wig"], ["Cow", "Bow"], ["Bee", "Tree"], ["Cake", "Lake"]] },
            { pairs: [["Fan", "Van"], ["Man", "Can"], ["Box", "Fox"], ["Bed", "Red"]] },
            { pairs: [["Zip", "Lip"], ["Top", "Hop"], ["Net", "Wet"], ["Star", "Car"]] },
            { pairs: [["Blue", "Glue"], ["Fly", "Sky"], ["Book", "Look"], ["Rain", "Train"]] }
        ]
    },
    {
        id: "sound-match",
        name: "Sound Match",
        type: "choice",
        category: "Rhyming & Blending",
        instructions: "Listen to the letter sound and pick the right one!",
        levels: [
            { sound: "s", options: ["S", "M", "T"], answer: "S", prompt: "Pick the letter /s/" },
            { sound: "m", options: ["B", "M", "D"], answer: "M", prompt: "Pick the letter /m/" },
            { sound: "t", options: ["P", "L", "T"], answer: "T", prompt: "Pick the letter /t/" },
            { sound: "a", options: ["E", "A", "O"], answer: "A", prompt: "Pick the letter /a/" },
            { sound: "b", options: ["D", "P", "B"], answer: "B", prompt: "Pick the letter /b/" }
        ]
    },
    {
        id: "word-builder",
        name: "Blend Builder",
        type: "drag-build",
        category: "Rhyming & Blending",
        instructions: "Drag the letters to build the word!",
        levels: [
            { word: "CAT", letters: ["A", "T", "C"] },
            { word: "DOG", letters: ["G", "O", "D"] },
            { word: "SUN", letters: ["N", "U", "S"] },
            { word: "PEN", letters: ["E", "N", "P"] },
            { word: "HAT", letters: ["T", "H", "A"] }
        ]
    },
    {
        id: "word-family-tree",
        name: "Word Family Tree",
        type: "treasure-hunt",
        category: "Rhyming & Blending",
        instructions: "Find all the words in the specified family!",
        levels: [
            { family: "at", targets: ["Cat", "Hat", "Bat", "Dog", "Pig", "Hen"], answers: ["Cat", "Hat", "Bat"] },
            { family: "ig", targets: ["Pig", "Wig", "Dig", "Cat", "Dog", "Sun"], answers: ["Pig", "Wig", "Dig"] },
            { family: "en", targets: ["Hen", "Pen", "Ten", "Man", "Can", "Van"], answers: ["Hen", "Pen", "Ten"] },
            { family: "it", targets: ["Sit", "Hit", "Kit", "Pot", "Hot", "Got"], answers: ["Sit", "Hit", "Kit"] },
            { family: "og", targets: ["Dog", "Log", "Fog", "Bug", "Hug", "Dug"], answers: ["Dog", "Log", "Fog"] }
        ]
    },
    {
        id: "silly-rhymes",
        name: "Silly Rhymes",
        type: "choice",
        category: "Rhyming & Blending",
        instructions: "Complete the silly rhyme!",
        levels: [
            { prompt: "The moon has a...", answer: "spoon", options: ["spoon", "fork", "knife"] },
            { prompt: "The cat wears a...", answer: "hat", options: ["hat", "shoe", "sock"] },
            { prompt: "The bee is in the...", answer: "tree", options: ["tree", "car", "map"] },
            { prompt: "The frog sits on a...", answer: "log", options: ["log", "bed", "fan"] },
            { prompt: "The mouse is in the...", answer: "house", options: ["house", "box", "pan"] }
        ]
    },
    {
        id: "sound-hopscotch",
        name: "Sound Hopscotch",
        type: "sequence-tap",
        category: "Rhyming & Blending",
        instructions: "Tap the letters in the right order to spell the word!",
        levels: [
            { word: "SHIP", letters: ["SH", "I", "P"] },
            { word: "FISH", letters: ["F", "I", "SH"] },
            { word: "BIRD", letters: ["B", "I", "R", "D"] },
            { word: "FROG", letters: ["F", "R", "O", "G"] },
            { word: "STAR", letters: ["S", "T", "A", "R"] }
        ]
    },
    {
        id: "rhyme-relay",
        name: "Rhyme Relay",
        type: "treasure-hunt",
        category: "Rhyming & Blending",
        instructions: "Find all the words that rhyme with the target!",
        levels: [
            { root: "cat", targets: ["Hat", "Bat", "Rat", "Dog", "Sun", "Pig"], answers: ["Hat", "Bat", "Rat"] },
            { root: "dog", targets: ["Log", "Fog", "Bog", "Cat", "Hen", "Pen"], answers: ["Log", "Fog", "Bog"] },
            { root: "pen", targets: ["Hen", "Ten", "Men", "Van", "Man", "Can"], answers: ["Hen", "Ten", "Men"] },
            { root: "bin", targets: ["Pin", "Win", "Tin", "Hot", "Pot", "Not"], answers: ["Pin", "Win", "Tin"] },
            { root: "box", targets: ["Fox", "Sox", "Pox", "Bug", "Hug", "Dug"], answers: ["Fox", "Sox", "Pox"] }
        ]
    },
    {
        id: "blend-the-beat",
        name: "Blend the Beat",
        type: "drum-rhythm",
        category: "Rhyming & Blending",
        instructions: "Tap the drum to the beat of the word syllables!",
        levels: [
            { word: "Apple", beats: 2 },
            { word: "Banana", beats: 3 },
            { word: "Cat", beats: 1 },
            { word: "Elephant", beats: 3 },
            { word: "Dinosaur", beats: 3 }
        ]
    },
    {
        id: "magic-door",
        name: "Magic Door",
        type: "voice-echo",
        category: "Rhyming & Blending",
        instructions: "Say the secret sound to open the door!",
        levels: [
            { sound: "SH", target: "sh" },
            { sound: "CH", target: "ch" },
            { sound: "TH", target: "th" },
            { sound: "WH", target: "wh" },
            { sound: "PH", target: "ph" }
        ]
    },
    {
        id: "sound-chain",
        name: "Sound Chain",
        type: "manipulation",
        category: "Rhyming & Blending",
        instructions: "What new word do we get if we change the first sound?",
        levels: [
            { word: "SHIP", change: "sh", to: "cl", answer: "Clip", options: ["Clip", "Flip", "Slip"] },
            { word: "CLIP", change: "cl", to: "fl", answer: "Flip", options: ["Flip", "Slip", "Drip"] },
            { word: "FLIP", change: "fl", to: "sl", answer: "Slip", options: ["Slip", "Drip", "Trip"] },
            { word: "SLIP", change: "sl", to: "dr", answer: "Drip", options: ["Drip", "Trip", "Grip"] },
            { word: "DRIP", change: "dr", to: "tr", answer: "Trip", options: ["Trip", "Grip", "Skip"] }
        ]
    },

    // 21-30: SYLLABLE + FLUENCY
    {
        id: "syllable-clap",
        name: "Syllable Clap",
        type: "count",
        category: "Syllable & Fluency",
        instructions: "How many claps are in this word?",
        levels: [
            { word: "Elephant", count: 3 },
            { word: "Tiger", count: 2 },
            { word: "Mouse", count: 1 },
            { word: "Crocodile", count: 3 },
            { word: "Butterfly", count: 3 }
        ]
    },
    {
        id: "syllable-sort",
        name: "Syllable Sort",
        type: "sort",
        category: "Syllable & Fluency",
        instructions: "Put these in order from fewest to most syllables!",
        levels: [
            { items: ["Cat", "Rabbit", "Dinosaur"], sequence: ["Cat", "Rabbit", "Dinosaur"] },
            { items: ["Dog", "Tiger", "Elephant"], sequence: ["Dog", "Tiger", "Elephant"] },
            { items: ["Pig", "Spider", "Computer"], sequence: ["Pig", "Spider", "Computer"] },
            { items: ["Bee", "Monkey", "Crocodile"], sequence: ["Bee", "Monkey", "Crocodile"] },
            { items: ["Fish", "Zebra", "Hippopotamus"], sequence: ["Fish", "Zebra", "Hippopotamus"] }
        ]
    },
    {
        id: "telephone-sounds",
        name: "Telephone Sounds",
        type: "matching",
        category: "Syllable & Fluency",
        instructions: "Find the matching sound pairs in the memory game!",
        levels: [
            { sounds: ["B", "P", "D", "T"] },
            { sounds: ["S", "Z", "F", "V"] },
            { sounds: ["M", "N", "L", "R"] },
            { sounds: ["K", "G", "J", "H"] },
            { sounds: ["A", "E", "I", "O"] }
        ]
    },
    {
        id: "alliteration-alley",
        name: "Alliteration Alley",
        type: "treasure-hunt",
        category: "Syllable & Fluency",
        instructions: "Find all the words that start with the same sound!",
        levels: [
            { target: "s", targets: ["Sun", "Snake", "Star", "Apple", "Dog", "Bird"], answers: ["Sun", "Snake", "Star"] },
            { target: "b", targets: ["Bear", "Ball", "Bat", "Cat", "Fish", "Hat"], answers: ["Bear", "Ball", "Bat"] },
            { target: "c", targets: ["Cat", "Car", "Cup", "Dog", "Egg", "Fan"], answers: ["Cat", "Car", "Cup"] },
            { target: "d", targets: ["Dog", "Duck", "Doll", "Hen", "Pig", "Sun"], answers: ["Dog", "Duck", "Doll"] },
            { target: "f", targets: ["Fish", "Frog", "Fan", "Hat", "Bed", "Pen"], answers: ["Fish", "Frog", "Fan"] }
        ]
    },
    {
        id: "pig-latin-challenge",
        name: "Pig Latin Challenge",
        type: "choice",
        category: "Syllable & Fluency",
        instructions: "Translate the Pig Latin word!",
        levels: [
            { prompt: "At-cay", answer: "Cat", options: ["Cat", "Hat", "Bat"] },
            { prompt: "Og-day", answer: "Dog", options: ["Dog", "Pig", "Log"] },
            { prompt: "Un-say", answer: "Sun", options: ["Sun", "Run", "Bun"] },
            { prompt: "En-pay", answer: "Pen", options: ["Pen", "Pan", "Pin"] },
            { prompt: "At-hay", answer: "Hat", options: ["Hat", "Ham", "Hot"] }
        ]
    },
    {
        id: "memory-match-sounds",
        name: "Memory Match",
        type: "memory",
        category: "Syllable & Fluency",
        instructions: "Find all the matching sound pairs!",
        levels: [
            { sounds: ["SH", "CH", "TH", "WH"] },
            { sounds: ["PH", "GH", "QU", "WR"] },
            { sounds: ["CK", "NG", "NK", "TC"] },
            { sounds: ["AI", "AY", "EE", "EA"] },
            { sounds: ["OA", "OE", "IE", "UE"] }
        ]
    },
    {
        id: "word-wheel",
        name: "Word Wheel",
        type: "reaction",
        category: "Syllable & Fluency",
        instructions: "Tap FREEZE when you see the target word!",
        levels: [
            { target: "cat", sounds: ["hat", "mat", "cat", "bat", "rat", "cat"] },
            { target: "dog", sounds: ["log", "fog", "dog", "bog", "dig", "dog"] },
            { target: "sun", sounds: ["run", "bun", "sun", "fun", "gun", "sun"] },
            { target: "pig", sounds: ["big", "dig", "pig", "wig", "fig", "pig"] },
            { target: "pen", sounds: ["hen", "ten", "pen", "men", "pan", "pen"] }
        ]
    },
    {
        id: "syllable-symphony",
        name: "Syllable Symphony",
        type: "drum-rhythm",
        category: "Syllable & Fluency",
        instructions: "Play the drum beats for each part of the word!",
        levels: [
            { word: "Dinosaur", beats: 3 },
            { word: "Computer", beats: 3 },
            { word: "Spider", beats: 2 },
            { word: "Crocodile", beats: 3 },
            { word: "Hippopotamus", beats: 5 }
        ]
    },
    {
        id: "sound-scavenger",
        name: "Sound Scavenger",
        type: "choice",
        category: "Syllable & Fluency",
        instructions: "Which word contains the specified sound?",
        levels: [
            { prompt: "Which word has /th/?", options: ["Thumb", "Hand", "Foot"], answer: "Thumb" },
            { prompt: "Which word has /sh/?", options: ["Ship", "Chip", "Whip"], answer: "Ship" },
            { prompt: "Which word has /ch/?", options: ["Chair", "Hair", "Stair"], answer: "Chair" },
            { prompt: "Which word has /ph/?", options: ["Phone", "Bone", "Tone"], answer: "Phone" },
            { prompt: "Which word has /ng/?", options: ["Ring", "Sing", "Wing"], answer: "Ring" }
        ]
    },
    {
        id: "fluency-ladder",
        name: "Fluency Ladder",
        type: "sort",
        category: "Syllable & Fluency",
        instructions: "Put the words in order to make a sentence!",
        levels: [
            { items: ["The", "cat", "sat"], sequence: ["The", "cat", "sat"] },
            { items: ["I", "can", "jump"], sequence: ["I", "can", "jump"] },
            { items: ["He", "is", "fast"], sequence: ["He", "is", "fast"] },
            { items: ["She", "likes", "cake"], sequence: ["She", "likes", "cake"] },
            { items: ["We", "play", "ball"], sequence: ["We", "play", "ball"] }
        ]
    }
];
