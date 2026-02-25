from pydantic import BaseModel
from typing import List, Optional

class ScreeningAnswer(BaseModel):
    question_id: str
    answer: Optional[str] = ""
    is_correct: bool

class ScreeningSubmission(BaseModel):
    user_id: str
    answers: List[ScreeningAnswer]
    # Granular scores - Optional to prevent 422 if one is missing
    phoneme_score: Optional[int] = 0
    rhyme_score: Optional[int] = 0
    naming_time: Optional[float] = 0
    letter_score: Optional[int] = 0
    reading_wpm: Optional[float] = 0
    reading_wer: Optional[float] = 0
    total_score: Optional[float] = 0
    audio_url: Optional[str] = None
