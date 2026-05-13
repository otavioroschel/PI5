<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdoptionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdoptionRequestController extends Controller
{
    /**
     * Lista os interessados em adoção da ONG logada.
     */
public function index()
    {
        // 🛡️ Otimização de Payload: Trazemos apenas o ID (para o link) e o Nome.
        // Removemos photo_path, description, age, etc., economizando tráfego de rede.
        $requests = AdoptionRequest::with('animal:id,name') 
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Adoptions/Requests/Index', [
            'requests' => $requests
        ]);
    }

    /**
     * Atualiza o status do lead (Interessado).
     */
    public function updateStatus(Request $request, AdoptionRequest $adoptionRequest)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,in_analysis,approved,rejected'],
        ]);

        $adoptionRequest->update([
            'status' => $validated['status']
        ]);

        return back()->with('success', 'Status do interessado atualizado com sucesso.');
    }
}