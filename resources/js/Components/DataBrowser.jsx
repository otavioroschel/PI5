import { useState, useMemo } from 'react';

// ── Ícones Genéricos ────────────────────────────────────────────────────────
const SearchIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
);
const FilterIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 4h18M7 12h10M11 20h2" /></svg>
);
const SortIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
);
const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>
);

export default function DataBrowser({ 
    title, 
    data = [], 
    columns = [], 
    renderMobileCard, // Função para renderizar o design específico do card
    onAddClick, 
    addLabel = "Adicionar",
    searchPlaceholder = "Buscar...",
    searchFn, // Função opcional para customizar a busca
    sortFn    // Função opcional para customizar a ordenação
}) {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');

    // Lógica de Filtragem e Ordenação Genérica
    const filteredAndSorted = useMemo(() => {
        let list = [...data];
        
        if (search.trim()) {
            list = list.filter(item => 
                searchFn ? searchFn(item, search.toLowerCase()) : 
                Object.values(item).some(val => 
                    String(val).toLowerCase().includes(search.toLowerCase())
                )
            );
        }

        list.sort((a, b) => {
            if (sortFn) return sortFn(a, b, sort);
            // Fallback genérico por ID ou data de criação se existir
            return sort === 'newest' ? (b.id - a.id) : (a.id - b.id);
        });

        return list;
    }, [data, search, sort, searchFn, sortFn]);

    const toggleSort = () => setSort(s => (s === 'newest' ? 'oldest' : 'newest'));

    return (
        <div className="py-10">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>

                {/* ── Toolbar ── */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <FilterIcon /> Filtros
                    </button>

                    <button
                        onClick={toggleSort}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                    >
                        <SortIcon /> {sort === 'newest' ? 'Mais novos' : 'Mais antigos'}
                    </button>

                    <button
                        onClick={onAddClick}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors ml-auto shadow-sm"
                    >
                        <PlusIcon /> {addLabel}
                    </button>
                </div>

                {/* ── View Desktop: Tabela Genérica ── */}
                <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    {columns.map((col, index) => (
                                        <th key={index} className="px-4 py-3 text-[11px] font-bold tracking-wider text-gray-500 whitespace-nowrap">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAndSorted.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                                            Nenhum registro encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSorted.map((item, index) => (
                                        <tr key={item.id || index} className="hover:bg-gray-50/50 transition-colors">
                                            {columns.map((col, colIndex) => (
                                                <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                                                    {/* Chama a função render customizada se existir, senão imprime o texto puro */}
                                                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── View Mobile: Renderização Dinâmica de Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden mt-4">
                    {filteredAndSorted.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
                            Nenhum registro encontrado.
                        </div>
                    ) : (
                        // Aqui passamos o "item" para a função do componente pai decidir como é o card dele
                        filteredAndSorted.map(item => renderMobileCard(item))
                    )}
                </div>

                {/* ── Footer ── */}
                {filteredAndSorted.length > 0 && (
                    <p className="mt-4 text-xs text-gray-400 text-right font-medium">
                        {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'registro encontrado' : 'registros encontrados'}
                    </p>
                )}
            </div>
        </div>
    );
}