import { Head, Link } from '@inertiajs/react';

export default function Home({ slug }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Head title="Página Inicial da ONG" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bem-vindo à nossa ONG!</h1>
            
            <Link 
                href={route('vitrine.adote', { slug: slug })} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Ver Animais para Adoção
            </Link>
        </div>
    );
}