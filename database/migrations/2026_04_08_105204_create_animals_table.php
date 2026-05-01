<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('animals', function (Blueprint $table) {
            // 1. Identificação Única (UUID por segurança de URL)
            $table->uuid('id')->primary();

            // 2. Chave Estrangeira da ONG (Obrigatória para o Isolamento/Multi-tenancy)
            $table->foreignUuid('ong_id')->constrained('ongs')->cascadeOnDelete();
            
            // 3. Dados Básicos
            $table->string('name');
            $table->enum('species', ['dog', 'cat', 'other']); // espécie
            $table->enum('gender', ['male', 'female']); // sexo
            $table->enum('size', ['small', 'medium', 'large']); // porte
            
            // 4. Datas e Idade
            $table->date('arrival_date'); // data_chegada
            $table->date('estimated_birth_date')->nullable(); // data_nascimento_estimada
            
            // 5. Saúde e Características (Usando Booleans para Sim/Não)
            $table->decimal('weight', 5, 2)->nullable(); // peso
            $table->boolean('is_neutered')->default(false); // castrado
            $table->boolean('is_vaccinated')->default(false); // vacinado
            $table->boolean('is_dewormed')->default(false); // vermifugado
            
            // 6. Conteúdo Visual e Texto
            $table->string('photo_path')->nullable(); // foto
            $table->text('description')->nullable(); // sobre
            
            // 7. Status do Animal
            $table->enum('status', [
                'available',      // disponível
                'adopted',        // adotado
                'deceased',       // óbito
                'foster_care',    // lar temporário
                'under_treatment' // em tratamento
            ])->default('available');

            // 8. Chave Estrangeira Opcional para Lar Temporário (Nullable)
            $table->uuid('foster_home_id')->nullable();

            // 9. Auditoria
            $table->timestamps();
            $table->softDeletes(); // Permite "deletar" sem apagar do banco (segurança)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animals');
    }
};