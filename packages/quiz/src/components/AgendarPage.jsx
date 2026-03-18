import React, { useMemo } from 'react';
import BookingCalendar from './BookingCalendar';

export default function AgendarPage() {
  const params = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    return {
      nombre: sp.get('nombre') || '',
      email: sp.get('email') || '',
      phone: sp.get('phone') || '',
      clinica: sp.get('clinica') || '',
      contactId: sp.get('contactId') || '',
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="bg-[#2C3E50] text-white text-center py-3 px-4 text-sm font-semibold">
        Hospital Capilar — Agendar Consulta Diagnóstica
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {params.nombre ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Paciente</p>
            <p className="font-bold text-gray-900">{params.nombre}</p>
            {params.email && <p className="text-sm text-gray-500">{params.email}</p>}
            {params.phone && <p className="text-sm text-gray-500">{params.phone}</p>}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-amber-800 text-sm font-medium">
              No se han recibido datos del paciente. Asegúrate de usar el link desde el CRM.
            </p>
          </div>
        )}

        <div className="bg-[#4CA994]/5 border border-[#4CA994]/20 rounded-2xl p-5">
          <BookingCalendar
            nombre={params.nombre}
            email={params.email}
            telefono={params.phone}
            ubicacion={params.clinica}
            contactId={params.contactId}
          />
        </div>
      </div>
    </div>
  );
}
