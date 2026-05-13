<?php

namespace App\Http\Controllers;

use App\Models\Volunteer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class VolunteerController extends Controller
{
    public function index()
    {
        // 🛡️ Global Scope do Tenant já atua aqui silenciosamente
        // Carregamos o endereço para exibir a cidade/estado na grid
        $volunteers = Volunteer::with('address')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Volunteers/Index', [
            'volunteers' => $volunteers
        ]);
    }

public function store(Request $request)
    {
        $validated = $this->validateVolunteer($request);

        // 🛡️ A CORREÇÃO ESTÁ AQUI: Passamos o ong_id na hora de criar!
        $volunteer = Volunteer::create([
            'ong_id' => auth()->user()->ong_id, // 👈 INJEÇÃO DO TENANT AQUI
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'emergency_available' => $validated['emergency_available'],
            'skills' => $validated['skills'] ?? [],
            'availability' => $validated['availability'] ?? [],
            'status' => 'active',
            'notes' => $validated['notes'],
        ]);

        // 📍 Salva o Endereço Polimórfico associado ao Voluntário
        $volunteer->address()->create([
            'zip_code' => $validated['zip_code'],
            'street' => $validated['street'],
            'number' => $validated['number'],
            'complement' => $validated['complement'],
            'neighborhood' => $validated['neighborhood'],
            'city' => $validated['city'],
            'state' => $validated['state'],
        ]);

        return redirect()->back()->with('success', 'Voluntário cadastrado com sucesso!');
    }

    public function update(Request $request, Volunteer $volunteer)
    {
        // 🛡️ Proteção Multi-tenant
        if ($volunteer->ong_id !== auth()->user()->ong_id) {
            abort(403, 'Acesso não autorizado.');
        }

        $validated = $this->validateVolunteer($request);

        $volunteer->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'emergency_available' => $validated['emergency_available'],
            'skills' => $validated['skills'] ?? [],
            'availability' => $validated['availability'] ?? [],
            'status' => $validated['status'],
            'notes' => $validated['notes'],
        ]);

        // Atualiza ou cria o endereço
        $volunteer->address()->updateOrCreate(
            ['addressable_id' => $volunteer->id, 'addressable_type' => Volunteer::class],
            [
                'zip_code' => $validated['zip_code'],
                'street' => $validated['street'],
                'number' => $validated['number'],
                'complement' => $validated['complement'],
                'neighborhood' => $validated['neighborhood'],
                'city' => $validated['city'],
                'state' => $validated['state'],
            ]
        );

        return redirect()->back()->with('success', 'Cadastro atualizado com sucesso!');
    }

    public function destroy(Volunteer $volunteer)
    {
        if ($volunteer->ong_id !== auth()->user()->ong_id) {
            abort(403, 'Acesso não autorizado.');
        }

        $volunteer->delete(); // O cascadeOnDelete no banco vai limpar o endereço automaticamente se configurado

        return redirect()->back()->with('success', 'Voluntário removido.');
    }

    // 🛡️ Helper de Validação Centralizado
    private function validateVolunteer(Request $request): array
    {
        return $request->validate([
            // Dados Pessoais
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'emergency_available' => 'boolean',
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'notes' => 'nullable|string',
            
            // Arrays JSON
            'skills' => 'nullable|array',
            'skills.*' => 'string',
            'availability' => 'nullable|array',
            'availability.*' => 'string',
            
            // Endereço
            'zip_code' => 'required|string|max:10',
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:20',
            'complement' => 'nullable|string|max:255',
            'neighborhood' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:2',
        ]);
    }
}