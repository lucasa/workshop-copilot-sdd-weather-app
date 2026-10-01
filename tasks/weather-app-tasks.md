# Backlog de Tarefas: Aplicação de Previsão do Tempo

Tarefas derivadas de `plans/weather-app-plan.md`. A numeração indica a ordem
preferencial de entrega; uma tarefa só deve começar quando suas dependências
estiverem concluídas.

Os IDs são identificadores estáveis; a posição física das tarefas indica a
ordem de implementação quando a numeração não acompanha uma dependência
reorganizada.

## Entrega 1 — Fundação e contratos

### T-01 — Definir os tipos do domínio meteorológico
- **Tipo:** Data
- **Descrição:** Criar os contratos compartilhados para unidade, cidade, clima atual, dia de previsão e dados meteorológicos.
- **Critérios de aceite:** `Unit` aceita somente `celsius` e `fahrenheit`; os quatro modelos refletem o plano; campos que podem faltar são opcionais; o projeto compila em TypeScript strict.
- **Dependências:** —
- **Arquivos prováveis:** `src/types/weather.ts`

### T-02 — Implementar conversão de temperatura
- **Tipo:** Data
- **Descrição:** Criar função pura para converter Celsius em Fahrenheit e manter Celsius sem conversão.
- **Critérios de aceite:** `0 °C` resulta em `32 °F`; valores negativos e decimais são tratados; campos ausentes não viram zero; a função não depende de React ou rede.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/temperature.ts`

### T-03 — Implementar formatação de temperatura
- **Tipo:** Data
- **Descrição:** Criar função pura para arredondar e exibir valor e símbolo da unidade selecionada.
- **Critérios de aceite:** Celsius exibe `°C` e Fahrenheit exibe `°F`; o mesmo valor produz o mesmo resultado em chamadas repetidas; valor indisponível mantém uma representação explícita sem inventar dados.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/lib/temperature.ts`

### T-04 — Mapear códigos WMO para apresentação
- **Tipo:** Data
- **Descrição:** Criar o mapeamento dos códigos meteorológicos da Open-Meteo para rótulos em pt-BR.
- **Critérios de aceite:** códigos principais têm rótulo; código desconhecido possui fallback; o mapeamento é uma função/estrutura pura.
- **Dependências:** —
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`

### T-05 — Normalizar texto de localidades
- **Tipo:** Data
- **Descrição:** Criar função para comparar estado/região ignorando caixa e acentos.
- **Critérios de aceite:** textos equivalentes são comparados como iguais; caracteres especiais são preservados na exibição; a função não altera o nome original da cidade.
- **Dependências:** —
- **Arquivos prováveis:** `src/lib/format.ts`

### T-06 — Formatar datas da previsão
- **Tipo:** Data
- **Descrição:** Criar função para apresentar datas `YYYY-MM-DD` em pt-BR usando a data local retornada pela API.
- **Critérios de aceite:** a data é formatada sem deslocamento causado pelo fuso do dispositivo; o primeiro e o segundo períodos podem receber rótulos de hoje e amanhã; entradas inválidas têm fallback seguro.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/format.ts`

## Entrega 2 — Acesso a dados

### T-08 — Montar requisição de geocodificação
- **Tipo:** Data
- **Descrição:** Criar a chamada Open-Meteo para buscar localidades por nome, com parâmetros codificados.
- **Critérios de aceite:** usa `URLSearchParams`, `count`, `language` e `format`; nome e caracteres especiais são codificados; falha HTTP não é tratada como sucesso.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/weatherService.ts`

### T-09 — Mapear e filtrar resultados de geocodificação
- **Tipo:** Data
- **Descrição:** Transformar resultados externos em `City[]` e filtrar estado/região localmente quando informado.
- **Critérios de aceite:** campos obrigatórios são mapeados; campos opcionais permanecem ausentes; `results` ausente ou vazio vira lista vazia; o filtro tolera caixa e acentos; homônimos permanecem distinguíveis.
- **Dependências:** T-01, T-05, T-08
- **Arquivos prováveis:** `src/services/weatherService.ts`

### T-10 — Montar requisição de forecast
- **Tipo:** Data
- **Descrição:** Criar a chamada Open-Meteo por latitude e longitude com variáveis atuais, diárias e cinco dias.
- **Critérios de aceite:** usa `timezone=auto`, `temperature_unit=celsius`, `forecast_days=5`, `current` e `daily`; coordenadas são enviadas corretamente; resposta HTTP inválida gera erro tratável.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/weatherService.ts`

### T-11 — Mapear resposta de forecast
- **Tipo:** Data
- **Descrição:** Transformar `current` e `daily` em `WeatherData` associado à `City` selecionada.
- **Critérios de aceite:** campos atuais são mapeados; arrays diários são pareados por índice; dias recebidos são preservados; campos ausentes permanecem opcionais; a cidade associada é a cidade recebida como argumento.
- **Dependências:** T-01, T-04, T-06, T-10
- **Arquivos prováveis:** `src/services/weatherService.ts`

### T-12 — Centralizar timeout e cancelamento dos serviços
- **Tipo:** Data
- **Descrição:** Adicionar `AbortController`, timeout configurável e distinção entre cancelamento esperado e falha recuperável.
- **Critérios de aceite:** timeout inicial de 10 segundos encerra o loading; abort por operação mais recente não cria alerta; falha de rede, JSON inválido e shape incompatível produzem erro tratável; retry pode repetir a chamada.
- **Dependências:** T-08, T-10
- **Arquivos prováveis:** `src/services/weatherService.ts`

## Entrega 3 — Orquestração de estado

### T-13 — Definir máquina de estados do `useWeather`
- **Tipo:** Data
- **Descrição:** Criar a estrutura de estado e as ações públicas do hook de clima.
- **Critérios de aceite:** estados `idle`, `loading`, `success`, `empty` e `error` identificam a operação; tipos impedem combinações inválidas; erro e retry carregam o contexto necessário.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-14 — Orquestrar busca e seleção de cidade
- **Tipo:** Data
- **Descrição:** Implementar no hook a validação local, debounce, sugestões e seleção da cidade.
- **Critérios de aceite:** entrada em branco não chama serviço; busca válida chama geocoding após debounce; lista vazia vira `empty`; seleção preserva a cidade e inicia a operação de forecast.
- **Dependências:** T-09, T-13
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-15 — Orquestrar forecast, retry e respostas obsoletas
- **Tipo:** Data
- **Descrição:** Completar o hook com consulta meteorológica, retry e invalidação de operações anteriores.
- **Critérios de aceite:** forecast concluído vira `success`; erro preserva a cidade para retry; seleção nova invalida resposta anterior; forecast antigo não é apresentado como pertencente à cidade atual.
- **Dependências:** T-11, T-12, T-13, T-14
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-07 — Implementar preferência de unidade local
- **Tipo:** Data
- **Descrição:** Criar o hook que inicializa, altera e persiste a unidade em `localStorage`.
- **Critérios de aceite:** Celsius é o padrão; somente unidades válidas são restauradas; armazenamento indisponível não interrompe a aplicação; cidade e dados não são persistidos; alterar a unidade não chama `weatherService`.
- **Dependências:** T-01, T-13
- **Arquivos prováveis:** `src/hooks/useUnitPreference.ts`

## Entrega 4 — Interface principal

### T-16 — Criar estado visual de carregamento
- **Tipo:** UI
- **Descrição:** Criar o componente acessível para carregamento de busca ou forecast.
- **Critérios de aceite:** mensagem em pt-BR identifica `search` ou `weather`; possui nome acessível; o componente mantém busca e retry montáveis no fluxo.
- **Dependências:** T-13
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`

### T-17 — Criar estados visuais vazio e erro
- **Tipo:** UI
- **Descrição:** Criar componentes separados para nenhum resultado e erro recuperável.
- **Critérios de aceite:** estado vazio informa que nenhuma cidade foi encontrada; estado de erro informa indisponibilidade e oferece retry; ambos são acessíveis e mantêm a busca utilizável.
- **Dependências:** T-12, T-13
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`, `src/components/states/ErrorState.tsx`

### T-18 — Criar apresentação de valor indisponível
- **Tipo:** UI
- **Descrição:** Criar componente ou helper visual para indicar campos meteorológicos ausentes.
- **Critérios de aceite:** ausência é identificada em pt-BR; nenhum campo ausente recebe zero ou texto de dado confirmado; o componente pode ser usado no clima atual e na previsão.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/components/states/UnavailableValue.tsx`

### T-19 — Implementar campo de busca
- **Tipo:** UI
- **Descrição:** Criar `SearchBar` com cidade, estado, submit e validação acessível.
- **Critérios de aceite:** campos têm labels ou nomes acessíveis; submit encaminha valores; entrada só com espaços é bloqueada localmente; controles funcionam por teclado.
- **Dependências:** T-14, T-16, T-17
- **Arquivos prováveis:** `src/components/SearchBar.tsx`

### T-20 — Implementar lista de sugestões
- **Tipo:** UI
- **Descrição:** Criar `CitySuggestions` para exibir e selecionar localidades retornadas.
- **Critérios de aceite:** cada item exibe cidade, estado/região e país quando disponíveis; itens são selecionáveis por teclado e ponteiro; seleção chama o callback da cidade correta; lista possui semântica acessível.
- **Dependências:** T-01, T-19
- **Arquivos prováveis:** `src/components/CitySuggestions.tsx`

### T-21 — Exibir clima atual
- **Tipo:** UI
- **Descrição:** Criar o componente de condições atuais com valores normalizados e unidade derivada.
- **Critérios de aceite:** cidade, temperatura, unidade e condição são identificáveis; sensação térmica, umidade e vento aparecem quando disponíveis; campos ausentes usam T-18; nenhum clima aparece sem cidade selecionada.
- **Dependências:** T-02, T-03, T-04, T-18
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`

### T-22 — Criar cartão de um dia de previsão
- **Tipo:** UI
- **Descrição:** Criar `ForecastDay` para renderizar um único período diário.
- **Critérios de aceite:** mostra data, mín/máx e condição; precipitação aparece quando disponível; temperaturas usam a unidade ativa; campos ausentes usam T-18.
- **Dependências:** T-02, T-03, T-04, T-06, T-18
- **Arquivos prováveis:** `src/components/ForecastDay.tsx`

### T-23 — Criar lista responsiva de previsão
- **Tipo:** UI
- **Descrição:** Criar `ForecastList` para compor os cartões recebidos e identificar a cidade.
- **Critérios de aceite:** renderiza os cinco períodos recebidos; cada item permanece associado à cidade selecionada; layout é utilizável em mobile e desktop; lista vazia não inventa dias.
- **Dependências:** T-22
- **Arquivos prováveis:** `src/components/ForecastList.tsx`

### T-24 — Implementar seletor de unidade
- **Tipo:** UI
- **Descrição:** Criar `UnitToggle` e conectá-lo ao hook de preferência.
- **Critérios de aceite:** é operável por teclado; unidade ativa é anunciada; alternância atualiza todos os valores sem novo request; `0 °C` vira `32 °F`; preferência é restaurada após recarga.
- **Dependências:** T-03, T-07, T-21, T-23
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`

### T-25 — Compor o fluxo principal no `App`
- **Tipo:** UI
- **Descrição:** Conectar hooks e componentes em uma tela, sem mover regras de domínio para o componente raiz.
- **Critérios de aceite:** fluxo busca → sugestão → seleção → forecast funciona; estados são exibidos no contexto correto; App apenas conecta props e callbacks; forecast antigo é ocultado durante nova seleção.
- **Dependências:** T-15, T-16, T-17, T-19, T-20, T-21, T-23, T-24
- **Arquivos prováveis:** `src/App.tsx`

### T-26 — Aplicar layout e estilos responsivos
- **Tipo:** UI
- **Descrição:** Ajustar o layout da tela e componentes para mobile e desktop conforme a stack Tailwind.
- **Critérios de aceite:** busca, sugestões, dados atuais, cinco dias e seletor permanecem utilizáveis em viewport mobile e desktop; não há sobreposição nem controle fora da tela; foco visível e textos em pt-BR são preservados.
- **Dependências:** T-25
- **Arquivos prováveis:** `src/index.css`, `src/App.tsx`

## Entrega 5 — Testes automatizados

### T-27 — Testar conversão e formatação de temperatura
- **Tipo:** Test
- **Descrição:** Cobrir conversão, arredondamento, símbolos e valores ausentes.
- **Critérios de aceite:** testes verificam `0 °C = 32 °F`, valores negativos, decimais, unidades e indisponibilidade sem rede ou DOM.
- **Dependências:** T-02, T-03
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`

### T-28 — Testar códigos WMO, localidades e datas
- **Tipo:** Test
- **Descrição:** Cobrir mapeamento de códigos, normalização de estados e datas da previsão.
- **Critérios de aceite:** há casos para código desconhecido, acentos, caixa, datas locais e entradas inválidas; testes são determinísticos.
- **Dependências:** T-04, T-05, T-06
- **Arquivos prováveis:** `tests/unit/lib/weatherCodes.test.ts`, `tests/unit/lib/format.test.ts`

### T-29 — Testar geocodificação com fetch simulado
- **Tipo:** Test
- **Descrição:** Validar URL, mapeamento, filtro de estado, homônimos e lista vazia.
- **Critérios de aceite:** mocks cobrem sucesso, caracteres especiais, campos opcionais, resultados vazios e resposta HTTP inválida; nenhum teste usa a Open-Meteo real.
- **Dependências:** T-08, T-09
- **Arquivos prováveis:** `tests/unit/services/geocoding.test.ts`, `tests/fixtures/weather.ts`

### T-30 — Testar forecast e falhas de serviço
- **Tipo:** Test
- **Descrição:** Validar parâmetros, mapeamento diário, resposta parcial, timeout, abort e falha de rede.
- **Critérios de aceite:** mocks confirmam cinco dias, associação à cidade, campos ausentes, JSON/shape inválido e distinção entre cancelamento e erro recuperável.
- **Dependências:** T-10, T-11, T-12
- **Arquivos prováveis:** `tests/unit/services/forecast.test.ts`, `tests/fixtures/weather.ts`

### T-31 — Testar ciclo do `useWeather`
- **Tipo:** Test
- **Descrição:** Verificar estados, debounce, seleção, retry e respostas fora de ordem do hook.
- **Critérios de aceite:** testes cobrem `idle`, `loading`, `success`, `empty` e `error`; entrada vazia não chama serviço; retry repete a operação; resposta antiga não substitui a cidade atual.
- **Dependências:** T-14, T-15
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`

### T-32 — Testar preferência de unidade
- **Tipo:** Test
- **Descrição:** Testar restauração, alteração e persistência da unidade no navegador.
- **Critérios de aceite:** localStorage válido, inválido e bloqueado são cobertos; Celsius é o fallback; alterar a unidade não chama serviço externo.
- **Dependências:** T-07
- **Arquivos prováveis:** `tests/unit/hooks/useUnitPreference.test.ts`

### T-33 — Testar componentes isolados
- **Tipo:** Test
- **Descrição:** Verificar estados visuais, sugestões, valores indisponíveis, clima atual, previsão e seletor.
- **Critérios de aceite:** loading, vazio e erro são renderizados; teclado nas sugestões funciona; campos ausentes são indicados; toggle converte todos os valores sem rede.
- **Dependências:** T-16, T-17, T-18, T-19, T-20, T-21, T-22, T-24
- **Arquivos prováveis:** `tests/unit/components/states.test.tsx`, `tests/unit/components/weather.test.tsx`

### T-34 — Testar fluxo E2E principal
- **Tipo:** Test
- **Descrição:** Cobrir busca, seleção, clima atual, cinco dias e alternância de unidade com Playwright em desktop e mobile.
- **Critérios de aceite:** `page.route` intercepta APIs; o fluxo confirma cidade, clima e exatamente cinco períodos; alternância não faz nova consulta; o mesmo fluxo passa em viewport desktop e mobile; execução é determinística.
- **Dependências:** T-25, T-26
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `tests/fixtures/*`

### T-35 — Testar E2E de falhas, persistência e viewports
- **Tipo:** Test
- **Descrição:** Cobrir homônimos, sem resultados, erro recuperável, recarga e viewport mobile/desktop.
- **Critérios de aceite:** os cenários exibem mensagens corretas; unidade sobrevive à recarga; controles principais permanecem acessíveis nos dois viewports; não há dependência de serviços externos.
- **Dependências:** T-34
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`

## Entrega 6 — Hardening e entrega

### T-36 — Revisar acessibilidade e foco
- **Tipo:** UI
- **Descrição:** Fazer a revisão final de roles, nomes, ordem de teclado, foco visível e mensagens anunciadas.
- **Critérios de aceite:** busca, sugestões, retry e unidade têm nomes acessíveis; fluxo principal funciona sem ponteiro; foco não fica perdido após loading, erro ou seleção.
- **Dependências:** T-26, T-33, T-35
- **Arquivos prováveis:** `src/components/*`, `src/App.tsx`

### T-37 — Executar qualidade estática do projeto
- **Tipo:** Infra
- **Descrição:** Executar lint e build após o hardening, corrigindo apenas problemas relacionados ao fluxo.
- **Critérios de aceite:** `pnpm lint` e `pnpm build` passam; o TypeScript strict permanece válido; nenhuma credencial é adicionada.
- **Dependências:** T-26, T-36
- **Arquivos prováveis:** `biome.json`, `package.json`

### T-38 — Executar a suíte de testes do projeto
- **Tipo:** Test
- **Descrição:** Rodar testes unitários e E2E determinísticos após a implementação e a revisão visual.
- **Critérios de aceite:** `pnpm test` passa; `pnpm test:e2e` usa somente fixtures e interceptações locais; falhas são reproduzíveis e não dependem da Open-Meteo real.
- **Dependências:** T-27, T-28, T-29, T-30, T-31, T-32, T-33, T-35, T-37
- **Arquivos prováveis:** `tests/*`

## Rastreabilidade por requisito funcional

| Requisito da spec | Tarefas que implementam ou verificam | Lacuna |
| --- | --- | --- |
| RF-01 — Buscar cidades | T-08, T-09, T-14, T-19, T-29, T-31, T-34 | Nenhuma |
| RF-02 — Sugerir resultados | T-09, T-14, T-20, T-31, T-34 | Nenhuma |
| RF-03 — Diferenciar cidades homônimas | T-09, T-20, T-29, T-34 | Nenhuma |
| RF-04 — Consultar clima atual | T-10, T-11, T-15, T-21, T-25, T-30, T-34 | Nenhuma |
| RF-05 — Consultar previsão de cinco dias | T-10, T-11, T-22, T-23, T-25, T-30, T-34 | Nenhuma |
| RF-06 — Alternar unidade | T-02, T-03, T-21, T-22, T-24, T-27, T-33, T-34 | Nenhuma |
| RF-07 — Persistir unidade escolhida | T-07, T-24, T-32, T-34 | Nenhuma |
| RF-08 — Informar falhas e ausência de resultados | T-12, T-15, T-17, T-18, T-30, T-31, T-33, T-35 | Nenhuma |

Todos os requisitos funcionais RF-01 a RF-08 possuem tarefas de implementação
e pelo menos uma tarefa de teste. Os requisitos não funcionais são cobertos
principalmente por T-07, T-19, T-24, T-26, T-33, T-34, T-35, T-36, T-37 e T-38.

## Prioridade e tamanho relativo

Prioridade: **P0** é necessária para o fluxo principal; **P1** é necessária
para completar qualidade, resiliência e validação do MVP; **P2** fica para
polimento ou evolução posterior. Tamanho: **S** (pequena), **M** (média) e
**G** (grande), considerando implementação e validação da tarefa.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | S |
| T-02 | P0 | S |
| T-03 | P1 | S |
| T-04 | P1 | S |
| T-05 | P0 | S |
| T-06 | P1 | S |
| T-08 | P0 | M |
| T-09 | P0 | M |
| T-10 | P0 | M |
| T-11 | P0 | M |
| T-12 | P1 | M |
| T-13 | P0 | S |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-07 | P1 | S |
| T-16 | P1 | S |
| T-17 | P1 | S |
| T-18 | P1 | S |
| T-19 | P0 | S |
| T-20 | P0 | S |
| T-21 | P0 | M |
| T-22 | P0 | M |
| T-23 | P0 | S |
| T-24 | P0 | S |
| T-25 | P0 | M |
| T-26 | P1 | M |
| T-27 | P1 | S |
| T-28 | P1 | S |
| T-29 | P1 | M |
| T-30 | P1 | M |
| T-31 | P1 | M |
| T-32 | P1 | S |
| T-33 | P1 | M |
| T-34 | P1 | M |
| T-35 | P1 | M |
| T-36 | P1 | M |
| T-37 | P1 | S |
| T-38 | P1 | M |

Não há tarefas P2 no MVP atual: todas as tarefas listadas são necessárias para
o escopo definido ou para sua validação. Novos refinamentos visuais e metas de
performance podem ser classificados como P2 depois das perguntas em aberto da
spec serem decididas.

## Sequência sugerida de fatias verticais

As fatias abaixo entregam comportamento observável de ponta a ponta; tarefas
da mesma fatia podem ser implementadas em paralelo quando suas dependências
permitirem.

1. **Busca e seleção:** T-01, T-05, T-08, T-09, T-13, T-14, T-16, T-17, T-19 e T-20. Entrega entrada acessível, sugestões, estado vazio e seleção de uma cidade.
2. **Clima atual:** T-02, T-03, T-04, T-06, T-10, T-11, T-12, T-15, T-18 e T-21. Entrega uma cidade selecionada com clima atual, condição e tratamento de falhas.
3. **Previsão e unidade:** T-22, T-23, T-07, T-24 e T-25. Entrega a composição visível da busca, clima atual, cinco períodos, alternância C/F e persistência local.
4. **Responsividade:** T-26. Entrega o uso da aplicação em mobile e desktop sem sobreposição ou perda de controles.
5. **Confiança de entrega:** T-27 a T-35. Cobre funções, services com fetch simulado, hooks, componentes, fluxo E2E principal e cenários de falha.
6. **Hardening:** T-36, T-37 e T-38. Fecha acessibilidade, lint, build, testes unitários e E2E.