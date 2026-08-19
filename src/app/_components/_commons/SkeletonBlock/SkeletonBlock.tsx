import styles from "./SkeletonBlock.module.scss";

interface Props {
  count?: number;
  height?: number;
  radius?: number;
}

/** 스켈레톤 기본 조각. 페이지별 스켈레톤은 이걸 조합하거나 자체 골격을 만든다. */
export default function SkeletonBlock({
  count = 1,
  height = 48,
  radius = 12,
}: Props) {
  return (
    <div className={styles.skeletonGroup}>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={styles.skeletonBlock}
          style={{ height, borderRadius: radius }}
        />
      ))}
    </div>
  );
}
