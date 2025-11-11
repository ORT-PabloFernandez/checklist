'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/state';
import { getCurrentUser } from '@/lib/storage';

export default function AuthGuard({ children, requiredRole, isPublic = false }) {
    const { currentUser, isLoading } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return; // Esperar a que termine de cargar el estado de autenticación
        if (currentUser === undefined) return;
        if (!currentUser && !isPublic) {
            router.push('/auth/login');
            return;
        }

        if (currentUser && isPublic) {
            const homeUrl = currentUser.role === 'Supervisor' ? '/supervisor' : '/colaborador';
            router.push(homeUrl);
            return;
        }

        if (requiredRole && currentUser.role !== requiredRole) {
            const homeUrl = currentUser.role === 'Supervisor' ? '/supervisor' : '/colaborador';
            router.push(homeUrl);
            return;
        }

    }, [currentUser, isPublic, requiredRole, router, isLoading]);

    if (isLoading) {
        return <div className='container mx-auto px-4 py-8 text-center'>cargando...</div>;
    }


    return <>{children}</>;

}