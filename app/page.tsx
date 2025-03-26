import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl">Agentes ECOM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button>Criar conta</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                Gerencie seus Agentes de IA com facilidade
              </h1>
              <p className="text-xl text-muted-foreground">
                Uma plataforma completa para criação, treinamento e implantação de agentes de IA.
              </p>
              <div className="flex gap-4">
                <Link href="/register">
                  <Button size="lg">Começar gratuitamente</Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline">
                    Ver recursos
                  </Button>
                </Link>
              </div>
            </div>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {/* Imagem ou ilustração */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <span className="text-2xl font-semibold text-primary">Demonstração</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
              Recursos principais
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tudo o que você precisa para gerenciar seus agentes de IA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-lg border bg-card">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl text-primary">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Agentes ECOM</span>
            <span className="text-muted-foreground">
              © {new Date().getFullYear()} Todos os direitos reservados.
            </span>
          </div>
          <div className="flex gap-6">
            <Link href="/termos" className="text-muted-foreground hover:text-primary">
              Termos
            </Link>
            <Link href="/privacidade" className="text-muted-foreground hover:text-primary">
              Privacidade
            </Link>
            <Link href="/contato" className="text-muted-foreground hover:text-primary">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '🤖',
    title: 'Agentes Virtuais',
    description: 'Crie e configure agentes de IA com diferentes modelos, personalização de comportamento e treinamento customizado.',
  },
  {
    icon: '📚',
    title: 'Gerenciamento de Conhecimento',
    description: 'Faça upload de documentos, extraia informações relevantes e organize em bases de conhecimento temáticas.',
  },
  {
    icon: '⚙️',
    title: 'Fluxos de Trabalho',
    description: 'Crie workflows visuais para automação, integração entre múltiplos agentes e sistemas.',
  },
  {
    icon: '📝',
    title: 'Prompts e Templates',
    description: 'Biblioteca de templates para diferentes casos de uso, editor visual de prompts com sugestões.',
  },
  {
    icon: '💬',
    title: 'Chat e Interações',
    description: 'Interface de chat para interação com agentes, histórico completo de conversas.',
  },
  {
    icon: '📊',
    title: 'Análise e Métricas',
    description: 'Dashboard com métricas de uso, análise de desempenho dos agentes.',
  },
];
