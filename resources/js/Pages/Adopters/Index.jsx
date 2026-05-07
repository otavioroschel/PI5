import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DataBrowser from '@/Components/DataBrowser';
import BaseModal from '@/Components/Modals/BaseModal';

// ── Helpers de Formatação ─────────────────────────────────────────────────────
const formatCPF = (cpf) => {
    if (!cpf) return '—';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatPhone = (phone) => {
    if (!phone) return '—';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

// 🛡️ A FUNÇÃO DE DATA QUE FALTAVA AQUI!
const formatDate = (d) => {
    return d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';
};

// ── Ícones Genéricos ────────────────────────────────────────────────────────
const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const HistoryIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// ── 🚀 FORMULÁRIO ESPECIALIZADO DE ADOTANTE (Com ViaCEP) ────────────────────
const AdopterForm = ({ initialData, onSuccess, onCancel }) => {
    const isEditing = !!initialData;
    
    const { data, setData, post, put, processing, errors } = useForm({
        name: initialData?.name || '',
        cpf: initialData?.cpf || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        zip_code: initialData?.address?.zip_code || '',
        street: initialData?.address?.street || '',
        number: initialData?.address?.number || '',
        neighborhood: initialData?.address?.neighborhood || '',
        city: initialData?.address?.city || '',
        state: initialData?.address?.state || '',
    });

    const [loadingCep, setLoadingCep] = useState(false);

    const fetchCep = async (cepValue) => {
        const cep = cepValue.replace(/\D/g, ''); 
        if (cep.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const result = await response.json();

            if (!result.erro) {
                setData(prevData => ({
                    ...prevData,
                    street: result.logradouro,
                    neighborhood: result.bairro,
                    city: result.localidade,
                    state: result.uf
                }));
                document.getElementById('address_number')?.focus();
            } else {
                alert('CEP não encontrado.');
            }
        } catch (error) {
            console.error("Erro ao consultar CEP:", error);
        } finally {
            setLoadingCep(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('adopters.update', initialData.id), { onSuccess });
        } else {
            post(route('adopters.store'), { onSuccess });
        }
    };

    const InputGroup = ({ label, id, type = "text", value, onChange, error, onBlur, disabled, maxLength, placeholder }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                id={id} type={type} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} maxLength={maxLength} placeholder={placeholder}
                className={`w-full rounded-lg text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 
                ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'}
                ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 👤 Dados Pessoais */}
                <InputGroup label="Nome Completo" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                <InputGroup label="CPF (Apenas números)" value={data.cpf} onChange={e => setData('cpf', e.target.value.replace(/\D/g, ''))} error={errors.cpf} maxLength="11" />
                <InputGroup label="Telefone/WhatsApp" value={data.phone} onChange={e => setData('phone', e.target.value)} error={errors.phone} />
                <InputGroup label="E-mail" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} />

                {/* 📍 Endereço */}
                <div className="col-span-1 sm:col-span-2 mt-2 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Endereço</h4>
                </div>

                {/* Campo CEP com Loading */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                        type="text" maxLength="9" placeholder="00000-000" autoComplete="postal-code"
                        className={`w-full rounded-lg text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 ${errors.zip_code ? 'border-red-500' : ''}`}
                        value={data.zip_code}
                        onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, ''); 
                            if (val.length > 5) {
                                val = val.replace(/^(\d{5})(\d)/, '$1-$2'); 
                            }
                            setData('zip_code', val);
                            if (val.replace(/\D/g, '').length === 8) fetchCep(val);
                        }}
                        onBlur={(e) => {
                            if (e.target.value.replace(/\D/g, '').length === 8) {
                                fetchCep(e.target.value);
                            }
                        }}
                    />
                    {loadingCep && (
                        <div className="absolute right-3 top-8">
                            <span className="flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                        </div>
                    )}
                    {errors.zip_code && <p className="mt-1 text-xs text-red-600">{errors.zip_code}</p>}
                </div>

                <InputGroup label="Logradouro (Rua/Av)" value={data.street} onChange={e => setData('street', e.target.value)} error={errors.street} disabled={loadingCep} />
                <InputGroup id="address_number" label="Número" value={data.number} onChange={e => setData('number', e.target.value)} error={errors.number} />
                <InputGroup label="Bairro" value={data.neighborhood} onChange={e => setData('neighborhood', e.target.value)} error={errors.neighborhood} disabled={loadingCep} />
                <InputGroup label="Cidade" value={data.city} onChange={e => setData('city', e.target.value)} error={errors.city} disabled={loadingCep} />
                <InputGroup label="UF" value={data.state} onChange={e => setData('state', e.target.value)} error={errors.state} disabled={loadingCep} maxLength="2" />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancelar
                </button>
                <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    {processing ? 'Salvando...' : 'Confirmar'}
                </button>
            </div>
        </form>
    );
};

// ── TELA PRINCIPAL ──────────────────────────────────────────────────────────
export default function Index({ auth, adopters = [] }) {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });
    const closeModal = () => setModalConfig({ isOpen: false, data: null });
    
    const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

    const tableColumns = [
        { label: 'NOME', key: 'name', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
        { label: 'CPF', key: 'cpf', render: (val) => formatCPF(val) },
        { label: 'CONTATO', key: 'phone', render: (val, adopter) => (
            <div className="flex flex-col">
                <span>{formatPhone(val)}</span>
                <span className="text-xs text-gray-500">{adopter.email || 'Sem e-mail'}</span>
            </div>
        )},
        { label: 'LOCALIDADE', key: 'address', render: (_, adopter) => (
            <span className="text-gray-600">
                {adopter.address?.city} - {adopter.address?.state}
            </span>
        )},
        { label: 'AÇÕES', key: 'actions', render: (_, adopter) => (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setViewModal({ isOpen: true, data: adopter })}
                    className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                    title="Ver Histórico Completo"
                >
                    <HistoryIcon />
                </button>

                <button 
                    onClick={() => setModalConfig({ isOpen: true, data: adopter })}
                    className="p-2 bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors"
                    title="Editar"
                >
                    <EditIcon />
                </button>

                <Link 
                    href={route('adopters.destroy', adopter.id)} 
                    method="delete" as="button" 
                    onClick={(e) => {
                        if (!confirm(`Tem certeza que deseja excluir ${adopter.name}? Esta ação não pode ser desfeita.`)) e.preventDefault();
                    }} 
                    className="p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
                    title="Excluir"
                >
                    <TrashIcon />
                </Link>
            </div>
        )}
    ];

    const searchFunction = (adopter, query) => {
        return (adopter.name || '').toLowerCase().includes(query) ||
               (adopter.cpf || '').includes(query) ||
               (adopter.address?.city || '').toLowerCase().includes(query);
    };

    const renderMobileCard = (adopter) => (
        <div key={adopter.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-900">{adopter.name}</h3>
                    <p className="text-sm text-gray-500">{formatCPF(adopter.cpf)}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setModalConfig({ isOpen: true, data: adopter })} className="text-indigo-600 p-1"><EditIcon /></button>
                </div>
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <p>📍 {adopter.address?.city} - {adopter.address?.state}</p>
                <p>📞 {formatPhone(adopter.phone)}</p>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestão de Adotantes</h2>}>
            <Head title="Adotantes" />

            <DataBrowser 
    title="Adotantes Cadastrados"
    
    // 🛡️ A CORREÇÃO ESTÁ NESTA LINHA ABAIXO:
    data={adopters.data || adopters} 
    
    columns={tableColumns}
    renderMobileCard={renderMobileCard}
    onAddClick={() => setModalConfig({ isOpen: true, data: null })}
    addLabel="Novo Adotante"
    searchPlaceholder="Buscar por nome, CPF ou cidade..."
    searchFn={searchFunction}
/>

            {/* 🛡️ 1. MODAL DE CADASTRO E EDIÇÃO (Aquele que havia sumido) */}
            <BaseModal 
                isOpen={modalConfig.isOpen} 
                onClose={closeModal} 
                title={modalConfig.data ? 'Editar Adotante' : 'Cadastrar Adotante'}
            >
                {modalConfig.isOpen && (
                    <AdopterForm 
                        initialData={modalConfig.data} 
                        onSuccess={closeModal} 
                        onCancel={closeModal} 
                    />
                )}
            </BaseModal>

            {/* 🛡️ 2. MODAL DE DOSSIÊ/HISTÓRICO */}
            <BaseModal 
                isOpen={viewModal.isOpen} 
                onClose={() => setViewModal({ isOpen: false, data: null })}
                title={`Dossiê: ${viewModal.data?.name}`}
            >
                {viewModal.data && (
                    <div className="p-6 space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Informações de Base</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <p><strong>CPF:</strong> {formatCPF(viewModal.data.cpf)}</p>
                                <p><strong>Telefone:</strong> {formatPhone(viewModal.data.phone)}</p>
                                <p className="col-span-2"><strong>Endereço:</strong> {viewModal.data.address?.street}, {viewModal.data.address?.number} - {viewModal.data.address?.city}/{viewModal.data.address?.state}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <h4 className="text-xs font-bold text-amber-700 uppercase mb-3 flex items-center gap-2">
                                ⚠️ Histórico de Adoções / Devoluções
                            </h4>
                            
                            {viewModal.data.adoptions?.length > 0 ? (
                                <div className="space-y-3">
                                    {viewModal.data.adoptions.map(adoption => (
                                        <div key={adoption.id} className={`p-3 rounded-lg border ${adoption.returned_at ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-gray-700">
                                                    🐾 {adoption.animal?.name}
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${adoption.returned_at ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-700'}`}>
                                                    {adoption.returned_at ? 'Devolvido' : 'Adotado'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500">
                                                {adoption.returned_at 
                                                    ? `Devolução em: ${formatDate(adoption.returned_at)}` 
                                                    : `Adotado em: ${formatDate(adoption.adoption_date)}`}
                                            </p>
                                            {adoption.return_reason && (
                                                <p className="mt-2 text-[11px] italic text-red-700 bg-red-100/50 p-2 rounded">
                                                    <strong>Motivo:</strong> {adoption.return_reason}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-amber-600 italic">Nenhum histórico de adoção registrado para este perfil.</p>
                            )}
                        </div>
                    </div>
                )}
            </BaseModal>

        </AuthenticatedLayout>
    );
}