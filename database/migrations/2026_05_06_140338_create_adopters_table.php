<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adopters', function (Blueprint $table) {
            // Chave Primária UUID para segurança contra enumeração
            $table->uuid('id')->primary();
            
            // Isolamento Multi-tenant (Chave Estrangeira UUID)
            $table->foreignUuid('ong_id')->constrained('ongs')->cascadeOnDelete();
            
            $table->string('name', 100);
            $table->char('cpf', 11);
            $table->string('phone', 15);
            $table->string('email', 100)->nullable();
            
            $table->timestamps();

            // Proteção B2B: Impede CPFs duplicados apenas dentro da MESMA ONG
            $table->unique(['ong_id', 'cpf']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adopters');
    }
};