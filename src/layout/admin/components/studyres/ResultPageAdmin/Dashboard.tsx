import React from "react";
import styles from "./Dashboard.module.css";

interface DashboardProps {
  progress: string; // Phần trăm hoàn thành
  averageScore: string; // Điểm trung bình
  passRate: string; // Tỷ lệ bài kiểm tra đạt
}

const Dashboard: React.FC<DashboardProps> = ({
  progress,
  averageScore,
  passRate,
}) => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.card}>
        <h3>Tiến độ học tập</h3>
        <div className={styles.progressBar}>
          <div
            style={{ width: `${progress}%` }}
            className={styles.progress}
          ></div>
        </div>
        <p>{parseFloat(progress).toFixed(2)}% hoàn thành</p>

      </div>
      <div className={styles.card}>
        <h3>Điểm trung bình</h3>
        <p>{parseFloat(averageScore).toFixed(2)}/10</p>
      </div>
      <div className={styles.card}>
        <h3>Tỷ lệ bài kiểm tra đạt</h3>
        <p>{parseFloat(passRate).toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default Dashboard;
