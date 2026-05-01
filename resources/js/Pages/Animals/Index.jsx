import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// Pequenos dicionários para traduzir os dados do banco para a interface
const translate = {
    species: { dog: 'Cachorro', cat: 'Gato' },
    gender: { male: 'Macho', female: 'Fêmea' },
    size: { small: 'Pequeno', medium: 'Médio', large: 'Grande' },
    status: { available: 'Disponível', foster_care: 'Lar Temporário', adopted: 'Adotado' }
};

// Função para deixar a data no padrão brasileiro
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

export default function Index({ auth, animals }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Animais da sua ONG</h2>}
        >
            <Head title="Animais" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Grid responsivo: 1 coluna no celular, 2 no tablet, 3 no PC */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {animals.map(animal => (
                            <div key={animal.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    
                                    {/* Cabeçalho do Card: Nome e Status */}
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-bold text-indigo-600">{animal.name}</h3>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            animal.status === 'available' ? 'bg-green-100 text-green-800' : 
                                            animal.status === 'foster_care' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {translate.status[animal.status] || animal.status}
                                        </span>
                                    </div>

                                    {/* Descrição */}
                                    <p className="text-gray-600 text-sm mb-4 italic line-clamp-2">
                                        "{animal.description}"
                                    </p>

                                    {/* Informações Básicas */}
                                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700 mb-4">
                                        <p><strong>Espécie:</strong> {translate.species[animal.species] || animal.species}</p>
                                        <p><strong>Sexo:</strong> {translate.gender[animal.gender] || animal.gender}</p>
                                        <p><strong>Porte:</strong> {translate.size[animal.size] || animal.size}</p>
                                        <p><strong>Chegou em:</strong> {formatDate(animal.arrival_date)}</p>
                                    </div>

                                    {/* Badges de Saúde */}
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                        {animal.is_vaccinated ? (
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-200">💉 Vacinado</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">❌ Sem Vacina</span>
                                        )}

                                        {animal.is_neutered ? (
                                            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200">✂️ Castrado</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-md border border-orange-200">⚠️ Não Castrado</span>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ))}

                        {/* Mensagem caso a ONG não tenha animais no Seed */}
                        {animals.length === 0 && (
                            <div className="col-span-full p-6 bg-white rounded-lg shadow-sm text-center text-gray-500">
                                Nenhum animal cadastrado ainda.
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}