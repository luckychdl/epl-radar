import axios from "axios";
import { FOOTBALL_PROXY_BASE_URL } from "@/app/_constants/football";

/** 클라이언트에서는 API 키를 노출하지 않도록 라우트 핸들러 프록시를 경유한다. */
const footballInstance = axios.create({
  baseURL: FOOTBALL_PROXY_BASE_URL,
  timeout: 10_000,
});

export default footballInstance;
