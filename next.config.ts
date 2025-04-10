
const nextConfig = {
  images: {
    domains: [
      'jsdevs-attachments.sgp1.digitaloceanspaces.com',
      // Add any other domains you might need for images
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // This will allow all domains, but you should restrict it in production
      },
    ],
  },
  experimental: {
    serverActions: true,
  }
};

module.exports = nextConfig;
