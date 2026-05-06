<?php

namespace App\Http\Controllers;

use App\Models\Adoption;
use App\Models\Animal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdoptionController extends Controller
{
    /**
     * Exibe a listagem do Histórico de Adoções (A ROTA QUE ESTAVA FALTANDO)
     */
 public function index(Request $request)
{
    // O Eloquent fará 3 queries otimizadas em vez do problema N+1:
    // 1. Busca as adoções
    // 2. Busca os animais e adotantes vinculados
    // 3. Busca os endereços vinculados aos adotantes
    $adoptions = Adoption::with([
        'animal', 
        'adopter.address' // 🛡️ A mágica acontece aqui (Relação Aninhada)
    ])
    ->orderBy('adoption_date', 'desc')
    ->paginate(15);

    return inertia('Adoptions/Index', [
        'adoptions' => $adoptions
    ]);
}
    /**
     * Salva uma nova adoção de forma atômica
     */
    public function store(Request $request)
    {
        $ongId = $request->user()->ong_id;

        // Validação Estrita (Garantindo que IDs pertencem à ONG correta)
        $validated = $request->validate([
            'animal_id' => [
                'required', 'uuid', 
                Rule::exists('animals', 'id')->where('ong_id', $ongId)
            ],
            'adopter_id' => [
                'required', 'uuid', 
                Rule::exists('adopters', 'id')->where('ong_id', $ongId)
            ],
            'adoption_date' => ['required', 'date', 'before_or_equal:today'],
        ]);

        try {
            DB::transaction(function () use ($validated, $ongId) {
                // 1. Bloqueia o registro do animal para leitura/escrita concorrente
                $animal = Animal::where('id', $validated['animal_id'])->lockForUpdate()->first();

                // 2. Proteção de Negócio: Impede dupla adoção
                if ($animal->status !== 'available') {
                    throw new \Exception('Este animal não está disponível para adoção.');
                }

                // 3. Registra o histórico
                Adoption::create([
                    'ong_id'        => $ongId,
                    'animal_id'     => $validated['animal_id'],
                    'adopter_id'    => $validated['adopter_id'],
                    'adoption_date' => $validated['adoption_date'],
                ]);

                // 4. Atualiza a vitrine
                $animal->update(['status' => 'adopted']);
            });

            return redirect()->back()->with('success', 'Adoção registrada com sucesso.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}