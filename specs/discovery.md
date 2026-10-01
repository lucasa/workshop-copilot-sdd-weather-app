# Discovery: Aplicação de Previsão do Tempo

## Contexto

A empresa deseja oferecer uma aplicação de previsão do tempo para que usuários encontrem uma cidade e consultem suas condições meteorológicas. O escopo inicial contempla busca com sugestões, clima atual e previsão diária de cinco dias, com suporte às unidades Celsius e Fahrenheit. A experiência deve funcionar em dispositivos móveis e desktop.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** o usuário deve poder pesquisar uma cidade informando seu nome e estado.
- **RF-02 — Sugerir resultados:** durante a busca, a aplicação deve apresentar sugestões de cidades correspondentes.
- **RF-03 — Diferenciar cidades homônimas:** os resultados da busca devem identificar a cidade pelo estado, para que o usuário possa selecionar a localidade correta.
- **RF-04 — Consultar clima atual:** após selecionar uma cidade, o usuário deve poder consultar sua temperatura atual e as condições climáticas.
- **RF-05 — Consultar previsão de cinco dias:** após selecionar uma cidade, o usuário deve poder consultar a previsão diária para cinco dias, incluindo o dia atual.
- **RF-06 — Alternar unidade de temperatura:** o usuário deve poder alternar a exibição da temperatura entre Celsius e Fahrenheit.
- **RF-07 — Persistir unidade escolhida:** a unidade selecionada pelo usuário deve permanecer após recarregar a aplicação e em uma nova sessão.
- **RF-08 — Informar falhas e ausência de resultados:** quando a cidade não for encontrada ou os dados meteorológicos estiverem indisponíveis, a aplicação deve apresentar uma mensagem de aviso.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** a aplicação deve ser utilizável em dispositivos móveis e desktop.
- **RNF-02 — Clareza da unidade:** a unidade atualmente selecionada deve estar explícita junto aos valores de temperatura.
- **RNF-03 — Contextualização dos dados:** o clima atual e cada item da previsão devem estar associados à cidade selecionada; a previsão deve identificar o dia correspondente.

## Riscos

- **Ambiguidade geográfica:** diferenciar cidades pelo estado pode não ser suficiente em países onde há localidades homônimas em estados ou regiões diferentes.
- **Disponibilidade e qualidade dos dados:** uma fonte externa pode estar indisponível ou não fornecer todos os dados necessários para o clima atual e a previsão diária.
- **Fuso horário e definição do dia:** a previsão inclui hoje, mas a interpretação do dia deve acompanhar a localidade selecionada para evitar datas incorretas.
- **Consistência da conversão:** arredondamento ou atualização parcial da interface ao alternar unidades pode gerar valores inconsistentes.
- **Persistência entre sessões:** ainda não foi definido como a preferência será associada ao usuário ou dispositivo, o que pode afetar sua retenção em dispositivos compartilhados.
- **Critérios de qualidade não definidos:** desempenho, navegadores suportados, acessibilidade e dimensões-alvo não foram especificados.

## Perguntas em Aberto

- Para cidades homônimas, o estado será suficiente para identificar o resultado ou também será necessário apresentar país/região?
- Quais informações devem acompanhar as “condições climáticas” do clima atual além da temperatura (por exemplo, descrição textual)?
- Com que frequência as informações meteorológicas devem ser atualizadas?
- Que comportamento e texto a mensagem de aviso deve apresentar para cidade não encontrada, falha de conexão ou dados incompletos?
- Quais navegadores, metas de desempenho e requisitos de acessibilidade devem ser suportados?

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** A API oferece dados meteorológicos sem exigir uma chave, reduzindo configuração e dependências de credenciais. Resolve a escolha do fornecedor; a frequência de atualização permanece em aberto.
- **Previsão de cinco dias: hoje mais os quatro dias seguintes.** Define explicitamente o intervalo da previsão e elimina ambiguidades sobre a contagem dos dias.
- **Unidade padrão: Celsius.** Estabelece o valor exibido na primeira visita e responde à pergunta sobre a unidade inicial.
- **Sem autenticação e sem persistência de servidor.** O app não terá contas nem armazenará preferências no servidor. A unidade escolhida será persistida localmente no navegador para atender ao RF-07, sem associá-la a uma conta.
- **Idioma da interface: pt-BR.** Define o idioma dos textos e mensagens da UI, evitando que essa decisão fique implícita durante a implementação.

## Suposições

- A experiência principal é uma aplicação responsiva para consulta individual de uma cidade selecionada por vez.
- A busca aceita nome da cidade e estado, e apresenta sugestões enquanto o usuário digita.
- A previsão é apresentada em períodos diários e compreende hoje mais os quatro dias seguintes.
- Celsius e Fahrenheit são as únicas unidades de temperatura necessárias no escopo inicial.
- A preferência de unidade deve ser preservada localmente entre recargas e sessões, sem autenticação ou armazenamento no servidor.
- A frequência de atualização dos dados, a estratégia técnica, os limites de atualização e os requisitos de navegadores e desempenho ainda não estão definidos.