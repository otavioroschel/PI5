<?php

namespace App\Observers;

use App\Models\Animal;

class AnimalObserver
{
    /**
     * Handle the Animal "updated" event.
     */
    public function updated(Animal $animal): void
    {
        // 1. Verifica se a coluna 'status' sofreu mutação NESTA transação do banco
        // 2. Garante que a mutação foi exatamente para o status 'adopted'
        if ($animal->wasChanged('status') && $animal->status === 'adopted') {
            
            // 🛡️ Integridade de Regra de Negócio:
            // Acessamos o relacionamento (que já possui o tenant isolado)
            // e aplicamos um update em massa (Bulk Update) apenas nos leads não finalizados.
            // Isso evita N+1 queries caso o animal tenha dezenas de interessados.
            $animal->adoptionRequests()
                ->whereIn('status', ['pending', 'in_analysis'])
                ->update(['status' => 'rejected']);
        }
    }
}