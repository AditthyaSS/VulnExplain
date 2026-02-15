"""
Minimal wrapper for LLM chat - now using Groq API
Supports Llama 3.3-70b-versatile and other Groq models
"""

from typing import Optional
import os
import httpx
import json


class UserMessage:
    """Represents a user message"""
    def __init__(self, text: str, images: Optional[list] = None):
        self.text = text
        self.images = images or []


class LlmChat:
    """LLM Chat wrapper for Groq API"""
    
    def __init__(self, api_key: str, session_id: str, system_message: str = ""):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.model_name = "llama-3.3-70b-versatile"
        self.temperature = 1.0
        self.top_p = 0.95
        self.max_tokens = 8192
        
    def with_model(self, provider: str, model: str):
        """Set the model"""
        self.model_name = model
        return self
    
    def with_params(self, temperature: float = None, top_p: float = None, top_k: int = None, max_tokens: int = None):
        """Set generation parameters"""
        if temperature is not None:
            self.temperature = temperature
        if top_p is not None:
            self.top_p = top_p
        if max_tokens is not None:
            self.max_tokens = max_tokens
        # Note: top_k is not used by Groq
        return self
    
    async def send_message(self, message: UserMessage) -> str:
        """Send a message and get a response from Groq"""
        
        # Build messages array
        messages = []
        if self.system_message:
            messages.append({
                "role": "system",
                "content": self.system_message
            })
        
        messages.append({
            "role": "user",
            "content": message.text
        })
        
        # Groq API endpoint
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": self.temperature,
            "top_p": self.top_p,
            "max_tokens": self.max_tokens,
            "stream": False
        }
        
        # Make async request
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            return result["choices"][0]["message"]["content"]

