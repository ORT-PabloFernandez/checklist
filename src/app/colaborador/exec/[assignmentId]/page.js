'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleSwitcher from '../../../../components/RoleSwitcher';
import ChecklistRunner from '../../../../components/ChecklistRunner';
import { getAssignment } from '../../../../lib/storage';
import { useCurrentUser } from '../../../../lib/state';

export default function ExecutePage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get assignmentId from URL params
  const assignmentId = params?.assignmentId;
  
  // Redirect if not a colaborador (using useEffect to avoid state updates during render)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Colaborador') {
      router.push(`/${currentUser.role.toLowerCase()}`);
    }
  }, [currentUser, router]);
  
  // Load assignment data on mount
  useEffect(() => {
    if (!assignmentId || !currentUser) return; // Esperar a que currentUser esté disponible
    
    try {
      setLoading(true);
      
      // Get assignment
      const assignmentData = getAssignment(assignmentId);
      if (!assignmentData) {
        throw new Error('No se encontró la asignación');
      }
      
      // Check if assignment belongs to the current user (with logging for debugging)
      console.log('Assignment check:', { 
        assignmentEmail: assignmentData.asignadoA, 
        currentUserEmail: currentUser.email 
      });
      
      // More flexible email comparison (case insensitive)
      if (!assignmentData.asignadoA ||
          assignmentData.asignadoA.toLowerCase() !== currentUser.email.toLowerCase()) {
        throw new Error(`Esta asignación está asignada a ${assignmentData.asignadoA}, no a ${currentUser.email}`);
      }
      
      // Check if assignment is in executable state
      const status = assignmentData.estado?.toLowerCase();
      if (status !== 'asignada' && status !== 'en ejecución' && status !== 'en ejecucion' && 
          status !== 'rechazada') {
        throw new Error('Esta asignación no puede ser ejecutada en su estado actual');
      }
      
      setAssignment(assignmentData);
      setError(null);
    } catch (err) {
      console.error('Error loading assignment:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, currentUser, router]);

  // Si no tenemos usuario aún, mostrar pantalla de carga
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">Cargando usuario...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RoleSwitcher />
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/colaborador" className="text-blue-600 hover:underline">
            &larr; Volver al panel
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Ejecutar Checklist</h1>
        {assignment && (
          <p className="text-gray-600">
            Ejecutando: <strong>{assignment.checklistNombre}</strong>
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
            <Link href="/colaborador" className="text-blue-600 hover:underline">
              Volver al panel de colaborador
            </Link>
          </div>
        </div>
      ) : (
        <ChecklistRunner assignmentId={assignmentId} />
      )}
    </div>
  );
}
