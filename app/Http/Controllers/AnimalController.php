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
    // 1. OTIMIZAÇÃO E CARREGAMENTO DE RELAÇÕES (Eager Loading):
    // active(): Filtra os animais (Local Scope).
    // with(['temporaryHome.address']): 🛡️ ESSA É A CHAVE! 
    // Carrega o lar temporário e, dentro dele, o endereço polimórfico.
    $animals = Animal::active()
        ->with(['temporaryHome.address']) 
        ->latest()
        ->paginate(15)
        ->withQueryString();

    // 2. INJEÇÃO DE CONTEXTO PARA OS MODAIS (BFF Seguro):
    // Adotantes para o modal de registro de adoção
    $adopters = \App\Models\Adopter::select('id', 'name', 'cpf')
        ->orderBy('name')
        ->get();

    // Lares Temporários para o modal de Edição do Animal
    $temporaryHomes = \App\Models\TemporaryHome::select('id', 'name', 'max_capacity')
        ->orderBy('name')
        ->get();

    // 3. ENVIO ÚNICO PARA O FRONT-END:
    return Inertia::render('Animals/Index', [
        'animals' => $animals,
        'adopters' => $adopters,
        'temporaryHomes' => $temporaryHomes
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
            
            // 🛡️ A LIBERAÇÃO DA CATRACA ESTÁ AQUI:
            'temporary_home_id'     => 'nullable|exists:temporary_homes,id',
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

        // Se o status NÃO for lar temporário, garantimos que o vínculo seja quebrado
        if ($validated['status'] !== 'foster_care') {
            $validated['temporary_home_id'] = null;
        }

        // 3. Atualiza os dados
        $animal->update($validated);

        return redirect()->back()->with('success', 'Animal atualizado com sucesso!');
    }

    public function show(Animal $animal)
    {
        // 🛡️ Segurança Multi-tenant: Impede que uma ONG acesse o animal de outra
        if ($animal->ong_id !== auth()->user()->ong_id) {
            abort(403, 'Acesso não autorizado a este dossiê.');
        }

        // 📦 Eager Loading: Carrega tudo que precisamos para a Linha do Tempo
        // Obs: Se você tiver um relacionamento de adoções (ex: 'adoptions.adopter'), 
        // você pode adicionar ele nesse array depois!
        $animal->load([
            'temporaryHome.address'
        ]);

        return Inertia::render('Animals/Show', [
            'animal' => $animal
        ]);
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