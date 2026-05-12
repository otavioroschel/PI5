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
    Schema::create('temporary_homes', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->foreignId('ong_id')->constrained()->cascadeOnDelete();
        $table->string('name'); // Nome do voluntário/responsável
        $table->string('phone');
        $table->integer('max_capacity')->default(1); // Quantos animais cabem lá?
        $table->text('notes')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temporary_homes');
    }
};
