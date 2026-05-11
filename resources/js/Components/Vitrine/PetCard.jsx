// resources/js/Components/Vitrine/PetCard.jsx

export default function PetCard({ pet, onAdoptClick }) {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            {/* Atualizado para 'photo' conforme sua validação */}
            <img 
    src={pet.photo_url || `/storage/${pet.photo}`} 
    alt={pet.name}
    className="w-full h-48 object-cover"
/>
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{pet.name}</h3>
                
                {/* Aqui você pode formatar a data de nascimento ou mostrar o porte/espécie */}
                <p className="text-gray-500 text-sm mt-1">
                    {pet.species === 'dog' ? 'Cachorro' : pet.species === 'cat' ? 'Gato' : 'Outro'} • {pet.gender === 'male' ? 'Macho' : 'Fêmea'}
                </p>
                
                <p className="text-gray-600 mt-2 line-clamp-2">{pet.description || 'Sem descrição no momento.'}</p>
                
                <button 
                    onClick={onAdoptClick}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150"
                >
                    Quero Adotar
                </button>
            </div>
        </div>
    );
}