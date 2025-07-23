/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        forceSwcTransforms: true,
    },
    images: {
        domains: ['localhost', 'example.com', 'your-domain.com', 'images.unsplash.com'],
        formats: ['image/avif', 'image/webp'],
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: 'asset/resource',
        });
        return config;
    },
}

module.exports = nextConfig