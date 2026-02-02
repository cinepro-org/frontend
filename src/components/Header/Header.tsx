import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '/favicon.svg';

export default function Header() {
    const navigate = useNavigate();

    return (
        <header className="top-0 z-50 w-full">
            <div className="supports-backdrop-filter:bg-background/60 border-b-muted bg-background/80 h-16 w-full border-b px-6 backdrop-blur">
                <div className="flex h-full items-center justify-between">
                    <Button variant={'ghost'} className="flex h-14 items-center gap-2" onClick={() => navigate('/')}>
                        <img src={Logo} alt="Logo" className="h-14" />
                        <h1 className="text-primary text-3xl font-bold">CinePro</h1>
                    </Button>

                    <div className="flex items-center gap-4">
                        <Button asChild>
                            <Link to="https://github.com/cinepro-org/frontend" target={'_blank'}>
                                Source Code
                                <Home />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
