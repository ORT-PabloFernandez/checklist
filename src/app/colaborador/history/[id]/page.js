'use client';

import { useParams } from 'next/navigation';

export default function ReviewPage() {
  const params = useParams();
  
  // Get assignmentId from URL params
  const historyId = params?.id;
  const loading = false;

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">Cargando datos...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
            <h2>Aca se encuentra la data de los history {historyId}</h2>
        </div>
      )}
    </div>
  );
}
