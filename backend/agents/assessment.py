import os
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from supabase import create_client, Client

class AssessmentAgent:
    def __init__(self):
        # Initialize Supabase inside __init__ to avoid top-level hangs
        url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")
        if not url or not key:
            print("WARNING: Supabase credentials missing in AssessmentAgent!")
            self.supabase = None
        else:
            self.supabase: Client = create_client(url, key)
        self.llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0, max_retries=5)
        self.parser = JsonOutputParser()
        
    def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """Fetches real user data from Supabase with error handling."""
        if not self.supabase:
            return {"profile": {}, "screening": {}}
        try:
            # 1. Get Profile
            profile = self.supabase.from_("profiles").select("*").eq("id", user_id).execute()
            p_data = profile.data[0] if profile.data else {}
            
            # 2. Get Screening
            screening = self.supabase.from_("screening_results").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
            s_data = screening.data[0] if screening.data else {}
            
            return {
                "profile": p_data,
                "screening": s_data
            }
        except Exception as e:
            print(f"Supabase context fetch error: {e}")
            return {"profile": {}, "screening": {}}

    READING_LEVELS = {
        1: {"content": "The cat sat.", "focus_sounds": ["c", "a", "t"]},
        2: {"content": "A red hen.", "focus_sounds": ["h", "e", "n"]},
        3: {"content": "Big dog dig.", "focus_sounds": ["d", "i", "g"]},
        4: {"content": "The sun is hot.", "focus_sounds": ["o", "t"]},
        5: {"content": "Ten men met.", "focus_sounds": ["e", "n"]},
        6: {"content": "The frog jumps.", "focus_sounds": ["fr", "j"]},
        7: {"content": "A green tree.", "focus_sounds": ["gr", "tr"]},
        8: {"content": "Skip and hop.", "focus_sounds": ["sk", "hp"]},
        9: {"content": "Stop the bus.", "focus_sounds": ["st", "bs"]},
        10: {"content": "A black truck.", "focus_sounds": ["bl", "tr"]},
        11: {"content": "The black cat had a snack.", "focus_sounds": ["ck"]},
        12: {"content": "Bring the long string.", "focus_sounds": ["ng"]},
        13: {"content": "A small snail in the rain.", "focus_sounds": ["ai"]},
        14: {"content": "The fleet of sheep sleep.", "focus_sounds": ["ee"]},
        15: {"content": "Light the bright night fire.", "focus_sounds": ["igh"]},
        16: {"content": "Fish and chips for lunch.", "focus_sounds": ["sh", "ch"]},
        17: {"content": "That thin thorn is sharp.", "focus_sounds": ["th", "sh"]},
        18: {"content": "Whales whistle in the white water.", "focus_sounds": ["wh"]},
        19: {"content": "The phone rang in the photo shop.", "focus_sounds": ["ph"]},
        20: {"content": "Check the chess chart.", "focus_sounds": ["ch"]},
        21: {"content": "The brown cow sat on the ground.", "focus_sounds": ["ow", "ou"]},
        22: {"content": "A toy boy with a joyful noise.", "focus_sounds": ["oy", "oi"]},
        23: {"content": "Look at the book near the brook.", "focus_sounds": ["oo"]},
        24: {"content": "The moon is cool in the pool.", "focus_sounds": ["oo"]},
        25: {"content": "A large car parked in the dark.", "focus_sounds": ["ar"]},
        26: {"content": "The bird chirps in the first fern.", "focus_sounds": ["ir", "er"]},
        27: {"content": "A short horse eats corn on the porch.", "focus_sounds": ["or"]},
        28: {"content": "The brave knight fought the dragon.", "focus_sounds": ["kn", "ght"]},
        29: {"content": "Please write a simple poem.", "focus_sounds": ["wr", "ph"]},
        30: {"content": "The weather is feather light today.", "focus_sounds": ["ea"]},
        46: {"content": "The eccentric inventor demonstrated his extraordinary machine.", "focus_sounds": ["complex"]},
        50: {"content": "Socio-economic factors influence the development of linguistic patterns in diverse communities.", "focus_sounds": ["pro"]}
    }

    def get_level_content(self, level: int, user_id: str) -> Dict[str, Any]:
        """Returns static reading content for a level (1-50)."""
        content = self.READING_LEVELS.get(level)
        if not content:
            # Fallback for missing middle levels
            return {"title": f"Level {level}", "content": "The brave astronaut explored the galaxy.", "focus_sounds": ["practice"]}
        return {"title": f"Level {level}", "content": content["content"], "focus_sounds": content["focus_sounds"]}

    def assign_initial_level(self, user_id: str) -> int:
        """Analyzes screening results and age to assign a starting level."""
        try:
            context = self.get_user_context(user_id)
            profile = context.get("profile", {})
            screening = context.get("screening", {})
            
            age = int(profile.get("age", 7))
            wpm = float(screening.get("reading_wpm", 0))
            error_rate = float(screening.get("reading_wer", 100))
            
            # Base level based on age
            if age <= 6: base = 1
            elif age <= 8: base = 5
            elif age <= 10: base = 12
            else: base = 20
            
            # Adjust based on performance
            if wpm > 40: base += 5
            if error_rate < 10: base += 3
            if error_rate > 30: base -= 5
            
            return max(1, min(50, base))
        except Exception as e:
            print(f"Level assignment error: {e}")
            return 1

    def get_daily_challenge(self, user_id: str) -> Dict[str, Any]:
        """Generates a daily interactive puzzle/exercise (not oral reading)."""
        try:
            context = self.get_user_context(user_id)
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are the Daily Challenge Creator for LexiLearn AI.
                Create a friendly puzzle for a child with dyslexia.
                Modes: 'Sound Match', 'Word Scramble', 'Phoneme ID'.
                
                Return JSON: 
                { "type": "string", "question": "string", "options": ["list"], "correct_answer": "string", "explanation": "string" }"""),
                ("human", f"Child Data: {context}")
            ])
            
            chain = prompt | self.llm | self.parser
            return chain.invoke({})
        except Exception as e:
            return {
                "type": "Sound Match",
                "question": "Which word starts with the 'C' sound?",
                "options": ["Cat", "Dog", "Fish"],
                "correct_answer": "Cat",
                "explanation": "Cat starts with the 'C' sound!"
            }

    def analyze_ability(self, user_id: str) -> Dict[str, Any]:
        """Analyzes ability for the dashboard overview."""
        try:
            context = self.get_user_context(user_id)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "Analyze the user's progress and return a JSON summary of their reading level and next steps."),
                ("human", f"Child Data: {context}")
            ])
            chain = prompt | self.llm | self.parser
            return chain.invoke({})
        except Exception as e:
            return {"reading_level": "Beginner", "next_step": "Practice Level 1"}
