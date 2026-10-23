import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/create-pool');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <img src="/vexlore-logo.jpg" alt="Vexlore" className="h-16 w-16 mx-auto rounded-2xl logo-glow" />
        <p className="text-muted-foreground">Loading launchpad...</p>
      </div>
    </div>
  );
}
