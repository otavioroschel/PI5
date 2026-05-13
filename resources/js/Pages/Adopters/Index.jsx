import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DataBrowser from '@/Components/DataBrowser';
import BaseModal from '@/Components/Modals/BaseModal';

// ── HELPERS DE FORMATAÇÃO (ESTÁTICOS) ─────────────────────────────────────────
const formatCPF = (cpf) => cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") || '—';
const formatPhone = (phone) => phone?.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") || '—';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

// ── ÍCONES ────────────────────────────────────────────────────────────────────
const EditIcon = () => ( <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> );
const TrashIcon = () => ( <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> );
const HistoryIcon = () => ( <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> );

// ── 🛡️ COMPONENTE DE INPUT ESTABILIZADO (EVITA PERDA DE FOCO) ──────────────────
const InputGroup = ({ label, id, type = "text", value, onChange, error, maxLength, placeholder, disabled }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            id={id} type={type} value={value} onChange={onChange} maxLength={maxLength} placeholder={placeholder} disabled={disabled}
            className={`w-full rounded-lg text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'} ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

// ── FORMULÁRIO DE ADOTANTE (LÓGICA VIACEP) ───────────────────────────────────
const AdopterForm = ({ initialData, onSuccess, onCancel }) => {
    const isEditing = !!initialData;
    const [loadingCep, setLoadingCep] = useState(false);

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

    const handleCepChange = async (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 5) val = val.replace(/^(\d{5})(\d)/, '$1-$2');
        setData('zip_code', val);

        if (val.replace(/\D/g, '').length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${val.replace(/\D/g, '')}/json/`);
                const result = await response.json();
                if (!result.erro) {
                    setData(prev => ({
                        ...prev,
                        zip_code: val,
                        street: result.logradouro || '',
                        neighborhood: result.bairro || '',
                        city: result.localidade || '',
                        state: result.uf || ''
                    }));
                    setTimeout(() => document.getElementById('address_number')?.focus(), 100);
                }
            } catch (err) { console.error(err); } finally { setLoadingCep(false); }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const action = isEditing ? put : post;
        const url = isEditing ? route('adopters.update', initialData.id) : route('adopters.store');
        action(url, { onSuccess, preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="Nome Completo" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                <InputGroup label="CPF (Números)" value={data.cpf} onChange={e => setData('cpf', e.target.value.replace(/\D/g, ''))} error={errors.cpf} maxLength="11" />
                <InputGroup label="Telefone" value={data.phone} onChange={e => setData('phone', e.target.value)} error={errors.phone} />
                <InputGroup label="E-mail" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} />
                <div className="col-span-2 border-t border-gray-100 pt-4 mt-2"><h4 className="text-xs font-bold text-gray-400 uppercase">Endereço</h4></div>
                <div className="relative">
                    <InputGroup label="CEP" value={data.zip_code} onChange={handleCepChange} error={errors.zip_code} maxLength="9" />
                    {loadingCep && <div className="absolute right-3 top-9 animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>}
                </div>
                <InputGroup label="Rua" value={data.street} onChange={e => setData('street', e.target.value)} error={errors.street} />
                <InputGroup id="address_number" label="Número" value={data.number} onChange={e => setData('number', e.target.value)} error={errors.number} />
                <InputGroup label="Bairro" value={data.neighborhood} onChange={e => setData('neighborhood', e.target.value)} error={errors.neighborhood} />
                <InputGroup label="Cidade" value={data.city} onChange={e => setData('city', e.target.value)} error={errors.city} />
                <InputGroup label="UF" value={data.state} onChange={e => setData('state', e.target.value)} error={errors.state} maxLength="2" />
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
                <button type="submit" disabled={processing} className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg font-bold">
                    {processing ? 'Salvando...' : 'Confirmar'}
                </button>
            </div>
        </form>
    );
};

// ── COMPONENTE PRINCIPAL (INDEX) ─────────────────────────────────────────────
export default function Index({ auth, adopters = [] }) {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });
    const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

    const closeModal = () => setModalConfig({ isOpen: false, data: null });

    const tableColumns = [
        { label: 'NOME', key: 'name', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
        { label: 'CPF', key: 'cpf', render: (val) => formatCPF(val) },
        { label: 'CONTATO', key: 'phone', render: (val, adopter) => (
            <div className="flex flex-col text-sm">
                <span>{formatPhone(val)}</span>
                <span className="text-xs text-gray-500">{adopter.email || 'Sem e-mail'}</span>
            </div>
        )},
        { label: 'LOCALIDADE', key: 'address', render: (_, adopter) => (
            <span className="text-sm text-gray-600">{adopter.address?.city} - {adopter.address?.state}</span>
        )},
        { label: 'AÇÕES', key: 'actions', render: (_, adopter) => (
            <div className="flex items-center gap-2">
                <button onClick={() => setViewModal({ isOpen: true, data: adopter })} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Ver Dossiê"><HistoryIcon /></button>
                <button onClick={() => setModalConfig({ isOpen: true, data: adopter })} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-indigo-100" title="Editar"><EditIcon /></button>
                <Link href={route('adopters.destroy', adopter.id)} method="delete" as="button" onClick={(e) => !confirm(`Excluir ${adopter.name}?`) && e.preventDefault()} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-100" title="Excluir"><TrashIcon /></Link>
            </div>
        )}
    ];

    const renderMobileCard = (adopter) => (
        <div key={adopter.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-900">{adopter.name}</h3>
                    <p className="text-sm text-gray-500">{formatCPF(adopter.cpf)}</p>
                </div>
                <button onClick={() => setModalConfig({ isOpen: true, data: adopter })} className="text-indigo-600 p-1"><EditIcon /></button>
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border">
                <p>📍 {adopter.address?.city} - {adopter.address?.state}</p>
                <p>📞 {formatPhone(adopter.phone)}</p>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestão de Adotantes</h2>}>
            <Head title="Adotantes" />
            <div className="py-10">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <DataBrowser 
                        title="Adotantes Cadastrados"
                        data={adopters.data || adopters} 
                        columns={tableColumns}
                        renderMobileCard={renderMobileCard}
                        onAddClick={() => setModalConfig({ isOpen: true, data: null })}
                        addLabel="Novo Adotante"
                        searchPlaceholder="Buscar por nome ou CPF..."
                        searchFn={(a, q) => (a.name||'').toLowerCase().includes(q) || (a.cpf||'').includes(q)}
                    />
                </div>
            </div>

            {/* Modal de Cadastro/Edição */}
            <BaseModal isOpen={modalConfig.isOpen} onClose={closeModal} title={modalConfig.data ? 'Editar Adotante' : 'Cadastrar Adotante'}>
                <AdopterForm initialData={modalConfig.data} onSuccess={closeModal} onCancel={closeModal} />
            </BaseModal>

            {/* Modal de Dossiê */}
            <BaseModal isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, data: null })} title={`Dossiê: ${viewModal.data?.name}`}>
                {viewModal.data && (
                    <div className="p-6 space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl border">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Informações de Base</h4>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <p><strong>CPF:</strong> {formatCPF(viewModal.data.cpf)}</p>
                                <p><strong>Telefone:</strong> {formatPhone(viewModal.data.phone)}</p>
                                <p><strong>Endereço:</strong> {viewModal.data.address?.street}, {viewModal.data.address?.number} - {viewModal.data.address?.city}/{viewModal.data.address?.state}</p>
                            </div>
                        </div>
                    </div>
                )}
            </BaseModal>
        </AuthenticatedLayout>
    );
}