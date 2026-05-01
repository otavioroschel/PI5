<?php

namespace App\Models;

use App\Models\Traits\BelongsToOng;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Animal extends Model
{
    use HasFactory, SoftDeletes, BelongsToOng;

    // 1. Configura o UUID como chave primária
    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

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

    // 4. Atributos Dinâmicos (Accessors)
    // Isso cria um campo virtual "age" que o React vai amar
    protected $appends = ['age_display'];

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