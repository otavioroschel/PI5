import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DataBrowser from '@/Components/DataBrowser';
import BaseModal from '@/Components/Modals/BaseModal';

// ── Helpers de Formatação ─────────────────────────────────────────────────────
const formatPhone = (phone) => {
    if (!phone) return '—';
    return phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

// ── Ícones Genéricos ────────────────────────────────────────────────────────
const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);
const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const HomeIcon = () => (
    <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

// ── 🚀 FORMULÁRIO ESPECIALIZADO DE LAR TEMPORÁRIO (Com ViaCEP Seguro) ──────────────
const TemporaryHomeForm = ({ initialData, onSuccess, onCancel }) => {
    const isEditing = !!initialData;
    
    const { data, setData, post, put, processing, errors } = useForm({
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        max_capacity: initialData?.max_capacity || 1,
        notes: initialData?.notes || '',
        // Endereço Achatado
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
            // CORREÇÃO APLICADA: Utilização estrita da variável de escopo local 'cep'
            const response = await fetch(`/api/cep/${cep}`);
            const result = await response.json();

            if (!result.erro) {
                setData(prevData => ({
                    ...prevData,
                    street: result.logradouro,
                    neighborhood: result.bairro,
                    city: result.localidade,
                    state: result.uf
                }));
                // UX: Direciona o foco para o número após o autopreenchimento
                setTimeout(() => document.getElementById('address_number')?.focus(), 100);
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
            put(route('temporary-homes.update', initialData.id), { onSuccess });
        } else {
            post(route('temporary-homes.store'), { onSuccess });
        }
    };

    const InputGroup = ({ label, id, type = "text", value, onChange, error, onBlur, disabled, maxLength, placeholder, min }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                id={id} type={type} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} maxLength={maxLength} placeholder={placeholder} min={min}
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
                {/* 👤 Informações do Lar */}
                <div className="col-span-1 sm:col-span-2">
                    <InputGroup label="Nome do Responsável / Família" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                </div>
                
                <InputGroup label="Telefone/WhatsApp" value={data.phone} onChange={e => setData('phone', e.target.value)} error={errors.phone} />
                <InputGroup label="Capacidade Máxima (Animais)" type="number" min="1" value={data.max_capacity} onChange={e => setData('max_capacity', e.target.value)} error={errors.max_capacity} />
                
                <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anotações (Restrições, regras do condomínio, etc.)</label>
                    <textarea 
                        rows="2" className="w-full rounded-lg border-gray-300 focus:border-indigo-500 text-sm shadow-sm resize-none" 
                        value={data.notes} onChange={e => setData('notes', e.target.value)}
                    ></textarea>
                </div>

                {/* 📍 Endereço */}
                <div className="col-span-1 sm:col-span-2 mt-2 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Endereço do Lar</h4>
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
                            if (val.length > 5) val = val.replace(/^(\d{5})(\d)/, '$1-$2'); 
                            setData('zip_code', val);
                            if (val.replace(/\D/g, '').length === 8) fetchCep(val);
                        }}
                        onBlur={(e) => {
                            if (e.target.value.replace(/\D/g, '').length === 8) fetchCep(e.target.value);
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
export default function Index({ auth, temporaryHomes = [] }) {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });
    const [residentsModal, setResidentsModal] = useState({ isOpen: false, animals: [], homeName: '' });
    
    const closeModal = () => setModalConfig({ isOpen: false, data: null });

    const tableColumns = [
        { label: 'RESPONSÁVEL / FAMÍLIA', key: 'name', render: (val, home) => (
            <div>
                <span className="font-bold text-gray-900 block">{val}</span>
                <span className="text-xs text-gray-500">{formatPhone(home.phone)}</span>
            </div>
        )},
        { label: 'CAPACIDADE', key: 'max_capacity', render: (val, home) => (
            <button 
                onClick={() => setResidentsModal({ isOpen: true, animals: home.animals || [], homeName: home.name })}
                className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
            >
                {home.animals?.length || 0} / {val} {val == 1 ? 'animal' : 'animais'}
            </button>
        )},
        { label: 'LOCALIDADE', key: 'address', render: (_, home) => (
            <span className="text-gray-600">
                {home.address?.city} - {home.address?.state}
            </span>
        )},
        { label: 'AÇÕES', key: 'actions', render: (_, home) => (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setModalConfig({ isOpen: true, data: home })}
                    className="p-2 bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors"
                    title="Editar"
                >
                    <EditIcon />
                </button>
                <Link 
                    href={route('temporary-homes.destroy', home.id)} 
                    method="delete" as="button" 
                    onClick={(e) => {
                        if (!confirm(`Tem certeza que deseja excluir o lar de ${home.name}?`)) e.preventDefault();
                    }} 
                    className="p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
                    title="Excluir"
                >
                    <TrashIcon />
                </Link>
            </div>
        )}
    ];

    const searchFunction = (home, query) => {
        return (home.name || '').toLowerCase().includes(query) ||
               (home.phone || '').includes(query) ||
               (home.address?.city || '').toLowerCase().includes(query);
    };

    const renderMobileCard = (home) => (
        <div key={home.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="mt-1"><HomeIcon /></div>
                    <div>
                        <h3 className="font-bold text-gray-900">{home.name}</h3>
                        <p className="text-sm text-gray-500">{formatPhone(home.phone)}</p>
                    </div>
                </div>
                <button onClick={() => setModalConfig({ isOpen: true, data: home })} className="text-indigo-600 p-1"><EditIcon /></button>
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100 text-sm">
                <span className="text-gray-600">📍 {home.address?.city}/{home.address?.state}</span>
                <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Cap: {home.max_capacity}</span>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Lares Temporários</h2>}>
            <Head title="Lares Temporários" />

            <DataBrowser 
                title="Rede de Apoio"
                data={temporaryHomes.data || temporaryHomes}
                columns={tableColumns}
                renderMobileCard={renderMobileCard}
                onAddClick={() => setModalConfig({ isOpen: true, data: null })}
                addLabel="Cadastrar Lar"
                searchPlaceholder="Buscar por nome, cidade ou telefone..."
                searchFn={searchFunction}
            />

            {/* CORREÇÃO APLICADA: Modal de Cadastro e Edição agora está sendo renderizado */}
            <BaseModal 
                isOpen={modalConfig.isOpen} 
                onClose={closeModal} 
                title={modalConfig.data ? `Editar Lar: ${modalConfig.data.name}` : 'Cadastrar Novo Lar Temporário'}
            >
                <TemporaryHomeForm 
                    initialData={modalConfig.data} 
                    onSuccess={closeModal} 
                    onCancel={closeModal} 
                />
            </BaseModal>

            <BaseModal 
                isOpen={residentsModal.isOpen} 
                onClose={() => setResidentsModal({ isOpen: false, animals: [], homeName: '' })} 
                title={`Animais em: ${residentsModal.homeName}`}
            >
                <div className="p-6">
                    {residentsModal.animals.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {residentsModal.animals.map(animal => (
                                <div key={animal.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        {animal.photo_url ? (
                                            <img src={animal.photo_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">🐾</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-gray-800">{animal.name}</h4>
                                        <p className="text-xs text-gray-500">
                                            {animal.species === 'dog' ? 'Cachorro' : 'Gato'} • {animal.gender === 'male' ? 'Macho' : 'Fêmea'}
                                        </p>
                                    </div>
                                    <Link 
                                        href={`/animals/${animal.id}`}
                                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                                    >
                                        VER PERFIL
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400 text-sm">Nenhum animal nesta casa no momento.</p>
                        </div>
                    )}
                </div>
            </BaseModal>

        </AuthenticatedLayout>
    );
}