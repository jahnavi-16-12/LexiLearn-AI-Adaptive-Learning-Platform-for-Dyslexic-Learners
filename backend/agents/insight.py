import os
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from supabase import create_client, Client

class ProgressInsightAgent:
    def __init__(self):
        # Initialize Supabase inside __init__ to avoid top-level hangs
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)
        self.output_parser = StrOutputParser()

    def get_historical_data(self, user_id: str) -> Dict[str, Any]:
        """Fetches historical performance data for insights."""
        # 1. Reading Progress
        completions = self.supabase.from_("level_completions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute()
        
        # 2. Game Performance
        game_scores = self.supabase.from_("game_scores").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
        
        # 3. AI Interactions (to see what they struggle with)
        chat_logs = self.supabase.from_("ai_chat_logs").select("message, ai_response").eq("user_id", user_id).order("started_at", desc=True).limit(5).execute()

        # 4. Screening Results
        screening = self.supabase.from_("screening_results").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        # 5. Profile
        profile = self.supabase.from_("profiles").select("*").eq("id", user_id).single().execute()
        
        return {
            "reading_history": completions.data if completions.data else [],
            "game_history": game_scores.data if game_scores.data else [],
            "chat_history": chat_logs.data if chat_logs.data else [],
            "screening": screening.data if screening.data else [],
            "profile": profile.data if profile.data else {}
        }

    def generate_report(self, user_id: str) -> str:
        """Generates a human-friendly progress report for parents."""
        data = self.get_historical_data(user_id)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Progress Insight Agent for LexiLearn AI. 
            Your goal is to explain a child's reading trends and progress to a parent or teacher.
            Use professional but encouraging and easy-to-understand language.
            
            Focus on:
            - Improvements in WPM or Accuracy.
            - Consistency in practice.
            - Actionable advice (e.g., "Try focusing on rhyming games this week")."""),
            ("human", "Historical Data: {data}")
        ])
        
        chain = prompt | self.llm | self.output_parser
        return chain.invoke({"data": data})
