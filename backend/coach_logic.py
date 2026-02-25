import random

# Adaptive Content Database (Simulating an AI Assessment Agent output)
# In production, this could call an LLM (Gemini/OpenAI) with a specific prompt.

CONTENT_TEMPLATES = {
    1: { # Tier 1: High Risk / Beginner
        "focus": "Phonemes & Single Words",
        "passages": [
            {"text": "The cat sat.", "words": ["The", "cat", "sat."]},
            {"text": "A red bug.", "words": ["A", "red", "bug."]},
            {"text": "Big blue fish.", "words": ["Big", "blue", "fish."]},
            {"text": "Run to me.", "words": ["Run", "to", "me."]}
        ]
    },
    2: { # Tier 2: Moderate Risk / Intermediate
        "focus": "Sentence Blending & Rhymes",
        "passages": [
            {"text": "The quick fox jumps over the dog.", "words": ["The", "quick", "fox", "jumps", "over", "the", "dog."]},
            {"text": "I love to play in the bright sun.", "words": ["I", "love", "to", "play", "in", "the", "bright", "sun."]},
            {"text": "Rain falls down on the green grass.", "words": ["Rain", "falls", "down", "on", "the", "green", "grass."]}
        ]
    },
    3: { # Tier 3: Low Risk / Advanced
        "focus": "Fluency & Short Stories",
        "passages": [
            {
                "title": "The Brave Little Squirrel",
                "text": "Sammy was a brave squirrel who lived in a tall oak tree. One day, he found a golden acorn and shared it with all his friends in the forest.",
                "words": ["Sammy", "was", "a", "brave", "squirrel", "who", "lived", "in", "a", "tall", "oak", "tree.", "One", "day,", "he", "found", "a", "golden", "acorn", "and", "shared", "it", "with", "all", "his", "friends", "in", "the", "forest."]
            },
            {
                "title": "Space Adventure",
                "text": "The rocket blasted off into the dark sky. Soon, the astronauts saw the moon and many twinkling stars outside their small window.",
                "words": ["The", "rocket", "blasted", "off", "into", "the", "dark", "sky.", "Soon,", "the", "astronauts", "saw", "the", "moon", "and", "many", "twinkling", "stars", "outside", "their", "small", "window."]
            }
        ]
    }
}

def generate_adaptive_content(tier: int, age: int = 7):
    """
    Simulates the AI Reading Coach Agent generating content.
    Adjusts complexity based on Tier and Age.
    """
    tier = max(1, min(3, tier)) # Clamp tier 1-3
    
    tier_data = CONTENT_TEMPLATES.get(tier)
    
    # Simple Age-based Logic:
    # Younger children (5-7) get shorter passages
    # Older children (8+) get slightly longer ones (if available in Tier)
    if age < 8:
        passage = tier_data["passages"][0]
    else:
        passage = tier_data["passages"][-1]
    
    return {
        "tier": tier,
        "age_context": "Junior" if age < 8 else "Senior",
        "focus": tier_data["focus"],
        "passage": passage
    }
