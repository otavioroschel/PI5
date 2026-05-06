<?php

namespace App\Models;

use App\Models\Traits\BelongsToOng;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Adopter extends Model
{
    use HasFactory, BelongsToOng, HasUuids; // Injeção do HasUuids

    protected $fillable = ['ong_id', 'name', 'cpf', 'phone', 'email'];

    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function adoptions()
    {
        return $this->hasMany(Adoption::class);
    }
}