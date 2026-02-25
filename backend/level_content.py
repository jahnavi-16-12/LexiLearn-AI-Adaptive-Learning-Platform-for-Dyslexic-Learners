
LEVELS = {
    # 🌱 BEGINNER ISLAND (1-15): Single Syllable, CVC Focus
    1: {"island": "Beginner", "text": "The cat sat on the mat.", "focus": "Short 'a' (cat, mat)"},
    2: {"island": "Beginner", "text": "The hat is on the cat.", "focus": "Short 'a', simple sight words"},
    3: {"island": "Beginner", "text": "The cat has a black hat.", "focus": "Blends (bl-), CVC"},
    4: {"island": "Beginner", "text": "The pig can dig in mud.", "focus": "Short 'i', 'u'"},
    5: {"island": "Beginner", "text": "A big pig sat in mud.", "focus": "Review 'i', 'a', 'u'"},
    6: {"island": "Beginner", "text": "The pig has a red hat.", "focus": "Short 'e', colors"},
    7: {"island": "Beginner", "text": "The dog can run to bed.", "focus": "Short 'o', 'u', 'e'"},
    8: {"island": "Beginner", "text": "A hot dog sat on top.", "focus": "Short 'o' focus"},
    9: {"island": "Beginner", "text": "The dog got a red top.", "focus": "CVC mixed vowels"},
    10: {"island": "Beginner", "text": "The hen has ten red eggs.", "focus": "Short 'e', numbers"},
    11: {"island": "Beginner", "text": "The sun is hot and red.", "focus": "Basic conjunctions (and)"},
    12: {"island": "Beginner", "text": "A fun bug sat in mud.", "focus": "Short 'u' rhyming"},
    13: {"island": "Beginner", "text": "The cat ran up the hill.", "focus": "Double consonant (ll)"},
    14: {"island": "Beginner", "text": "The pig can run and jump.", "focus": "Ending blends (-mp)"},
    15: {"island": "Beginner", "text": "The dog sat on the rug.", "focus": "Beginner Island Review"},

    # 🏝️ INTERMEDIATE ATOLL (16-35): 2-Line Sentences, Blends & Digraphs
    16: {"island": "Intermediate", "text": "The black cat ran fast. Stop!", "focus": "Blends (bl-, st-)"},
    17: {"island": "Intermediate", "text": "The clap was loud and fast.", "focus": "Blends (cl-), dipthongs (ou)"},
    18: {"island": "Intermediate", "text": "The flag is on the hill.", "focus": "Blends (fl-)"},
    19: {"island": "Intermediate", "text": "The black crab can snap.", "focus": "Blends (cr-, sn-)"},
    20: {"island": "Intermediate", "text": "The drum can make a big sound.", "focus": "Blends (dr-), silent e (make)"},
    21: {"island": "Intermediate", "text": "The ship can sail on the lake.", "focus": "Digraph (sh-), vowel team (ai)"},
    22: {"island": "Intermediate", "text": "The chick has three chips.", "focus": "Digraph (ch-, th-)"},
    23: {"island": "Intermediate", "text": "The thin moth flew at night.", "focus": "Digraph (th-), igh pattern"},
    24: {"island": "Intermediate", "text": "The bath has hot thick soap.", "focus": "Digraph (th-), vowel team (oa)"},
    25: {"island": "Intermediate", "text": "When the ship sank, fish swam.", "focus": "Digraph (wh-, sh-), blends"},
    26: {"island": "Intermediate", "text": "The bike has five black wheels.", "focus": "Long 'i' (i_e), digraph (wh)"},
    27: {"island": "Intermediate", "text": "The cake is on a white plate.", "focus": "Long 'a' (a_e), blend (pl-)"},
    28: {"island": "Intermediate", "text": "The lake has five white ducks.", "focus": "Review long vowels, ck ending"},
    29: {"island": "Intermediate", "text": "The snake can make a hissing sound.", "focus": "Blends (sn-), suffix (-ing)"},
    30: {"island": "Intermediate", "text": "The brave kite flew in the wind.", "focus": "Blends (br-, fl-), long 'i'"},
    31: {"island": "Intermediate", "text": "The car has four black wheels.", "focus": "R-controlled (ar), colors"},
    32: {"island": "Intermediate", "text": "The bird can chirp in the dark.", "focus": "R-controlled (ir, ar)"},
    33: {"island": "Intermediate", "text": "The girl has curly hair.", "focus": "R-controlled (ir, ur, air)"},
    34: {"island": "Intermediate", "text": "The nurse has a sharp turn.", "focus": "R-controlled (ur, ar)"},
    35: {"island": "Intermediate", "text": "The purple shirt has fur trim.", "focus": "Intermediate Review"},

    # ⛰️ ADVANCED MOUNTAIN (36-50): Paragraphs, Comprehension, Fluency
    36: {"island": "Advanced", "text": "The robot can bake a cake. It makes six thin cakes. The baker can bake brave cakes too.", "focus": "Long words, sentence flow"},
    37: {"island": "Advanced", "text": "The plane can fly so high. Kate made a plane from paper. She can make a brave kite too.", "focus": "Long 'a', 'i' patterns"},
    38: {"island": "Advanced", "text": "The train goes down the track. Sam has a black train. It can make a loud click.", "focus": "Tr- blend, complex sentences"},
    39: {"island": "Advanced", "text": "The rain made a big flood. The flood has thick mud. Sam swam from the flood.", "focus": "Vowel teams, reading ease"},
    40: {"island": "Advanced", "text": "The teacher wrote on the board. She wrote about a whale. The whale has a long tail.", "focus": "Silent letters (wr-), compound words"},
    41: {"island": "Advanced", "text": "The boat can sail on the sea. The sea has big waves. The captain has three brave sailors.", "focus": "Maritime theme, multi-syllable"},
    42: {"island": "Advanced", "text": "The team can play a game. They have red and blue shirts. The blue team made three points.", "focus": "Sports theme, vowel teams (ea, ay)"},
    43: {"island": "Advanced", "text": "The meat was on the grill. The chef made eight steaks. They ate steak and beans.", "focus": "Cooking theme, ea variations"},
    44: {"island": "Advanced", "text": "The coin fell in the road. Roy found five gold coins. He made a big noise!", "focus": "Diphthongs (oi, oy)"},
    45: {"island": "Advanced", "text": "The house has a brown roof. The mouse ran in the house. The cat chased the mouse.", "focus": "Diphthongs (ou, ow)"},
    46: {"island": "Advanced", "text": "The Big Storm. The wind blew the leaves off the trees. The rain made big puddles in the street. Sam and Kate stayed inside. They read books until the storm stopped.", "focus": "Narrative fluency, past tense"},
    47: {"island": "Advanced", "text": "Lost Dog. The brown dog ran away from home. He went down the street and up the hill. Dad looked for the dog. He found the dog at the park.", "focus": "Story sequencing, prepositions"},
    48: {"island": "Advanced", "text": "The New Bike. Tim got a red bike for his birthday. He rode it down the street. The bike had a bell. Tim rang the bell for his friends.", "focus": "Personal narrative, compound sentences"},
    49: {"island": "Advanced", "text": "Beach Day. Mom took Sam and Kate to the beach. They built a big sand castle. The waves came close but did not knock it down. They found five shells.", "focus": "Complex vowel patterns"},
    50: {"island": "Advanced", "text": "The School Play. The class made a play about space. Kate was the moon. Sam was a star. They had ten brave astronauts. The play was great!", "focus": "Advanced Comprehension End"},
}

def get_level_data(level: int):
    return LEVELS.get(level, LEVELS[1])

def get_total_levels():
    return len(LEVELS)

def get_starting_level(age: int, risk: str) -> int:
    # Logic: Lower level for HIGHER risk (need more help), Higher level for LOWER risk (stronger readers)
    if age <= 6:
        if risk == "HIGH": return 1
        elif risk == "MODERATE": return 5
        elif risk == "LOW": return 12
    elif age <= 8:
        if risk == "HIGH": return 8
        elif risk == "MODERATE": return 12
        elif risk == "LOW": return 16
    elif age <= 10:
        if risk == "HIGH": return 12
        elif risk == "MODERATE": return 20
        else: return 30
    else: # Age 11-12+
        if risk == "HIGH": return 16
        elif risk == "MODERATE": return 30
        else: return 40
    return 1 # Fallback
