<?php

namespace App\Models;

use App\Models\Traits\BelongsToOng;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Adoption extends Model
{
    use HasFactory, HasUuids, BelongsToOng;

    protected $fillable = [
        'ong_id',
        'animal_id',
        'adopter_id',
        'adoption_date',
        'returned_at',    // 🛡️ LIBERADO PARA GRAVAÇÃO
        'return_reason'   // 🛡️ LIBERADO PARA GRAVAÇÃO
    ];

    protected $casts = [
        'adoption_date' => 'date',
    ];

    // Relacionamentos blindados
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function adopter(): BelongsTo
    {
        return $this->belongsTo(Adopter::class);
    }
}