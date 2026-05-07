<?php

namespace App\Http\Controllers;

use App\Models\Adopter;
use App\Http\Requests\AdopterRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Exception;

class AdopterController extends Controller
{
    // Retorna a página (Inertia) com os adotantes da ONG
    public function index()
{
    // Buscamos os adotantes com endereço E com o histórico de adoções + animais
    $adopters = Adopter::with(['address', 'adoptions.animal'])
        ->orderBy('name', 'asc')
        ->paginate(15);

    return inertia('Adopters/Index', [
        'adopters' => $adopters
    ]);
}

    // Salva o Adotante e o Endereço de forma atômica
    public function store(AdopterRequest $request)
    {
        $validated = $request->validated();
        
        // Garante a integridade Multi-tenant
        $ongId = $request->user()->ong_id;

        try {
            // Inicia a transação: Se o endereço falhar, o adotante NÃO é salvo.
            DB::transaction(function () use ($validated, $ongId) {
                
                // 1. Cria o Adotante (UUID é gerado automaticamente pelo Model)
                $adopter = Adopter::create([
                    'ong_id' => $ongId,
                    'name' => $validated['name'],
                    'cpf' => $validated['cpf'],
                    'phone' => $validated['phone'],
                    'email' => $validated['email'],
                ]);

                // 2. Cria o Endereço Polimórfico vinculado ao Adotante recém-criado
                $adopter->address()->create([
                    'ong_id' => $ongId, // Repassamos a trava de segurança
                    'zip_code' => $validated['zip_code'],
                    'street' => $validated['street'],
                    'number' => $validated['number'],
                    'neighborhood' => $validated['neighborhood'],
                    'city' => $validated['city'],
                    'state' => $validated['state'],
                ]);
            });

            return redirect()->back()->with('success', 'Adotante e endereço cadastrados com segurança!');

        } catch (Exception $e) {
            // Em um ambiente de produção SaaS, deveríamos logar $e->getMessage()
            return redirect()->back()->withErrors(['error' => 'Falha ao processar o cadastro. Tente novamente.']);
        }
    }

    public function update(AdopterRequest $request, Adopter $adopter)
{
    $validated = $request->validated();

    try {
        DB::transaction(function () use ($validated, $adopter) {
            // 1. Atualiza os dados básicos do adotante
            $adopter->update([
                'name'  => $validated['name'],
                'cpf'   => $validated['cpf'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
            ]);

            // 2. Atualiza o endereço (ou cria se não existir por algum motivo)
            // O Laravel cuida de encontrar o endereço polimórfico vinculado
            $adopter->address()->updateOrCreate(
                ['addressable_id' => $adopter->id, 'addressable_type' => Adopter::class],
                [
                    'ong_id'       => $adopter->ong_id,
                    'zip_code'     => $validated['zip_code'],
                    'street'       => $validated['street'],
                    'number'       => $validated['number'],
                    'neighborhood' => $validated['neighborhood'],
                    'city'         => $validated['city'],
                    'state'        => $validated['state'],
                ]
            );
        });

        return redirect()->back()->with('success', 'Cadastro atualizado com sucesso!');

    } catch (\Exception $e) {
        return redirect()->back()->withErrors(['error' => 'Erro ao atualizar: ' . $e->getMessage()]);
    }
}

    public function destroy(Adopter $adopter)
{
    try {
        // O Global Scope (BelongsToOng) garante que o Laravel só encontre o model 
        // se ele pertencer à ONG do usuário logado. Caso contrário, dá 404.
        
        // Iniciamos uma transação apenas por segurança, embora a Migration 
        // com cascadeOnDelete vá apagar o endereço automaticamente.
        DB::transaction(function () use ($adopter) {
            // O endereço polimórfico será apagado pelo Banco de Dados (cascade)
            $adopter->delete();
        });

        return redirect()->back()->with('success', 'Adotante excluído com sucesso!');

    } catch (\Illuminate\Database\QueryException $e) {
        // Verifica se o erro é de violação de chave estrangeira (SQLSTATE 23000)
        // Isso acontece por causa do restrictOnDelete que colocamos na tabela 'adoptions'
        if ($e->getCode() === '23000') {
            return redirect()->back()->withErrors([
                'error' => 'Não é possível excluir este adotante pois ele possui um histórico de adoções vinculado.'
            ]);
        }

        return redirect()->back()->withErrors(['error' => 'Erro ao excluir o registro.']);
    }
}

}