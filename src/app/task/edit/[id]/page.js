<<<<<<< HEAD
import TaskForm from '@/components/TaskEdit';
=======
'use client';

import AuthGuard from '@/components/AuthGuard';
import TaskForm from '@/components/TaskForm';
>>>>>>> 1f5fcdd3bf5845d053a9fa5a594998a582191f04

export default function EditTaskPage({ params }) {
  return (
    <AuthGuard requiredRole="Supervisor">
      <TaskForm taskId={params.id} />
    </AuthGuard>
  );
}