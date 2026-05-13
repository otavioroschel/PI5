import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

// Dicionários para as nossas Tags JSON
const SKILLS_OPTIONS = [
    { id: 'veterinario', label: 'Veterinário(a)' },
    { id: 'transporte', label: 'Transporte/Resgate' },
    { id: 'lar_temporario', label: 'Lar Temporário' },
    { id: 'fotografia', label: 'Fotografia' },
    { id: 'eventos', label: 'Eventos/Feiras' },
    { id: 'administrativo', label: 'Administrativo' },
];

const AVAILABILITY_OPTIONS = [
    { id: 'weekdays', label: 'Dias de Semana' },
    { id: 'weekends', label: 'Finais de Semana' },
    { id: 'nights', label: 'Período Noturno' },
];

// Ícone Rápido
const AlertIcon = () => <svg className="w-4 h-4 text-red-500 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

export default function VolunteersIndex({ auth, volunteers }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        name: '', phone: '', email: '', emergency_available: false,
        skills: [], availability: [], notes: '', status: 'active',
        zip_code: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
    });

    const openModal = (volunteer = null) => {
        if (volunteer) {
            setEditingId(volunteer.id);
            setData({
                ...volunteer,
                zip_code: volunteer.address?.zip_code || '',
                street: volunteer.address?.street || '',
                number: volunteer.address?.number || '',
                complement: volunteer.address?.complement || '',
                neighborhood: volunteer.address?.neighborhood || '',
                city: volunteer.address?.city || '',
                state: volunteer.address?.state || '',
            });
        } else {
            setEditingId(null);
            reset();
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('volunteers.update', editingId), { onSuccess: () => closeModal() });
        } else {
            post(route('volunteers.store'), { onSuccess: () => closeModal() });
        }
    };

    // Helper para lidar com os Checkboxes Múltiplos (O pulo do gato do JSON)
    const handleCheckboxArray = (e, field) => {
        const { value, checked } = e.target;
        if (checked) {
            setData(field, [...data[field], value]);
        } else {
            setData(field, data[field].filter((item) => item !== value));
        }
    };

    // Função de Busca de CEP (Chamada ViaCEP Direta - Não Segura)
    const fetchCep = async (cep) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            try {
                // Aviso de Arquiteto: Chamada direta ao serviço de terceiros (sem BFF/Proxy)
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const result = await response.json();
                
                if (!result.erro) {
                    setData(prevData => ({
                        ...prevData,
                        street: result.logradouro || '',
                        neighborhood: result.bairro || '',
                        city: result.localidade || '',
                        state: result.uf || '',
                        zip_code: cleanCep // Garante que o CEP atual não se perca
                    }));
                } else {
                    alert('CEP não encontrado na base do ViaCEP.');
                }
            } catch (error) {
                console.error("Erro ao buscar CEP externamente", error);
                alert('Não foi possível conectar ao serviço de CEP. Verifique se o seu navegador não está bloqueando chamadas externas.');
            }
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Rede de Voluntários</h2>}>
            <Head title="Voluntários" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500 text-sm">Catálogo de talentos e rede de apoio para emergências.</p>
                    <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm">
                        + Adicionar Voluntário
                    </button>
                </div>

                {/* 📋 Grid de Voluntários */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 uppercase tracking-wider text-gray-500 text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Voluntário</th>
                                <th className="px-6 py-4">Contato</th>
                                <th className="px-6 py-4">Habilidades</th>
                                <th className="px-6 py-4">Localização</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {volunteers.data.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhum voluntário cadastrado.</td></tr>
                            ) : (
                                volunteers.data.map((vol) => (
                                    <tr key={vol.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 flex items-center">
                                                {vol.name}
                                                {vol.emergency_available && <span title="Disponível para Emergências" className="ml-2"><AlertIcon /></span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{vol.phone}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {vol.skills?.map(skill => (
                                                    <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase">
                                                        {SKILLS_OPTIONS.find(s => s.id === skill)?.label || skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {vol.address ? `${vol.address.city} - ${vol.address.state}` : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openModal(vol)} className="text-indigo-600 font-bold hover:underline mr-4">Editar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 📝 MODAL DE CADASTRO / EDIÇÃO */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl relative my-8">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
                            <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Voluntário' : 'Novo Voluntário'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        
                        <form onSubmit={submit} className="p-6 space-y-8">
                            {/* Bloco 1: Dados Pessoais */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Informações Básicas</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">WhatsApp / Telefone</label>
                                        <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                        {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Bloco 2: Tags JSON (Skills e Disponibilidade) */}
                            <div className="bg-gray-50 -mx-6 px-6 py-6 border-y border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Perfil de Ajuda</h4>
                                
                                <div className="mb-6">
                                    <label className="flex items-center p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer">
                                        <input type="checkbox" checked={data.emergency_available} onChange={e => setData('emergency_available', e.target.checked)} className="rounded border-gray-300 text-red-600 shadow-sm focus:ring-red-500 w-5 h-5" />
                                        <span className="ml-3 font-bold text-red-800 text-sm">Disponível para Resgates/Emergências (Fora de hora)</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Habilidades (Skills)</label>
                                        <div className="space-y-2">
                                            {SKILLS_OPTIONS.map(skill => (
                                                <label key={skill.id} className="flex items-center text-sm text-gray-600">
                                                    <input type="checkbox" value={skill.id} checked={data.skills.includes(skill.id)} onChange={(e) => handleCheckboxArray(e, 'skills')} className="rounded border-gray-300 text-indigo-600 mr-2" />
                                                    {skill.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Disponibilidade Geral</label>
                                        <div className="space-y-2">
                                            {AVAILABILITY_OPTIONS.map(opt => (
                                                <label key={opt.id} className="flex items-center text-sm text-gray-600">
                                                    <input type="checkbox" value={opt.id} checked={data.availability.includes(opt.id)} onChange={(e) => handleCheckboxArray(e, 'availability')} className="rounded border-gray-300 text-indigo-600 mr-2" />
                                                    {opt.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bloco 3: Endereço (ViaCEP) */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Localização (Importante para logística)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">CEP</label>
                                        <input type="text" value={data.zip_code} onBlur={(e) => fetchCep(e.target.value)} onChange={e => setData('zip_code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                        {errors.zip_code && <div className="text-red-500 text-xs mt-1">{errors.zip_code}</div>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Rua/Logradouro</label>
                                        <input type="text" value={data.street} onChange={e => setData('street', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50" readOnly required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Número</label>
                                        <input type="text" value={data.number} onChange={e => setData('number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Bairro</label>
                                        <input type="text" value={data.neighborhood} onChange={e => setData('neighborhood', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50" readOnly required />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold">Cancelar</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold disabled:opacity-50">
                                    {processing ? 'Salvando...' : 'Salvar Voluntário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}