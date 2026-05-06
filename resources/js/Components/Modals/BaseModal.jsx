import { useEffect } from 'react';

export default function BaseModal({ isOpen, onClose, title, children }) {
    // Gestão de Estado de UI e Acessibilidade (Evita double-scroll)
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // Cleanup para evitar memory leaks de UI se o componente for desmontado subitamente
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Renderização condicional imediata
    if (!isOpen) return null;

    return (
        // z-50 garante que o modal fique acima de qualquer navbar ou tabela (z-index)
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 bg-black/50 backdrop-blur-sm">
            
            {/* Overlay invisível para fechar ao clicar fora do modal */}
            <div 
                className="absolute inset-0" 
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Container Central do Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Fechar janela"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Corpo do Modal (Onde os formulários dinâmicos serão injetados) */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}