// resources/js/Components/Admin/ApproveLeadModal.jsx

import { useForm } from '@inertiajs/react';

export default function ApproveLeadModal({ lead, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        cpf: '',
        zip_code: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.leads.approve', lead.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
                
                <h2 className="text-2xl font-bold mb-2">Oficializar Adoção</h2>
                <p className="text-gray-600 mb-6">
                    Completando este cadastro, <strong>{lead.animal.name}</strong> será marcado como adotado por <strong>{lead.adopter_name}</strong>.
                </p>

                <form onSubmit={submit} className="space-y-4">
                    {/* --- Dados do Lead (Apenas Leitura) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md border">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Nome</label>
                            <div className="mt-1 text-sm text-gray-900">{lead.adopter_name}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">E-mail</label>
                            <div className="mt-1 text-sm text-gray-900">{lead.adopter_email}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Telefone</label>
                            <div className="mt-1 text-sm text-gray-900">{lead.adopter_phone}</div>
                        </div>
                    </div>

                    <hr className="my-4" />

                    {/* --- Dados Faltantes (Obrigatórios) --- */}
                    <h3 className="text-lg font-semibold text-gray-800">Dados Complementares</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF</label>
                        <input
                            type="text"
                            value={data.cpf}
                            onChange={e => setData('cpf', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.cpf && <span className="text-red-500 text-xs">{errors.cpf}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">CEP</label>
                            <input
                                type="text"
                                value={data.zip_code}
                                onChange={e => setData('zip_code', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                            {errors.zip_code && <span className="text-red-500 text-xs">{errors.zip_code}</span>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Rua</label>
                            <input
                                type="text"
                                value={data.street}
                                onChange={e => setData('street', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número</label>
                            <input
                                type="text"
                                value={data.number}
                                onChange={e => setData('number', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bairro</label>
                            <input
                                type="text"
                                value={data.neighborhood}
                                onChange={e => setData('neighborhood', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cidade/UF</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                    className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm"
                                    placeholder="Cidade"
                                    required
                                />
                                <input
                                    type="text"
                                    value={data.state}
                                    onChange={e => setData('state', e.target.value)}
                                    className="mt-1 block w-1/3 rounded-md border-gray-300 shadow-sm"
                                    placeholder="UF"
                                    maxLength="2"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                            {processing ? 'Salvando...' : 'Aprovar Adoção'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}