'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/state';

export default function AuthGuard({ children, requiredRole, isPublic = false }) {
    const { currentUser } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (currentUser === undefined) return;
        if (!currentUser && !isPublic) {
            router.push('/login');
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

    }, [currentUser, isPublic, requiredRole, router]);

    if (currentUser === undefined) {
        return <div className='container mx-auto px-4 py-8 text-center'>cargando...</div>;
    }


    return <>{children}</>;

}