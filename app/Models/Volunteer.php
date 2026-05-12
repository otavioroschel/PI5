<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Volunteer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'ong_id',
        'name',
        'phone',
        'email',
        'skills',
        'availability',
        'emergency_available',
        'status',
        'notes',
    ];

    // 🚀 O pulo do gato: O Laravel converte JSON do banco pra Array no PHP (e vice-versa)
    protected $casts = [
        'skills' => 'array',
        'availability' => 'array',
        'emergency_available' => 'boolean',
    ];

    // 📍 O reaproveitamento da inteligência do ViaCEP
    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    // Filtro rápido para pegar só quem tá ativo
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
