import { redirect } from 'next/navigation';

// The backend's /auth/google/callback already set the httpOnly session cookies.
export default function CallbackPage() {
  redirect('/dashboard');
}
