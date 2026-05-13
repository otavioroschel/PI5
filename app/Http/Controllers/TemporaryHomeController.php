<?php

namespace App\Http\Controllers;

use App\Models\TemporaryHome;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TemporaryHomeController extends Controller
{
   public function index()
    {
        // 🛡️ A MÁGICA ESTÁ AQUI: array ['address', 'animals']
        // Traz os Lares, seus Endereços e a lista de Animais hospedados lá
        $temporaryHomes = TemporaryHome::with(['address', 'animals'])
            ->where('ong_id', auth()->user()->ong_id)
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('TemporaryHomes/Index', [
            'temporaryHomes' => $temporaryHomes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'max_capacity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            // Endereço
            'zip_code' => 'required|string|max:10',
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:20',
            'neighborhood' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:2',
        ]);

        // 1. Cria o Lar Temporário
        $home = TemporaryHome::create([
            'ong_id' => auth()->user()->ong_id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'max_capacity' => $validated['max_capacity'],
            'notes' => $validated['notes'] ?? null,
        ]);

        // 2. Cria o Endereço vinculado a ele (Relação Polimórfica)
        $home->address()->create([
            'ong_id' => auth()->user()->ong_id,
            'zip_code' => $validated['zip_code'],
            'street' => $validated['street'],
            'number' => $validated['number'],
            'neighborhood' => $validated['neighborhood'],
            'city' => $validated['city'],
            'state' => $validated['state'],
        ]);

        return redirect()->back();
    }

    public function update(Request $request, TemporaryHome $temporaryHome)
    {
        // Segurança: Impede de editar lares de outra ONG
        if ($temporaryHome->ong_id !== auth()->user()->ong_id) abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'max_capacity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            // Endereço
            'zip_code' => 'required|string|max:10',
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:20',
            'neighborhood' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:2',
        ]);

        // 1. Atualiza o Lar
        $temporaryHome->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'max_capacity' => $validated['max_capacity'],
            'notes' => $validated['notes'],
        ]);

        // 2. Atualiza o Endereço
        if ($temporaryHome->address) {
            $temporaryHome->address()->update([
                'zip_code' => $validated['zip_code'],
                'street' => $validated['street'],
                'number' => $validated['number'],
                'neighborhood' => $validated['neighborhood'],
                'city' => $validated['city'],
                'state' => $validated['state'],
            ]);
        }

        return redirect()->back();
    }

    public function destroy(TemporaryHome $temporaryHome)
    {
        if ($temporaryHome->ong_id !== auth()->user()->ong_id) abort(403);
        
        // O Endereço será deletado automaticamente se você configurou o cascadeOnDelete() na migration
        $temporaryHome->delete();
        
        return redirect()->back();
    }
}