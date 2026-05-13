<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdoptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // A rota é pública
    }

    public function rules(): array
    {
        return [
            // Valida se o ID existe e é um UUID válido, prevenindo SQL Injection/Enumeração
            'animal_id'     => ['required', 'uuid', 'exists:animals,id'], 
            'adopter_name'  => ['required', 'string', 'max:255', 'strip_tags'], // strip_tags customizado ou regex para evitar XSS
            'adopter_email' => ['required', 'email', 'max:255'],
            'adopter_phone' => ['required', 'string', 'max:20', 'regex:/^[0-9\-\+\(\)\s]+$/'],
        ];
    }
}