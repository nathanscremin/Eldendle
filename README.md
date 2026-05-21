# Eldendle - Elden Ring Boss Guessing Game

**Eldendle** é um jogo de navegador focado no universo de **Elden Ring**, inspirado na febre do "Wordle" e jogos do tipo ".dle". O objetivo do jogador é adivinhar o chefe (boss) secreto usando as dicas visuais e de atributos que o jogo fornece a cada tentativa.

---

## ✨ Modos de Jogo

O jogo agora conta com uma interface dividida em dois jogos principais, acessíveis via abas no topo:

### 📜 Classic Wordle
Neste modo, você digita o nome de um chefe e recebe de volta uma linha de tabela colorida comparando os atributos do chefe que você chutou com os atributos do chefe secreto:
* **Verde (Correct):** Atributo idêntico.
* **Vermelho (Incorrect):** Atributo diferente.
* **Laranja (Partial):** Usado na Região. Significa que o boss está na mesma região maior, mas em um local específico diferente.
* **Setas (🔼/🔽):** Indicam se o valor numérico (Fase ou Runas) é maior ou menor.

### 🗿 Emoji Guess (Parte 2)
Um modo misterioso onde a tabela de atributos não te ajuda! 
A cada vez que você erra o chefe, um novo emoji (de um total de 5) é revelado na tela. Estes emojis representam dicas visuais cruciais sobre a lore, raça, tipo ou região do chefe. Você tem 5 tentativas!

### ⏳ Modos Diário e Infinito
Ambos os jogos oferecem duas opções de desafio:
* **👑 Daily Challenge:** Todo mundo no mundo inteiro joga exatamente o mesmo Boss (baseado na data do dia). Se você ganhar ou perder, fica travado até amanhã! (Salvo via `localStorage`).
* **⚔️ Endless Mode:** Jogue livremente, reinicie quantas vezes quiser. Bosses totalmente aleatórios para treinar.

---

## 💻 Arquitetura (100% Static / Frontend)

O projeto foi **completamente refatorado** para não necessitar de servidor!

Originalmente, o Eldendle rodava com um backend Python FastAPI. Porém, para viabilizar a hospedagem gratuita e velocidade instantânea, todo o banco de dados (mais de 160 chefes) e a lógica de validação foram movidos para o Javascript cliente.
Isso significa que:
* **Não requer backend, Python ou servidor.**
* Pode ser rodado simplesmente abrindo o `index.html` em qualquer navegador.
* Totalmente compatível com **GitHub Pages** e Vercel.

---

## 🚀 Como Rodar e Hospedar

### Rodando Localmente
1. Baixe os arquivos do repositório ou clone via git:
   ```bash
   git clone https://github.com/nathanscremin/elden-rindle_api.git
   ```
2. Dê um clique duplo no arquivo `index.html`.
3. Pronto! O jogo funcionará 100% no seu navegador.

### Hospedando no GitHub Pages
Como o projeto é apenas HTML, CSS e JS:
1. Faça o fork/push para seu repositório no GitHub.
2. Vá na aba **Settings** do repositório > **Pages**.
3. Em "Source", selecione **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/ (root)`.
5. Salve! O GitHub construirá seu site e o deixará online gratuitamente.

---

## 🧾 Licença & Créditos
Projeto inicialmente desenvolvido como entrega acadêmica para a disciplina de Programação de Scripts da Fatec Rio Claro, e posteriormente refatorado para uma SPA completa.
Dados de Bosses obtidos com base nas wikis de Elden Ring.
