<?php

namespace App\Models;

use App\Models\Traits\BelongsToOng;
use Illuminate\Database\Eloquent\Concerns\HasUuids; // 1. Import do UUID nativo
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute; // 2. Import do Accessor moderno
use Illuminate\Support\Facades\Storage; // 3. Import do Storage
use Carbon\Carbon;

class Animal extends Model
{
    // Substituímos a configuração manual do UUID pela Trait HasUuids nativa do Laravel
    use HasFactory, SoftDeletes, BelongsToOng, HasUuids;

    // 2. Campos que podem ser preenchidos em massa
    protected $fillable = [
        'ong_id',
        'name',
        'species',
        'gender',
        'size',
        'arrival_date',
        'estimated_birth_date',
        'weight',
        'is_neutered',
        'is_vaccinated',
        'is_dewormed',
        'photo_path',
        'description',
        'status',
        'foster_home_id'
    ];

    // 3. Conversão automática de tipos (Casts)
    protected $casts = [
        'is_neutered' => 'boolean',
        'is_vaccinated' => 'boolean',
        'is_dewormed' => 'boolean',
        'arrival_date' => 'date',
        'estimated_birth_date' => 'date',
        'weight' => 'decimal:2',
    ];

    // 4. Atributos Dinâmicos (Accessors) que serão injetados no JSON para o React
    // Adicionamos o 'photo_url' aqui!
    protected $appends = ['age_display', 'photo_url'];

    /**
     * Gera a URL pública da foto usando o disco 'public'.
     * O React lerá isso como 'animal.photo_url'
     */
    protected function photoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->photo_path ? Storage::url($this->photo_path) : null,
        );
    }

    /**
     * Calcula a idade formatada.
     * O React lerá isso como 'animal.age_display'
     */
    public function getAgeDisplayAttribute()
    {
        if (!$this->estimated_birth_date) {
            return 'Idade desconhecida';
        }

        $now = Carbon::now();
        $diff = $this->estimated_birth_date->diff($now);

        if ($diff->y > 0) {
            return $diff->y . ($diff->y == 1 ? ' ano' : ' anos');
        }

        if ($diff->m > 0) {
            return $diff->m . ($diff->m == 1 ? ' mês' : ' meses');
        }

        return $diff->d . ($diff->d == 1 ? ' dia' : ' dias');
    }
}