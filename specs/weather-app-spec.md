# Especificação de Produto: Aplicação de Previsão do Tempo

## Overview

O produto é uma aplicação responsiva para consultar as condições meteorológicas de uma cidade. A pessoa usuária pesquisa pelo nome da cidade e estado, escolhe um resultado, consulta o clima atual e uma previsão diária de cinco dias (hoje e os quatro dias seguintes) e alterna entre Celsius e Fahrenheit.

A interface será em pt-BR e usará a Open-Meteo como fonte de dados, sem exigir chave de API. A unidade inicial será Celsius. Não haverá autenticação nem persistência de dados no servidor; a preferência de unidade será armazenada localmente no navegador.

O discovery não define personas nomeadas. Portanto, esta especificação usa a persona genérica **usuário**, sem presumir necessidades de segmentos diferentes.

## Functional Requirements

- **RF-01 — Buscar cidades:** permitir informar o nome de uma cidade e seu estado para iniciar uma busca.
- **RF-02 — Sugerir resultados:** apresentar sugestões correspondentes enquanto a pessoa usuária informa a busca.
- **RF-03 — Diferenciar cidades homônimas:** identificar cada sugestão pelo menos pelo nome da cidade e estado, permitindo selecionar a localidade correta.
- **RF-04 — Consultar clima atual:** depois da seleção de uma cidade, apresentar sua temperatura atual e suas condições climáticas.
- **RF-05 — Consultar previsão de cinco dias:** depois da seleção, apresentar previsão diária para hoje e os quatro dias seguintes, associada à cidade escolhida.
- **RF-06 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit e atualizar todos os valores de temperatura exibidos.
- **RF-07 — Persistir unidade escolhida:** preservar localmente a unidade escolhida depois de recarregar a aplicação e em uma nova sessão no mesmo navegador.
- **RF-08 — Informar falhas e ausência de resultados:** apresentar um aviso quando uma busca não encontrar cidade ou quando os dados meteorológicos estiverem indisponíveis. Em respostas parciais, indicar quais dados não estão disponíveis sem inventar valores.

## User Stories

- **US-01:** Como usuário, quero buscar uma cidade pelo nome e estado e receber sugestões identificáveis para escolher a localidade correta. (RF-01, RF-02, RF-03)
- **US-02:** Como usuário, quero consultar a temperatura e as condições climáticas atuais da cidade selecionada para entender o tempo neste momento. (RF-04)
- **US-03:** Como usuário, quero consultar a previsão de hoje e dos quatro dias seguintes para planejar minhas atividades. (RF-05)
- **US-04:** Como usuário, quero alternar entre Celsius e Fahrenheit para consultar as temperaturas na unidade que prefiro. (RF-06)
- **US-05:** Como usuário, quero que minha unidade preferida seja mantida entre visitas no mesmo navegador para não precisar selecioná-la novamente. (RF-07)
- **US-06:** Como usuário, quero receber um aviso claro quando não houver resultados ou os dados estiverem indisponíveis para entender por que a consulta não foi concluída. (RF-08)

## Traceability Matrix

Os critérios podem atender a mais de uma story quando validam comportamentos compartilhados. Os RNFs listados são os aplicáveis a cada fluxo.

| User Story | Functional Requirements | Acceptance Criteria | Relevant Non-Functional Requirements |
| --- | --- | --- | --- |
| US-01 — Buscar e identificar cidades | RF-01, RF-02, RF-03 | AC-01.1, AC-01.2, AC-02.1, AC-02.2, AC-03.1, AC-03.2, AC-08.1 | RNF-01, RNF-04, RNF-05, RNF-06 |
| US-02 — Consultar clima atual | RF-04 | AC-04.1, AC-04.2, AC-06.1, AC-06.2, AC-08.2, AC-08.3 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06 |
| US-03 — Consultar previsão de cinco dias | RF-05 | AC-05.1, AC-05.2, AC-05.3, AC-06.1, AC-06.2, AC-08.2, AC-08.3 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06 |
| US-04 — Alternar unidade | RF-06 | AC-06.1, AC-06.2, AC-06.3, AC-07.2, AC-07.3 | RNF-01, RNF-02, RNF-04, RNF-05, RNF-07 |
| US-05 — Persistir unidade | RF-07 | AC-07.1, AC-07.2, AC-07.3 | RNF-01, RNF-04, RNF-05, RNF-07 |
| US-06 — Entender falhas e ausência de dados | RF-08 | AC-08.1, AC-08.2, AC-08.3 | RNF-01, RNF-04, RNF-05, RNF-06 |

## Acceptance Criteria

Os critérios abaixo são verificáveis e organizados por requisito funcional. Cada requisito RF-01 a RF-08 tem pelo menos um critério associado.

### RF-01 — Buscar cidades

- **AC-01.1** — Given que a aplicação está aberta, When o usuário informa um nome de cidade e um estado e inicia a busca, Then a aplicação envia uma consulta de geocodificação contendo os dois valores.
- **AC-01.2** — Given que o campo de busca contém apenas espaços em branco, When o usuário tenta iniciar a busca, Then nenhuma consulta é enviada e a aplicação solicita uma busca válida.

### RF-02 — Sugerir resultados

- **AC-02.1** — Given que o usuário informa um nome de cidade e a geocodificação retorna uma ou mais correspondências, When os resultados chegam, Then a aplicação exibe as correspondências como sugestões selecionáveis antes da consulta meteorológica.
- **AC-02.2** — Given que há sugestões visíveis, When o usuário seleciona uma sugestão, Then a aplicação usa a localidade selecionada como destino da consulta meteorológica.

### RF-03 — Diferenciar cidades homonimas

- **AC-03.1** — Given que a busca retorna cidades com o mesmo nome em estados diferentes, When as sugestões são exibidas, Then cada sugestão mostra o estado correspondente junto ao nome da cidade.
- **AC-03.2** — Given que existem duas sugestões com o mesmo nome de cidade, When o usuário seleciona a sugestão de um estado, Then o clima atual e a previsão solicitados correspondem ao estado selecionado.

### RF-04 — Consultar clima atual

- **AC-04.1** — Given que uma cidade foi selecionada e a resposta atual está disponível, When os dados meteorológicos carregam, Then a aplicação exibe a cidade selecionada, a temperatura atual, sua unidade e as condições climáticas retornadas pela fonte.
- **AC-04.2** — Given que não existe uma cidade selecionada, When a aplicação é aberta, Then nenhum dado meteorológico é apresentado como se pertencesse a uma cidade.

### RF-05 — Consultar previsao de cinco dias

- **AC-05.1** — Given que uma cidade foi selecionada e a previsão está disponível, When os dados carregam, Then a aplicação exibe exatamente cinco períodos diários, incluindo hoje e os quatro dias seguintes.
- **AC-05.2** — Given que a previsão foi carregada, When cada período é exibido, Then ele apresenta o dia correspondente e está associado à cidade selecionada.
- **AC-05.3** — Given que a cidade selecionada está em um fuso horário diferente do dispositivo, When os dias da previsão são determinados, Then hoje e os dias seguintes são calculados pelo fuso horário da localidade selecionada.

### RF-06 — Alternar unidade de temperatura

- **AC-06.1** — Given que temperaturas atuais e/ou da previsão estão visíveis em Celsius, When o usuário seleciona Fahrenheit, Then todos os valores de temperatura visíveis passam a ser exibidos em Fahrenheit com a unidade identificada.
- **AC-06.2** — Given que temperaturas estão visíveis em Fahrenheit, When o usuário seleciona Celsius, Then todos os valores de temperatura visíveis passam a ser exibidos em Celsius com a unidade identificada.
- **AC-06.3** — Given que uma temperatura exibida é 0 °C, When o usuário alterna para Fahrenheit, Then o valor correspondente exibido é 32 °F.

### RF-07 — Persistir unidade escolhida

- **AC-07.1** — Given que não há preferência de unidade salva, When o usuário abre a aplicação pela primeira vez, Then a unidade exibida é Celsius.
- **AC-07.2** — Given que o usuário selecionou Fahrenheit, When a aplicação é recarregada no mesmo navegador, Then Fahrenheit continua selecionado.
- **AC-07.3** — Given que o usuário selecionou uma unidade em uma sessão, When inicia uma nova sessão no mesmo navegador sem limpar os dados locais, Then a unidade selecionada anteriormente é restaurada.

### RF-08 — Informar falhas e ausencia de resultados

- **AC-08.1** — Given que uma busca válida termina sem cidades correspondentes, When a resposta da geocodificação é recebida, Then a aplicação informa que nenhum resultado foi encontrado e não apresenta clima de outra localidade.
- **AC-08.2** — Given que a consulta meteorológica falha ou excede o tempo limite, When a falha é detectada, Then a aplicação exibe um aviso de indisponibilidade e não apresenta a resposta como dado atual confirmado.
- **AC-08.3** — Given que a resposta meteorológica contém apenas parte dos dados esperados, When a interface é atualizada, Then os dados recebidos são exibidos com sua identificação de cidade e os campos ausentes são marcados como indisponíveis, sem valores fabricados.

## Non-Functional Requirements

- **RNF-01 — Responsividade:** a busca, a seleção de cidade, a consulta atual, a previsão e o controle de unidade devem permanecer utilizáveis em telas móveis e desktop, sem sobreposição ou perda dos controles principais.
- **RNF-02 — Clareza da unidade:** cada valor de temperatura deve exibir explicitamente Celsius ou Fahrenheit, inclusive após alternar a unidade.
- **RNF-03 — Contextualização dos dados:** o clima atual e cada período da previsão devem identificar a cidade selecionada; cada item diário deve identificar seu dia.
- **RNF-04 — Idioma:** textos da interface e avisos devem estar em português do Brasil (pt-BR).
- **RNF-05 — Acessibilidade básica:** busca, sugestões, alternância de unidade e demais controles devem ser operáveis por teclado e possuir nome acessível que identifique sua função.
- **RNF-06 — Integração sem credenciais:** a consulta de geocodificação e previsão deve usar a Open-Meteo sem exigir chave de API do usuário ou da aplicação.
- **RNF-07 — Escopo de persistência:** a aplicação não deve exigir conta nem enviar a preferência de unidade para persistência em servidor.

## Edge Cases

- **Cidade inexistente:** após uma busca válida sem correspondências, mostrar aviso de que nenhuma cidade foi encontrada, manter a busca disponível para correção e não iniciar consulta meteorológica.
- **Input vazio:** se o campo estiver vazio ou contiver apenas espaços, não enviar requisição; solicitar que o usuário informe cidade e estado.
- **Caracteres especiais:** aceitar caracteres válidos em nomes de localidades (incluindo acentos) e tratar caracteres de entrada como dados, sem quebrar a interface nem alterar a estrutura da requisição. Se não houver correspondência, mostrar o estado sem resultados.
- **Falha de API:** mostrar aviso de indisponibilidade, manter a possibilidade de tentar novamente e não substituir a localidade selecionada por dados de outra cidade.
- **Timeout:** tratar o tempo excedido como falha recuperável, interromper o estado de carregamento, informar indisponibilidade e permitir nova tentativa. O limite de tempo ainda precisa ser definido.
- **Geocoding sem resultados:** mostrar estado sem resultados, não exibir sugestões e não solicitar dados meteorológicos enquanto não houver cidade selecionada.
- **Resposta parcial:** mostrar somente os campos efetivamente recebidos; indicar cada seção ou valor ausente como indisponível e manter os dados disponíveis associados à cidade correta.

## Assumptions

- A experiência principal atende uma pessoa por vez e consulta uma cidade selecionada por vez.
- A busca usa nome da cidade e estado, com sugestões durante a digitação.
- A previsão diária inclui hoje e os quatro dias seguintes, segundo o fuso horário da localidade.
- Celsius e Fahrenheit são as únicas unidades no escopo inicial; Celsius é o padrão quando não há preferência salva.
- A preferência é salva localmente no navegador, sem autenticação ou armazenamento em servidor.
- A Open-Meteo é a fonte de geocodificação e dados meteorológicos.
- Como o discovery não nomeia personas, “usuário” é a única persona usada nesta versão.
- Os valores de temperatura são apresentados usando a unidade solicitada ou convertidos de forma consistente; a precisão visual do arredondamento ainda não foi definida.

## Risks

- **Ambiguidade geográfica:** cidade e estado podem não identificar unicamente uma localidade em todos os países; pode ser necessário exibir país ou região.
- **Disponibilidade e qualidade dos dados:** a fonte externa pode falhar ou omitir campos requeridos; a interface precisa evitar informação inventada ou atribuída à cidade errada.
- **Fuso horário:** interpretar “hoje” pelo fuso do dispositivo pode deslocar os dias apresentados para a localidade consultada.
- **Conversão e arredondamento:** conversão incorreta ou atualização parcial dos valores pode produzir temperaturas inconsistentes.
- **Preferência em dispositivo compartilhado:** a persistência local pode manter a unidade escolhida para outra pessoa que use o mesmo navegador.
- **Qualidade não quantificada:** navegadores suportados, metas de desempenho e dimensões de tela ainda não estão definidos.

## Out of Scope

- Cadastro, autenticacao, perfis e sincronizacao de preferencias entre dispositivos.
- Persistencia de preferencias ou dados meteorologicos em servidor.
- Consulta simultanea de varias cidades, favoritos ou comparacao entre localidades.
- Previsoes alem dos cinco dias definidos, historico meteorologico, alertas e notificacoes.
- Mapa meteorologico e dados que nao estejam disponiveis na resposta integrada da Open-Meteo.

## Open Questions

- Para cidades homônimas, o estado será suficiente ou a interface também deve exibir país/região? A busca é limitada a um país?
- Quais campos, além da temperatura, definem “condições climáticas” no clima atual (por exemplo, descrição textual, sensação térmica, umidade ou vento)?
- Com que frequência os dados devem ser atualizados e quando uma nova consulta deve ocorrer?
- Qual deve ser o texto exato dos avisos para cidade não encontrada, falha de conexão, timeout e resposta parcial?
- Qual limite de tempo deve caracterizar um timeout?
- Qual precisão e regra de arredondamento devem ser usadas na exibição e conversão das temperaturas?
- Quais navegadores, dimensões-alvo, metas de desempenho e requisitos de acessibilidade devem ser oficialmente suportados?
- Há personas específicas além do usuário genérico identificadas pelo produto que devam orientar as stories?