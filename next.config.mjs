/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project (a stray lockfile in the home dir
  // otherwise gets mis-detected as the workspace root).
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
