'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleSwitcher from '../../../../components/RoleSwitcher';
import ReviewPanel from '../../../../components/ReviewPanel';
import { getAssignment, getExecution } from '../../../../lib/storage';
import { useCurrentUser } from '../../../../lib/state';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [assignment, setAssignment] = useState(null);
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get assignmentId from URL params
  const assignmentId = params?.assignmentId;
  
  // Redirect if not a supervisor
  if (currentUser && currentUser.role !== 'Supervisor') {
    router.push(`/${currentUser.role.toLowerCase()}`);
    return null;
  }
  
  // Load data on mount
  useEffect(() => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      
      // Get assignment
      const assignmentData = getAssignment(assignmentId);
      if (!assignmentData) {
        throw new Error('No se encontró la asignación');
      }
      setAssignment(assignmentData);
      
      // Check if assignment is in reviewable state
      const status = assignmentData.estado?.toLowerCase();
      if (status !== 'enviada' && status !== 'en revisión' && status !== 'en revision') {
        throw new Error('Esta asignación no está lista para revisión');
      }
      
      // Get execution
      if (assignmentData.lastExecutionId) {
        const executionData = getExecution(assignmentData.lastExecutionId);
        if (!executionData) {
          throw new Error('No se encontró la ejecución asociada');
        }
        setExecution(executionData);
      } else {
        throw new Error('La asignación no tiene una ejecución asociada');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading review data:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <RoleSwitcher />
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/supervisor" className="text-blue-600 hover:underline">
            &larr; Volver al panel
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Revisar Ejecución</h1>
        {assignment && (
          <p className="text-gray-600">
            Revisando: <strong>{assignment.checklistNombre}</strong>
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">Cargando datos...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
          <div className="mt-4">
            <Link href="/supervisor" className="text-blue-600 hover:underline">
              Volver al panel de supervisor
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {execution && (
            <div className="bg-white rounded shadow-sm p-4 border mb-6">
              <h3 className="text-lg font-medium mb-4">Resultados de la Ejecución</h3>
              
              <div className="border rounded overflow-hidden">
                <div className="bg-gray-100 p-3 font-mono text-sm">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(execution, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          <ReviewPanel assignmentId={assignmentId} />
        </div>
      )}
    </div>
  );
}
