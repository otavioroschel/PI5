<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Otimização padrão do Vite para o front-end
        Vite::prefetch(concurrency: 3);

        // Isso resolve o erro de Mixed Content (chrome-error) no redirecionamento do login.
        if (str_contains(config('app.url'), 'github.dev')) {
            URL::forceScheme('https');
        }
    }
}