"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import styles from "./MatchPreview.module.scss";

type State = "idle" | "loading" | "streaming" | "done" | "error" | "hidden";

interface Props {
  matchId: number;
}

export default function MatchPreview({ matchId }: Props) {
  const [state, setState] = useState<State>("idle");
  const [text, setText] = useState("");

  // 목록에서 자동으로 부르지 않는다. 사용자가 열었을 때만 생성 요청이 나간다.
  const loadPreview = async () => {
    setState("loading");
    setText("");

    try {
      const res = await fetch("/api/ai/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });

      // 204 는 서버에 API 키가 없어 기능 자체가 꺼진 상태다. 이때만 조용히 사라진다.
      if (res.status === 204) {
        setState("hidden");
        return;
      }

      if (!res.ok || !res.body) {
        setState("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let received = "";
      setState("streaming");

      for (;;) {
        const { done, value } = await reader.read();

        if (value) {
          received += decoder.decode(value, { stream: true });
          setText(received);
        }

        if (done) break;
      }

      // 생성 도중 실패하면 서버가 빈 응답으로 스트림을 닫는다. 실패로 취급한다.
      setState(received.trim().length > 0 ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "hidden") return null;

  if (state === "idle") {
    return (
      <button
        type="button"
        className={styles.trigger}
        onClick={loadPreview}
        aria-label="AI 매치 프리뷰 보기"
      >
        <Sparkles size={14} />
        AI 프리뷰 보기
      </button>
    );
  }

  return (
    <section className={styles.matchPreview} aria-live="polite">
      <header>
        <Sparkles size={14} />
        <span>AI 생성 내용</span>
      </header>

      {state === "loading" && (
        <div className={styles.skeleton}>
          <span />
          <span />
          <span />
        </div>
      )}

      {state === "error" && (
        <div className={styles.error}>
          <p>프리뷰를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.</p>
          <button type="button" onClick={loadPreview}>
            다시 시도
          </button>
        </div>
      )}

      {(state === "streaming" || state === "done") && <p>{text}</p>}
    </section>
  );
}
