import asyncio
import os
import traceback
from dotenv import load_dotenv

# Load env
backend_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path)

from agents.study_insight import StudyInsightAgent

async def debug_agent():
    content = """The LexiLearn platform uses three main AI agents. 1. The Learning Assessment Agent identifies reading levels. 2. The AI Reading Coach provides oral feedback. 3. The Progress Insight Agent explains improvements to parents."""
    
    print("\n--- Testing Study Insight Agent Debug ---")
    payload = {
        "content": content,
        "subject": "LexiLearn Info",
        "child_age": 8
    }
    
    agent = StudyInsightAgent()
    try:
        # Check if model is initialized
        print(f"Model: {agent.llm.model}")
        
        result = await agent.process_chapter(payload)
        print("\nFINAL RESULT:")
        import json
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print("\nTOP LEVEL FAILURE:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_agent())
