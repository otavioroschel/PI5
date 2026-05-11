// resources/js/Pages/Vitrine/Adote.jsx

import { Head } from '@inertiajs/react';
import { useState } from 'react';
import PetCard from '@/Components/Vitrine/PetCard';
import AdoptionModal from '@/Components/Vitrine/AdoptionModal';

export default function Adote({ pets, slug }) {
    const [selectedPet, setSelectedPet] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head title="Adote um Amigo" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Animais Disponíveis para Adoção</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                        <PetCard 
                            key={pet.uuid} 
                            pet={pet} 
                            onAdoptClick={() => setSelectedPet(pet)} 
                        />
                    ))}
                </div>
            </div>

            {selectedPet && (
                <AdoptionModal 
                    pet={selectedPet} 
                    slug={slug} 
                    onClose={() => setSelectedPet(null)} 
                />
            )}
        </div>
    );
}