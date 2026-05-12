<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // $middleware->statefulApi();

        $middleware->alias([
            // O seu middleware interno (Painel da ONG)
            'tenant' => \App\Http\Middleware\IdentifyTenant::class,
            
            // O NOVO middleware público (Vitrine)
            'resolve.tenant' => \App\Http\Middleware\ResolveTenantBySlug::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();