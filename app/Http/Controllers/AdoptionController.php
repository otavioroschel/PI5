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
     * Exibe a listagem do Histórico de Adoções
     */
  public function index(Request $request)
    {
        $query = Adoption::with([
            'animal', 
            'adopter.address',
            'adopter.adoptions.animal' 
        ])->orderBy('adoption_date', 'desc');

        // 🛡️ LÓGICA DE PESQUISA
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('adopter', function ($q) use ($search) {
                $q->where('cpf', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            })->orWhereHas('animal', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // withQueryString garante que o termo de busca continue na URL ao trocar de página
        $adoptions = $query->paginate(15)->withQueryString();

        return inertia('Adoptions/Index', [
            'adoptions' => $adoptions,
            'filters' => $request->only('search') // Devolvemos o filtro para o React
        ]);
    }

    /**
     * Salva uma nova adoção de forma atômica
     */
    public function store(Request $request)
    {
        $ongId = $request->user()->ong_id;

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
                $animal = Animal::where('id', $validated['animal_id'])->lockForUpdate()->first();

                if ($animal->status !== 'available') {
                    throw new \Exception('Este animal não está disponível para adoção.');
                }

                Adoption::create([
                    'ong_id'        => $ongId,
                    'animal_id'     => $validated['animal_id'],
                    'adopter_id'    => $validated['adopter_id'],
                    'adoption_date' => $validated['adoption_date'],
                ]);

                $animal->update(['status' => 'adopted']);
            });

            return redirect()->back()->with('success', 'Adoção registrada com sucesso.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    } // <--- AQUI FECHA O STORE

    /**
     * Registra a devolução de um animal
     */
    public function returnAnimal(Request $request, Adoption $adoption)
    {
        $request->validate([
            'return_reason' => 'required|string|min:10',
        ]);

        try {
            DB::transaction(function () use ($request, $adoption) {
                $adoption->update([
                    'returned_at' => now(),
                    'return_reason' => $request->return_reason,
                ]);

                $adoption->animal->update([
                    'status' => 'returned'
                ]);
            });

            return redirect()->back()->with('success', 'Devolução registrada.');
        } catch (\Exception $e) {
            // 🚨 TROQUE O REDIRECT PELO DD() AQUI:
            dd($e->getMessage()); 
        }
    }
} // <--- AQUI FECHA A CLASSE