from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union, Any
import os
from dotenv import load_dotenv

# --- CRITICAL: Load ENV before any other imports ---
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    load_dotenv() 

from supabase import create_client, Client
from models import ScreeningSubmission
from scoring import calculate_reading_metrics, calculate_research_risk
import shutil
import whisper
import level_content
# from agents.insight import ProgressInsightAgent
from agents.study_insight import StudyInsightAgent
from agents.study_chat import StudyChatAgent

# Automatically add FFmpeg to PATH if found in common Winget location (Optimized)
if not shutil.which("ffmpeg"):
    print("FFmpeg not in PATH, checking common locations...")
    # Skip deep scan to avoid startup hang
else:
    print("✅ FFmpeg found in system PATH.")

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5175", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Supabase client placeholder
supabase_client = None

def get_supabase():
    global supabase_client
    if supabase_client is None:
        url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")
        if url and key:
            try:
                supabase_client = create_client(url, key)
                print("Supabase Initialized Lazily.")
            except Exception as e:
                print(f"Lazy Supabase Error: {e}")
    return supabase_client

# Global model placeholder for lazy loading
model_cache = None

def get_whisper_model():
    global model_cache
    if model_cache is None:
        print("Lazy Loading Whisper Model...")
        try:
            model_cache = whisper.load_model("tiny")
            print("Whisper Model Loaded.")
        except Exception as e:
            print(f"Error loading Whisper: {e}")
    return model_cache

@app.get("/")
def read_root():
    return {"message": "LexiLearn AI Backend with Whisper is Running!"}

@app.post("/api/process-audio")
async def process_audio(
    file: UploadFile = File(...), 
    expected_text: str = Form(""), 
    duration_seconds: float = Form(0.0),
    user_id: str = Form(None),
    level: int = Form(1)
):
    model = get_whisper_model()
    if not model:
        raise HTTPException(status_code=500, detail="Whisper model not available")
    
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_location = f"{upload_dir}/{file.filename}"
    
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = model.transcribe(file_location, language='en')
        transcribed_text = result["text"].strip()
        print(f"DEBUG: Whisper Transcribed -> '{transcribed_text}'")
        
        wpm = 0
        wer = 100
        if duration_seconds > 0:
            wpm, wer = calculate_reading_metrics(transcribed_text, expected_text, duration_seconds, level)
            print(f"DEBUG: Metrics -> WPM: {wpm}, WER: {wer} (Level: {level}, Expected: '{expected_text}')")
        
        audio_url = None
        supabase = get_supabase()
        if supabase and user_id:
            try:
                storage_path = f"{user_id}/{file.filename}"
                with open(file_location, "rb") as f:
                    supabase.storage.from_("screening-audio").upload(
                        path=storage_path,
                        file=f,
                        file_options={"content-type": "audio/webm"}
                    )
                audio_url_res = supabase.storage.from_("screening-audio").get_public_url(storage_path)
                audio_url = str(audio_url_res)
            except Exception as e:
                print(f"Supabase Storage Upload Error: {e}")

        os.remove(file_location)
        
        return {
            "status": "success",
            "transcribed_text": transcribed_text,
            "wpm": wpm,
            "wer": wer,
            "audio_url": audio_url
        }

    except Exception as e:
        print(f"Audio processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/screening")
def submit_screening(submission: ScreeningSubmission):
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection error")

    try:
        risk_data = calculate_research_risk({
            "phoneme_score": submission.phoneme_score,
            "rhyme_score": submission.rhyme_score,
            "naming_time": submission.naming_time,
            "letter_score": submission.letter_score,
            "reading_wpm": submission.reading_wpm,
            "reading_wer": submission.reading_wer
        })

        data = {
            "user_id": submission.user_id,
            "answers": [a.dict() for a in submission.answers],
            "phoneme_score": submission.phoneme_score,
            "rhyme_score": submission.rhyme_score,
            "naming_time": submission.naming_time,
            "letter_score": submission.letter_score,
            "reading_wpm": submission.reading_wpm,
            "reading_wer": submission.reading_wer,
            "calculated_score": risk_data["total_score"],
            "risk_level": risk_data["risk_level"],
            "risk_details": risk_data["details"],
            "audio_url": submission.audio_url
        }

        supabase.table("screening_results").insert(data).execute()
        
        tier = 1
        if risk_data["risk_level"] == "LOW": tier = 3
        elif risk_data["risk_level"] == "MODERATE": tier = 2

        # Update user profile
        try:
            print(f"DEBUG: Updating profile for {submission.user_id} with Risk: {risk_data['total_score']} ({risk_data['risk_level']})")
            
            # Use UPDATE instead of UPSERT to avoid potential index conflicts or replacing valid data with nulls
            # We assume profile exists (created at signup). If not, this might fail, but that's a larger data integrity issue.
            response = supabase.table("profiles").update({
                "dyslexia_risk_score": risk_data["total_score"],
                "reading_level": "High" if risk_data["risk_level"] == "HIGH" else "Moderate" if risk_data["risk_level"] == "MODERATE" else "Low",
                "current_tier": tier
            }).eq("id", submission.user_id).execute()
            
            print(f"DEBUG: Profile update result: {response.data}")
            
        except Exception as profile_err:
            print(f"CRITICAL Warning: Profile update failed: {profile_err}")
            import traceback
            traceback.print_exc()

        return {
            "status": "success", 
            "risk_level": risk_data["risk_level"], 
            "total_score": risk_data["total_score"],
            "tier": tier
        }
    except Exception as e:
        print(f"Error saving screening: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# AI AGENTS
class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: Optional[List[dict]] = []
    plan: Optional[dict] = None

@app.get("/api/ai/plan")
def get_ai_plan(user_id: str):
    print(f"DEBUG: Generating AI plan for user: {user_id}")
    from agents.assessment import AssessmentAgent
    agent = AssessmentAgent()
    try:
        plan = agent.analyze_ability(user_id)
        return plan
    except Exception as e:
        print(f"DEBUG: Assessment Agent Error: {e}")
        return {
            "reading_level": "Beginner",
            "next_step": "Practice Level 1"
        }

@app.get("/api/ai/level")
def get_level_content(user_id: str, level: int = 1):
    print(f"DEBUG: Serving level {level} content to user {user_id}")
    data = level_content.get_level_data(level)
    return {
        "title": f"Level {level}",
        "content": data["text"],
        "focus_sounds": [data["focus"]],
        "island": data["island"],
        "total_levels": level_content.get_total_levels()
    }

@app.get("/api/ai/daily")
def get_daily_challenge(user_id: str):
    from agents.assessment import AssessmentAgent
    agent = AssessmentAgent()
    return agent.get_daily_challenge(user_id)

@app.get("/api/user/progress")
def get_user_progress(user_id: str):
    supabase = get_supabase()
    if not supabase: 
        print(f"DEBUG get_user_progress: No supabase client for {user_id}")
        return {"current_level": 1, "daily_done": False}
    try:
        from datetime import datetime
        print(f"DEBUG get_user_progress: Querying for user {user_id}")
        # Only query current_level since last_daily_completed doesn't exist
        res = supabase.table("profiles").select("current_level").eq("id", user_id).single().execute()
        print(f"DEBUG get_user_progress: Query result: {res.data}")
        data = res.data or {}
        
        result = {
            "current_level": data.get("current_level", 1),
            "daily_done": False  # Feature not implemented yet
        }
        print(f"DEBUG get_user_progress: Returning {result}")
        return result
    except Exception as e:
        print(f"DEBUG get_user_progress: Exception {e}")
        import traceback
        traceback.print_exc()
        return {"current_level": 1, "daily_done": False}

@app.post("/api/user/complete-daily")
def complete_daily(user_id: str):
    supabase = get_supabase()
    if not supabase: return {"status": "error"}
    try:
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        supabase.table("profiles").update({"last_daily_completed": today}).eq("id", user_id).execute()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class CompleteLevelRequest(BaseModel):
    user_id: str
    level: int
    accuracy: float = 0.0
    wpm: float = 0.0

@app.post("/api/user/complete-level")
def complete_level(req: CompleteLevelRequest):
    supabase = get_supabase()
    if not supabase: 
        return {"status": "error", "message": "Database connection failed"}
    try:
        # Increment level if current level is completion level
        curr = get_user_progress(req.user_id)["current_level"]
        accuracy = req.accuracy
        print(f"DEBUG: User {req.user_id} completing level {req.level}, current: {curr}, acc: {accuracy}")
        
        # 1. Always calculate stars based on performance
        stars = 1
        if accuracy >= 95: stars = 3
        elif accuracy >= 85: stars = 2
        
        # 2. Always record the completion in the history table
        try:
            supabase.table("level_completions").insert({
                "user_id": req.user_id,
                "level": req.level,
                "stars": stars,
                "accuracy": accuracy,
                "wpm": req.wpm
            }).execute()
        except Exception as log_err:
            print(f"History log warning: {log_err}")

        # 3. Always update profile totals (Stars & Words)
        try:
            p = supabase.table("profiles").select("total_stars, words_read").eq("id", req.user_id).single().execute()
            # Robust mapping: ensure we don't add stars to None
            current_stars = 0
            current_words = 0
            
            if p.data:
                current_stars = p.data.get("total_stars") or 0
                current_words = p.data.get("words_read") or 0
            
            print(f"DEBUG: Updating Stats for {req.user_id} | Existing Stars: {current_stars}, Add: {stars} | Words: {current_words}")
            
            supabase.table("profiles").update({
                "total_stars": current_stars + stars,
                "words_read": current_words + 50 # Estimate 50 words per level
            }).eq("id", req.user_id).execute()
        except Exception as stat_err:
            print(f"Stats update warning: {stat_err}")

        # 4. Handle Progression (Only if it's the current level AND accuracy is good)
        if req.level >= curr and accuracy >= 85:
            new_level = req.level + 1
            try:
                supabase.table("profiles").update({
                    "current_level": new_level
                }).eq("id", req.user_id).execute()
            except Exception as prog_err:
                print(f"Progression update warning: {prog_err}")
            
            return {"status": "success", "new_level": new_level, "stars": stars, "unlocked": True}
        
        return {"status": "success", "new_level": curr, "stars": stars, "unlocked": False}
    except Exception as e:
        print(f"Progress update error: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

class GameScoreRequest(BaseModel):
    user_id: str
    game_id: str
    score: int
    stars: int

@app.post("/api/user/game-score")
def submit_game_score(req: GameScoreRequest):
    supabase = get_supabase()
    if not supabase: return {"status": "error"}
    try:
        supabase.table("game_scores").insert({
            "user_id": req.user_id,
            "game_id": req.game_id,
            "score": req.score,
            "stars_earned": req.stars
        }).execute()
        
        # Also update profile total stars
        p = supabase.table("profiles").select("total_stars").eq("id", req.user_id).single().execute()
        current_stars = 0
        if p.data:
            current_stars = p.data.get("total_stars") or 0
            
        print(f"DEBUG: Game Score update for {req.user_id} | Existing Stars: {current_stars}, Add: {req.stars}")
        
        supabase.table("profiles").update({
             "total_stars": current_stars + req.stars
        }).eq("id", req.user_id).execute()

        return {"status": "success"}
    except Exception as e:
        print(f"Game score error: {e}")
        return {"status": "error"}

class FeedbackRequest(BaseModel):
    user_id: str
    level: int
    text: str
    child_reading: str
    accuracy: float
    wpm: float
    errors: List[str]
    island: str

@app.post("/api/ai/feedback")
async def generate_feedback(req: FeedbackRequest):
    from agents.coach import ReadingCoachAgent
    agent = ReadingCoachAgent()
    context = req.dict()
    feedback = await agent.generate_feedback(context)
    return {"feedback": feedback}

@app.post("/api/user/initialize-level")
def initialize_level(user_id: str):
    """Calibrates starting level based on screening."""
    supabase = get_supabase()
    if not supabase: return {"status": "error"}
    
    # Fetch user profile to get risk/age
    try:
        # Get profile data
        res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        profile = res.data
        
        if not profile:
            return {"status": "error", "message": "Profile not found"}
            
        # Extract Age (default to 7 if missing)
        # Note: 'age' might be stored as string or int depending on schema, handle gracefully
        age = 7
        if profile.get("age"):
            try:
                age = int(profile["age"])
            except:
                pass
                
        # Extract Risk Score/Level
        # We need the calculated risk score (dyslexia_risk_score) or the level string
        risk_level = "MODERATE" # Default
        
        # Logic: If we have a numeric score, we might re-calculate, but here we use the string level 
        # or simplified logic. The previous screening submission saved "reading_level" as High/Moderate/Low 
        # based on risk. Let's use that if available.
        # However, `get_starting_level` expects risk string: "HIGH", "MODERATE", "LOW".
        
        # Mapping 'reading_level' back to RISK (Inverse of screening logic)
        # stored: High (Risk High) -> Risk HIGH
        # stored: Low (Risk Low) -> Risk LOW
        stored_level = profile.get("reading_level") # "High", "Moderate", "Low"
        
        if stored_level == "High": risk_level = "HIGH"
        elif stored_level == "Moderate": risk_level = "MODERATE" 
        elif stored_level == "Low": risk_level = "LOW"
        
        # Calculate Starting Level
        level = level_content.get_starting_level(age, risk_level) 
        
        print(f"DEBUG: Initializing User {user_id} | Age: {age} | Risk: {risk_level} -> Level {level}")
        
        supabase.table("profiles").update({"current_level": level}).eq("id", user_id).execute()
        return {"status": "success", "initial_level": level}
        
    except Exception as e:
        print(f"Error initializing level: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/ai/chat")
async def ai_chat(req: ChatRequest):
    print(f"DEBUG: Incoming chat request for {req.user_id}")
    try:
        plan = req.plan
        if not plan:
            print("DEBUG: No plan in request, fetching from AssessmentAgent...")
            from agents.assessment import AssessmentAgent
            assessment_agent = AssessmentAgent()
            plan = assessment_agent.analyze_ability(req.user_id)
            print(f"DEBUG: Fetched plan: {bool(plan)}")
        
        from langchain_core.messages import HumanMessage, AIMessage
        lc_history = []
        for m in req.history:
            role = m.get('role')
            content = m.get('content', '')
            if role == 'user': 
                lc_history.append(HumanMessage(content=content))
            else: 
                lc_history.append(AIMessage(content=content))
        print(f"DEBUG: History processed. Count: {len(lc_history)}")
            
        from agents.coach import ReadingCoachAgent
        coach = ReadingCoachAgent()
        print("DEBUG: Calling coach.chat...")
        response = await coach.chat(req.user_id, req.message, plan, lc_history)
        print("DEBUG: Coach response received.")

        # LOGGING TO DATABASE
        supabase = get_supabase()
        if supabase:
            try:
                supabase.table("ai_chat_logs").insert({
                    "user_id": req.user_id,
                    "message": req.message,
                    "ai_response": response,
                    "context": plan
                }).execute()
            except Exception as log_err:
                print(f"Chat logging failed: {log_err}")

        return {"response": response}
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"CRITICAL CHAT ERROR:\n{error_details}")
        return {"response": "I'm having a little trouble thinking. Let's try reading the next word together!"}

class StudyAgentRequest(BaseModel):
    child_id: str
    child_age: int
    child_level: Union[str, int, Any]
    dyslexia_risk: str
    subject: str
    content: str
    features: Optional[List[str]] = ["summary", "quiz", "keywords"]

@app.post("/api/study-insight")
@app.post("/api/study-agent")
async def study_agent(req: StudyAgentRequest):
    print(f"--- DEBUG: Incoming Study Request ---")
    print(f"User: {req.child_id}, Age: {req.child_age}, Level: {req.child_level}")
    print(f"Features: {req.features}")
    print(f"Content Snippet: {req.content[:200]}...")
    print(f"Content Length: {len(req.content)}")
    
    if not req.content.strip():
        print("WARNING: Empty content received in study-agent request.")
        return {"summary": "Please upload a file with text to study.", "quiz": [], "keywords": [], "simplified": ""}
        
    try:
        agent = StudyInsightAgent()
        result = await agent.process_chapter(req.dict())
        print(f"DEBUG: Study Agent result keys: {list(result.keys())}")
        return result
    except Exception as e:
        import traceback
        print(f"Study Agent Error: {e}")
        print(traceback.format_exc())
        return {"summary": "The Study Buddy had a little trouble reading that. Let's try again!", "quiz": [], "keywords": [], "simplified": req.content}

class StudyChatRequest(BaseModel):
    user_id: str
    message: str
    context: str
    history: List[dict]

@app.post("/api/study-chat")
async def study_chat(req: StudyChatRequest):
    print(f"DEBUG: Study Chat request from {req.user_id} | Message: {req.message} | Context Length: {len(req.context)}")
    if not req.context.strip():
        return {"response": "I haven't read the chapter yet. Could you upload it so I can help?"}
        
    try:
        agent = StudyChatAgent()
        history = []
        for h in req.history:
            history.append((h.get("role", "human"), h.get("content", "")))
        
        response = await agent.chat(req.user_id, req.message, req.context, history)
        print(f"DEBUG: Study Chat response length: {len(response)}")
        return {"response": response}
    except Exception as e:
        import traceback
        print(f"Study Chat Error: {e}")
        print(traceback.format_exc())
        return {"response": "I'm having a little trouble thinking about this chapter right now. Could you ask me something else?"}

@app.get("/api/ai/report")
def get_ai_report(user_id: str):
    from agents.insight import ProgressInsightAgent
    agent = ProgressInsightAgent()
    try:
        report = agent.generate_report(user_id)
        return {"report": report}
    except Exception as e:
        return {"report": "Could not generate report."}

# LEGACY (Keeping for compatibility if needed, but redirects to new logic)
@app.get("/api/get-reading-plan")
def get_reading_plan(user_id: str):
    return get_ai_plan(user_id)
