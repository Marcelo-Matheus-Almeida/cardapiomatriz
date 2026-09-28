# Painel do cardápio

O painel fica em `/admin/` e usa o Decap CMS para gravar `data/cardapio.json` no branch `main` do GitHub. Cada publicação cria um commit e a integração existente da Netlify inicia o deploy.

## Configuração única da autenticação

O painel usa o provedor GitHub da Netlify. A conta que entrar precisa ter permissão de escrita no repositório `Marcelo-Matheus-Almeida/cardapiomatriz`.

1. No GitHub, crie uma OAuth App em **Settings → Developer settings → OAuth Apps**. Use a URL pública do site como Homepage URL e `https://api.netlify.com/auth/done` como Authorization callback URL.
2. Na Netlify, abra **Project configuration → Security → OAuth**, instale o provedor GitHub e informe o Client ID e o Client Secret da OAuth App.
3. Depois do deploy, abra `https://SEU-DOMINIO/admin/`, entre com uma conta GitHub que tenha acesso de escrita ao repositório e edite **Cardápio semanal → Semana atual**.

Git Gateway não é usado. A Netlify marcou esse serviço como depreciado e não recomenda novas configurações.

## Atualização semanal

No formulário, edite o rótulo da semana, a validade e os pratos. A validade deve ser sexta-feira às 23:59 no horário de Brasília. Publique; o commit no branch `main` dispara a publicação automática do site.
