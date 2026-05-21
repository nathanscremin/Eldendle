import requests

url = 'http://127.0.0.1:8000/'
try:
    resposta_status = requests.get(url)
    if resposta_status.status_code == 200:
        print(f'CODE [{resposta_status.status_code}] - Connection to the server successful!')
    elif resposta_status.status_code == 404:
        print(f'CODE [{resposta_status.status_code}] - Server not found at address!')
    elif resposta_status.status_code == 500:
        print(f'CODE [{resposta_status.status_code}] - Server failed to process the initial request!')
    else:
        print(f'CODE [{resposta_status.status_code}] - Unknown connection error.')

except requests.exceptions.ConnectionError:
    print(f'CONNECTION FAILED - Could not connect to the server at {url}')
    print('Check the IP address, port, and if the server is online.')
    exit()

try:
    start = requests.post(url + "app/game/start")
    start.raise_for_status() 
    game_id = start.json()['game_id']
    print(f'Game started! Game ID: {game_id}')
except requests.exceptions.RequestException as e:
    print(f'Error starting the game: {e}')
    exit()

def mostrar_lista_bosses():
    try:
        response = requests.get(url + "api/bosses/names")
        if response.status_code == 200:
            boss_names = response.json()
            print("\n--- Elden Ring Boss List ---")
            for name in boss_names:
                print(f"- {name}")
            print("--------------------------------------\n")
        else:
            print(f'CODE [{response.status_code}] - Error fetching the boss list.')
    except requests.exceptions.RequestException as e:
        print(f'Connection error fetching list: {e}')

while True:
    print("What would you like to do?")
    print("1 - Make a guess")
    print("2 - View the boss list")
    print("Q - Quit the game")
    
    escolha = input("Enter your choice (1, 2, or Q): ").strip().upper()
    print(' ') 

    if escolha == '1':
        # Make a guess
        guess_name = input('Which boss is this? ')
        try:
            resposta_nome = requests.post(url + 'api/guess/' + game_id + '/' + guess_name)

            if resposta_nome.status_code == 200:
                resultado = resposta_nome.json()
                acertou = True

                for valor in resultado.values():
                    if valor != 'correct':  
                        acertou = False
                        break

                if acertou:
                    print(' ')
                    print('Congratulations, you won!')
                    print(' ')
                    print("--- Final Details ---")
                    for chave, valor in resultado.items():
                        print(f'{chave}: {valor}')
                    print("------------------------")
                    break 
                else:
                    print("\n--- Guess Hints ---")
                    texto_formatado = ""
                    for chave, valor in resultado.items():
                        texto_formatado += f'{chave}: {valor}\n'
                    print(texto_formatado.strip())
                    print("--------------------------")

            elif resposta_nome.status_code == 404:
                print(f'CODE [{resposta_nome.status_code}] - Boss "{guess_name}" not found in the database!')
            elif resposta_nome.status_code == 500:
                print(f'CODE [{resposta_nome.status_code}] - Server error processing the guess!')
            else:
                print(f'CODE [{resposta_nome.status_code}] - Unknown error submitting guess.')
        
        except requests.exceptions.RequestException as e:
            print(f'Connection error submitting guess: {e}')

    elif escolha == '2':
        mostrar_lista_bosses()

    elif escolha == 'Q' or escolha == 'S':
        print("Thanks for playing!")
        break
    
    else:
        print("Invalid option. Please enter '1', '2', or 'Q'.")
