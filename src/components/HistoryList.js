'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAssignments, useHistory } from '../lib/state';
import { formatShortDate, formatStatus, isOverdue } from '../lib/utils';

export default function HistoryList({
  
}) {
  const { history, loading } = useHistory();
  const router = useRouter();

  const getActionButton = (history) => {
    const viewDetails = (
      <button 
          onClick={() => router.push(`/colaborador/history/${history.id}`)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Revisar
      </button>
    );
    return (
      <div>
        {viewDetails}
      </div>
    );
  };

  return (
    <div>
      {/* Assignments table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Fecha</th>
              <th className="py-2 px-4 border-b">Estado</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 px-4 text-center text-gray-500">
                  Cargando asignaciones...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td className="py-4 px-4 text-center text-gray-500">
                  No hay history
                </td>
              </tr>
            ) : (
              history.map((history) => {
                return (
                  <tr key={history.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{history.nombre}</td>
                    <td className="py-2 px-4 border-b">
                      {formatShortDate(history.fecha)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className={history.estado}>
                        {history.estado}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center gap-2">
                        {getActionButton(history)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
