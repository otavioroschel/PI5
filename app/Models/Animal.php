<?php

namespace App\Models;

use App\Models\Traits\BelongsToOng;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class Animal extends Model
{
    use HasFactory, SoftDeletes, BelongsToOng, HasUuids;

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

    protected $casts = [
        'is_neutered' => 'boolean',
        'is_vaccinated' => 'boolean',
        'is_dewormed' => 'boolean',
        'arrival_date' => 'date',
        'estimated_birth_date' => 'date',
        'weight' => 'decimal:2',
    ];

    protected $appends = ['age_display', 'photo_url'];

    // ── SCOPES DE NEGÓCIO ────────────────────────────────────────────────────

    /**
     * Scope: Filtra animais que compõem a "Vitrine Ativa" da ONG.
     * Exclui automaticamente os animais já adotados das listagens principais.
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'adopted');
    }

    // ── ACCESSORS (Atributos Dinâmicos para o BFF/React) ─────────────────────

    /**
     * Gera a URL pública da foto usando o disco 'public'.
     */
    protected function photoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->photo_path ? Storage::url($this->photo_path) : null,
        );
    }

    /**
     * Calcula a idade formatada utilizando a sintaxe moderna do Laravel 11.
     */
    protected function ageDisplay(): Attribute
    {
        return Attribute::make(
            get: function () {
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
        );
    }
}