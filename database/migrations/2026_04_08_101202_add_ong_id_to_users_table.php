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
        Schema::table('users', function (Blueprint $table) {
            // 1. foreignUuid: Como o ID da ONG é um UUID, precisamos usar esse método.
            // 2. nullable(): Permitimos nulo para que o Super Admin (Você, dono do SaaS) possa existir sem estar preso a uma ONG.
            // 3. constrained('ongs'): Cria a chave estrangeira (Foreign Key) de verdade, blindando o banco contra IDs inválidos.
            // 4. cascadeOnDelete(): Se uma ONG for completamente deletada do banco, todos os usuários dela serão deletados junto, evitando "dados órfãos".
            
            $table->foreignUuid('ong_id')
                  ->nullable()
                  ->after('id') // Coloca a coluna logo após o ID do usuário para ficar organizado
                  ->constrained('ongs')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Regra de ouro: no down(), primeiro removemos a chave estrangeira, depois a coluna.
            $table->dropForeign(['ong_id']);
            $table->dropColumn('ong_id');
        });
    }
};