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
        Schema::create('volunteers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ong_id')->constrained('ongs')->cascadeOnDelete();
            
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            
            // 🚀 O Segredo do MVP Ágil: Arrays JSON
            $table->json('skills')->nullable(); 
            $table->json('availability')->nullable();
            
            // 🚨 A sua ideia brilhante de emergência
            $table->boolean('emergency_available')->default(false);
            
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('volunteers');
    }
};
