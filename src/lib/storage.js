'use client';

import { getEndpointUrl, TOKEN_KEY } from "./config";

// Storage keys
const KEYS = {
  HISTORY: 'checklist.history',
  ASSIGNMENTS: 'checklist:assignments',
  EXECUTIONS: 'checklist:executions',
  CURRENT_USER: 'checklist:user',
  TASKS: 'tasks',
  NOTIFICATION_KEY: 'checklist:notifications'
};

/**
 * Get all assignments from localStorage
 * @returns {Array} List of assignments
 */
export function listAssignments() {
  try {
    const stored = localStorage.getItem(KEYS.ASSIGNMENTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading assignments:', error);
    return [];
  }
}

/**
 * Save a new assignment
 * @param {Object} assignment - The assignment to save
 * @returns {string} The ID of the saved assignment
 */
export function saveAssignment(assignment) {
  try {
    const assignments = listAssignments();

    // Generate ID if not present
    if (!assignment.id) {
      assignment.id = Date.now().toString();
    }

    // Add to assignments list
    assignments.push(assignment);

    // Save to localStorage
    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(assignments));

    return assignment.id;
  } catch (error) {
    console.error('Error saving assignment:', error);
    throw error;
  }
}

/**
 * Update an existing assignment
 * @param {Object} assignment - The assignment with updated data
 * @returns {boolean} Whether the operation was successful
 */
export function updateAssignment(assignment) {
  try {
    const assignments = listAssignments();

    // Find assignment index
    const index = assignments.findIndex(a => a.id === assignment.id);
    if (index === -1) {
      console.error(`Assignment with ID ${assignment.id} not found`);
      return false;
    }

    // Update assignment
    assignments[index] = { ...assignments[index], ...assignment };

    // Save to localStorage
    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(assignments));

    return true;
  } catch (error) {
    console.error('Error updating assignment:', error);
    return false;
  }
}

/**
 * Get a specific assignment by ID
 * @param {string} id - Assignment ID
 * @returns {Object|null} The assignment or null if not found
 */
export function getAssignment(id) {
  try {
    const assignments = listAssignments();
    return assignments.find(a => a.id === id) || null;
  } catch (error) {
    console.error(`Error getting assignment ${id}:`, error);
    return null;
  }
}

/**
 * Get all tasks from localStorage
 * @returns {Array} List of tasks
 */
export function listTasks() {
  try {
    const stored = localStorage.getItem(KEYS.TASKS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

/**
 * Get a specific task by ID
 * @param {string} id - Task ID
 * @returns {Object|null} The task or null if not found
 */
export function getTask(id) {
  try {
    const tasks = listTasks();
    return tasks.find(t => t.id === id) || null;
  } catch (error) {
    console.error(`Error getting task ${id}:`, error);
    return null;
  }
}

/**
 * Save a new task
 * @param {Object} taskData - The task data to save
 * @param {Object} currentUser - The current user creating the task
 * @returns {string} The ID of the saved task
 */
export function saveTask(taskData, currentUser) {
  try {
    const tasks = listTasks();

    const pasos = (taskData.pasos || []).map(paso => {
      const type = paso.type;
      return {
        ...paso,
        tipo: type,
        text: paso.text,
        type: type
      };
    });

    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      pasos: pasos,
      createdBy: currentUser?.email || currentUser?.id || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.push(newTask);
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));

    return newTask.id;
  } catch (error) {
    console.error('Error saving task:', error);
    throw error;
  }
}

/**
 * Update an existing task
 * @param {string} taskId - The ID of the task to update
 * @param {Object} taskData - The updated task data
 * @returns {boolean} Whether the operation was successful
 */
export function updateTask(taskId, taskData) {
  try {
    const tasks = listTasks();

    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      console.error(`Task with ID ${taskId} not found`);
      return false;
    }

    const pasos = (taskData.pasos || []).map(paso => {
      const type = paso.type;
      return {
        ...paso,
        tipo: type,
        text: paso.text,
        type: type
      };
    });

    tasks[index] = {
      ...tasks[index],
      ...taskData,
      pasos: pasos,
      id: taskId,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
}

/**
 * Delete an assignment by ID
 * @param {string} id - Assignment ID
 * @returns {boolean} Whether the operation was successful
 */
export function deleteAssignment(id) {
  try {
    const assignments = listAssignments();
    const filtered = assignments.filter(a => a.id !== id);

    if (filtered.length === assignments.length) {
      // Nothing was removed
      return false;
    }

    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error(`Error deleting assignment ${id}:`, error);
    return false;
  }
}

/**
 * Save an execution
 * @param {Object} execution - The execution to save
 * @returns {string} The ID of the saved execution
 */
export function saveExecution(execution) {
  try {
    const executions = getExecutions();

    // Generate ID if not present
    if (!execution.id) {
      execution.id = Date.now().toString();
    }

    // Add timestamp if not present
    if (!execution.timestamp) {
      execution.timestamp = Date.now();
    }

    // Add to executions list
    executions.push(execution);

    // Save to localStorage
    localStorage.setItem(KEYS.EXECUTIONS, JSON.stringify(executions));

    return execution.id;
  } catch (error) {
    console.error('Error saving execution:', error);
    throw error;
  }
}

/**
 * Get all executions from localStorage
 * @returns {Array} List of executions
 */
export function getExecutions() {
  try {
    const stored = localStorage.getItem(KEYS.EXECUTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading executions:', error);
    return [];
  }
}

/**
 * Get a specific execution by ID
 * @param {string} id - Execution ID
 * @returns {Object|null} The execution or null if not found
 */
export function getExecution(id) {
  try {
    const executions = getExecutions();
    return executions.find(e => e.id === id) || null;
  } catch (error) {
    console.error(`Error getting execution ${id}:`, error);
    return null;
  }
}

/**
 * List executions related to a specific assignment
 * @param {string} assignmentId - Assignment ID
 * @returns {Array} List of executions for the assignment
 */
export function listExecutionsByAssignment(assignmentId) {
  try {
    const executions = getExecutions();
    return executions.filter(e => e.assignmentId === assignmentId);
  } catch (error) {
    console.error(`Error getting executions for assignment ${assignmentId}:`, error);
    return [];
  }
}

/**
 * Get current user information from localStorage
 * @returns {Object|null} User information or null if not set
 */
export function getCurrentUser() {
  try {
    const stored = localStorage.getItem(KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Set current user information in localStorage
 * @param {Object} user - User information to store
 * @returns {boolean} Whether the operation was successful
 */
export function setCurrentUser(user) {
  try {
    if (!user || !user.email) {
      throw new Error('Invalid user object');
    }

    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error setting current user:', error);
    return false;
  }
}

/**
 * Clear all stored data (for testing/development)
 */
export function clearAllData() {
  try {
    localStorage.removeItem(KEYS.ASSIGNMENTS);
    localStorage.removeItem(KEYS.EXECUTIONS);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

/**
 * Initialize default assignments for demo purposes
 * @param {string} userEmail - Email of the current user
 */
export function initializeDefaultAssignments(userEmail) {
  try {
    // Only initialize if there are no assignments already
    const currentAssignments = listAssignments();
    if (currentAssignments && currentAssignments.length > 0) {
      return false;
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Create some default assignments for the user
    const defaultAssignments = [
      {
        id: '1757901770100',
        checklistSlug: 'inspeccion-de-seguridad',
        checklistNombre: 'Inspección de Seguridad',
        asignadoA: userEmail,
        fechaVencimiento: tomorrow.toISOString(),
        prioridad: 'Alta',
        notas: 'Realizar inspección de seguridad en el área de producción',
        creadoPor: 'supervisor@ort.edu.ar',
        fechaCreacion: now.toISOString(),
        estado: 'Asignada',
        rechazos: []
      },
      {
        id: '1757901770101',
        checklistSlug: 'mantenimiento-preventivo',
        checklistNombre: 'Mantenimiento Preventivo',
        asignadoA: userEmail,
        fechaVencimiento: nextWeek.toISOString(),
        prioridad: 'Media',
        notas: 'Realizar mantenimiento preventivo en equipos del sector A',
        creadoPor: 'supervisor@ort.edu.ar',
        fechaCreacion: now.toISOString(),
        estado: 'Asignada',
        rechazos: []
      }
    ];

    // Save assignments to localStorage
    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(defaultAssignments));
    return true;
  } catch (error) {
    console.error('Error initializing default assignments:', error);
    return false;
  }
}

/**
 * Get all assignments from localStorage
 * @returns {Array} List of assignments
 */
export async function listHistory() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const stored = await fetch(getEndpointUrl('EXECUTIONS'),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    if (stored && stored.status < 300) {
      const data = await stored.json();
      return data.data;
    }


    return [];
  } catch (error) {
    console.error('Error loading assignments:', error);
    return [];
  }
}
export function clearAuth() {
  try {
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userSession');
    localStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Error clearing authentication data:', error);
    return false;
  }
}

export async function updateAvatar(img, id) {
  const token = localStorage.getItem(TOKEN_KEY);
  const stored = await fetch(getEndpointUrl('USERS') + `/${id}/avatar`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ img })
    }
  );
  if (stored.status >= 300) {
    throw new Error('Fallo al mandar imagen')
  }
  const result = await stored.json();
  return result.data;
}

export async function getNotifications(id) {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const stored = await fetch(getEndpointUrl('USERS') + `/${id}/notifications`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );
    if (stored.status >= 300) {
      throw new Error('Fallo al obtener la notificación')
    }
    const result = await stored.json();
    return result.data;
  } catch (error) {
    console.error(error);
  }
}


export function addNotification(id, message, type) {
  try {
    const notifications = getLocalNotifications(id);
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    const allNotifications = JSON.parse(localStorage.getItem(KEYS.NOTIFICATION_KEY) || '{}');
    allNotifications.push(newNotification);
    localStorage.setItem(KEYS.NOTIFICATION_KEY, JSON.stringify(allNotifications));
    return newNotification.id;
  } catch (error) {
    console.error('Error adding notification:', error);

  }
}

export function getLocalNotifications(id) {
  try {
    const stored = localStorage.getItem(KEYS.NOTIFICATION_KEY);
    if (!stored) return [];
    const all = JSON.parse(stored);
    return all
      .filter(n => n.userId === id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];

  }
}

export function clearNotifications(id) {
  try {
    const stored = localStorage.getItem(KEYS.NOTIFICATION_KEY);
    if (!stored) return [];
    const all = JSON.parse(stored);
    return all
      .filter(n => n.userId !== id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return [];
  }
}

export function markNotificationsRead(id) {
  try {
    const stored = localStorage.getItem(KEYS.NOTIFICATION_KEY);
    if (!stored) return;
    const all = JSON.parse(stored);
    const updated = all.filter(n => {
      if (n.userId === id) return { ...n, read: true };
      return n;
    });
    localStorage.setItem(KEYS.NOTIFICATION_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}