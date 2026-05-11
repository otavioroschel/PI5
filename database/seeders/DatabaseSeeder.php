<?php

namespace Database\Seeders;

use App\Models\Ong;
use App\Models\User;
use App\Models\Animal;
use App\Models\Adopter; // 🛡️ Importação do Adotante
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker; // 🛡️ Importação do Faker para gerar dados falsos realistas

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Instancia o gerador de dados falsos em Português
        $faker = Faker::create('pt_BR');

        // 1. Super Admin (O "Dono" do SaaS)
        User::withoutEvents(function () {
            User::create([
                'name' => 'Super Admin SaaS',
                'email' => 'admin@meusaas.com',
                'password' => Hash::make('senha123'),
                'ong_id' => null,
            ]);
        });

        // 2. ONG 1 - Cão Feliz
        $ong1 = Ong::create([
            'id' => Str::uuid(),
            'slug' => 'caofeliz',
            'name' => 'ONG Cão Feliz',
            'cnpj' => '11111111111111',
            'email' => 'contato@caofeliz.com.br',
            'whatsapp' => '11999999999',
            'branding' => ['primary_color' => '#FF5733'],
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Gestor Cão Feliz',
            'email' => 'gestor@caofeliz.com.br',
            'password' => Hash::make('senha123'),
            'ong_id' => $ong1->id,
        ]);

        // Animal para ONG 1
        Animal::create([
            'ong_id' => $ong1->id,
            'name' => 'Rex',
            'species' => 'dog',
            'gender' => 'male',
            'size' => 'large',
            'arrival_date' => now()->subMonths(2),
            'estimated_birth_date' => now()->subYears(3),
            'is_neutered' => true,
            'is_vaccinated' => true,
            'status' => 'available',
            'description' => 'Um cão muito brincalhão e protetor.'
        ]);

        // 🐾 2 Adotantes de Teste para a ONG 1
        for ($i = 0; $i < 2; $i++) {
            $adopter = Adopter::create([
                'ong_id' => $ong1->id,
                'name'   => $faker->name,
                'cpf'    => $faker->cpf(false), 
                'phone'  => $faker->cellphoneNumber,
                'email'  => $faker->unique()->safeEmail,
            ]);

            // Cria o Endereço vinculado a ele
            $adopter->address()->create([
                'ong_id'       => $ong1->id,
                'zip_code'     => $faker->postcode,
                'street'       => $faker->streetName,
                'number'       => $faker->buildingNumber,
                'neighborhood' => 'Bairro ' . $faker->word,
                'city'         => $faker->city,
                'state'        => $faker->stateAbbr, 
            ]);
        }

        // 3. ONG 2 - Gato Mestre
        $ong2 = Ong::create([
            'id' => Str::uuid(),
            'slug' => 'gatomestre',
            'name' => 'Abrigo Gato Mestre',
            'cnpj' => '22222222222222',
            'email' => 'contato@gatomestre.com.br',
            'whatsapp' => '22999999999',
            'branding' => ['primary_color' => '#8E44AD'],
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Diretora Gato Mestre',
            'email' => 'diretora@gatomestre.com.br',
            'password' => Hash::make('senha123'),
            'ong_id' => $ong2->id,
        ]);

        // Animal para ONG 2
        Animal::create([
            'ong_id' => $ong2->id,
            'name' => 'Mingau',
            'species' => 'cat',
            'gender' => 'female',
            'size' => 'small',
            'arrival_date' => now()->subDays(15),
            'estimated_birth_date' => now()->subMonths(6),
            'is_neutered' => false,
            'is_vaccinated' => true,
            'status' => 'foster_care',
            'description' => 'Uma gatinha dócil que adora colo.'
        ]);

        // Depois de criar as ONGs e os Animais...
        \App\Models\AdoptionRequest::factory(30)->create();
    }
}