import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import BaseModal from '@/Components/Modals/BaseModal';

// Helpers inline de tradução e formatação
const translateSpecies = { dog: 'Cachorro', cat: 'Gato' };

const translateSize = { 
    small: 'Pequeno', 
    medium: 'Médio', 
    large: 'Grande' 
};
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

export default function Index({ auth, adoptions }) {
    // Estado para controlar o Modal do Dossiê
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, data: null });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Histórico de Adoções</h2>}
        >
            <Head title="Histórico de Adoções" />

            <div className="py-10">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Adoções Concluídas</h1>
                            <p className="text-gray-500 mt-1">Histórico de animais que ganharam um novo lar.</p>
                        </div>
                        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                            Total: {adoptions.total} registros
                        </div>
                    </div>

                    {/* A SUA TABELA ORIGINAL */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="border-b border-gray-100 bg-gray-50/80">
                                    <tr>
                                        {['DATA DA ADOÇÃO', 'ANIMAL', 'ESPÉCIE', 'ADOTANTE', 'CPF ADOTANTE'].map((h) => (
                                            <th key={h} className="px-6 py-4 text-[11px] font-bold tracking-wider text-gray-500 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {adoptions.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                Nenhuma adoção registrada ainda.
                                            </td>
                                        </tr>
                                    ) : (
                                        adoptions.data.map((adoption) => (
                                            <tr key={adoption.id} className="hover:bg-gray-50/50 transition-colors">
                                                {/* Data da Adoção */}
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {formatDate(adoption.adoption_date)}
                                                </td>

                                                {/* Informações do Animal */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {adoption.animal?.photo_url ? (
                                                            <img 
                                                                src={adoption.animal.photo_url} 
                                                                alt={adoption.animal.name} 
                                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                                                🐾
                                                            </div>
                                                        )}
                                                        <span className="font-bold text-gray-800">
                                                            {adoption.animal?.name || 'Animal Removido'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Espécie */}
                                                <td className="px-6 py-4 text-gray-600">
                                                    {translateSpecies[adoption.animal?.species] || adoption.animal?.species || '—'}
                                                </td>

                                                {/* Adotante (AGORA CLICÁVEL) */}
                                                <td className="px-6 py-4 font-semibold">
                                                    <button 
                                                        onClick={() => setDetailsModal({ isOpen: true, data: adoption })}
                                                        className="text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                                                        title="Ver Dossiê Completo"
                                                    >
                                                        {adoption.adopter?.name || 'Adotante Removido'}
                                                    </button>
                                                </td>

                                                {/* Documento Básico */}
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs tracking-tight">
                                                    {adoption.adopter?.cpf || '—'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginação Nativa do Laravel */}
                    {adoptions.links && adoptions.links.length > 3 && (
                        <div className="mt-6 flex justify-center gap-1">
                            {adoptions.links.map((link, k) => (
                                <a 
                                    key={k} 
                                    href={link.url || '#'} 
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                                        link.active 
                                        ? 'bg-indigo-600 text-white border-indigo-600' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── MODAL DE DOSSIÊ DE ADOÇÃO ── */}
            <BaseModal 
                isOpen={detailsModal.isOpen} 
                onClose={() => setDetailsModal({ isOpen: false, data: null })}
                title="Dossiê Completo de Adoção"
            >
                {detailsModal.data && (
                    <div className="p-6 space-y-6 bg-gray-50/50">
                        
                        {/* Dados do Adotante */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">👤 Informações de Contato</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-400 text-xs">Nome Completo</span>
                                    <span className="font-medium text-gray-900">{detailsModal.data.adopter?.name}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-xs">Documento (CPF)</span>
                                    <span className="font-mono text-gray-700">{detailsModal.data.adopter?.cpf}</span>
                                </div>
                                <div>
                                    {/* ATENÇÃO: Ajuste "phone" para o nome da coluna no seu banco (ex: telefone) */}
                                    <span className="block text-gray-400 text-xs">Telefone de Contato</span>
                                    <span className="font-medium text-gray-900">{detailsModal.data.adopter?.phone || detailsModal.data.adopter?.telefone || 'Não informado'}</span>
                                </div>
                                
                                <div className="sm:col-span-2">
    <span className="block text-gray-400 text-xs">Endereço Completo</span>
    <span className="font-medium text-gray-900">
        {/* Acessamos o nível .address antes das propriedades da tabela */}
        {detailsModal.data.adopter?.address?.street ? (
            <>
                {detailsModal.data.adopter.address.street}, {detailsModal.data.adopter.address.number}
                {detailsModal.data.adopter.address.neighborhood && ` - ${detailsModal.data.adopter.address.neighborhood}`}
                {detailsModal.data.adopter.address.city && ` - ${detailsModal.data.adopter.address.city}/${detailsModal.data.adopter.address.state}`}
                {detailsModal.data.adopter.address.zip_code && ` (CEP: ${detailsModal.data.adopter.address.zip_code})`}
            </>
        ) : (
            <span className="text-gray-400 italic">Endereço não cadastrado detalhadamente.</span>
        )}
    </span>
</div>
                            </div>
                        </div>

                        {/* Dados do Animal */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">🐾 Animal Adotado</h3>
                            <div className="flex flex-col sm:flex-row gap-6">
                                {detailsModal.data.animal?.photo_url ? (
                                    <img 
                                        src={detailsModal.data.animal.photo_url} 
                                        alt={detailsModal.data.animal.name} 
                                        className="w-24 h-24 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-3xl">
                                        🐾
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4 text-sm w-full">
                                    <div>
                                        <span className="block text-gray-400 text-xs">Nome</span>
                                        <span className="font-medium text-gray-900">{detailsModal.data.animal?.name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs">Espécie</span>
                                        <span className="font-medium text-gray-900">{translateSpecies[detailsModal.data.animal?.species] || detailsModal.data.animal?.species}</span>
                                    </div>
                                    <div>
    <span className="block text-gray-400 text-xs">Porte / Peso</span>
    <span className="font-medium text-gray-900">
        {/* Usamos a tradução. Se por acaso vier algo fora do dicionário, ele faz o fallback para o original em maiúsculo */}
        {(translateSize[detailsModal.data.animal?.size] || detailsModal.data.animal?.size)?.toUpperCase()} 
        
        {/* O peso continua concatenado de forma segura */}
        {detailsModal.data.animal?.weight && ` • ${detailsModal.data.animal.weight}kg`}
    </span>
</div>
                                    <div>
                                        <span className="block text-gray-400 text-xs">Status Médico na Saída</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {detailsModal.data.animal?.is_vaccinated ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Vacinado</span> : null}
                                            {detailsModal.data.animal?.is_neutered ? <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">Castrado</span> : null}
                                            {detailsModal.data.animal?.is_dewormed ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">Vermifugado</span> : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </BaseModal>

        </AuthenticatedLayout>
    );
}