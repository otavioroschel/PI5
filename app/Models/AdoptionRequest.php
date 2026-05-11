<?php

// app/Models/AdoptionRequest.php

namespace App\Models;

use App\Scopes\TenantScope; // Assumindo que você já tem esse Scope criado
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids; // Segurança contra iteração de IDs

class AdoptionRequest extends Model
{
    use HasFactory, HasUuids;

    // Proteção Mass Assignment
    protected $fillable = [
        'ong_id',
        'animal_id',
        'adopter_name',
        'adopter_email',
        'adopter_phone',
        'status',
    ];

    /**
     * O "booted" method é onde aplicamos a trava de segurança Multi-tenant.
     * Toda query neste model terá automaticamente um "WHERE ong_id = ?"
     */
    protected static function booted()
    {
        static::addGlobalScope(new TenantScope);
    }

    // --- Relacionamentos ---

    public function ong()
    {
        return $this->belongsTo(Ong::class);
    }

    public function animal()
    {
        return $this->belongsTo(Animal::class);
    }
}