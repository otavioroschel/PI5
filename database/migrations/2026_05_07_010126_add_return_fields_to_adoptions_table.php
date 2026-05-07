<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa as alterações (Cria as colunas).
     */
    public function up(): void
    {
        Schema::table('adoptions', function (Blueprint $table) {
            // Adicionamos o timestamp de quando foi devolvido
            // Usamos o 'after' para manter a tabela organizada visualmente
            $table->timestamp('returned_at')->nullable()->after('adoption_date');
            
            // Adicionamos o motivo (text permite textos longos/justificativas)
            $table->text('return_reason')->nullable()->after('returned_at');
        });
    }

    /**
     * Reverte as alterações (Remove as colunas).
     */
    public function down(): void
    {
        Schema::table('adoptions', function (Blueprint $table) {
            // Se decidirmos desfazer a migration, as colunas são apagadas
            $table->dropColumn(['returned_at', 'return_reason']);
        });
    }
};