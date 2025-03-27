import { redirect } from 'next/navigation';

export default function Home() {
  // Redirecionar da página inicial para a página de login
  redirect('/login');
}
