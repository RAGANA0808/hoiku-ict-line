import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@hoiku/db', '@hoiku/lib', '@hoiku/line', '@hoiku/ui'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

export default config;
