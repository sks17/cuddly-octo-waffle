import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="content">
      <div className="notfound rounded-[4px] border border-border/60 bg-card">
        <h1>404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page drifted off the graph.</p>
        <div className="mt-6">
          <Link to="/" className={buttonVariants()}>
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
