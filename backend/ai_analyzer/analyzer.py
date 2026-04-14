import os
import json
import google.generativeai as genai
from pydantic import BaseModel, ValidationError

class AIAnalyzer:
    def __init__(self):
        # Configure Gemini API key from environment
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-3-flash-preview')
        else:
            self.model = None

    def analyze_resume(self, resume_text: str, jd_text: str) -> dict:
        """
        Analyzes the resume against the job description.
        Returns a JSON-compatible dictionary.
        """
        if not self.model:
            # Fallback if no API key is provided
            return {
                "matchPercentage": 0,
                "matchedKeywords": [],
                "missingKeywords": [],
                "suggestions": [
                    "We need a valid GEMINI_API_KEY in the .env file to generate real comparisons.",
                    "Please add the key and restart the backend server."
                ]
            }

        prompt = f"""
        You are an expert ATS (Applicant Tracking System) simulator and a senior tech recruiter.
        I will provide you with a Job Description and a Candidate's Resume.
        
        Compare the resume to the job description and output a strict JSON string with the following schema:
        {{
            "matchPercentage": int (0-100),
            "matchedKeywords": list of strings (keywords found in both),
            "missingKeywords": list of strings (important keywords in JD missing from resume),
            "suggestions": list of strings (actionable advice to improve the resume)
        }}

        Ensure the output is ONLY valid JSON, do not include markdown formatting like ```json or trailing text.

        === JOB DESCRIPTION ===
        {jd_text}

        === RESUME ===
        {resume_text}
        """

        try:
            response = self.model.generate_content(prompt)
            # Clean possible markdown ticks from gemini
            text_response = response.text.replace("```json", "").replace("```", "").strip()
            result = json.loads(text_response)
            return result
        except Exception as e:
            print(f"Error during AI generation: {e}")
            return {
                "matchPercentage": 0,
                "matchedKeywords": [],
                "missingKeywords": [],
                "suggestions": [f"Error occurred during analysis: {str(e)}"]
            }
