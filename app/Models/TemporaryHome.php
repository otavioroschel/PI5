<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; // 👈 O import que faltava
use Illuminate\Database\Eloquent\Concerns\HasUuids;    // 👈 O import que faltava pro UUID

class TemporaryHome extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['ong_id', 'name', 'phone', 'max_capacity', 'notes'];

    // 🛡️ Relacionamento Polimórfico com Endereço
    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    // 🛡️ Um Lar Temporário tem vários Animais
    public function animals()
    {
        return $this->hasMany(Animal::class);
    }
}