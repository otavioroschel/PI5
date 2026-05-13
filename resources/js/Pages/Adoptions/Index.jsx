import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react'; // 🛡️ Adicione o useEffect
import BaseModal from '@/Components/Modals/BaseModal';

const translateSpecies = { dog: 'Cachorro', cat: 'Gato' };
const translateSize = { small: 'Pequeno', medium: 'Médio', large: 'Grande' };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

export default function Index({ auth, adoptions, filters }) { // 🛡️ Receba o 'filters' aqui
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, data: null });
    const [returnModal, setReturnModal] = useState({ isOpen: false, adoption: null });
    
    // 🛡️ Estado da barra de pesquisa
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const { data, setData, patch, processing, reset, errors } = useForm({
        return_reason: '',
    });

    // 🛡️ Efeito para buscar automaticamente ao digitar (Debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('adoptions.index'), { search: searchTerm }, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }, 300); // Espera 300ms após a última tecla
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleReturn = (e) => {
        e.preventDefault();
        patch(route('adoptions.return', returnModal.adoption.id), {
            onSuccess: () => {
                setReturnModal({ isOpen: false, adoption: null });
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Histórico de Adoções</h2>}
        >
            <Head title="Histórico de Adoções" />

            <div className="py-10">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* 🛡️ CABEÇALHO DA TABELA COM BARRA DE PESQUISA */}
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Adoções Concluídas</h1>
                            <p className="text-gray-500 mt-1">Histórico de animais que ganharam um novo lar.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="text"
                                    placeholder="Buscar CPF, Adotante ou Animal..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                                {/* Ícone de Lupa */}
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>
                            
                            <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm whitespace-nowrap">
                                Total: {adoptions.total}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="border-b border-gray-100 bg-gray-50/80">
                                    <tr>
                                        {/* Ações não é mais "text-right" */}
                                        {['DATA DA ADOÇÃO', 'ANIMAL', 'ESPÉCIE', 'ADOTANTE', 'CPF ADOTANTE', 'AÇÕES'].map((h) => (
                                            <th key={h} className="px-6 py-4 text-[11px] font-bold tracking-wider text-gray-500 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {adoptions.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                                Nenhum registro encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        adoptions.data.map((adoption) => (
                                            <tr key={adoption.id} className="hover:bg-gray-50/50 transition-colors">
                                                {/* ... (Data, Animal, Espécie, Adotante, CPF continuam iguais) ... */}
                                                
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{formatDate(adoption.adoption_date)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {adoption.animal?.photo_url ? (
                                                            <img src={adoption.animal.photo_url} alt="Pet" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">🐾</div>
                                                        )}
                                                        <span className="font-bold text-gray-800">{adoption.animal?.name || 'Animal Removido'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{translateSpecies[adoption.animal?.species] || adoption.animal?.species || '—'}</td>
                                                <td className="px-6 py-4 font-semibold">
                                                    <button onClick={() => setDetailsModal({ isOpen: true, data: adoption })} className="text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none">
                                                        {adoption.adopter?.name || 'Adotante Removido'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{adoption.adopter?.cpf || '—'}</td>

                                                {/* 🛡️ AÇÕES CORRIGIDAS (Alinhamento à esquerda, sem ficar colado na borda direita) */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-start h-full min-h-[40px]">
                                                        {!adoption.returned_at ? (
                                                            <button 
                                                                onClick={() => setReturnModal({ isOpen: true, adoption: adoption })}
                                                                className="text-[10px] font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors border border-red-100 whitespace-nowrap"
                                                            >
                                                                DEVOLVER ANIMAL
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200 whitespace-nowrap">
                                                                Devolvido em {formatDate(adoption.returned_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* ... (Paginação e Modais continuam iguais) ... */}

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

            {/* ── 1. MODAL DE DOSSIÊ DE ADOÇÃO ── */}
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
                                    <span className="block text-gray-400 text-xs">Telefone de Contato</span>
                                    <span className="font-medium text-gray-900">{detailsModal.data.adopter?.phone || detailsModal.data.adopter?.telefone || 'Não informado'}</span>
                                </div>
                                
                                <div className="sm:col-span-2">
                                    <span className="block text-gray-400 text-xs">Endereço Completo</span>
                                    <span className="font-medium text-gray-900">
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

                            {/* Alerta de Devoluções Anteriores */}
                            {/* Alerta de Devoluções Anteriores */}
<div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
    <h4 className="text-xs font-bold text-amber-700 uppercase mb-3">⚠️ Histórico de Devoluções</h4>
    {detailsModal.data.adopter?.adoptions?.filter(a => a.returned_at).length > 0 ? (
        <ul className="space-y-2">
            {detailsModal.data.adopter.adoptions.filter(a => a.returned_at).map(ret => (
                <li key={ret.id} className="text-xs text-amber-900 bg-amber-100/60 p-2 rounded border border-amber-200/50 leading-relaxed">
                    <span className="font-mono bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded mr-2">
                        {formatDate(ret.returned_at)}
                    </span>
                    <strong>Animal:</strong> {ret.animal?.name} <br className="sm:hidden" />
                    <span className="hidden sm:inline"> | </span> 
                    <strong>Motivo:</strong> {ret.return_reason}
                </li>
            ))}
        </ul>
    ) : (
        <p className="text-xs text-amber-600 italic">Nenhum registro de devolução anterior para este CPF.</p>
    )}
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
                                            {(translateSize[detailsModal.data.animal?.size] || detailsModal.data.animal?.size)?.toUpperCase()} 
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

            {/* ── 2. MODAL DE REGISTRO DE DEVOLUÇÃO ── */}
            <BaseModal 
                isOpen={returnModal.isOpen} 
                onClose={() => {
                    setReturnModal({ isOpen: false, adoption: null });
                    reset();
                }}
                title="Registrar Devolução"
            >
                <form onSubmit={handleReturn} className="p-6">
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0 text-xl">⚠️</div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-800">
                                    Você está registrando a devolução de <strong>{returnModal.adoption?.animal?.name}</strong>. 
                                    O animal voltará para a lista de ativos com o status <span className="font-bold">"Devolvido"</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Motivo da Devolução
                            </label>
                            <textarea
                                rows="4"
                                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${errors.return_reason ? 'border-red-500' : ''}`}
                                placeholder="Descreva o motivo detalhadamente (mínimo 10 caracteres)..."
                                value={data.return_reason}
                                onChange={e => setData('return_reason', e.target.value)}
                            ></textarea>
                            {errors.return_reason && (
                                <p className="mt-1 text-xs text-red-600">{errors.return_reason}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setReturnModal({ isOpen: false, adoption: null });
                                reset();
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Processando...' : 'Confirmar Devolução'}
                        </button>
                    </div>
                </form>
            </BaseModal>

        </AuthenticatedLayout>
    );
}