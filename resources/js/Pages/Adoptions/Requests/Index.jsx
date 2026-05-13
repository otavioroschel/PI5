import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, requests }) {
    // 🛡️ Sanitização para o WhatsApp mantida
    const getWhatsAppLink = (phone) => {
        if (!phone) return '#';
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
            cleanPhone = `55${cleanPhone}`;
        }
        return `https://wa.me/${cleanPhone}`;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Interessados em Adoção" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Interessados em Adoção</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-3 px-4 font-semibold text-sm text-gray-600">Candidato</th>
                                        <th className="py-3 px-4 font-semibold text-sm text-gray-600">Contato</th>
                                        <th className="py-3 px-4 font-semibold text-sm text-gray-600">Animal</th>
                                        <th className="py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                                        <th className="py-3 px-4 font-semibold text-sm text-gray-600">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.data.map((req) => (
                                        <tr key={req.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-900">{req.adopter_name}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-600">{req.adopter_email}</div>
                                                <a 
                                                    href={getWhatsAppLink(req.adopter_phone)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-green-600 hover:text-green-800 hover:underline flex items-center gap-1 mt-0.5 w-max"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                                    {req.adopter_phone}
                                                </a>
                                            </td>
                                            <td className="py-3 px-4">
                                                {/* 🚀 O redirecionamento SPA seguro acontece aqui */}
                                                {req.animal ? (
                                                  <Link 
    // 🚀 Adicionamos a query string indicando a origem
    href={`/animals/${req.animal.id}?from=requests`}
    className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm flex items-center gap-1 transition-colors w-max"
    title="Ver Dossiê Completo"
>
    {req.animal.name}
    <svg className="w-3.5 h-3.5 mt-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
</Link>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">Animal Removido</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full border 
                                                    ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                                    ${req.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                                    ${req.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                                `}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(req.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}