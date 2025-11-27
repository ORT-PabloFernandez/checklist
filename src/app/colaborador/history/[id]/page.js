'use client';

import AuthGuard from '@/components/AuthGuard';
import { useHistory } from '@/lib/state';
import { useParams } from 'next/navigation';

export default function ReviewPage() {
  const params = useParams();
  const { history, loading } = useHistory();
  const historyId = params?.id;

  // Get assignmentId from URL params
  const h = history.filter((execution) => {
    return execution._id === historyId;
  })[0];

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="text-gray-500">Cargando datos...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <h2>Execution: {h.checklistTitle}</h2>
            {h.responses && Object.keys(h.responses).forEach((key) => {
              return (<p>{h.responses[key].completedAt}</p>);
            })}
            <h3></h3>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
