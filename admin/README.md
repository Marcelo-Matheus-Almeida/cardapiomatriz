# Painel de envio do cardápio

O painel em `/admin/` recebe um arquivo JSON pronto. Ele valida a estrutura, mostra uma prévia e só altera o repositório depois que você clicar em **Aprovar e enviar ao GitHub**, informar a versão e confirmar a ação.

## Formato do arquivo

Use `data/cardapio.json` como exemplo para preparar as próximas semanas. O arquivo que você envia precisa ter o rótulo da semana, a validade e os cinco dias úteis. Cada dia contém as categorias nesta ordem: prato principal, acompanhamentos, saladas, sucos e sobremesa. A validade deve ser um horário ISO com fuso, por exemplo `2026-10-02T23:59:59-03:00`. Você não precisa incluir `appVersion` no arquivo enviado.

O campo `main` foi removido do formato. O painel ignora esse campo caso apareça em um JSON antigo e não o grava no arquivo publicado. O destaque visual dos pratos principais vem do tipo da categoria (`prato`).

## Publicar uma semana

1. Abra `/admin/` e clique em **Conectar GitHub**.
2. Selecione o arquivo JSON preparado. O painel valida o conteúdo e mostra a prévia; até aqui o Git não foi alterado.
3. Confira semana, validade e pratos. Clique em **Aprovar e enviar ao GitHub** e informe a nova versão do app quando o popup pedir. Ela precisa ser diferente da versão atual.
4. Confirme a publicação. O painel acrescenta `appVersion` ao JSON e grava o arquivo no branch `main` do repositório `Marcelo-Matheus-Almeida/cardapiomatriz`. Esse envio cria um commit; a Netlify detecta a mudança e inicia o deploy.
5. Ao abrir o app, o service worker lê `appVersion` do JSON. Se mudou, cria um cache com essa versão e remove o cache anterior. Não é necessário editar `sw.js` toda semana.

## Configurar o login uma vez

A conta GitHub usada no painel precisa ter permissão de escrita nesse repositório.

1. No GitHub, crie uma OAuth App em **Settings → Developer settings → OAuth Apps**. Use o domínio público do site como Homepage URL e `https://api.netlify.com/auth/done` como Authorization callback URL.
2. Na Netlify, abra **Project configuration → Security → OAuth**, instale o provedor GitHub e informe o Client ID e o Client Secret da OAuth App.
3. Publique o projeto. Acesse `https://SEU-DOMINIO/admin/` e conecte a conta GitHub.

O token de acesso é mantido apenas na memória da página enquanto o painel está aberto. Git Gateway e o editor Decap não são usados.
