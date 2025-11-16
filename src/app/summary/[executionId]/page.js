'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getExecution, getAssignment } from '../../../lib/storage';
import { useCurrentUser } from '../../../lib/state';
import { formatDate } from '../../../lib/utils';
import '../summary.css';

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
  const renderFieldValue = (respuesta) => {
    const { valor, pasoId } = respuesta;

    if (valor === null || valor === undefined || valor === '') {
      return <em className="text-gray-400 italic">No respondido</em>
    }
    if (typeof valor === 'string') {
      //si el valor son enlaces de imagen, mostrar la imagen
      if (valor.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
        valor.startsWith('data:image/') ||
        valor.includes('foto') ||
        valor.includes('imagen') ||
        pasoId.toLowerCase().includes('foto') ||
        pasoId.toLowerCase().includes('imagen')) {
        return (
          <div className="mt-2">
            <img
              src={valor}
              alt={`Imagen para ${pasoId}`}
              className="field-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{ display: 'none' }} className="text-sm text-gray-500">
              Enlace a imagen: <a href={valor} target="_blank" rel="noopener noreferrer" className="field-url">{valor}</a>
            </div>
          </div>
        );
      }

      // Firmas (en caso de que sean data URLs)
      if (valor.startsWith('data:image/') && (
        pasoId.toLowerCase().includes('firma') ||
        pasoId.toLowerCase().includes('signature'))) {
        return (
          <div className="mt-2">
            <div className="summary-meta-label">Firma:</div>
            <img
              src={valor}
              alt="Firma"
              className="field-signature"
            />
          </div>
        );
      }
      if (valor.startsWith('http')) {
        return (
          <a href={valor} target="_blank" rel="noopener noreferrer" className="field-url">
            {valor}
          </a>
        );
      }

      // Textos largos
      if (valor.length > 100) {
        return (
          <div className="field-long-text">
            {valor}
          </div>
        );
      }
    }

    // Booleanos
    if (typeof valor === 'boolean') {
      return (
        <span className={`field-boolean ${valor ? 'field-boolean-true' : 'field-boolean-false'}`}>
          {valor ? 'Sí' : 'No'}
        </span>
      );
    }
    return <span className="whitespace-pre-wrap break-words">{String(valor)}</span>;

  };

  //funcion para agrupar respuestas por seccion
  const groupResponses = (respuestas = []) => {
    if (!respuestas) return { grouped: false, data: [] };

    const visibleResponses = respuestas.filter(r => r.visible !== false);
    return { grouped: false, data: visibleResponses }
  };
  const responseGroups = execution ? groupResponses(execution.respuestas) : { grouped: false, data: [] };
}

return (
  <div className="summary-container">
    {/* Encabezado */}
    <div className="summary-header">
      <div className="summary-back-link">
        {currentUser?.role === 'Supervisor' ? (
          <Link href="/supervisor" className="summary-back-link">
            <svg className="summary-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al panel de supervisor
          </Link>
        ) : (
          <Link href="/colaborador" className="summary-back-link">
            <svg className="summary-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al panel de colaborador
          </Link>
        )}
      </div>

      <div className="summary-title-section">
        <h1 className="summary-main-title">Resumen de Ejecución</h1>

        {execution && (
          <div className="summary-meta-grid">
            <div className="summary-meta-item">
              <span className="summary-meta-label">Checklist</span>
              <span className="summary-meta-value">{execution.checklist}</span>
            </div>
            <div className="summary-meta-item">
              <span className="summary-meta-label">Ejecutado por</span>
              <span className="summary-meta-value">{execution.user}</span>
            </div>
            <div className="summary-meta-item">
              <span className="summary-meta-label">Fecha de ejecución</span>
              <span className="summary-meta-value">{formatDate(execution.timestamp)}</span>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Estados de carga y error */}
    {loading ? (
      <div className="loading-state">
        <div>Cargando datos...</div>
      </div>
    ) : error ? (
      <div className="error-state">
        <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span>{error}</span>
      </div>
    ) : (
      <>
        {/* Botón de revisión */}
        {showReviewButton() && (
          <div className="action-buttons">
            <Link
              href={`/supervisor/review/${assignment.id}`}
              className="review-button"
            >
              <svg className="review-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ir a revisión
            </Link>
          </div>
        )}

        {/* Respuestas del Checklist */}
        <div className="summary-card">
          <div className="summary-card-header">
            <h2 className="summary-card-title">Respuestas del Checklist</h2>
            <p className="summary-card-subtitle">
              {responseGroups.data.length} {responseGroups.data.length === 1 ? 'respuesta' : 'respuestas'} registradas
            </p>
          </div>

          <div className="summary-card-body">
            {responseGroups.data.length === 0 ? (
              <div className="loading-state">
                No hay respuestas para mostrar en esta ejecución.
              </div>
            ) : (
              <div className="responses-container">
                {responseGroups.data.map((respuesta, index) => (
                  <div key={respuesta.pasoId || index} className="response-item">
                    <div className="response-header">
                      <div className="response-question">
                        {respuesta.pasoId || `Paso ${index + 1}`}
                      </div>
                      {respuesta.valido === false && (
                        <span className="summary-status-badge validation-invalid">
                          Inválido
                        </span>
                      )}
                    </div>
                    <div className="response-value">
                      {renderFieldValue(respuesta)}
                    </div>
                    {respuesta.errores && respuesta.errores.length > 0 && (
                      <div className="validation-errors">
                        <ul className="validation-error-list">
                          {respuesta.errores.map((error, errorIndex) => (
                            <li key={errorIndex}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Información de la Asignación */}
        {assignment && (
          <div className="summary-card">
            <div className="summary-card-header">
              <h2 className="summary-card-title">Información de la Asignación</h2>
            </div>
            <div className="summary-card-body">
              <div className="assignment-info-grid">
                <div className="assignment-info-item">
                  <span className="assignment-info-label">Estado</span>
                  <span className={`summary-status-badge ${assignment.estado === 'Completada' ? 'status-completed' :
                    assignment.estado === 'En revisión' ? 'status-in-review' :
                      'status-active'
                    }`}>
                    {assignment.estado}
                  </span>
                </div>

                <div className="assignment-info-item">
                  <span className="assignment-info-label">Asignado a</span>
                  <span className="assignment-info-value">{assignment.asignadoA}</span>
                </div>

                <div className="assignment-info-item">
                  <span className="assignment-info-label">Creado por</span>
                  <span className="assignment-info-value">{assignment.creadoPor}</span>
                </div>

                <div className="assignment-info-item">
                  <span className="assignment-info-label">Fecha de vencimiento</span>
                  <span className="assignment-info-value">{formatDate(assignment.fechaVencimiento)}</span>
                </div>

                <div className="assignment-info-item">
                  <span className="assignment-info-label">Prioridad</span>
                  <span className={`summary-status-badge ${assignment.prioridad === 'Alta' ? 'priority-high' :
                    assignment.prioridad === 'Media' ? 'priority-medium' :
                      'priority-low'
                    }`}>
                    {assignment.prioridad}
                  </span>
                </div>

                <div className="assignment-info-item">
                  <span className="assignment-info-label">Checklist</span>
                  <span className="assignment-info-value">{assignment.checklistNombre}</span>
                </div>
              </div>

              {assignment.notas && (
                <div className="assignment-notes">
                  <div className="assignment-notes-label">Notas adicionales</div>
                  <div className="assignment-notes-content">{assignment.notas}</div>
                </div>
              )}
            </div>
          </div>
        )}


      </>
    )}
  </div>
);
