// resources/js/Components/Modals/DynamicForm.jsx
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function DynamicForm({ fields, endpoint, method = 'post', entity = null, onSuccess }) {
    
    // 1. Inicializa o estado de forma segura (trata null e undefined)
    const initialState = fields.reduce((acc, field) => {
        acc[field.name] = entity ? (entity[field.name] ?? '') : (field.defaultValue ?? '');
        return acc;
    }, {});

    // 2. Spoofing de Método (Obrigatório no Laravel para PUT com Inertia)
    if (method === 'put') {
        initialState['_method'] = 'put';
    }

    const { data, setData, post, processing, errors, clearErrors } = useForm(initialState);

    const submit = (e) => {
        e.preventDefault();
        clearErrors(); // Limpa erros anteriores antes de tentar novamente
        
        const url = method === 'put' ? `${endpoint}/${entity.id}` : endpoint;
        
        // Sempre usamos post() do Inertia, o _method no data avisa o Laravel que é PUT
        post(url, { 
            preserveScroll: true,
            onSuccess: () => onSuccess && onSuccess() 
        });
    };

    // 3. Renderizador inteligente de Inputs (Aceita text, select, textarea)
    const renderInput = (field) => {
        const commonClasses = "w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500";

        if (field.type === 'select') {
            return (
                <select 
                    className={commonClasses}
                    value={data[field.name]}
                    onChange={e => setData(field.name, e.target.value)}
                    disabled={field.disabled}
                >
                    <option value="">Selecione...</option>
                    {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );
        }

        if (field.type === 'textarea') {
            return (
                <textarea 
                    className={commonClasses}
                    rows={field.rows || 3}
                    value={data[field.name]}
                    onChange={e => setData(field.name, e.target.value)}
                    disabled={field.disabled}
                />
            );
        }

        return (
            <input 
                type={field.type || 'text'}
                className={commonClasses}
                value={data[field.name]}
                onChange={e => setData(field.name, e.target.value)}
                disabled={field.disabled}
                placeholder={field.placeholder || ''}
            />
        );
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            {/* Grid para deixar o formulário mais bonito (2 colunas em telas médias) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div 
                        key={field.name} 
                        // Se o campo for marcado como fullWidth, ocupa as duas colunas
                        className={field.fullWidth ? "sm:col-span-2" : "sm:col-span-1"}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                        </label>
                        
                        {renderInput(field)}
                        
                        <InputError message={errors[field.name]} className="mt-1" />
                    </div>
                ))}
            </div>
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                    type="button" 
                    onClick={onSuccess} // Usa a mesma função de sucesso para fechar (cancelar)
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    disabled={processing} 
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {processing ? 'Salvando...' : 'Confirmar'}
                </button>
            </div>
        </form>
    );
}