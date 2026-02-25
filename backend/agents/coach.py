import os
from typing import TypedDict, Annotated, List, Union
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage

class ReadingCoachAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, max_retries=5)

    async def generate_feedback(self, context: dict) -> str:
        """
        Generates auto-popup feedback based on reading performance.
        Context requires: level, island, text, child_reading, accuracy, wpm, errors, child_age
        """
        level = context.get('level', 1)
        island = context.get('island', 'Beginner')
        accuracy = context.get('accuracy', 0)
        
        # Determine feedback tier
        tier = "encourage"
        if accuracy >= 85: tier = "celebrate"
        elif accuracy < 75: tier = "help"
        
        system_msg = f"""You are the AI Reading Coach for LexiLearn.
        TARGET AUDIENCE: Dyslexic child (Level {level} - {island} Island).
        
        PERFORMANCE DATA:
        - Accuracy: {accuracy}%
        - Errors: {context.get('errors', [])}
        - Text: "{context.get('text', '')}"
        
        RULES:
        1. Keep it short (max 40 words).
        2. Use emojis! 🌟
        3. Simple language based on Island:
           - Beginner (Lv 1-15): Very simple words.
           - Intermediate (Lv 16-35): Focus on sounds.
           - Advanced (Lv 36-50): Comprehension focus.
        
        SCENARIO ({tier.upper()}):
        - If CELEBRATE (85%+): "🎉 AMAZING! {accuracy}%! Level unlocked! ⭐⭐⭐"
        - If ENCOURAGE (75-84%): Praise effort + 1 gentle tip on specific error.
        - If HELP (<75%): Praise effort + "Need help? Click the chat bubble! 💬"
        
        Generate the short feedback message now:"""
        
        try:
            response = await self.llm.ainvoke([HumanMessage(content=system_msg)])
            return response.content
        except Exception as e:
            print(f"Feedback gen error: {e}")
            if tier == "celebrate": return "🎉 WOW! You are a superstar! ⭐⭐⭐"
            return "Good try! You are getting better every day! 🌟"

    async def chat(self, user_id: str, message: str, current_plan: dict, history: List[BaseMessage] = []):
        """Direct chat interface for manual help requests."""
        level = current_plan.get('current_level', 1)
        current_sentence = current_plan.get('current_sentence', '')
        island = current_plan.get('island', 'Beginner')
        focus = current_plan.get('focus', '')
        
        system_msg = f"""You are the AI Reading Coach for LexiLearn.
        Kid is on Level {level} ({island} Island). 
        
        CURRENT SENTENCE THEY ARE PRACTICING: "{current_sentence}"
        FOCUS SKILL: {focus}
        
        CRITICAL RULES:
        1. ONLY help with the CURRENT SENTENCE above. Do NOT talk about other sentences.
        2. If they ask about a word NOT in the current sentence, gently redirect: "That word isn't in this sentence. Let's focus on: {current_sentence}"
        3. Be super encouraging and specific to the current text.
        4. Break down help by island level:
           - Beginner (Lv 1-15): Phoneme sounds "/c/ - /a/ - /t/ = cat"
           - Intermediate (Lv 16-35): Blends and digraphs "th- makes the 'thuh' sound"
           - Advanced (Lv 36-50): Comprehension "What happened first in the story?"
        5. Keep answers under 2 sentences.
        6. Use emojis to stay friendly! 🌟
        
        Child's question: "{message}"
        """
        
        try:
            full_history = [SystemMessage(content=system_msg)] + history + [HumanMessage(content=message)]
            response = await self.llm.ainvoke(full_history)
            return response.content
        except Exception as e:
            print(f"Direct Coach Error: {e}")
            return f"Let's focus on this sentence: '{current_sentence}'. Try sounding out the first word! 🚀"
