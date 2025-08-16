import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable source maps for development
  productionBrowserSourceMaps: false,
  
  // SCSS configuration with source maps
  sassOptions: {
    includePaths: ['./src/styles'],
    sourceMap: true,
    sourceMapContents: true,
    outputStyle: 'expanded',
  },
  
  // 하이드레이션 오류 방지를 위한 설정
  reactStrictMode: false,
  
  // 컴파일러 설정
  compiler: {
    // 개발 모드에서 하이드레이션 경고 숨기기
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
