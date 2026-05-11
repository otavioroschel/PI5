<?php

namespace App\Http\Controllers\Vitrine;

use App\Http\Controllers\Controller;
use App\Models\Animal;

class VitrineController extends Controller
{
    // 1. Rota da Home (Ex: /gatomestre)
    public function home($slug)
    {
        return inertia('Vitrine/Home', [
            'slug' => $slug
        ]);
    }

    // 2. Rota de Adoção (Ex: /gatomestre/adote)
    public function adote($slug)
    {
        $ongId = app('tenant_id');

        // 🚨 ÁREA DE DEBUG: Se a página carregar sem animais, remova os comentários 
        // (/* e */) das linhas abaixo, recarregue a página e me mande o resultado!
        
        /*
        $todosAnimais = Animal::where('ong_id', $ongId)->get();
        dd([
            'ONG_ID_RESOLVIDO' => $ongId,
            'SLUG' => $slug,
            'TOTAL_DE_ANIMAIS_NO_BANCO' => $todosAnimais->count(),
            'DADOS_CRUS' => $todosAnimais->toArray()
        ]);
        */

        // Busca apenas os animais disponíveis
        $pets = Animal::where('ong_id', $ongId)
               ->where('status', 'available')
               ->latest()
               ->get(); 

        return inertia('Vitrine/Adote', [
            'pets' => $pets,
            'slug' => $slug
        ]);
    }
}