<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ongs', function (Blueprint $table) {
            $table->uuid('id')->primary(); 
            $table->string('slug', 100)->unique()->index(); 
            $table->string('name');
            
            // Adicionando o CNPJ: 14 caracteres, único. 
            // 'nullable()' caso você permita que ONGs informais testem o sistema primeiro.
            $table->string('cnpj', 14)->unique()->nullable(); 
            
            // Adicionando um e-mail de contato da ONG
            $table->string('email')->unique()->nullable();
            
            $table->string('whatsapp', 20)->nullable(); 
            $table->json('branding')->nullable(); 
            $table->string('logo_path')->nullable();
            $table->boolean('is_active')->default(true); 
            
            $table->timestamps();
            $table->softDeletes(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ongs');
    }
};