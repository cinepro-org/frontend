import Lenis from 'lenis';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '@/pages/Home/Home';
import NotFound from '@/pages/404/NotFound';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Header from '@/components/Header/Header';
import { OmssProvider } from '@omss/sdk';

export function App() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }

    new Lenis({
        autoRaf: true,
    });

    return (
        <>
            <div className="min-h-screen w-full">
                <OmssProvider config={{ baseUrl: import.meta.env.VITE_API_URL }}>
                    <ThemeProvider defaultTheme="dark">
                        <BrowserRouter>
                            <Header />
                            <main className="bg-background/50 relative m-3 min-h-[87vh] overflow-hidden rounded-2xl border p-3 backdrop-blur-xl">
                                <div className="relative z-10 h-full w-full">
                                    <div className="flex min-h-[80vh] w-full flex-col gap-6">
                                        <Routes>
                                            {/* Home */}
                                            <Route path="/" element={<Home />} />

                                            {/* 404 */}
                                            <Route path="*" element={<NotFound />} />
                                        </Routes>
                                    </div>
                                </div>
                                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full w-full animate-pulse" style={{ animationDuration: '20s' }}>
                                        <div className="bg-primary/60 absolute -top-48 -left-48 h-[40vw] max-h-150 min-h-75 w-[40vw] max-w-150 min-w-75 rounded-full blur-[128px]" />
                                        <div className="bg-primary/20 absolute -top-32 -left-32 h-[30vw] max-h-100 min-h-50 w-[30vw] max-w-100 min-w-50 rounded-full blur-[96px]" />
                                        <div className="bg-primary/10 absolute -top-16 -left-16 h-[20vw] max-h-50 min-h-25 w-[20vw] max-w-50 min-w-25 rounded-full blur-3xl" />
                                    </div>
                                    <div className="absolute right-0 bottom-0 h-full w-full animate-pulse" style={{ animationDuration: '25s' }}>
                                        <div className="bg-primary/60 absolute -right-48 -bottom-48 h-[40vw] max-h-150 min-h-75 w-[40vw] max-w-150 min-w-75 rounded-full blur-[128px]" />
                                        <div className="bg-primary/20 absolute -right-32 -bottom-32 h-[30vw] max-h-100 min-h-50 w-[30vw] max-w-100 min-w-50 rounded-full blur-[96px]" />
                                        <div className="bg-primary/10 absolute -right-16 -bottom-16 h-[20vw] max-h-50 min-h-25 w-[20vw] max-w-50 min-w-25 rounded-full blur-3xl" />
                                    </div>
                                </div>
                            </main>
                        </BrowserRouter>
                        <Toaster closeButton visibleToasts={5} />
                    </ThemeProvider>
                </OmssProvider>
            </div>
        </>
    );
}

export default App;
