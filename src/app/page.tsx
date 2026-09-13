import { redirect } from 'next/navigation';

// After Google sign-in the backend redirects participants to the bare FRONTEND_URL (auth.go#redirectURL).
export default function Home() {
  redirect('/dashboard');
}
