# Agentes ECOM

Plataforma completa para gerenciamento e implementação de agentes de IA, oferecendo controle total sobre o ciclo de vida desde a criação até o monitoramento e otimização contínua.

## Recursos Principais

- **Agentes Virtuais**: Crie e configure agentes de IA com diferentes modelos e personalização
- **Gerenciamento de Conhecimento**: Upload e processamento de documentos, extração de informações
- **Fluxos de Trabalho**: Criação de workflows visuais para automação e integração
- **Prompts e Templates**: Biblioteca de templates para diferentes casos de uso
- **Chat e Interações**: Interface de chat para interação com agentes
- **Administração**: Gerenciamento de usuários, configurações e segurança
- **API e Integrações**: API REST completa e integrações com serviços externos
- **Análise e Métricas**: Dashboard com métricas de uso e desempenho

## Tecnologias Utilizadas

- Next.js 14 com App Router
- React
- TypeScript
- Supabase (Auth, Database)
- Tailwind CSS
- Shadcn UI
- Zod
- React Hook Form

## Requisitos

- Node.js 18.17 ou superior
- NPM 9 ou superior
- Um projeto Supabase

## Configuração

1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/agentes-ecom.git
cd agentes-ecom
```

2. Instale as dependências

```bash
npm install
```

3. Configure as variáveis de ambiente

Copie o arquivo `.env.local.example` para `.env.local` e preencha as variáveis necessárias:

```bash
cp .env.local.example .env.local
```

4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Adicione as variáveis do Supabase ao seu `.env.local`
3. Execute o script SQL para criar as tabelas necessárias (disponível em `supabase/schema.sql`)

## Estrutura do Projeto

```
project/
├── app/                # Diretório raiz do Next.js (usando o App Router)
│   ├── (auth)/         # Rotas de autenticação 
│   ├── (dashboard)/    # Rotas protegidas do dashboard
│   ├── api/            # Rotas da API Next.js
│   ├── components/     # Componentes React da aplicação
│   └── ...
├── components/         # Componentes React compartilhados
├── lib/                # Bibliotecas e utilitários
├── shared/             # Código compartilhado entre server e client
│   └── types/          # Tipos TypeScript compartilhados
├── public/             # Arquivos estáticos
└── ...
```

## Licença

[MIT](LICENSE)
