import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import CreateAnimalModal from '@/Components/CreateAnimalModal';
import EditAnimalModal from '@/Components/EditAnimalModal';
import BaseModal from '@/Components/Modals/BaseModal';
import DynamicForm from '@/Components/Modals/DynamicForm';

// ── Tradução e Helpers ────────────────────────────────────────────────────────
const translate = {
    species: { dog: 'Cachorro', cat: 'Gato' },
    gender:  { male: 'Macho',   female: 'Fêmea' },
    size:    { small: 'P',      medium: 'M',     large: 'G' },
    status:  {
        available:   'Disponível',
        foster_care: 'Lar temporário',
        adopted:     'Adotado',
        under_treatment: 'Em tratamento',
        returned:    'Retornado (Avaliação)', // 🚀 ADICIONE ESTA CHAVE
    },
};

const statusStyle = {
    available:   'bg-green-100 text-green-700',
    foster_care: 'bg-purple-100 text-purple-700',
    adopted:     'bg-blue-100 text-blue-700',
    under_treatment: 'bg-yellow-100 text-yellow-700',
    returned:    'bg-orange-100 text-orange-700', // 🚀 COR DE ALERTA PARA AVALIAÇÃO
};


const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

const calculateAge = (birthDate) => {
    if (!birthDate) return '—';
    const diff = new Date() - new Date(birthDate);
    const ageDate = new Date(diff);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = ageDate.getUTCMonth();
    if (years === 0 && months === 0) return '< 1 mês';
    if (years === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
};

// ── Badges e Ícones ──────────────────────────────────────────────────────────
const BoolBadge = ({ value, yes = 'Sim', no = 'Não' }) => (
    <span className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-semibold ${value ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
        {value ? yes : no}
    </span>
);



const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyle[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {translate.status[status] ?? status}
    </span>
);

const AdoptIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
); 
const SearchIcon = () => ( <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>);
const FilterIcon = () => ( <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 4h18M7 12h10M11 20h2" /></svg>);
const SortIcon = () => ( <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>);
const EditIcon = () => ( <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const TrashIcon = () => ( <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const PlusIcon = () => ( <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>);
const PawIcon = () => ( <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C10.5 2 9.2 3.2 9.2 4.7C9.2 6.2 10.5 7.5 12 7.5C13.5 7.5 14.8 6.2 14.8 4.7C14.8 3.2 13.5 2 12 2ZM6.5 6C5.1 6 4 7.1 4 8.5C4 9.9 5.1 11 6.5 11C7.9 11 9 9.9 9 8.5C9 7.1 7.9 6 6.5 6ZM17.5 6C16.1 6 15 7.1 15 8.5C15 9.9 16.1 11 17.5 11C18.9 11 20 9.9 20 8.5C20 7.1 18.9 6 17.5 6ZM12 10C9.2 10 7 12.2 7 15C7 18 9 22 12 22C15 22 17 18 17 15C17 12.2 14.8 10 12 10Z"/></svg>);
const ViewIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const GenderIcon = ({ gender }) =>
    gender === 'female' ? (
        <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="9" r="5" /><path strokeLinecap="round" d="M12 14v6M9 17h6" /></svg>
    ) : (
        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="10" cy="14" r="5" /><path strokeLinecap="round" d="M19 5l-5 5M19 5h-5M19 5v5" /></svg>
    );

// ── Componente principal ───────────────────────────────────────────────────────
export default function Index({ auth, animals = [], adopters = [], temporaryHomes = [] }) {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAnimal, setEditingAnimal] = useState(null);
    const [adoptionModal, setAdoptionModal] = useState({ isOpen: false, animal: null });
    const [locationModal, setLocationModal] = useState({ isOpen: false, home: null });

    // Configuração do Formulário de Adoção
    const adoptionFields = useMemo(() => [
        { 
            name: 'adopter_id', 
            label: 'Selecione o Adotante', 
            type: 'select', 
            options: adopters.map(a => ({ value: a.id, label: `${a.name} (${a.cpf})` })),
            fullWidth: true
        },
        { 
            name: 'adoption_date', 
            label: 'Data da Adoção', 
            type: 'date', 
            defaultValue: new Date().toISOString().split('T')[0],
            fullWidth: true
        },
        { name: 'animal_id', type: 'hidden', defaultValue: adoptionModal.animal?.id }
    ], [adopters, adoptionModal.animal]);

    const filtered = useMemo(() => {
        let list = [...(animals.data || animals)];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((a) => {
                const translatedSpecies = translate.species[a.species] ?? a.species ?? '';
                const translatedStatus = translate.status[a.status] ?? a.status ?? '';
                return (
                    (a.name ?? '').toLowerCase().includes(q) ||
                    translatedSpecies.toLowerCase().includes(q) ||
                    translatedStatus.toLowerCase().includes(q)
                );
            });
        }
        list.sort((a, b) => {
            const da = new Date(a.arrival_date ?? 0);
            const db = new Date(b.arrival_date ?? 0);
            return sort === 'newest' ? db - da : da - db;
        });
        return list;
    }, [animals, search, sort]);

    const toggleSort = () => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Animais da sua ONG</h2>}
        >
            <Head title="Animais" />

            <div className="py-10">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Animais Cadastrados</h1>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <div className="relative flex-1 min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
                            <input
                                type="text"
                                placeholder="Buscar animal, espécie ou status..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-indigo-500"
                            />
                        </div>

                        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            <FilterIcon /> Filtros
                        </button>

                        <button onClick={toggleSort} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            <SortIcon /> {sort === 'newest' ? 'Mais novos' : 'Mais antigos'}
                        </button>

                        <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors ml-auto shadow-sm">
                            <PlusIcon /> Adicionar animal
                        </button>
                    </div>

                    {/* VIEW DESKTOP */}
                    <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    {['FOTO','SEXO','NOME','ESPÉCIE','DATA CHEGADA','PORTE','PESO','IDADE','VERMIFUGADO','CASTRADO','VACINADO','STATUS','AÇÕES'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-[11px] font-bold tracking-wider text-gray-500 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={13} className="px-4 py-12 text-center text-gray-400">Nenhum animal encontrado.</td></tr>
                                ) : (
                                    filtered.map((animal) => (
                                        <tr key={animal.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                {animal.photo_url ? (
                                                    <img src={animal.photo_url} alt={animal.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center"><PawIcon /></div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3"><GenderIcon gender={animal.gender} /></td>
                                            <td className="px-4 py-3 font-bold text-gray-800">{animal.name}</td>
                                            <td className="px-4 py-3">{translate.species[animal.species] ?? animal.species}</td>
                                            <td className="px-4 py-3">{formatDate(animal.arrival_date)}</td>
                                            <td className="px-4 py-3">{translate.size[animal.size] ?? animal.size}</td>
                                            <td className="px-4 py-3">{animal.weight ? `${animal.weight}kg` : '—'}</td>
                                            <td className="px-4 py-3">{calculateAge(animal.estimated_birth_date)}</td>
                                            <td className="px-4 py-3"><BoolBadge value={animal.is_dewormed} /></td>
                                            <td className="px-4 py-3"><BoolBadge value={animal.is_neutered} /></td>
                                            <td className="px-4 py-3"><BoolBadge value={animal.is_vaccinated} /></td>
                                            <td className="px-4 py-3">
    {animal.status === 'foster_care' ? (
        <button 
            onClick={() => setLocationModal({ isOpen: true, home: animal.temporary_home })}
            className="group flex items-center gap-1"
        >
            <StatusBadge status={animal.status} />
            <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                (ver local)
            </span>
        </button>
    ) : (
        <StatusBadge status={animal.status} />
    )}
</td><td className="px-4 py-3">
    <div className="flex items-center gap-2">
        {/* Botão de Adotar (se estiver disponível) */}
        {animal.status === 'available' && (
            <button 
                onClick={() => setAdoptionModal({ isOpen: true, animal: animal })}
                className="p-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg transition-colors"
                title="Registrar Adoção"
            >
                <AdoptIcon />
            </button>
        )}
        
        {/* 👁️ NOVO: Botão de Ver Dossiê (Olho) */}
        <Link 
            href={`/animals/${animal.id}`} 
            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Ver Dossiê Completo"
        >
            <ViewIcon />
        </Link>

        {/* Botão de Editar */}
        <button onClick={() => setEditingAnimal(animal)} className="p-2 bg-gray-100 text-gray-600 hover:bg-indigo-100 rounded-lg" title="Editar">
            <EditIcon />
        </button>
        
        {/* Botão de Excluir */}
        <Link href={`/animals/${animal.id}`} method="delete" as="button" className="p-2 bg-gray-100 text-gray-600 hover:bg-red-100 rounded-lg" onClick={(e) => !confirm(`Excluir ${animal.name}?`) && e.preventDefault()} title="Excluir">
            <TrashIcon />
        </Link>
    </div>
</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* VIEW MOBILE */}
                    <div className="md:hidden grid grid-cols-1 gap-4 mt-4">
                        {filtered.map((animal) => (
                            <div key={`card-${animal.id}`} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center border overflow-hidden">
                                        {animal.photo_url ? <img src={animal.photo_url} className="object-cover w-full h-full" /> : <PawIcon />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2"><h3 className="font-bold">{animal.name}</h3><GenderIcon gender={animal.gender} /></div>
                                        <StatusBadge status={animal.status} />
                                    </div>
                                </div>
                               <div className="flex justify-end gap-2 pt-3 border-t">
    {/* Botão de Adotar (se disponível) */}
    {animal.status === 'available' && (
        <button onClick={() => setAdoptionModal({ isOpen: true, animal })} className="p-2 text-pink-600 bg-pink-50 rounded-lg"><AdoptIcon /></button>
    )}
    
    {/* 👁️ NOVO: Botão de Ver Dossiê no Mobile */}
    <Link href={`/animals/${animal.id}`} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
        <ViewIcon />
    </Link>

    {/* Botão de Editar */}
    <button onClick={() => setEditingAnimal(animal)} className="p-2 text-gray-600 bg-gray-100 rounded-lg"><EditIcon /></button>
</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <CreateAnimalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
           {/* ✅ Depois: */}
           {/* 🐾 MODAL DE ADOÇÃO (Estava faltando renderizar) */}
            <BaseModal 
                isOpen={adoptionModal.isOpen} 
                onClose={() => setAdoptionModal({ isOpen: false, animal: null })} 
                title={adoptionModal.animal ? `Registrar Adoção: ${adoptionModal.animal.name}` : 'Registrar Adoção'}
            >
                {/* 
                    Como Arquiteto de Segurança, lembre-se: a rota 'adoptions.store' 
                    deve estar protegida no Laravel validando se o animal realmente
                    pertence ao tenant atual (ong_id) e se o status dele é 'available'.
                */}
                <DynamicForm 
                    fields={adoptionFields}
                    routePath={route('adoptions.store')} 
                    onSuccess={() => setAdoptionModal({ isOpen: false, animal: null })}
                    onCancel={() => setAdoptionModal({ isOpen: false, animal: null })}
                    submitLabel="Confirmar Adoção"
                />
            </BaseModal>
<EditAnimalModal 
    isOpen={!!editingAnimal} 
    onClose={() => setEditingAnimal(null)} 
    animal={editingAnimal} 
    temporaryHomes={temporaryHomes} 
/>
            <BaseModal 
    isOpen={locationModal.isOpen} 
    onClose={() => setLocationModal({ isOpen: false, home: null })} 
    title="📍 Localização do Animal"
>
    {locationModal.home ? (
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">🏠</div>
                <div>
                    <h3 className="font-bold text-gray-900">{locationModal.home.name}</h3>
                    <p className="text-sm text-gray-500">{locationModal.home.phone}</p>
                </div>
            </div>
            
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Endereço Completo</h4>
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-indigo-900 text-sm">
                    <p><strong>{locationModal.home.address?.street}, {locationModal.home.address?.number}</strong></p>
                    <p>{locationModal.home.address?.neighborhood}</p>
                    <p>{locationModal.home.address?.city} - {locationModal.home.address?.state}</p>
                </div>
            </div>

            <a 
                href={`https://wa.me/55${locationModal.home.phone?.replace(/\D/g, '')}`} 
                target="_blank"
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors"
            >
                💬 Chamar no WhatsApp
            </a>
        </div>
    ) : (
        <p className="p-6 text-center text-gray-500">Dados de localização não encontrados.</p>
    )}
</BaseModal>
        </AuthenticatedLayout>
    );
}