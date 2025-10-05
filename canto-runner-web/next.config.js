/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY,
  },
}

module.exports = nextConfig