import Lenis from 'lenis';
import { AlertTriangle } from 'lucide-react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '@/pages/Home/Home';
import NotFound from '@/pages/404/NotFound';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Header from '@/components/Header/Header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
            <div className="hidden min-h-screen w-full md:block">
                <ThemeProvider defaultTheme="dark">
                    <BrowserRouter>
                        <Header />
                        <main className="bg-background/50 relative m-3 min-h-[87vh] overflow-hidden rounded-2xl border p-3 backdrop-blur-xl">
                            <div className="relative z-10 h-full w-full">
                                <Routes>
                                    {/* Home */}
                                    <Route path="/" element={<Home />} />

                                    {/* 404 */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
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
            </div>

            <div
                className="bg-destructive/30 fixed top-0 left-0 flex h-screen w-screen flex-col items-center justify-center gap-10 overflow-hidden text-center backdrop-blur-xl md:hidden"
                style={{ zIndex: 10000 }}
            >
                <AlertTriangle className="h-40 w-40 text-red-500" />
                <Alert variant={'destructive'} className="flex w-[90%] max-w-lg flex-col gap-10 rounded-lg p-6 shadow-lg sm:w-[60%]">
                    <div>
                        <AlertTitle className="text-2xl font-semibold text-red-500">Unsupported Device</AlertTitle>
                        <AlertDescription className="text-xl">MovieStore is not available on mobile devices yet.</AlertDescription>
                    </div>
                </Alert>
            </div>
        </>
    );
}

export default App;
