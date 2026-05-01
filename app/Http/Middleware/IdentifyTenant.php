<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IdentifyTenant
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // 1. Verifica se o usuário está logado e se ele tem uma ONG vinculada
        if (Auth::check() && Auth::user()->ong_id) {
            
            // 2. Avisa o sistema (e a sua Trait) qual é a ONG atual!
            app()->instance('currentTenant', Auth::user()->ong_id);
            
            return $next($request);
        }

        // 3. Se for o Superadmin (que não tem ong_id) ou um usuário bugado, joga pro painel
        return redirect()->route('dashboard');
    }
}