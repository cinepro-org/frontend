import { Button } from '@/components/ui/button.tsx';
import { HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="flex min-h-[80vh] w-full flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
            <h1 className="text-4xl font-bold">404 - Not Found</h1>
            <p className="text-lg">The page you are looking for does not exist or has moved.</p>
            <div className={'mt-2 flex flex-col items-center justify-center gap-2'}>
                <Button size="lg" asChild>
                    <Link to="/" className="mt-4">
                        Back Home
                        <HomeIcon />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
