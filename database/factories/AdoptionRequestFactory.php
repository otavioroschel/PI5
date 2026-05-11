<?php

namespace Database\Factories;

use App\Models\AdoptionRequest;
use App\Models\Animal;
use App\Models\Ong;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdoptionRequestFactory extends Factory
{
    protected $model = AdoptionRequest::class;

    public function definition(): array
    {
        // Pega um animal aleatório disponível
        $animal = Animal::where('status', 'available')->inRandomOrder()->first();
        
        // Se não houver animais, a factory falharia. Como fallback de segurança, 
        // criamos um animal ou usamos um array vazio (depende da sua lógica de seed)
        $ongId = $animal ? $animal->ong_id : Ong::factory();

        return [
            'ong_id'        => $ongId,
            'animal_id'     => $animal->id,
            'adopter_name'  => fake()->name(),
            'adopter_email' => fake()->unique()->safeEmail(),
            'adopter_phone' => fake()->phoneNumber(),
            'status'        => fake()->randomElement(['pending', 'pending', 'approved', 'rejected']), // Mais peso para pending
        ];
    }
}