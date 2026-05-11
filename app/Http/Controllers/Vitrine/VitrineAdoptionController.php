<?php

namespace App\Http\Controllers\Vitrine;

use App\Http\Controllers\Controller;
use App\Models\AdoptionRequest;
use App\Models\Animal;
use Illuminate\Http\Request;

class VitrineAdoptionController extends Controller
{
    // Adicionei o $slug na assinatura do método para bater com o Route::prefix('{slug}')
    public function store(Request $request, $slug, $animal_uuid)
    {
        // O tenant_id já foi injetado pelo middleware da vitrine (ResolveTenantBySlug)
        $ongId = app('tenant_id');

        // 1. Validação CORRIGIDA (sem a regra strip_tags que não existe no Laravel)
        $validated = $request->validate([
            'adopter_name'  => 'required|string|max:100', 
            'adopter_email' => 'required|email:rfc,dns|max:150',
            'adopter_phone' => 'required|string|max:20', 
        ]);

        // 2. Verifica se o animal existe, pertence à ONG e está disponível
        $animal = Animal::where('id', $animal_uuid)
                        ->where('ong_id', $ongId)
                        ->where('status', 'available')
                        ->firstOrFail();

        // 3. Previne spam no mesmo animal
        $alreadyRequested = AdoptionRequest::where('animal_id', $animal->id)
            ->where('adopter_email', $validated['adopter_email'])
            ->where('status', 'pending')
            ->exists();

        if ($alreadyRequested) {
            return back()->withErrors(['adopter_email' => 'Você já possui uma solicitação em análise para este animal.']);
        }

        // 4. Salva o Lead (Usamos strip_tags aqui no PHP puro para limpar o nome)
        AdoptionRequest::create([
            'ong_id'        => $ongId,
            'animal_id'     => $animal->id,
            'adopter_name'  => strip_tags($validated['adopter_name']),
            'adopter_email' => $validated['adopter_email'],
            'adopter_phone' => $validated['adopter_phone'],
            'status'        => 'pending',
        ]);

        return back()->with('success', 'Sua solicitação foi enviada! A ONG entrará em contato em breve.');
    }
}