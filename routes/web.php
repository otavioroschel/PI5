<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AnimalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redireciona a raiz direto para o login
Route::get('/', function () {
    return redirect()->route('login');
});

// A rota que o Breeze procura logo após o login
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// --- AS NOSSAS ROTAS PROTEGIDAS (Sessão + Tenant da ONG) ---
Route::middleware(['auth', 'tenant'])->group(function () {
    Route::get('/animals', [AnimalController::class, 'index'])->name('animals.index');
});

// Rotas de perfil padrão do Breeze
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Rotas de registro de animais
// Rotas de registro de animais (Protegidas por Autenticação e Isolamento de Tenant)
Route::middleware(['auth', 'tenant'])->group(function () {
    
    // 1. Listagem (Tabela e Cards)
    Route::get('/animals', [AnimalController::class, 'index'])->name('animals.index');
    
    // 2. Criar novo (Vindo do Modal de Criação)
    Route::post('/animals', [AnimalController::class, 'store'])->name('animals.store');
    
    // 3. Atualizar existente (Vindo do Modal de Edição)
    Route::put('/animals/{animal}', [AnimalController::class, 'update'])->name('animals.update');
    
    // 4. Excluir (Soft Delete da Lixeira)
    Route::delete('/animals/{animal}', [AnimalController::class, 'destroy'])->name('animals.destroy');

});

require __DIR__.'/auth.php';