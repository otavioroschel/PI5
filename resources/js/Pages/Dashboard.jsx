import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-900">Lorem Ipsum</h1>
                {/* Adicione widgets/cards aqui conforme necessário */}
            </div>
        </AuthenticatedLayout>
    );
}
