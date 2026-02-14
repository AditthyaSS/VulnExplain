"""
Minimal wrapper for emergentintegrations.llm.chat module
This provides compatibility with the emergent LLM chat interface
"""

from typing import Optional
import google.generativeai as genai


class UserMessage:
    """Represents a user message"""
    def __init__(self, text: str, images: Optional[list] = None):
        self.text = text
        self.images = images or []


class LlmChat:
    """LLM Chat wrapper for Gemini"""
    
    def __init__(self, api_key: str, session_id: str, system_message: str = ""):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.model_name = "gemini-2.0-flash-exp"
        self.temperature = 1.0
        self.top_p = 0.95
        self.top_k = 40
        
    def with_model(self, provider: str, model: str):
        """Set the model"""
        self.model_name = model
        return self
    
    def with_params(self, temperature: float = None, top_p: float = None, top_k: int = None):
        """Set generation parameters"""
        if temperature is not None:
            self.temperature = temperature
        if top_p is not None:
            self.top_p = top_p
        if top_k is not None:
            self.top_k = top_k
        return self
    
    async def send_message(self, message: UserMessage) -> str:
        """Send a message and get a response"""
        genai.configure(api_key=self.api_key)
        
        # Create generation config
        generation_config = {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "top_k": self.top_k,
            "max_output_tokens": 8192,
        }
        
        # Create the model
        model = genai.GenerativeModel(
            model_name=self.model_name,
            generation_config=generation_config,
            system_instruction=self.system_message
        )
        
        # Send the message
        response = model.generate_content(message.text)
        
        return response.text
