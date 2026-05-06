<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Isolamento Multi-tenant
            $table->foreignUuid('ong_id')->constrained('ongs')->cascadeOnDelete();
            
            // MÁGICA: Relacionamento Polimórfico adaptado para UUID
            // Isso cria duas colunas: addressable_type (string) e addressable_id (char 36)
            $table->uuidMorphs('addressable'); 
            
            $table->char('zip_code', 8); // CEP sem máscara (apenas números)
            $table->string('street', 100);
            $table->string('number', 10);
            $table->string('neighborhood', 50);
            $table->string('city', 50);
            $table->char('state', 2);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};