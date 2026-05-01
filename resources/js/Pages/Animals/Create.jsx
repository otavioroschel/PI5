import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        species: 'dog',
        gender: 'male',
        size: 'medium',
        arrival_date: '',
        estimated_birth_date: '', // Variável aqui
        is_neutered: false,
        is_vaccinated: false,
        status: 'available',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('animals.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Cadastrar Novo Animal</h2>}
        >
            <Head title="Novo Animal" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white p-8 shadow sm:rounded-lg border border-gray-200">
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* Nome */}
                            <div>
                                <InputLabel htmlFor="name" value="Nome do Animal" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Espécie, Gênero e Porte */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <InputLabel htmlFor="species" value="Espécie" />
                                    <select id="species" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.species} onChange={(e) => setData('species', e.target.value)}>
                                        <option value="dog">Cachorro</option>
                                        <option value="cat">Gato</option>
                                    </select>
                                    <InputError message={errors.species} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="gender" value="Gênero" />
                                    <select id="gender" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.gender} onChange={(e) => setData('gender', e.target.value)}>
                                        <option value="male">Macho</option>
                                        <option value="female">Fêmea</option>
                                    </select>
                                    <InputError message={errors.gender} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="size" value="Porte" />
                                    <select id="size" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.size} onChange={(e) => setData('size', e.target.value)}>
                                        <option value="small">Pequeno</option>
                                        <option value="medium">Médio</option>
                                        <option value="large">Grande</option>
                                    </select>
                                    <InputError message={errors.size} className="mt-2" />
                                </div>
                            </div>

                            {/* Datas (AGORA SIM, AS DUAS AQUI!) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="arrival_date" value="Data de Chegada na ONG" />
                                    <TextInput
                                        id="arrival_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.arrival_date}
                                        onChange={(e) => setData('arrival_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.arrival_date} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="estimated_birth_date" value="Nascimento Estimado (Opcional)" />
                                    <TextInput
                                        id="estimated_birth_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.estimated_birth_date}
                                        onChange={(e) => setData('estimated_birth_date', e.target.value)}
                                    />
                                    <InputError message={errors.estimated_birth_date} className="mt-2" />
                                </div>
                            </div>

                            {/* Status e Checkboxes de Saúde */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-gray-50 p-4 rounded-md border border-gray-100">
                                <div>
                                    <InputLabel htmlFor="status" value="Status de Adoção" />
                                    <select id="status" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                        <option value="available">Disponível para Adoção</option>
                                        <option value="foster_care">Em Lar Temporário</option>
                                        <option value="adopted">Adotado</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div className="flex space-x-6 mt-4 md:mt-0 md:justify-center">
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 w-5 h-5" checked={data.is_neutered} onChange={(e) => setData('is_neutered', e.target.checked)} />
                                        <span className="ml-2 text-sm font-medium text-gray-700">Castrado</span>
                                    </label>

                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 w-5 h-5" checked={data.is_vaccinated} onChange={(e) => setData('is_vaccinated', e.target.checked)} />
                                        <span className="ml-2 text-sm font-medium text-gray-700">Vacinado</span>
                                    </label>
                                </div>
                            </div>

                            {/* Descrição */}
                            <div>
                                <InputLabel htmlFor="description" value="História / Descrição do Animal" />
                                <textarea
                                    id="description"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    rows="4"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Conte um pouco sobre o temperamento e a história do animal..."
                                ></textarea>
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Botão Salvar */}
                            <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-200">
                                <PrimaryButton disabled={processing} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700">
                                    {processing ? 'Salvando...' : 'Salvar Animal'}
                                </PrimaryButton>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}