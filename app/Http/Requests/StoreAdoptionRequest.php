<?php

namespace App\Http\Requests\Vitrine;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreAdoptionLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // A rota é pública
    }

    public function rules(): array
    {
        return [
            // strip_tags previne injeção de scripts (XSS)
            'adopter_name'  => ['required', 'string', 'max:100'],
            // rfc,dns verifica se o formato é válido e se o domínio realmente existe
            'adopter_email' => ['required', 'email:rfc,dns', 'max:150'],
            // Regex básico para telefone/WhatsApp BR
            'adopter_phone' => ['required', 'string', 'regex:/^\+?[1-9]\d{1,14}$/'],
        ];
    }

    protected function prepareForValidation()
    {
        // Sanitização proativa antes da validação
        $this->merge([
            'adopter_name' => strip_tags($this->adopter_name),
            'adopter_phone' => preg_replace('/[^0-9+]/', '', $this->adopter_phone),
        ]);
    }
}