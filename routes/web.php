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
Route::middleware(['auth', 'tenant'])->group(function () {
    Route::get('/animals', [AnimalController::class, 'index'])->name('animals.index');
    Route::get('/animals/create', [AnimalController::class, 'create'])->name('animals.create');
    Route::post('/animals', [AnimalController::class, 'store'])->name('animals.store');
});

require __DIR__.'/auth.php';