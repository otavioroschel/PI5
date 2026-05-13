<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Ong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class ResolveTenantBySlug
{
    public function handle(Request $request, Closure $next)
    {
        // Pega o {slug} da URL (ex: 'gatomestre')
        $slug = $request->route('slug');
        
        // Resolve a ONG. Se não existir, retorna 404 instantaneamente.
        $ong = Ong::where('slug', $slug)->firstOrFail();
        
        // Registra o ID do tenant no Container (para ser usado pelo Controller)
        App::instance('tenant_id', $ong->id);

        return $next($request);
    }
}