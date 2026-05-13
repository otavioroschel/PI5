// resources/js/Components/Vitrine/AdoptionModal.jsx

import { useForm } from '@inertiajs/react';

export default function AdoptionModal({ pet, slug, onClose }) {
    // Inicialização segura do estado do formulário
    const { data, setData, post, processing, errors, reset } = useForm({
        adopter_name: '',
        adopter_email: '',
        adopter_phone: '',
    });

 const submit = (e) => {
        e.preventDefault();
        
        // 🔴 ATENÇÃO AQUI: Garanta que os parâmetros passados para o route() 
        // são exatamente 'slug' e 'animal_uuid'. E que o pet.id ou pet.uuid está correto.
        post(route('vitrine.adote.store', { 
            slug: slug, 
            animal_uuid: pet.id // Se o ID do seu animal já for um UUID string, use pet.id
        }), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
                // Alerta temporário só para você ter certeza que funcionou!
                alert('Solicitação enviada com sucesso!'); 
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
                
                <h2 className="text-2xl font-bold mb-4">Adotar {pet.name}</h2>
                <p className="text-gray-600 text-sm mb-6">
                    Preencha seus dados para que a ONG entre em contato.
                </p>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="adopter_name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input
                            id="adopter_name"
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.adopter_name}
                            onChange={e => setData('adopter_name', e.target.value)}
                            required
                        />
                        {/* Exibição automática do erro de validação do FormRequest do Laravel */}
                        {errors.adopter_name && <span className="text-red-500 text-xs mt-1">{errors.adopter_name}</span>}
                    </div>

                    <div>
                        <label htmlFor="adopter_email" className="block text-sm font-medium text-gray-700">E-mail</label>
                        <input
                            id="adopter_email"
                            type="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.adopter_email}
                            onChange={e => setData('adopter_email', e.target.value)}
                            required
                        />
                        {errors.adopter_email && <span className="text-red-500 text-xs mt-1">{errors.adopter_email}</span>}
                    </div>

                    <div>
                        <label htmlFor="adopter_phone" className="block text-sm font-medium text-gray-700">Telefone (WhatsApp)</label>
                        <input
                            id="adopter_phone"
                            type="tel"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.adopter_phone}
                            onChange={e => setData('adopter_phone', e.target.value)}
                            required
                        />
                        {errors.adopter_phone && <span className="text-red-500 text-xs mt-1">{errors.adopter_phone}</span>}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={processing} // Trava de segurança no frontend
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {processing ? 'Enviando Solicitação...' : 'Confirmar Interesse'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}