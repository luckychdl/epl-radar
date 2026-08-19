import styles from "./ErrorNotice.module.scss";

interface Props {
  title?: string;
  description?: string;
}

/** 외부 API 실패(요청 제한 등)로 데이터를 못 받았을 때 보여주는 안내 영역 */
export default function ErrorNotice({
  title = "데이터를 불러오지 못했습니다.",
  description = "일시적인 오류로 데이터를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.",
}: Props) {
  return (
    <div className={styles.errorNotice}>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
