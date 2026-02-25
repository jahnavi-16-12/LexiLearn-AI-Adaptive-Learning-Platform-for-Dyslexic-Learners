import os
import json
import re
import time
from typing import Dict, Any, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class StudyInsightAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1, max_retries=5)
        self.output_parser = StrOutputParser()

    async def process_chapter(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            with open("agent_debug.log", "a", encoding="utf-8") as f:
                f.write(f"\n--- REQUEST RECEIVED {time.ctime()} ---\n")
        except:
            pass
            
        features = data.get("features", ["summary", "quiz", "keywords"])
        
        feature_instructions = ""
        if "summary" in features:
            feature_instructions += "1. Create a bulleted, dyslexia-friendly summary using simple language.\n"
        if "quiz" in features:
            feature_instructions += "2. Create 3 multiple choice questions with 4 options each.\n"
        if "keywords" in features:
            feature_instructions += "3. Identify 5 important key terms (keywords) with short, clear definitions.\n"

        system_prompt = (
            "You are a Dyslexia-Expert Learning Assistant. Analyze the textbook chapter provided.\n"
            "TASK:\n"
            f"{feature_instructions}\n"
            "IMPORTANT: Your response must be ONLY a valid JSON object. Do not include markdown code blocks or any other text.\n"
            "CRITICAL: Never include trailing commas in your JSON (e.g., [1, 2, ] is illegal).\n"
            "JSON SCHEMA:\n"
            "{{ \"summary\": \"string\", \"quiz\": [ {{ \"question\":\"string\", \"options\":[\"string\"], \"answer\":\"string\" }} ], \"keywords\": [ {{ \"term\":\"string\", \"definition\":\"string\" }} ] }}"
        )
        
        user_prompt = "Subject: {subject}, Age: {child_age}, Level: {child_level}\n\nCONTENT:\n{content}"
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt)
        ])
        
        chain = prompt | self.llm | self.output_parser
        
        try:
            # Clean content for prompt safety - Reduce length to avoid 429 errors
            clean_content = data.get("content", "")[:8000].replace("{", "[").replace("}", "]")
            print(f"DEBUG: StudyInsightAgent - Input Content Length: {len(clean_content)}")
            
            start_time = time.time()
            raw_res = await chain.ainvoke({
                "subject": data.get("subject", "General"),
                "child_age": data.get("child_age", 8),
                "child_level": data.get("child_level", "Unknown"),
                "content": clean_content
            })
            duration = time.time() - start_time
            print(f"DEBUG: StudyInsightAgent - Chain Duration: {duration:.2f}s")
            
            print(f"DEBUG: StudyInsightAgent - Raw Response Start: {raw_res[:200]}")
            
            # Robust JSON Extraction & Cleaning
            clean_raw = re.sub(r"```json|```", "", raw_res, flags=re.IGNORECASE).strip()
            
            # Use regex to find the JSON block in case of conversational prefix/suffix
            json_match = re.search(r"\{.*\}", clean_raw, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                # DEEP CLEANING: Remove trailing commas before closing braces/brackets
                json_str = re.sub(r",\s*(\}|\])", r"\1", json_str)
                try:
                    res = json.loads(json_str)
                except json.JSONDecodeError as je1:
                    print(f"DEBUG: StudyInsightAgent - JSON Regex Match Parse Failure: {je1}")
                    res = json.loads(clean_raw) # Fallback
            else:
                res = json.loads(clean_raw)
            
            summary = res.get("summary", "No summary generated.")
            if isinstance(summary, list): summary = "\n".join([f"• {s}" for s in summary])
            
            print("DEBUG: StudyInsightAgent - Successfully parsed JSON response.")
            
            # FILE LOGGING FOR PRODUCTION DEBUGGING
            try:
                with open("agent_debug.log", "a", encoding="utf-8") as f:
                    f.write(f"\n--- SUCCESS {time.ctime()} ---\nDuration: {duration:.2f}s\n")
            except:
                pass

            return {
                "summary": str(summary),
                "quiz": res.get("quiz", [])[:3],
                "keywords": res.get("keywords", [])[:5],
                "simplified": data.get("content", "")
            }
            
        except Exception as e:
            import traceback
            error_msg = f"Study Insight Agent Final Error: {e}\n{traceback.format_exc()}"
            print(error_msg)
            
            # FILE LOGGING FOR PRODUCTION DEBUGGING
            try:
                with open("agent_debug.log", "a", encoding="utf-8") as f:
                    f.write(f"\n--- ERROR {time.ctime()} ---\n{error_msg}\n")
                    if 'raw_res' in locals():
                        f.write(f"RAW RES: {raw_res}\n")
            except:
                pass

            if 'raw_res' in locals():
                print(f"DEBUG: StudyInsightAgent - RAW AI RESPONSE BEFORE PARSE FAILURE: {raw_res[:1000]}")
            
            return {
                "summary": "I'm having a little trouble reading this chapter. Could you try uploading a shorter section or a different file?",
                "quiz": [],
                "keywords": [],
                "simplified": data.get("content", "")
            }
