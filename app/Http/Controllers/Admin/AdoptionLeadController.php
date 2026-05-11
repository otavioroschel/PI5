<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdoptionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdoptionLeadController extends Controller
{
    public function index(Request $request)
    {
        // O Global Scope (TenantScope) já deve limitar à ONG logada.
        // Trazemos as solicitações pendentes e carregamos os dados do animal desejado.
        $leads = AdoptionRequest::with('animal')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Leads/Index', [
            'leads' => $leads
        ]);
    }
}