/** @type {import('next').NextConfig} */
const { S3_BUCKET_NAME, S3_DEFAULT_REGION } = process.env;

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [`${S3_BUCKET_NAME}.s3.${S3_DEFAULT_REGION}.amazonaws.com`],
  },
};

export default nextConfig;
