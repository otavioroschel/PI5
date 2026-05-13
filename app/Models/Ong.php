<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ong extends Model // <-- AQUI: Tem que ser "Ong" e não "Ongs"
{
    use HasFactory, SoftDeletes;

    // Dizemos ao Laravel que a chave primária não é auto-incremento, mas sim UUID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'slug', 'name', 'cnpj', 'email', 'whatsapp', 'branding', 'logo_path', 'is_active'
    ];

    protected $casts = [
        'branding' => 'array',
        'is_active' => 'boolean',
    ];
}