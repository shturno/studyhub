# Como Usar - StudyHub com Editais

## Início Rápido

### 1. Primeira Vez - Criar Concurso

1. Faça login
2. Vai para Dashboard (vazio)
3. Clica no botão **"Criar Primeiro Concurso"**
4. Preenche os dados:
   - Nome do concurso
   - Instituição
   - Cargo/Posição
   - Data da prova (opcional)
5. Clica **"Criar Concurso"**

✅ Pronto! Concurso criado.

---

### 2. Adicionar Editais

1. Na página **Contests**, encontra o seu concurso
2. Clica no botão **"Detalhes →"**
3. Vai para **Contest Detail Page**
4. No lado esquerdo, clica **"➕ Adicionar Edital"**
5. Preenche:
   - **Título:** Nome do edital (obrigatório)
   - **Descrição:** Resumo do conteúdo (opcional)
   - **Link:** URL do edital (opcional)
6. Clica **"Adicionar Edital"**

✅ Edital adicionado!

#### Adicion múltiplos editais:
- Repete os passos acima quantas vezes precisar
- Cada edital novo aparece na lista

---

### 3. Ver Análise de Conteúdo (Cruzamentos)

Quando você adiciona **2 ou mais editais**, o sistema automaticamente:

1. Analisa qual conteúdo aparece em múltiplos editais
2. Calcula a **relevância** (quanto aparecem em comum)
3. Mostra na seção **"Análise de Conteúdo"**

**O que você vê:**
- ⚡ Tópicos com alta relevância (aparecem em múltiplos editais)
- 📊 Percentual de relevância
- 🏷️ Quantos editais contêm aquele tópico

**Exemplo:**
```
⚡ Matemática Financeira
   3 editais • 85% relevância
   → Foque neste tópico! (aparece em 3 de 3 editais)

⚡ Português
   2 editais • 60% relevância
   → Importante (aparece em 2 editais)
```

✅ Use isso para priorizar seus estudos!

---

### 4. Gerar Cronograma com IA

1. Vai para **Planner** (no menu lateral)
2. Clica no botão **"🧠 IA Cronograma"** (topo direito)
3. Preenche:
   - **Data da Prova:** Quando é o concurso?
   - **Horas por Semana:** Quantas horas quer estudar?
4. Clica **"Gerar Cronograma"**
5. Vê a **prévia** com:
   - Semanas de estudo
   - Horas por disciplina
   - Dicas de estudo

6. Clica **"Importar"** para adicionar ao planner

✅ Cronograma criado automaticamente!

---

### 5. Estudar - Planner

1. Vê as **disciplinas e lições** disponíveis (lado esquerdo)
2. **Arrastra as lições** para os dias da semana
3. Cria um cronograma visual
4. Clica em uma lição para:
   - Iniciar estudo (timer Pomodoro)
   - Ver materiais
   - Marcar como feita

---

## Funcionalidades Principais

### Dashboard
- **Empty State:** Quando não tem concursos, mostra mensagem com CTA
- **Stats:** Mostra XP, nível, estudos recentes
- **Random Topic:** Sugere um tópico aleatório para estudar

### Contests
- **Lista de Concursos:** Todos os seus concursos
- **Botão Detalhes:** Vai para página de gerenciamento
- **Botão Deletar:** Remove concurso (hover)
- **Badge "Foco Principal":** Marca concurso prioritário

### Contest Detail
- **Header:** Informações do concurso
- **Stats:** Data, disciplinas, tópicos, editais
- **Editorial Manager:** Adicionar/remover editais
- **Content Crossing:** Analisa tópicos comuns
- **Disciplinas:** Lista todas as disciplinas e tópicos

### Planner
- **Drag & Drop:** Arrasta lições para os dias
- **AI Cronograma:** Gera automaticamente com Gemini
- **Timer:** Inicia sessão de estudo com Pomodoro

---

## Dicas de Uso

### Para Máximo Proveito:

1. **Adicione múltiplos editais** → Sistema faz análise automática
2. **Veja o "Análise de Conteúdo"** → Identifique prioridades
3. **Use "IA Cronograma"** → Otimiza tempo de estudo
4. **Arraste lições no planner** → Organize visualmente
5. **Use timer Pomodoro** → Estude em blocos de 25 min

### Fluxo Ideal:

```
1. Login
   ↓
2. Criar Concurso
   ↓
3. Adicionar Editais (2+)
   ↓
4. Ver Análise de Conteúdo
   ↓
5. Gerar Cronograma com IA
   ↓
6. Estudar com Planner
   ↓
7. Acompanhar Progresso
```

---

## Troubleshooting

### Problema: Botão "Detalhes" não aparece

**Solução:** Atualize a página (F5) ou aguarde o carregamento.

### Problema: Não consigo adicionar edital

**Solução:** 
- Certifique-se que você está na página correta (Contest Detail)
- Clique no botão "Adicionar Edital"
- Preencheu o título (obrigatório)?

### Problema: IA Cronograma não funciona

**Solução:**
- Adicione pelo menos 1 edital primeiro
- Preencheu a data da prova?
- Preencheu as horas por semana?
- Aguarde a resposta da IA (pode levar alguns segundos)

### Problema: Cruzamentos não aparecem

**Solução:**
- Você adicionou pelo menos 2 editais?
- Esperou o carregamento da análise?
- Mapeou o conteúdo dos editais?

---

## Atalhos & Buttons

| Botão | Localização | Ação |
|-------|------------|------|
| Criar Primeiro Concurso | Dashboard (vazio) | Vai para Contests |
| Detalhes → | Contest Card | Vai para Contest Detail |
| Foco Principal | Contest Card | Marca concurso prioritário |
| ➕ Adicionar Edital | Contest Detail | Abre dialog |
| 🧠 IA Cronograma | Planner | Gera cronograma com IA |
| ➕ Nova Sessão | Planner | Cria sessão manual |
| 🗑️ Deletar | Contest/Edital | Remove o item |

---

## Integração com IA (Gemini)

O sistema usa **Gemini 1.5 Flash** para:

1. **Analisar** seus editais
2. **Identificar** tópicos prioritários (cruzamentos)
3. **Gerar** cronogramas otimizados
4. **Sugerir** estratégias de estudo

**Tudo acontece automaticamente!**

---

## Próximas Features (Roadmap)

- [ ] Mapeamento visual de conteúdo (qual edital contém qual tópico)
- [ ] Análise de coverage (% do conteúdo coberto)
- [ ] Histórico de gerações de cronogramas
- [ ] Personalização de preferências
- [ ] Exportar cronograma (PDF/Excel)
- [ ] Compartilhar concursos com amigos

---

## Suporte

Se algo não funcionar:

1. Atualize a página (F5)
2. Limpe o cache (Ctrl+Shift+Del)
3. Faça logout e login novamente
4. Verifique se tem internet

**Tudo funcionando agora? 🎉**
