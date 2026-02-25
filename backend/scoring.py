import re
from difflib import SequenceMatcher

def calculate_reading_metrics(transcribed_text, expected_text, duration_seconds, level=1):
    """Calculates WPM and WER with level-based leniency and cleanup."""
    # Clean Whisper artifacts like [silence], (gentle music), etc.
    original_transcribed = transcribed_text
    transcribed_text = re.sub(r'\[.*?\]|\(.*?\)', '', transcribed_text)
    
    def clean_for_metrics(text):
        return re.sub(r'[^\w\s]', '', text.lower()).strip()

    clean_transcribed = clean_for_metrics(transcribed_text)
    clean_expected = clean_for_metrics(expected_text)

    print(f"--- SCORING DEBUG (Level {level}) ---")
    print(f"Expected: '{clean_expected}'")
    print(f"Transcribed (Original): '{original_transcribed}'")
    print(f"Transcribed (Clean): '{clean_transcribed}'")

    if not clean_expected:
        return 0, 100

    # Words Per Minute
    word_count = len(clean_transcribed.split())
    wpm = (word_count / duration_seconds) * 60 if duration_seconds > 0 else 0
    
    # Robust Matching
    matcher = SequenceMatcher(None, clean_expected, clean_transcribed)
    raw_accuracy = matcher.ratio() * 100
    accuracy = raw_accuracy
    
    # LEVEL 1 LENIENCY: Check for actual word matches
    if level == 1:
        expected_words = clean_expected.split()
        transcribed_words = clean_transcribed.split()
        matching_words = sum(1 for word in expected_words if word in transcribed_words)
        
        print(f"Expected words: {expected_words}")
        print(f"Transcribed words: {transcribed_words}")
        print(f"Matching words: {matching_words}/{len(expected_words)}")
        
        # Need at least 2 out of 3 words for "the cat sat"
        if matching_words >= 2:
            accuracy = 100
        else:
            accuracy = min(raw_accuracy * 1.3, 95)  # Small boost but not automatic pass
    
    wer = max(0, 100 - accuracy)
    print(f"Raw Accuracy: {raw_accuracy:.1f}%, Final Accuracy: {accuracy:.1f}%, WER: {wer}")
    return int(wpm), int(wer)

def calculate_research_risk(data):
    """
    Calculates Dyslexia Risk Score (0-10) based on 5 research tests.
    data = {
        "phoneme_score": 0-10,
        "rhyme_score": 0-10,
        "naming_time": seconds (for 30 items),
        "letter_score": 0-20,
        "reading_wpm": float,
        "reading_wer": float
    }
    """
    # 1. Phoneme ID (0-10)
    s1 = data.get("phoneme_score", 0)
    
    # 2. Rhyme Detection (0-10)
    s2 = data.get("rhyme_score", 0)
    
    # 3. Rapid Naming (Time based, normalized to 0-10)
    # Threshold: > 45s is Risk. 
    # Logic: 10 if <= 30s, 0 if >= 60s.
    time = data.get("naming_time", 60)
    s3 = max(0, min(10, 10 * (60 - time) / (60 - 30))) if time < 60 else 0
    
    # 4. Letter Sound (0-20, normalized to 0-10)
    s4 = (data.get("letter_score", 0) / 20) * 10
    
    # 5. Oral Reading (Average of WPM and Accuracy scores)
    wpm = data.get("reading_wpm", 0)
    wer = data.get("reading_wer", 100)
    
    # WPM Score: 10 if >= 45, 0 if <= 20
    wpm_score = max(0, min(10, 10 * (wpm - 20) / (45 - 20)))
    # WER Score: 10 if <= 10%, 0 if >= 25%
    wer_score = max(0, min(10, 10 * (25 - wer) / (25 - 10)))
    
    s5 = (wpm_score + wer_score) / 2
    
    # Total Risk Score (0-10)
    total_avg = (s1 + s2 + s3 + s4 + s5) / 5
    
    risk_level = "LOW"
    if total_avg <= 4:
        risk_level = "HIGH"
    elif total_avg <= 7:
        risk_level = "MODERATE"
        
    return {
        "total_score": round(total_avg, 1),
        "risk_level": risk_level,
        "details": {
            "phoneme": round(s1, 1),
            "rhyme": round(s2, 1),
            "naming": round(s3, 1),
            "letters": round(s4, 1),
            "reading": round(s5, 1)
        }
    }
