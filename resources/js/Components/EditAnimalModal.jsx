import { useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import InputError from '@/Components/InputError';

const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="4" /></svg>
);
const CloseIcon = () => (
    <svg className="w-6 h-6 text-gray-500 hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

// 🛡️ 1. Recebemos a lista de temporaryHomes aqui
export default function EditAnimalModal({ isOpen, onClose, animal, temporaryHomes = [] }) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'put',
        name: '',
        species: 'dog',
        gender: 'male',
        size: 'small',
        weight: '',
        arrival_date: '',
        estimated_birth_date: '',
        is_neutered: false,
        is_vaccinated: false,
        is_dewormed: false,
        photo: null,
        description: '',
        status: 'available',
        temporary_home_id: '', // 🛡️ 2. Novo campo no state
    });

    useEffect(() => {
        if (animal && isOpen) {
            setData({
                _method: 'put',
                name: animal.name || '',
                species: animal.species || 'dog',
                gender: animal.gender || 'male',
                size: animal.size || 'small',
                weight: animal.weight || '',
                arrival_date: animal.arrival_date ? animal.arrival_date.split('T')[0] : '',
                estimated_birth_date: animal.estimated_birth_date ? animal.estimated_birth_date.split('T')[0] : '',
                is_neutered: !!animal.is_neutered,
                is_vaccinated: !!animal.is_vaccinated,
                is_dewormed: !!animal.is_dewormed,
                photo: null, 
                description: animal.description || '',
                status: animal.status || 'available',
                temporary_home_id: animal.temporary_home_id || '', // 🛡️ 2. Carrega do banco se tiver
            });
            setPreview(animal.photo_url || null);
        }
    }, [animal, isOpen]);

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    if (!isOpen || !animal) return null;

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const fecharModal = () => {
        reset();
        clearErrors();
        setPreview(null);
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/animals/${animal.id}`, {
            preserveScroll: true,
            onSuccess: () => fecharModal(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Editar animal</h2>
                    <button onClick={fecharModal} className="p-1 focus:outline-none"><CloseIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="editAnimalForm" onSubmit={submit} className="space-y-5">
                        
                        <div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handlePhotoChange} />
                            <div onClick={() => fileInputRef.current.click()} className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group overflow-hidden">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <CameraIcon />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Trocar foto</span>
                                </div>
                            </div>
                            <InputError message={errors.photo} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do animal *</label>
                            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black" value={data.name} onChange={e => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Espécie</label>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"><input type="radio" value="dog" checked={data.species === 'dog'} onChange={e => setData('species', e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" /> Cachorro</label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"><input type="radio" value="cat" checked={data.species === 'cat'} onChange={e => setData('species', e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" /> Gato</label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
                                <select value={data.size} onChange={e => setData('size', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black bg-white">
                                    <option value="small">Pequeno (P)</option>
                                    <option value="medium">Médio (M)</option>
                                    <option value="large">Grande (G)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                                <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black" value={data.weight} onChange={e => setData('weight', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-black" value={data.estimated_birth_date} onChange={e => setData('estimated_birth_date', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de chegada *</label>
                                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-black" value={data.arrival_date} onChange={e => setData('arrival_date', e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"><input type="radio" value="male" checked={data.gender === 'male'} onChange={e => setData('gender', e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300" /> Macho</label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"><input type="radio" value="female" checked={data.gender === 'female'} onChange={e => setData('gender', e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300" /> Fêmea</label>
                            </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"><input type="checkbox" checked={data.is_neutered} onChange={e => setData('is_neutered', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" /> Castrado</label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"><input type="checkbox" checked={data.is_vaccinated} onChange={e => setData('is_vaccinated', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" /> Vacinado</label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"><input type="checkbox" checked={data.is_dewormed} onChange={e => setData('is_dewormed', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" /> Vermifugado</label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sobre</label>
                            <textarea rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black resize-none" value={data.description} onChange={e => setData('description', e.target.value)}></textarea>
                        </div>

                        <div className="pb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black bg-white">
                                <option value="available">Disponível</option>
                                <option value="adopted">Adotado</option>
                                <option value="under_treatment">Em tratamento</option>
                                <option value="foster_care">Lar temporário</option>
                                <option value="deceased">Óbito</option>
                            </select>

                            {/* 🛡️ 3. A MÁGICA CONDICIONAL */}
                            {data.status === 'foster_care' && (
                                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in duration-200">
                                    <label className="block text-sm font-bold text-blue-800 mb-1">Selecione o Lar Temporário *</label>
                                    <select 
                                        value={data.temporary_home_id} 
                                        onChange={e => setData('temporary_home_id', e.target.value)}
                                        className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 bg-white"
                                        required={data.status === 'foster_care'}
                                    >
                                        <option value="">-- Escolha um Lar na lista --</option>
                                        {temporaryHomes.map(home => (
                                            <option key={home.id} value={home.id}>
                                                {home.name} (Capacidade: {home.max_capacity})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.temporary_home_id} className="mt-1" />
                                    <p className="text-xs text-blue-600 mt-2">
                                        * O animal será oficialmente vinculado ao endereço deste lar.
                                    </p>
                                </div>
                            )}
                        </div>

                    </form>
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
                    <button type="submit" form="editAnimalForm" disabled={processing} className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
                        {processing ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>

            </div>
        </div>
    );
}