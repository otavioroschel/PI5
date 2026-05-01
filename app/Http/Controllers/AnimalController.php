<?php

namespace App\Http\Controllers;

use App\Models\Animal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnimalController extends Controller
{
    // 1. Lista os animais 
    public function index()
    {
        // O Tenant já filtrou tudo por ONG automaticamente
        $animals = Animal::all();

        // Passamos os dados direto para o React
        return Inertia::render('Animals/Index', [
            'animals' => $animals
        ]);
    }

    // 2. Abre a tela do formulário vazio
    public function create()
    {
        return Inertia::render('Animals/Create');
    }

    // 3. Recebe os dados do React e salva no banco
    public function store(Request $request)
    {
        // Valida se os dados que vieram do React estão corretos
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'species' => 'required|in:dog,cat',
            'gender' => 'required|in:male,female',
            'size' => 'required|in:small,medium,large',
            'arrival_date' => 'required|date',
            'estimated_birth_date' => 'nullable|date',
            'is_neutered' => 'required|boolean',
            'is_vaccinated' => 'required|boolean',
            'status' => 'required|in:available,foster_care,adopted',
            'description' => 'nullable|string',
        ]);

        // A mágica: Salva no banco. O 'ong_id' é injetado sozinho pela sua Trait!
        Animal::create($validated);

        // Devolve o usuário para a lista de animais
        return redirect()->route('animals.index');
    }
}