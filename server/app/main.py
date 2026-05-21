# Bibliotecas
import random
import uuid
import os

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Dict
from .database import BOSS_DATABASE
from .models import Boss, GuessFeedback, FeedbackStatus

# Inicialização do FastAPI
app = FastAPI()

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Caminho absoluto para a pasta do cliente web
current_dir = os.path.dirname(os.path.abspath(__file__))
client_web_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "client", "web"))

# Montar arquivos estáticos
app.mount("/static", StaticFiles(directory=os.path.join(client_web_dir, "static")), name="static")

# Inicialização do jogo
ACTIVE_GAMES: Dict[str, Boss] = {}

#Função que randomiza o boss
def get_new_random_boss() -> Boss:
    all_boss_names = list(BOSS_DATABASE.keys())
    random_boss_name = random.choice(all_boss_names)
    print(f"--- Novo jogo criado. Resposta: {random_boss_name} ---")
    return Boss(**BOSS_DATABASE[random_boss_name])

@app.get("/")
def read_root():
    return FileResponse(os.path.join(client_web_dir, "index.html"))

@app.get("/api/bosses/names", response_model=List[str])
def get_all_boss_names():
    return list(BOSS_DATABASE.keys())

@app.get("/api/boss/details/{boss_name}", response_model=Boss)
def get_boss_details(boss_name: str):
    # Endpoint para o cliente pegar os dados do boss
    if boss_name not in BOSS_DATABASE:
        raise HTTPException(status_code=404, detail="Boss não encontrado.")
    return BOSS_DATABASE[boss_name]
    
@app.post("/app/game/start")
def start_new_game():
    # Criar um novo jogo
    game_id = str(uuid.uuid4())
    correct_boss = get_new_random_boss()
    ACTIVE_GAMES[game_id] = correct_boss
    return {"game_id": game_id}

@app.post("/api/guess/{game_id}/{guess_name}", response_model=GuessFeedback)
def process_guess(game_id: str, guess_name: str):
    # Endpoint principal
    correct_boss_data = ACTIVE_GAMES.get(game_id)

    if not correct_boss_data:
        raise HTTPException(status_code=404, detail="Sessão de jogo não encontrada. Inicie um novo jogo.")
    if guess_name not in BOSS_DATABASE:
        raise HTTPException(status_code=404, detail="Boss não encontrado.")
    
    guess_data = Boss(**BOSS_DATABASE[guess_name])
    feedback = {}
    feedback["nome"] = "correct" if guess_data.nome == correct_boss_data.nome else "incorrect"
    feedback["tipo"] = "correct" if guess_data.tipo == correct_boss_data.tipo else "incorrect"
    feedback["raca"] = "correct" if guess_data.raca == correct_boss_data.raca else "incorrect"
    feedback["drop_principal"] = "correct" if guess_data.drop_principal == correct_boss_data.drop_principal else "incorrect"
    feedback["obrigatorio"] = "correct" if guess_data.obrigatorio == correct_boss_data.obrigatorio else "incorrect"

    if guess_data.localizacao_especifica == correct_boss_data.localizacao_especifica:
        feedback["localizacao_especifica"] = "correct"
        feedback["regiao"] = "correct"
    elif guess_data.regiao == correct_boss_data.regiao:
        feedback["localizacao_especifica"] = "incorrect"
        feedback["regiao"] = "partial" 
    else:
        feedback["localizacao_especifica"] = "incorrect"
        feedback["regiao"] = "incorrect"
        
    if guess_data.fase == correct_boss_data.fase:
        feedback["fase"] = "correct"
    elif guess_data.fase < correct_boss_data.fase:
        feedback["fase"] = "higher" 
    else:
        feedback["fase"] = "lower" 

    if guess_data.runes == correct_boss_data.runes:
        feedback["runes"] = "correct"
    elif guess_data.runes < correct_boss_data.runes:
        feedback["runes"] = "higher" 
    else:
        feedback["runes"] = "lower"  
        
    return GuessFeedback(**feedback)

@app.get("/api/game/hint/{game_id}")
def get_game_hint(game_id: str):
    # Retorna uma dica para o jogo
    correct_boss = ACTIVE_GAMES.get(game_id)
    if not correct_boss:
        raise HTTPException(status_code=404, detail="Sessão de jogo não encontrada.")
    
    # Mascara o nome do boss deixando apenas a primeira letra de cada palavra
    words = correct_boss.nome.split(" ")
    masked_words = []
    for word in words:
        if len(word) > 1:
            # Mantém a primeira letra e substitui o resto por asteriscos, respeitando caracteres especiais
            masked = word[0] + "".join(["*" if c.isalnum() else c for c in word[1:]])
            masked_words.append(masked)
        else:
            masked_words.append(word)
    masked_name = " ".join(masked_words)
    
    return {
        "masked_name": masked_name,
        "regiao": correct_boss.regiao,
        "raca": correct_boss.raca,
        "tipo": correct_boss.tipo,
        "obrigatorio": "Yes" if correct_boss.obrigatorio else "No"
    }

@app.get("/api/boss/image/{boss_name}")
def get_boss_image(boss_name: str):
    import urllib.request
    import urllib.parse
    import json
    import ssl
    from fastapi.responses import RedirectResponse
    
    query = urllib.parse.quote(boss_name)
    api_url = f"https://eldenring.fandom.com/api.php?action=query&prop=pageimages&titles={query}&pithumbsize=200&format=json"
    
    try:
        req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, timeout=5, context=context) as response:
            data = json.loads(response.read().decode('utf-8'))
            pages = data.get("query", {}).get("pages", {})
            for page_id, page_data in pages.items():
                if "thumbnail" in page_data:
                    return RedirectResponse(url=page_data["thumbnail"]["source"], status_code=302)
    except Exception as e:
        print(f"Erro ao buscar imagem no Fandom para {boss_name}: {e}")
    
    # Fallback logo
    return RedirectResponse(url="https://static.wikia.nocookie.net/eldenring/images/1/10/Elden_Ring_logo.png/revision/latest/scale-to-width-down/200", status_code=302)
