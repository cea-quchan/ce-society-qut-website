import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SigninRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, [router]);
  return null;
} 