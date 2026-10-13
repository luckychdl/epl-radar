import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
    ],
  },
  // 분당 10회 예산을 지키는지 확인하려면 실제 외부 호출과 캐시 적중을 구분해야 한다.
  // next dev 로그에 fetch 별 cache hit / skip 이 표시된다.
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
