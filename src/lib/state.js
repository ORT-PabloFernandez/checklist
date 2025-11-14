'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, setCurrentUser, listAssignments, saveAssignment, updateAssignment,
  getAssignment,
  saveExecution,
  getExecution,
  initializeDefaultAssignments } from './storage';
import { isPasoVisible, getVisibilityMap } from './conditions';
import { validateField } from './validation';

/**
 * Hook for managing current user
 * @returns {Object} Current user state and setter functions
 */
export function useCurrentUser() {
  const [currentUser, setUser] = useState(null);
  
  // Default users for the system
  const defaultUsers = [
    { email: 'supervisor@ort.edu.ar', role: 'Supervisor', name: 'Supervisor' },
    { email: 'Nestor.Wilke@ejemplo.com', role: 'Colaborador', name: 'Nestor Wilke', avatar: 'https://raw.githubusercontent.com/ORT-PabloFernandez/PNTP2-REACT-EJEMPLO/main/public/img/Nestor%20Wilke.jpg' }
  ];
  
  // Load user on mount
  useEffect(() => {
    const initializeUser = async () => {
      let user = getCurrentUser();
      if (user) {
        // Usuario existente, establecer en estado
        setUser(user);
      } else {
        // Crear usuario predeterminado si no existe
        const defaultCollaborator = defaultUsers.find(u => u.role === 'Colaborador');
        if (defaultCollaborator) {
          setCurrentUser(defaultCollaborator);
          setUser(defaultCollaborator);
          
          // Esperar un momento para asegurar que el usuario esté guardado
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Inicializar asignaciones predeterminadas para este usuario
          initializeDefaultAssignments(defaultCollaborator.email);
        }
      }
    };
    
    initializeUser();
  }, []);
  
  // Update user in state and storage
  const updateCurrentUser = useCallback((user) => {
    if (!user) return;
    setCurrentUser(user);
    setUser(user);
  }, []);

  return { 
    currentUser, 
    updateCurrentUser,
    defaultUsers
  };
}

/**
 * Hook for managing assignment list and operations
 * @returns {Object} Assignments and related functions
 */
export function useAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load assignments on mount
  useEffect(() => {
    loadAssignments();
  }, []);
  
  // Load assignments from storage
  const loadAssignments = useCallback(() => {
    setLoading(true);
    const data = listAssignments();
    setAssignments(data);
    setLoading(false);
  }, []);
  
  // Refresh assignments (public method to refresh from outside)
  const refreshAssignments = useCallback(() => {
    loadAssignments();
  }, [loadAssignments]);
  
  // Create a new assignment
  const createAssignment = useCallback((assignment) => {
    try {
      // Set default state if not provided
      if (!assignment.estado) {
        assignment.estado = 'Asignada';
      }
      
      // Set creation date
      if (!assignment.fechaCreacion) {
        assignment.fechaCreacion = new Date().toISOString();
      }
      
      // Ensure rejections array exists
      if (!assignment.rechazos) {
        assignment.rechazos = [];
      }
      
      // Save to storage
      const id = saveAssignment(assignment);
      
      // Reload assignments
      loadAssignments();
      
      return id;
    } catch (error) {
      console.error('Error creating assignment:', error);
      return null;
    }
  }, [loadAssignments]);
  
  // Update an existing assignment
  const updateAssignmentState = useCallback((assignment) => {
    try {
      const success = updateAssignment(assignment);
      if (success) {
        loadAssignments();
      }
      return success;
    } catch (error) {
      console.error('Error updating assignment:', error);
      return false;
    }
  }, [loadAssignments]);
  
  return {
    assignments,
    loading,
    loadAssignments,
    refreshAssignments,
    createAssignment,
    updateAssignment: updateAssignmentState
  };
}

/**
 * Hook for managing execution of a checklist
 * @param {string} assignmentId - The ID of the assignment being executed
 * @param {Object} checklist - The checklist being executed
 * @returns {Object} Execution state and functions
 */
export function useExecutionState(assignmentId, checklist) {
  const [responses, setResponses] = useState({});
  const [visibilityMap, setVisibilityMap] = useState({});
  const [validationMap, setValidationMap] = useState({});
  const [assignmentData, setAssignmentData] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [executionId, setExecutionId] = useState(null);
  
  // Load assignment data
  useEffect(() => {
    if (assignmentId) {
      const data = getAssignment(assignmentId);
      if (data) {
        setAssignmentData(data);
        
        // Load last execution if available
        if (data.lastExecutionId) {
          const execution = getExecution(data.lastExecutionId);
          if (execution) {
            // Convert responses array to object by paso_id
            const responseObj = {};
            execution.respuestas.forEach(resp => {
              if (resp.visible) {
                responseObj[resp.pasoId] = resp.valor;
              }
            });
            
            setResponses(responseObj);
            setExecutionId(execution.id);
          }
        }
      }
    }
  }, [assignmentId]);
  
  // Update visibility map when responses change
  useEffect(() => {
    if (checklist?.pasos) {
      const visibility = getVisibilityMap(checklist.pasos, responses);
      setVisibilityMap(visibility);
      
      // Reset responses for hidden fields
      const updatedResponses = { ...responses };
      checklist.pasos.forEach(paso => {
        if (!isPasoVisible(paso, responses)) {
          delete updatedResponses[paso.id];
        }
      });
      
      // Only update if there are changes
      if (Object.keys(updatedResponses).length !== Object.keys(responses).length) {
        setResponses(updatedResponses);
      }
      
      // Update validation for all visible fields
      const validations = {};
      checklist.pasos.forEach(paso => {
        if (visibility[paso.id]) {
          validations[paso.id] = validateField(responses[paso.id], paso);
        }
      });
      setValidationMap(validations);
    }
  }, [responses, checklist]);
  
  // Update a single response
  const updateResponse = useCallback((pasoId, value) => {
    setResponses(prev => ({
      ...prev,
      [pasoId]: value
    }));
  }, []);
  
  // Save progress (create or update execution)
  const saveProgress = useCallback(async () => {
    if (!assignmentId || !checklist) return null;
    
    try {
      const respuestas = [];
      
      // Create response objects for each paso
      checklist.pasos.forEach(paso => {
        const visible = visibilityMap[paso.id] || false;
        const validation = validationMap[paso.id] || { isValid: true, errors: [] };
        
        respuestas.push({
          pasoId: paso.id,
          valor: responses[paso.id] || null,
          valido: validation.isValid,
          errores: validation.errors || [],
          visible
        });
      });
      
      // Create execution object
      const execution = {
        id: executionId || undefined,
        assignmentId,
        checklist: checklist.nombre,
        timestamp: Date.now(),
        user: getCurrentUser()?.email || 'unknown',
        respuestas
      };
      
      // Save execution
      const id = saveExecution(execution);
      setExecutionId(id);
      
      // Update assignment with lastExecutionId
      if (assignmentData) {
        const updatedAssignment = {
          ...assignmentData,
          lastExecutionId: id
        };
        
        // If not already in execution state, update it
        if (updatedAssignment.estado === 'Asignada') {
          updatedAssignment.estado = 'En ejecución';
        }
        
        updateAssignment(updatedAssignment);
        setAssignmentData(updatedAssignment);
      }
      
      setLastSaved(new Date());
      return id;
    } catch (error) {
      console.error('Error saving progress:', error);
      return null;
    }
  }, [assignmentId, checklist, responses, visibilityMap, validationMap, executionId, assignmentData]);
  
  // Check if all required fields are valid for submission
  const canSubmit = useCallback(() => {
    if (!checklist?.pasos) return false;
    
    let valid = true;
    
    checklist.pasos.forEach(paso => {
      if (visibilityMap[paso.id] && paso.obligatorio) {
        const hasValue = responses[paso.id] !== undefined && responses[paso.id] !== null;
        const isValid = validationMap[paso.id]?.isValid !== false;
        
        if (!hasValue || !isValid) {
          valid = false;
        }
      }
    });
    
    return valid;
  }, [checklist, responses, visibilityMap, validationMap]);
  
  return {
    responses,
    updateResponse,
    visibilityMap,
    validationMap,
    saveProgress,
    lastSaved,
    canSubmit,
    executionId,
    assignmentData
  };
}