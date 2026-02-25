import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class StudyChatAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.5, max_retries=5)
        self.output_parser = StrOutputParser()

    async def chat(self, user_id: str, message: str, context: str, history: list) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the LexiLearn Study Buddy, a friendly and supportive academic assistant. 
            Your goal is to help students understand their textbook chapters.
            
            RULES:
            1. Use simple, child-friendly language.
            2. ALWAYS use the provided Chapter Context to answer questions.
            3. If the answer is not in the context, be honest but try to relate it back to the study material.
            4. Be encouraging and guide the student towards thinking for themselves.
            
            CHAPTER CONTEXT:
            {context}"""),
            *history,
            ("human", "{message}")
        ])
        
        chain = prompt | self.llm | self.output_parser
        try:
            return await chain.ainvoke({"message": message, "context": context})
        except Exception as e:
            print(f"Study Chat Logic Error: {e}")
            return "I'm having a little trouble thinking about this right now. Could you try rephrasing your question?"
