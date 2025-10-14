
"use client"

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // If authenticated, check for role-based route access
        if (user?.role === 'master' && !pathname.startsWith('/master-admin')) {
             // Allow master admin to see other pages if they navigate manually, but default to their dashboard
             if (pathname === '/login' || pathname === '/signup') {
                router.push('/master-admin');
             }
        } else if (user?.role === 'admin' && pathname.startsWith('/master-admin')) {
             router.push('/dashboard');
        }

    }, [isAuthenticated, isLoading, router, user, pathname]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    // If user is admin but tries to access master-admin, show loading while redirecting
    if (user?.role === 'admin' && pathname.startsWith('/master-admin')) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }


    return <>{children}</>;
}
