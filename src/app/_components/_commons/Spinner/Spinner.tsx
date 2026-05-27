import styles from "./Spinner.module.scss";

export default function Spinner() {
  return (
    <div className={styles.spinnerBackdrop}>
      <div className={styles.spinner} />
    </div>
  );
}
