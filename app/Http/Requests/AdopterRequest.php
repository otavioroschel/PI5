<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdopterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'cpf' => preg_replace('/[^0-9]/', '', $this->cpf),
            'phone' => preg_replace('/[^0-9]/', '', $this->phone),
            'zip_code' => preg_replace('/[^0-9]/', '', $this->zip_code),
        ]);
    }

    public function rules(): array
    {
        $ongId = $this->user()->ong_id;

        return [
            'name' => ['required', 'string', 'max:100'],
            'cpf' => [
                'required',
                'string',
                'size:11',
                Rule::unique('adopters', 'cpf')
                    ->where('ong_id', $ongId)
                    ->ignore($this->route('adopter')), // ignora o próprio registro na edição
            ],
            'phone' => ['required', 'string', 'max:15'],
            'email' => ['nullable', 'email', 'max:100'],
            'zip_code' => ['required', 'string', 'size:8'],
            'street' => ['required', 'string', 'max:100'],
            'number' => ['required', 'string', 'max:10'],
            'neighborhood' => ['required', 'string', 'max:50'],
            'city' => ['required', 'string', 'max:50'],
            'state' => ['required', 'string', 'size:2'],
        ];
    }

    public function messages(): array
    {
        return [
            'cpf.unique' => 'Este CPF já está cadastrado em nossa ONG.',
        ];
    }
}
