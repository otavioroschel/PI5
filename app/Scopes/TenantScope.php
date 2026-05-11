<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class TenantScope implements Scope
{
    /**
     * Aplica a trava do ong_id em TODAS as queries do Model.
     */
    public function apply(Builder $builder, Model $model)
    {
        // 1. Se estiver na Vitrine Pública (O middleware injetou o tenant_id)
        if (app()->bound('tenant_id')) {
            $builder->where($model->getTable() . '.ong_id', app('tenant_id'));
        } 
        // 2. Se estiver no Painel da ONG (O usuário está logado)
        elseif (Auth::check() && Auth::user()->ong_id) {
            $builder->where($model->getTable() . '.ong_id', Auth::user()->ong_id);
        }
        
        // Se não for nenhum dos dois (ex: rodando no console sem contexto), 
        // a query roda solta, o que é útil para testes ou comandos artisan.
    }
}