'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleSwitcher from '../../../components/RoleSwitcher';
import { getExecution, getAssignment } from '../../../lib/storage';
import { useCurrentUser } from '../../../lib/state';
import { formatDate } from '../../../lib/utils';

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [execution, setExecution] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get executionId from URL params
  const executionId = params?.executionId;
  
  // Load data on mount
  useEffect(() => {
    if (!executionId) return;
    
    try {
      setLoading(true);
      
      // Get execution
      const executionData = getExecution(executionId);
      if (!executionData) {
        throw new Error('No se encontró la ejecución');
      }
      setExecution(executionData);
      
      // Get associated assignment
      if (executionData.assignmentId) {
        const assignmentData = getAssignment(executionData.assignmentId);
        if (assignmentData) {
          setAssignment(assignmentData);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading execution data:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [executionId]);

  // Determine if review button should be shown
  const showReviewButton = () => {
    if (!assignment || !currentUser) return false;
    
    const isReviewable = assignment.estado === 'Enviada' || 
                         assignment.estado === 'En revisión' ||
                         assignment.estado === 'En revision';
                         
    return currentUser.role === 'Supervisor' && isReviewable;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <RoleSwitcher />
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          {currentUser?.role === 'Supervisor' ? (
            <Link href="/supervisor" className="text-blue-600 hover:underline">
              &larr; Volver al panel de supervisor
            </Link>
          ) : (
            <Link href="/colaborador" className="text-blue-600 hover:underline">
              &larr; Volver al panel de colaborador
            </Link>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Resumen de Ejecución</h1>
        
        {execution && (
          <div className="text-gray-600">
            <p>Checklist: <strong>{execution.checklist}</strong></p>
            <p>Ejecutado por: <strong>{execution.user}</strong></p>
            <p>Fecha: <strong>{formatDate(execution.timestamp)}</strong></p>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">Cargando datos...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
      ) : (
        <>
          {showReviewButton() && (
            <div className="mb-6">
              <Link 
                href={`/supervisor/review/${assignment.id}`}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Ir a revisión
              </Link>
            </div>
          )}
          
          <div className="bg-white rounded shadow-sm p-4 border">
            <h2 className="text-lg font-medium mb-4">Datos de la ejecución</h2>
            
            <div className="border rounded overflow-hidden">
              <div className="bg-gray-100 p-3">
                <pre className="whitespace-pre-wrap break-all font-mono text-sm">
                  {JSON.stringify(execution, null, 2)}
                </pre>
              </div>
            </div>
            
            {assignment && (
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Información de la asignación</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="font-semibold">Estado:</dt>
                    <dd>{assignment.estado}</dd>
                    
                    <dt className="font-semibold">Asignado a:</dt>
                    <dd>{assignment.asignadoA}</dd>
                    
                    <dt className="font-semibold">Creado por:</dt>
                    <dd>{assignment.creadoPor}</dd>
                    
                    <dt className="font-semibold">Fecha vencimiento:</dt>
                    <dd>{formatDate(assignment.fechaVencimiento)}</dd>
                    
                    <dt className="font-semibold">Prioridad:</dt>
                    <dd>{assignment.prioridad}</dd>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
