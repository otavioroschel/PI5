<?php

namespace App\Http\Controllers;

use App\Models\Animal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AnimalController extends Controller
{
   public function index()
{
    // 1. OTIMIZAÇÃO E REGRA DE NEGÓCIO (SaaS Escalável):
    // active(): Aplica o Local Scope (onde status != 'adopted') que criamos no Model.
    // latest(): Ordena pelos mais recentes.
    // paginate(15): Blinda a memória RAM do servidor limitando a 15 instâncias por vez.
    $animals = Animal::active()
        ->latest()
        ->paginate(15)
        ->withQueryString(); // Mantém a URL sincronizada caso use filtros/buscas no futuro

    // 2. INJEÇÃO DE CONTEXTO (BFF Seguro):
    // Mantido exatamente como você fez: restritivo e focado em performance.
    $adopters = \App\Models\Adopter::select('id', 'name', 'cpf')
        ->orderBy('name')
        ->get();

    return Inertia::render('Animals/Index', [
        'animals' => $animals,
        'adopters' => $adopters
    ]);
}

    /**
     * Salva o novo animal vindo do Modal.
     */
    public function store(Request $request)
    {
        // 1. Validação rigorosa (seguindo a sua Migration)
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'species'               => 'required|in:dog,cat,other',
            'gender'                => 'required|in:male,female',
            'size'                  => 'required|in:small,medium,large',
            'arrival_date'          => 'required|date',
            'estimated_birth_date'  => 'nullable|date',
            'weight'                => 'nullable|numeric|min:0',
            'is_neutered'           => 'required|boolean',
            'is_vaccinated'         => 'required|boolean',
            'is_dewormed'           => 'required|boolean',
            'description'           => 'nullable|string',
            'status'                => 'required|in:available,adopted,deceased,foster_care,under_treatment',
            // Validação da foto: max 2MB
            'photo'                 => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // 2. Lógica de Upload com Isolamento de Tenant (ONG)
        if ($request->hasFile('photo')) {
            // Pegamos a ONG do usuário logado
            $ongId = auth()->user()->ong_id;
            // Criamos uma pasta física única para esta ONG: storage/app/public/tenants/{id}/animals
            // Isso impede que uma ONG acesse arquivos de outra no servidor
            $path = $request->file('photo')->storePublicly("tenants/{$ongId}/animals", 'public');

            // Salvamos o CAMINHO no banco de dados (coluna photo_path)
            $validated['photo_path'] = $path;
        }

        // 3. Criação do Registro
        // O 'ong_id' e o 'id' (UUID) serão injetados automaticamente pela sua Trait e pelo Model
        Animal::create($validated);

        // 4. Resposta para o Inertia (Redireciona de volta para a lista com os dados atualizados)
        return redirect()->route('animals.index')->with('success', 'Animal cadastrado com sucesso!');

        
    }

    /**
     * Atualiza o cadastro do animal (Update)
     */
    public function update(Request $request, Animal $animal)
    {
        // 1. Validação (A foto é nullable pois o usuário pode atualizar só o nome e não trocar a foto)
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'species'               => 'required|in:dog,cat,other',
            'gender'                => 'required|in:male,female',
            'size'                  => 'required|in:small,medium,large',
            'arrival_date'          => 'required|date',
            'estimated_birth_date'  => 'nullable|date',
            'weight'                => 'nullable|numeric|min:0',
            'is_neutered'           => 'required|boolean',
            'is_vaccinated'         => 'required|boolean',
            'is_dewormed'           => 'required|boolean',
            'description'           => 'nullable|string',
            'status'                => 'required|in:available,adopted,deceased,foster_care,under_treatment',
            'photo'                 => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // 2. Substituição de Arquivo Seguro (Storage Management)
        if ($request->hasFile('photo')) {
            // Se já existia uma foto, deletamos do disco para economizar storage e custo na AWS/Servidor
            if ($animal->photo_path) {
                Storage::disk('public')->delete($animal->photo_path);
            }

            // Salva a nova foto na mesma estrutura isolada do tenant
            $path = $request->file('photo')->storePublicly("tenants/{$animal->ong_id}/animals", 'public');
            $validated['photo_path'] = $path;
        }

        // 3. Atualiza os dados
        $animal->update($validated);

        return redirect()->back()->with('success', 'Animal atualizado com sucesso!');
    }

    /**
     * Exclui o animal (Soft Delete)
     */
    public function destroy(Animal $animal)
    {
        // Graças à trait SoftDeletes no Model, isso não dá um DROP na linha, 
        // apenas preenche a coluna 'deleted_at'. Os dados ficam seguros.
        $animal->delete();

        return redirect()->back()->with('success', 'Animal removido com sucesso!');
    }
}