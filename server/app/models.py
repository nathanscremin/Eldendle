# Bibliotecas
from pydantic import BaseModel 
from typing import Literal

# Status de feedback para o jogo
FeedbackStatus = Literal["correct", "incorrect", "partial", "higher", "lower"]

class Boss(BaseModel):
    # Define a estrutura de um Boss
    name: str
    region: str
    phase: int
    type: str
    race: str
    specific_location: str
    mandatory: bool
    dlc: bool
    runes: int
    image_url: str
    
class GuessFeedback(BaseModel):
    # Define as respostas de feedback para o cliente
    name: FeedbackStatus
    region: FeedbackStatus
    phase: FeedbackStatus
    type: FeedbackStatus
    race: FeedbackStatus
    specific_location: FeedbackStatus
    mandatory: FeedbackStatus
    dlc: FeedbackStatus
    runes: FeedbackStatus
    