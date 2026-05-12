// localhost

// import { defineConfig } from 'vite';
// import laravel from 'laravel-vite-plugin';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: 'resources/js/app.jsx',
//             refresh: true,
//         }),
//         react(),
//     ],
//     resolve: {
//         alias: {
//             // Permite importar componentes usando '@/Components/...'
//             '@': path.resolve(__dirname, './resources/js'),
//         },
//     },
//     // Removido o server host 0.0.0.0 para evitar conflitos de handshake do Vite
//     // Se estiver usando Docker, adicione novamente apenas se necessário.
// });

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

// Verifica se existe a variável de ambiente do Codespaces
const isCodespaces = process.env.CODESPACE_NAME !== undefined;

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        cors: true,
        // Só injeta as configurações de proxy se estiver no Codespaces
        ...(isCodespaces ? {
            hmr: {
                host: `${process.env.CODESPACE_NAME}-5173.app.github.dev`,
                clientPort: 443,
                protocol: 'wss',
            }
        } : {}), 
    },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
});