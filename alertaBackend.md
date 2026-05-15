# Alerta de Backend

## Objetivo

Este arquivo serve apenas como alerta tecnico para justificar os erros `500` observados no consumo da API de matriculas. Nenhuma correcao de backend foi incluida neste envio.

## Resumo do problema

O login continua a funcionar, mas algumas rotas de inscricoes e matriculas passam a responder com `500`.

Isso acontece porque existe uma divergencia entre o nome da coluna no banco de dados e o nome da coluna usado nas rotas do backend.

## Motivo principal do erro

No schema da tabela `estudanteinscricao`, a coluna esta definida como:

- `estado_estdanteInscrito`

Nas rotas do backend, porem, varias queries usam:

- `estado_estudanteInscrito`

Ou seja, o backend tenta consultar ou atualizar uma coluna com nome diferente da que realmente existe no banco. Quando isso acontece, o MySQL devolve erro de coluna inexistente e a API responde com `500`.

## Porque o login nao caiu

O fluxo de login consulta a tabela `estudanteinscricao`, mas nao depende dessa coluna de estado. Por isso ele continua operacional mesmo com as outras rotas a falhar.

## Rotas potencialmente afetadas

- `GET /EstudantesInscritos`
- `GET /EstudantesByStatus/:status`
- `GET /EstatisticasInscricoes`
- `PUT /estudanteInscritoAceitar/:id`
- `PUT /estudanteInscritoRecusar/:id`
- `PUT /estudanteInscritoNota/:codigoEstudante`

## Impacto

- Listagens por estado deixam de funcionar.
- Estatisticas de inscricoes podem falhar.
- Acoes de aprovar, reprovar ou atualizar nota podem retornar `500`.
- O frontend passa a aparentar erro geral de API, mesmo quando a conexao com o servidor esta ativa.

## Recomendacao

Antes de expandir ou evoluir este modulo, e importante alinhar primeiro o contrato entre banco e backend.

Opcoes de correcao futura:

1. Padronizar o nome da coluna diretamente no banco de dados com uma migracao controlada.
2. Ajustar as queries do backend para refletirem exatamente o nome real da coluna existente.
3. Criar uma validacao simples de smoke test para essas rotas criticas antes de publicar novas alteracoes.

## Observacao final

Este alerta foi criado para documentacao do problema e nao altera o comportamento atual do backend.
