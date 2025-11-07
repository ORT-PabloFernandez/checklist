'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/state';

export default function AuthGuard({ children, requiredRole, isPublic = false }) {
    const { currentUser } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (currentUser === undefined) {
            return; // still loading
        }
        if (!currentUser) {
            if (isPublic) {
                router.push('/login');
            }
            return;
        }

        const homeUrl = currentUser.role === 'Supervisor' ? '/supervisor' : '/colaborador';
        if (isPublic) {
            router.push(homeUrl);
            return;
        }

        if (requiredRole) {
            if (currentUser.role !== requiredRole) {
                router.push(homeUrl);
                return;
            }
        }

    }, [currentUser, isPublic, requiredRole, router]);

    if (currentUser === undefined) {
        return <div className='container mx-auto px-4 py-8 text-center'>cargando...</div>;
    }

    if (!currentUser && isPublic) {
        return <div className='container mx-auto px-4 py-8 text-center'>redirigiendo a login...</div>;
    }
    if (isPublic && currentUser) {
        return <div className="container mx-auto px-4 py-8 text-center">Redirigiendo al panel...</div>;

    }

    return <>{children}</>;

}