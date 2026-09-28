# Painel de envio do cardápio

O painel em `/admin/` recebe a imagem do cardápio e tenta montar o JSON automaticamente. Também aceita um JSON pronto. Ele mostra uma prévia editável e só altera o repositório depois que você aprova, informa a versão do app e confirma a ação.

Na leitura de imagem, o painel processa o arquivo no navegador usando OCR em português; a imagem original não é enviada ao GitHub. Para melhorar a leitura, envie a tabela inteira, na horizontal e fotografada o mais de frente possível. A leitura usa a disposição em cinco colunas e cinco faixas da imagem de referência.

## Formato do arquivo

O exemplo `data/cardapio.json` mostra a estrutura do JSON. A imagem não inclui semana nem validade; o painel sugere a semana atual e sexta-feira às 23:59. Confira ou ajuste esses campos na prévia antes de publicar. Se enviar um JSON, ele precisa conter semana, validade e os cinco dias úteis; a validade deve usar horário ISO com fuso, por exemplo `2026-10-02T23:59:59-03:00`. Você não precisa incluir `appVersion` no arquivo enviado.

O campo `main` foi removido do formato. O painel ignora esse campo caso apareça em um JSON antigo e não o grava no arquivo publicado. O destaque visual dos pratos principais vem do tipo da categoria (`prato`).

## Publicar uma semana

1. Abra `/admin/` e clique em **Conectar GitHub**.
2. Selecione a imagem. O painel reconhece os textos e monta os pratos por dia e categoria; até aqui o Git não foi alterado.
3. Confira os pratos na prévia. Clique em qualquer item para corrigir um erro do OCR. Confira também a semana e a validade sugeridas.
4. Clique em **Aprovar e enviar ao GitHub**, informe uma versão diferente da atual quando o popup pedir e confirme.
5. O painel acrescenta `appVersion` ao JSON e grava o arquivo no branch `main` do repositório `Marcelo-Matheus-Almeida/cardapiomatriz`. Esse envio cria um commit; a Netlify detecta a mudança e inicia o deploy.
6. Ao abrir o app, o service worker lê `appVersion` do JSON. Se mudou, cria um cache com essa versão e remove o cache anterior. Não é necessário editar `sw.js` toda semana.

## Configurar o login uma vez

A conta GitHub usada no painel precisa ter permissão de escrita nesse repositório.

1. No GitHub, crie uma OAuth App em **Settings → Developer settings → OAuth Apps**. Use o domínio público do site como Homepage URL e `https://api.netlify.com/auth/done` como Authorization callback URL.
2. Na Netlify, abra **Project configuration → Security → OAuth**, instale o provedor GitHub e informe o Client ID e o Client Secret da OAuth App.
3. Publique o projeto. Acesse `https://SEU-DOMINIO/admin/` e conecte a conta GitHub.

O token de acesso é mantido apenas na memória da página enquanto o painel está aberto. Git Gateway e o editor Decap não são usados.
