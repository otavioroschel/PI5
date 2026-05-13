// resources/js/Pages/Admin/Leads/Index.jsx

import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApproveLeadModal from '@/Components/Admin/ApproveLeadModal'; // <-- Importando o componente do Modal

export default function LeadsIndex({ leads }) {
    // Controla qual solicitação de adoção está selecionada para o modal
    const [approvingLead, setApprovingLead] = useState(null);

    return (
        <div className="p-6">
            <Head title="Solicitações de Adoção" />
            
            <h1 className="text-2xl font-bold mb-6">Interessados em Adoção</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interessado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal Desejado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {leads.data.map((lead) => (
                            <tr key={lead.id}>
                                <td className="px-6 py-4">{lead.adopter_name}</td>
                                <td className="px-6 py-4">
                                    <p>{lead.adopter_phone}</p>
                                    <p className="text-sm text-gray-500">{lead.adopter_email}</p>
                                </td>
                                <td className="px-6 py-4 font-semibold text-blue-600">
                                    {lead.animal.name}
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    {/* AQUI MUDA: Ao clicar, definimos o estado "approvingLead" 
                                        com os dados deste lead específico.
                                    */}
                                    <button 
                                        onClick={() => setApprovingLead(lead)}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                                    >
                                        Aprovar e Cadastrar
                                    </button>
                                    
                                    <button className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200 transition">
                                        Recusar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* RENDERIZAÇÃO CONDICIONAL DO MODAL:
                Se o estado "approvingLead" não for nulo, o Modal é montado na tela.
                Passamos a função onClose para "limpar" o estado e fechar o modal.
            */}
            {approvingLead && (
                <ApproveLeadModal 
                    lead={approvingLead} 
                    onClose={() => setApprovingLead(null)} 
                />
            )}
        </div>
    );
}