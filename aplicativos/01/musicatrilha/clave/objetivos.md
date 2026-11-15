# Clave — Objetivos, Vantagens e Aplicação no Ensino Musical

## 🎯 Objetivo geral

O **Clave** é um aplicativo educacional gratuito que ensina música por meio de uma
**trilha gamificada**: o aluno aprende a ler partitura, tocar piano virtual e
desenvolver percepção rítmica enquanto avança por "mundos" temáticos.

O app foi projetado para **escolas, professores de música e alunos autodidatas**,
com foco em:

- **Acessibilidade**: funciona em qualquer navegador, sem instalação
- **Gamificação**: XP, gemas, ofensiva diária, estrelas e níveis
- **Progressão real**: cada música concluída libera a próxima
- **Feedback imediato**: erros mostram exatamente o que revisar
- **Modo professor (Pro)**: turmas, rankings e gestão de alunos

---

## 📚 Objetivos específicos

### 1. Ensinar leitura musical de forma prática
- Partitura interativa com **destaque da nota atual**
- Piano virtual com **teclas mapeadas para o teclado do PC**
- Reprodução de áudio da música para referência auditiva

### 2. Desenvolver percepção rítmica
- **Metrônomo integrado** (som e luz)
- Medição de **precisão rítmica** ao final de cada lição

### 3. Gamificar a aprendizagem
- **XP** por nota acertada (10 XP) e por música concluída (bônus)
- **Gemas** como moeda de recompensa
- **Ofensiva diária** (streak) — constância é recompensada
- **Ranking global** e **ranking por turma**
- **Sistema de níveis** por músicas concluídas com 2+ estrelas

### 4. Empoderar professores
- Criação de **turmas** com código de acesso
- **Modo professor Pro**: cadastrar alunos, ver ranking, acompanhar progresso
- **Compra de músicas para a turma** (distribuição por aluno ou para todos)

### 5. Oferecer conteúdo curado
- Músicas organizadas em **5 mundos temáticos** (Floresta, Fazenda, Cidade, Espaço, Vulcão)
- Dificuldade crescente: Iniciante → Básico → Intermediário → Avançado → Mestre
- Loja de músicas avulsas (compra via PIX)

---

## ✨ Vantagens competitivas

| Vantagem | Descrição |
|---|---|
| **100% gratuito** | Sem mensalidade, sem anúncios, sem coleta de dados sensíveis |
| **Multiplataforma** | Roda em navegador — celular, tablet, PC, PS4 (modo lite) |
| **Sem instalação** | Basta abrir o link e tocar |
| **Acessível** | Design responsivo, fontes grandes, alto contraste |
| **Progressão salva na nuvem** | Firestore (Google) — aluno não perde progresso ao trocar de aparelho |
| **Modo offline parcial** | Cache de músicas + localStorage para progresso local |
| **Integração professor-aluno** | Turmas, ranking, compra coletiva de músicas |
| **Conteúdo em português** | Notas em Dó, Ré, Mi — não em C, D, E |
| **Alinhado à BNCC** | Atende competências de Arte (música) para Ensino Fundamental |
| **Extensível** | Novas músicas via `manifest.json`, novos vídeos via Firestore |

---

## 🎓 Aplicação no ensino musical

### Para o professor em sala de aula
- **Aula invertida**: aluno pratica em casa, professor acompanha ranking
- **Avaliação formativa**: precisão e ritmo medidos automaticamente
- **Diferenciação**: cada aluno avança no seu ritmo
- **Relatórios visuais**: ranking da turma mostra engajamento

### Para o aluno autodidata
- **Autonomia**: feedback imediato sem precisar de professor
- **Motivação**: gamificação mantém o hábito de praticar
- **Progressão clara**: sabe exatamente qual é a próxima música

### Para escolas sem verba para instrumentos
- **Substituto do piano físico** para primeiras lições
- **Complemento** ao ensino tradicional de música
- **Zero custo de hardware** (usa o celular que o aluno já tem)

---

## 🧩 Metodologia pedagógica

O Clave combina 3 abordagens:

1. **Kodály** — uso de sílabas rítmicas e canto antes do instrumento
2. **Orff** — aprendizagem ativa, exploração sonora
3. **Gamificação (Self-Determination Theory)**:
   - **Autonomia**: aluno escolhe quando praticar
   - **Competência**: feedback visual de progresso
   - **Relacionamento**: ranking global e por turma

---

## 📊 Métricas de sucesso (o que medimos)

| Métrica | Como é coletada | Meta |
|---|---|---|
| Músicas concluídas por aluno | Firestore `musicasConcluidas` | 15 em 30 dias |
| Ofensiva (streak) | Firestore `ofensiva` | 7 dias consecutivos |
| Precisão média | `acc` salvo por música | 80%+ |
| Alunos ativos por turma | Firestore `alunos` | 100% |
| Retenção (D7) | `ultimoAcesso` | 40% |

---

## 🚀 Roadmap (curto/médio prazo)

### Curto prazo (concluído)
- [x] Separação do código em módulos (CSS + JS)
- [x] Vídeos tutoriais organizados por tópicos
- [x] Sistema de XP com teto por música
- [x] Sistema de níveis por músicas concluídas
- [x] Piano fixo no rodapé
- [x] Rolagem automática nas lições longas
- [x] Checkbox de notificações por e-mail

### Médio prazo (próximos 3 meses)
- [ ] Modo offline completo (Service Worker + PWA)
- [ ] Gravação de áudio do aluno (comparação com referência)
- [ ] Modo "dueto" (aluno + app tocando juntos)
- [ ] Importação de músicas por ABC (usuário cola o código)
- [ ] Exportação de relatório PDF (professor)

### Longo prazo (6-12 meses)
- [ ] App nativo (Capacitor / PWA instalável)
- [ ] Modo multi-instrumento (violão, flauta)
- [ ] Marketplace de músicas criadas por professores
- [ ] Certificado de conclusão por nível
- [ ] Integração com Google Classroom

---

## 🏫 Casos de uso

### 1. Escola de música
**Prof. Ana** cria uma turma "Violão Iniciante 2026". Cadastra 20 alunos.
Cada aluno entra com código no celular e pratica em casa.
Ana vê o ranking semanal e identifica quem precisa de ajuda.

### 2. ONG em comunidade carente
**ONG Música para Todos** usa o Clave em tablets emprestados.
Alunos aprendem partitura sem precisar de piano físico.
Custo zero de hardware novo.

### 3. Aluno autodidata
**João, 12 anos**, quer aprender piano mas não tem professor.
Abre o Clave, segue a trilha, toca 10 min por dia.
Em 1 mês, conclui as 20 músicas do nível Iniciante.

---

## 📞 Contato

- **Autor:** Prof. Albertino Moura
- **WhatsApp:** +55 71 98679-7547
- **E-mail:** musicanplay3@gmail.com
- **PIX:** 66ed51c1-afa6-4d07-82c6-ab5263143bc5

---

*Documento mantido em [`objetivos.md`](objetivos.md). Última atualização: 2026-11-15.*