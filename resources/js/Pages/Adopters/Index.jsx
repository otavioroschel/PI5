import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import DataBrowser from '@/Components/DataBrowser';
import BaseModal from '@/Components/Modals/BaseModal';
import DynamicForm from '@/Components/Modals/DynamicForm';

// ── Helpers de Formatação ─────────────────────────────────────────────────────
const formatCPF = (cpf) => {
    if (!cpf) return '—';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatPhone = (phone) => {
    if (!phone) return '—';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

// ── Ícones Genéricos ────────────────────────────────────────────────────────
const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

export default function Index({ auth, adopters = [] }) {
    // Estado do Modal Híbrido (Controla Criação e Edição)
    const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });

    const closeModal = () => setModalConfig({ isOpen: false, data: null });

    // ── 1. CONFIGURAÇÃO DA TABELA (Schema Visual) ───────────────────────────
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
            // Extrai os dados da relação polimórfica com fallback de segurança
            <span className="text-gray-600">
                {adopter.address?.city} - {adopter.address?.state}
            </span>
        )},
        { label: 'AÇÕES', key: 'actions', render: (_, adopter) => (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setModalConfig({ isOpen: true, data: adopter })}
                    className="p-2 bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors"
                >
                    <EditIcon />
                </button>
                <Link 
                    href={route('adopters.destroy', adopter.id)} 
                    method="delete" 
                    as="button" 
                    onClick={(e) => {
                        if (!confirm(`Tem certeza que deseja excluir ${adopter.name}? Esta ação não pode ser desfeita.`)) e.preventDefault();
                    }} 
                    className="p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
                >
                    <TrashIcon />
                </Link>
            </div>
        )}
    ];

    // ── 2. SCHEMA DO FORMULÁRIO GENÉRICO ────────────────────────────────────
    const formFields = [
        // Bloco Adotante
        { name: 'name', label: 'Nome Completo', type: 'text' },
        { name: 'cpf', label: 'CPF (Apenas números)', type: 'text' },
        { name: 'phone', label: 'Telefone/WhatsApp', type: 'text' },
        { name: 'email', label: 'E-mail', type: 'email' },
        // Bloco Endereço (Relacionamento Polimórfico achatado)
        { name: 'zip_code', label: 'CEP', type: 'text' },
        { name: 'street', label: 'Logradouro (Rua/Av)', type: 'text' },
        { name: 'number', label: 'Número', type: 'text' },
        { name: 'neighborhood', label: 'Bairro', type: 'text' },
        { name: 'city', label: 'Cidade', type: 'text' },
        { name: 'state', label: 'UF', type: 'text' },
    ];

    // ── Transformação de Dados (Flattening) para a Edição ──
    const getFlattenedData = (adopter) => {
        if (!adopter) return null; // Retorna nulo se for Modo Criação
        
        // Se for Modo Edição, extraímos o endereço de dentro do objeto para o nível raiz
        return {
            ...adopter,
            zip_code: adopter.address?.zip_code || '',
            street: adopter.address?.street || '',
            number: adopter.address?.number || '',
            neighborhood: adopter.address?.neighborhood || '',
            city: adopter.address?.city || '',
            state: adopter.address?.state || '',
        };
    };

    // ── 3. LÓGICA DE BUSCA CUSTOMIZADA ──────────────────────────────────────
    const searchFunction = (adopter, query) => {
        return (adopter.name || '').toLowerCase().includes(query) ||
               (adopter.cpf || '').includes(query) ||
               (adopter.address?.city || '').toLowerCase().includes(query);
    };

    // ── 4. RENDERIZADOR DO CARD MOBILE ──────────────────────────────────────
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

            {/* Injeção do nosso Motor Genérico */}
            <DataBrowser 
                title="Adotantes Cadastrados"
                data={adopters}
                columns={tableColumns}
                renderMobileCard={renderMobileCard}
                onAddClick={() => setModalConfig({ isOpen: true, data: null })}
                addLabel="Novo Adotante"
                searchPlaceholder="Buscar por nome, CPF ou cidade..."
                searchFn={searchFunction}
            />

            {/* ÚNICO Modal que atende Criação e Edição simultaneamente */}
            <BaseModal 
                isOpen={modalConfig.isOpen} 
                onClose={closeModal} 
                title={modalConfig.data ? 'Editar Adotante' : 'Cadastrar Adotante'}
            >
                <DynamicForm 
                    fields={formFields} 
                    endpoint="/adopters" 
                    method={modalConfig.data ? 'put' : 'post'}
                    entity={getFlattenedData(modalConfig.data)} 
                    onSuccess={closeModal} 
                />
            </BaseModal>

        </AuthenticatedLayout>
    );
}