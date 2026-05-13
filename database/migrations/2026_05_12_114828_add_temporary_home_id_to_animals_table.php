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
    Schema::table('animals', function (Blueprint $table) {
        // foreignUuid pois o ID do LT é UUID
        $table->foreignUuid('temporary_home_id')->nullable()->constrained('temporary_homes')->nullOnDelete();
    });
}

    /**
     * Reverse the migrations.
     */
  public function down(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            // 1. Remove o relacionamento (a trava)
            $table->dropForeign(['temporary_home_id']);
            
            // 2. Remove a coluna física
            $table->dropColumn('temporary_home_id');
        });
    }
};
