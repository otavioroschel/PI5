<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait BelongsToOng
{
    /**
     * Boot the trait.
     */
    protected static function bootBelongsToOng(): void
    {
        static::addGlobalScope('ong_id', function (Builder $builder) {
            $table = $builder->getQuery()->from;

            // 1. Contexto SaaS (Painel Privado): Usuário autenticado
            if (Auth::hasUser() && Auth::user()->ong_id) {
                $builder->where($table . '.ong_id', Auth::user()->ong_id);
            } 
            // 2. Contexto Public/Landing Page: Tenant resolvido via Middleware
            elseif (app()->bound('currentTenant')) {
                $builder->where($table . '.ong_id', app('currentTenant')->id);
            } 
            // 3. Fail-Secure (Bloqueio de Vazamento)
            else {
                // Permite queries irrestritas apenas no console (ex: artisan migrate/seed)
                if (!app()->runningInConsole()) {
                    $builder->whereRaw('1 = 0'); 
                }
            }
        });

        // Evento 'creating' para auto-preencher o ong_id no banco
        // Previne que o dev esqueça de passar o ID da ONG ao salvar um Model
        static::creating(function (Model $model) {
            if (empty($model->ong_id)) {
                if (Auth::hasUser() && Auth::user()->ong_id) {
                    $model->ong_id = Auth::user()->ong_id;
                } elseif (app()->bound('currentTenant')) {
                    $model->ong_id = app('currentTenant')->id;
                } else {
                    // Se tentar criar um registro isolado sem contexto, lança exceção
                    throw new \Exception("Tentativa de criar registro em {$model->getTable()} sem contexto de ONG (Tenant Isolado).");
                }
            }
        });
    }

    /**
     * Relacionamento padrão com a tabela de ONGs.
     */
    public function ong()
    {
        return $this->belongsTo(\App\Models\Ong::class, 'ong_id');
    }
}