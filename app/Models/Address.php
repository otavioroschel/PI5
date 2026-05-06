<?php

namespace App\Models;

use App\Models\Traits\BelongsToOng;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory, BelongsToOng, HasUuids;

    protected $fillable = [
        'ong_id', 'zip_code', 'street', 'number', 
        'neighborhood', 'city', 'state'
    ];

    public function addressable()
    {
        return $this->morphTo();
    }
}