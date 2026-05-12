<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AnimalController;
use App\Http\Controllers\AdopterController;
use App\Http\Controllers\AdoptionController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\Admin\AdoptionLeadController;
use App\Http\Controllers\Vitrine\VitrineController;
use App\Http\Controllers\Vitrine\VitrineAdoptionController;
use App\Http\Controllers\TemporaryHomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── ROTAS DE REDIRECIONAMENTO ─────────────────────────────────────────────────
Route::get('/', function () {
    return redirect()->route('login');
})->middleware('throttle:60,1');

// ── ÁREA DE USUÁRIO (Sessão, mas independente de ONG) ─────────────────────────
Route::middleware(['auth', 'verified', 'tenant'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'throttle:60,1'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


// ==============================================================================
// 🔒 NÚCLEO DO SAAS (Proteção B2B: Exige Login + Isolamento de Tenant interno)
// ==============================================================================
Route::middleware(['auth', 'tenant'])->group(function () {
    
    // 🐾 Módulo 1: Prontuários de Animais
    // 🐾 Módulo 1: Prontuários de Animais
    Route::prefix('animals')->name('animals.')->group(function () {
        Route::get('/', [AnimalController::class, 'index'])->name('index');
        
        // 👁️ ADICIONE ESTA LINHA AQUI (A rota do Dossiê!):
        Route::get('/{animal}', [AnimalController::class, 'show'])->name('show');
        
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('/', [AnimalController::class, 'store'])->name('store');
            Route::put('/{animal}', [AnimalController::class, 'update'])->name('update');
            Route::delete('/{animal}', [AnimalController::class, 'destroy'])->name('destroy');
        });
    });
    // 👤 Módulo 2: Adotantes
    Route::prefix('adopters')->name('adopters.')->group(function () {
        Route::get('/', [AdopterController::class, 'index'])->name('index');
        Route::middleware('throttle:20,1')->group(function () {
            Route::post('/', [AdopterController::class, 'store'])->name('store');
            Route::put('/{adopter}', [AdopterController::class, 'update'])->name('update');
            Route::delete('/{adopter}', [AdopterController::class, 'destroy'])->name('destroy');
        });
    });

    // 🤝 Módulo 3: Adoções
    Route::prefix('adoptions')->name('adoptions.')->group(function () {
        Route::get('/', [AdoptionController::class, 'index'])->name('index');
        Route::middleware('throttle:15,1')->group(function () {
            Route::post('/', [AdoptionController::class, 'store'])->name('store');
            Route::patch('/{adoption}/return', [AdoptionController::class, 'returnAnimal'])->name('return');
        });
    });

    // 📦 Módulo 4: Insumos (Inventory)
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/food', [InventoryController::class, 'food'])->name('food');
        Route::get('/medications', [InventoryController::class, 'medications'])->name('medications');
        Route::get('/hygiene', [InventoryController::class, 'hygiene'])->name('hygiene');
        Route::get('/cleaning', [InventoryController::class, 'cleaning'])->name('cleaning');
    });

    // 📩 Módulo 5: Solicitações de Adoção (Leads da Vitrine para a ONG gerenciar)
    Route::get('/painel/solicitacoes', [AdoptionLeadController::class, 'index'])->name('admin.leads.index');
    Route::post('/painel/solicitacoes/{lead}/aprovar', [AdoptionLeadController::class, 'approve'])->name('admin.leads.approve');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // ... suas outras rotas

    Route::resource('temporary-homes', TemporaryHomeController::class)->except(['create', 'show', 'edit']);
});


        require __DIR__.'/auth.php';

// ==============================================================================
// 🌍 ÁREA PÚBLICA (VITRINE) - Fora do middleware Auth! Totalmente aberta!
// ==============================================================================
Route::prefix('{slug}')->middleware(['web', 'resolve.tenant'])->group(function () {
    
    // Rotas de leitura (Páginas) - Limite tolerante
    Route::middleware('throttle:60,1')->group(function () {
        
        // 1. A raiz do slug (/gatomestre) agora chama o método 'home'
        Route::get('/', [VitrineController::class, 'home'])->name('vitrine.home'); 
        
        // 2. A página de adoção (/gatomestre/adote) continua chamando 'adote'
        Route::get('/adote', [VitrineController::class, 'adote'])->name('vitrine.adote');
        
    });

    // Rota de Escrita (Formulário) - Limite SEVERO para evitar spam bots
    Route::post('/adote/{animal_uuid}/solicitar', [VitrineAdoptionController::class, 'store'])
        ->middleware('throttle:5,1') 
        ->name('vitrine.adote.store');
});

