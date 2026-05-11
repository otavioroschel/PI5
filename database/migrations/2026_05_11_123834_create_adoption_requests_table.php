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
    Schema::create('adoption_requests', function (Blueprint $table) {
        $table->uuid('id')->primary();
        
        // ESTA LINHA É A QUE O ERRO DIZ QUE ESTÁ FALTANDO:
        $table->foreignId('ong_id')->constrained()->onDelete('cascade');
        
        // Certifique-se que o animal_id também é UUID se seus animais usam UUID
        $table->foreignUuid('animal_id')->constrained('animals')->onDelete('cascade');
        
        $table->string('adopter_name');
        $table->string('adopter_email');
        $table->string('adopter_phone');
        $table->string('status')->default('pending'); 
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adoption_requests');
    }
};
