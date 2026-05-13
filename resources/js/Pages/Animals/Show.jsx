import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// ── Helpers e Traduções ─────────────────────────────
const translate = {
    species: { dog: 'Cachorro', cat: 'Gato', other: 'Outro' },
    gender:  { male: 'Macho', female: 'Fêmea' },
    size:    { small: 'Pequeno (P)', medium: 'Médio (M)', large: 'Grande (G)' },
    status:  {
        available: 'Disponível',
        foster_care: 'Em Lar Temporário',
        adopted: 'Adotado',
        under_treatment: 'Em Tratamento',
        deceased: 'Óbito'
    },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

const calculateAge = (birthDate) => {
    if (!birthDate) return 'Idade desconhecida';
    const diff = new Date() - new Date(birthDate);
    const ageDate = new Date(diff);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = ageDate.getUTCMonth();
    if (years === 0 && months === 0) return '< 1 mês';
    if (years === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
};

// ── Ícones ────────────────────────────────────────────────────────────────────
const ArrowLeft = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const PawIcon = () => <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C10.5 2 9.2 3.2 9.2 4.7C9.2 6.2 10.5 7.5 12 7.5C13.5 7.5 14.8 6.2 14.8 4.7C14.8 3.2 13.5 2 12 2ZM6.5 6C5.1 6 4 7.1 4 8.5C4 9.9 5.1 11 6.5 11C7.9 11 9 9.9 9 8.5C9 7.1 7.9 6 6.5 6ZM17.5 6C16.1 6 15 7.1 15 8.5C15 9.9 16.1 11 17.5 11C18.9 11 20 9.9 20 8.5C20 7.1 18.9 6 17.5 6ZM12 10C9.2 10 7 12.2 7 15C7 18 9 22 12 22C15 22 17 18 17 15C17 12.2 14.8 10 12 10Z"/></svg>;
const CheckCircle = () => <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircle = () => <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
// 🚀 CORREÇÃO 1: Adicionada a prop 'back_url' aqui na desestruturação!
export default function Show({ auth, animal, back_url }) {
    
    // Cores dinâmicas para o Status Hero
    const statusColors = {
        available: 'bg-green-500 text-white',
        foster_care: 'bg-purple-500 text-white',
        adopted: 'bg-blue-500 text-white',
        under_treatment: 'bg-yellow-500 text-white',
        deceased: 'bg-gray-500 text-white'
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dossiê do Animal</h2>}>
            <Head title={`Dossiê: ${animal.name}`} />

            <div className="py-8 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 🚀 CORREÇÃO 2: Botão Voltar unificado, dinâmico e no lugar correto */}
                <div className="mb-6">
                    <Link 
                        href={back_url || "/animals"} // Fallback seguro de roteamento
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft /> Voltar para a lista
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* 🟦 COLUNA ESQUERDA: HERO & INFO PRINCIPAL */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Hero Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="h-64 bg-gray-100 relative">
                                {animal.photo_url ? (
                                    <img src={animal.photo_url} alt={animal.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><PawIcon /></div>
                                )}
                                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${statusColors[animal.status] || 'bg-gray-800 text-white'}`}>
                                    {translate.status[animal.status]}
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h1 className="text-3xl font-black text-gray-900 mb-1">{animal.name}</h1>
                                <p className="text-gray-500 font-medium">
                                    {translate.species[animal.species]} • {translate.gender[animal.gender]}
                                </p>
                            </div>
                        </div>

                        {/* Dados Físicos */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Características Físicas</h3>
                            <ul className="space-y-3">
                                <li className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Idade</span>
                                    <span className="font-bold text-gray-900">{calculateAge(animal.estimated_birth_date)}</span>
                                </li>
                                <li className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Porte</span>
                                    <span className="font-bold text-gray-900">{translate.size[animal.size]}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-500">Peso</span>
                                    <span className="font-bold text-gray-900">{animal.weight ? `${animal.weight} kg` : 'Não informado'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 🟦 COLUNA DIREITA: PRONTUÁRIO & TIMELINE */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Prontuário Médico */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Prontuário Básico</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    {animal.is_vaccinated ? <CheckCircle /> : <XCircle />}
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Vacinação</p>
                                        <p className="text-sm font-semibold text-gray-900">{animal.is_vaccinated ? 'Vacinado' : 'Pendente'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    {animal.is_neutered ? <CheckCircle /> : <XCircle />}
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Castração</p>
                                        <p className="text-sm font-semibold text-gray-900">{animal.is_neutered ? 'Castrado' : 'Pendente'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    {animal.is_dewormed ? <CheckCircle /> : <XCircle />}
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Vermífugo</p>
                                        <p className="text-sm font-semibold text-gray-900">{animal.is_dewormed ? 'Em dia' : 'Pendente'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Descrição */}
                            <div className="mt-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Anotações e Histórico Comportamental</h4>
                                <div className="p-4 bg-yellow-50 rounded-xl text-sm text-yellow-900 border border-yellow-100 leading-relaxed whitespace-pre-wrap">
                                    {animal.description ? animal.description : <span className="italic opacity-70">Nenhuma anotação registrada.</span>}
                                </div>
                            </div>
                        </div>

                        {/* Linha do Tempo (Timeline) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Linha do Tempo na ONG</h3>
                            
                            <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
                                
                                {/* Ponto: Lar Temporário (se existir) */}
                                {animal.status === 'foster_care' && animal.temporary_home && (
                                    <div className="relative">
                                        <span className="absolute -left-[35px] bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                            🏠
                                        </span>
                                        <h4 className="font-bold text-gray-900">Em Lar Temporário</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Hospedado por <strong className="text-gray-700">{animal.temporary_home.name}</strong> 
                                            {animal.temporary_home.address && (
                                                <span> em {animal.temporary_home.address.city} - {animal.temporary_home.address.state}.</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {/* Ponto Inicial: Chegada na ONG */}
                                <div className="relative">
                                    <span className="absolute -left-[35px] bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                        📥
                                    </span>
                                    <h4 className="font-bold text-gray-900">Chegada na ONG</h4>
                                    <p className="text-sm text-gray-500 mt-1">Registrado no sistema em <strong className="text-gray-700">{formatDate(animal.arrival_date)}</strong>.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}