<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Http\Resources\UserResource; // Sugiro usar Resources para higienizar dados

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define as propriedades compartilhadas por padrão.
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            
            // 1. Contexto de Autenticação (Sanitizado)
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->uuid, // Use UUID no front, nunca ID incremental
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role, // Para controle de acesso no React
                    'ong_id' => $request->user()->ong_id,
                ] : null,
            ],

            // 2. Contexto do Tenant (ONG Atual)
            // Assumindo que você identifica a ONG via subdomínio ou slug e injeta no Request
            'tenant' => $request->attributes->get('tenant') ? [
                'name' => $request->attributes->get('tenant')->name,
                'slug' => $request->attributes->get('tenant')->slug,
                'logo' => $request->attributes->get('tenant')->logo_path,
            ] : null,

            // 3. Comunicação de Estado (Flash Messages)
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
            ],

            // 4. CSRF Token (Segurança extra para formulários não-Inertia se necessário)
            'csrf_token' => csrf_token(),
        ];
    }
}