<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AnimalController;
use App\Http\Controllers\AdopterController;
use App\Http\Controllers\AdoptionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── ROTAS PÚBLICAS ────────────────────────────────────────────────────────────
// Padrão B2B: Redireciona para login e possui um limite básico contra bots de scan
Route::get('/', function () {
    return redirect()->route('login');
})->middleware('throttle:60,1');

// ── ÁREA DE USUÁRIO (Sessão, mas independente de ONG) ─────────────────────────
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'tenant'])->name('dashboard'); // 🛡️ ADICIONADO: Middleware 'tenant' para proteger métricas da ONG

Route::middleware(['auth', 'throttle:60,1'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ── NÚCLEO DO SAAS (Proteção B2B: Autenticação + Isolamento de Tenant) ──
// Todo o tráfego desta área exige usuário logado e contexto de ONG validado.
Route::middleware(['auth', 'tenant'])->group(function () {
    
    // 🐾 Módulo 1: Prontuários de Animais
    Route::prefix('animals')->name('animals.')->group(function () {
        Route::get('/', [AnimalController::class, 'index'])->name('index'); // Leitura (Mais permissiva)
        
        // 🛡️ Isolamento de tráfego para operações de escrita (CRUD)
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('/', [AnimalController::class, 'store'])->name('store');
            Route::put('/{animal}', [AnimalController::class, 'update'])->name('update');
            Route::delete('/{animal}', [AnimalController::class, 'destroy'])->name('destroy');
        });
    });

    // 👤 Módulo 2: Adotantes
    Route::prefix('adopters')->name('adopters.')->group(function () {
        Route::get('/', [AdopterController::class, 'index'])->name('index');
        
        // 🛡️ Proteção contra Spam/DDoS via Rate Limiting
        Route::middleware('throttle:20,1')->group(function () {
            Route::post('/', [AdopterController::class, 'store'])->name('store');
            Route::put('/{adopter}', [AdopterController::class, 'update'])->name('update');
            Route::delete('/{adopter}', [AdopterController::class, 'destroy'])->name('destroy');
        });
    });

    // 🤝 Módulo 3: Adoções
    Route::prefix('adoptions')->name('adoptions.')->group(function () {
        Route::get('/', [AdoptionController::class, 'index'])->name('index');
        
        // 🛡️ Rate Limiting rigoroso para transações atômicas de banco de dados
        Route::middleware('throttle:15,1')->group(function () {
            Route::post('/', [AdoptionController::class, 'store'])->name('store');
        });
    });

    // 📦 Módulo 4: Insumos (Inventory)
Route::prefix('inventory')->name('inventory.')->group(function () {
    Route::get('/food', [InventoryController::class, 'food'])->name('food');
    Route::get('/medications', [InventoryController::class, 'medications'])->name('medications');
    Route::get('/hygiene', [InventoryController::class, 'hygiene'])->name('hygiene');
    Route::get('/cleaning', [InventoryController::class, 'cleaning'])->name('cleaning');
});
    // Futuros Módulos do PI5 (Lares Temporários, Voluntários, Insumos)
    // Seguirão rigorosamente este mesmo padrão estrutural.
});

require __DIR__.'/auth.php';