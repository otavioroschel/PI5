<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

// 🚀 As importações obrigatórias que faltavam:
use App\Models\Animal;
use App\Observers\AnimalObserver;

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
        Vite::prefetch(concurrency: 3);
        
        // Agora o Laravel consegue resolver as classes perfeitamente
        Animal::observe(AnimalObserver::class);
    }
}