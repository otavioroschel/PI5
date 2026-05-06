<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adoptions', function (Blueprint $table) {
            // 1. Chave Primária UUID
            $table->uuid('id')->primary();
            
            // 2. Isolamento de Tenant (ONG)
            $table->foreignUuid('ong_id')->constrained('ongs')->cascadeOnDelete();
            
            // 3. Dados da Transação
            $table->date('adoption_date');
            
            // 4. Integridade Histórica (RESTRICT)
            $table->foreignUuid('animal_id')->constrained('animals')->restrictOnDelete();
            $table->foreignUuid('adopter_id')->constrained('adopters')->restrictOnDelete();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adoptions');
    }
};