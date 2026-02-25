import requests
import json
import time

def test_debug():
    url = "http://localhost:8000/api/study-insight"
    payload = {
        "child_id": "debug_user",
        "child_age": 9,
        "child_level": "Grade 4",
        "dyslexia_risk": "Moderate",
        "subject": "History",
        "content": "The Roman Empire was one of the largest and most powerful empires in history. It began in the city of Rome, which is in modern-day Italy. The Romans built great roads, bridges, and buildings like the Colosseum." * 50, # Sufficient length
        "features": ["summary"]
    }
    
    print(f"DEBUG: Sending request to {url}...")
    start = time.time()
    try:
        response = requests.post(url, json=payload, timeout=130)
        elapsed = time.time() - start
        print(f"DEBUG: Status Code: {response.status_code} | Time: {elapsed:.2f}s")
        if response.status_code == 200:
            res_json = response.json()
            print("DEBUG: Response Summary Snippet:", res_json.get("summary", "")[:100])
            if "I'm having a little trouble" in res_json.get("summary", ""):
                print("DEBUG: [ISSUE] Backend returned fallback message.")
            else:
                print("DEBUG: [SUCCESS] Backend returned real summary.")
        else:
            print(f"DEBUG: Error Body: {response.text}")
    except Exception as e:
        print(f"DEBUG: Request Error: {e}")

if __name__ == "__main__":
    test_debug()
