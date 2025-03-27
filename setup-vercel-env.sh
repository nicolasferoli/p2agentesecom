#!/bin/bash

# Lista de variáveis de ambiente do seu .env.local
ENV_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "OPENAI_API_KEY"
  "ANTHROPIC_API_KEY"
  "MISTRAL_API_KEY"
  "NEXT_PUBLIC_APP_NAME"
  "NEXT_PUBLIC_APP_URL"
  "NODE_ENV"
)

# Adiciona cada variável
for var in "${ENV_VARS[@]}"; do
  value=$(grep "^$var=" .env.local | cut -d '=' -f2-)
  
  if [ -n "$value" ]; then
    echo "Adicionando $var..."
    # Adiciona para todos os ambientes (development, preview, production)
    npx vercel env add $var production <<< "$value"
    npx vercel env add $var preview <<< "$value"
    npx vercel env add $var development <<< "$value"
  fi
done

echo "Configuração de variáveis de ambiente concluída!"
echo "Execute 'npx vercel --prod' para fazer o deploy de produção" 