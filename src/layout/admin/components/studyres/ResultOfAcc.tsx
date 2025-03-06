// ResultOfAcc.tsx
import React, { useEffect, useState } from "react";
import Filter from "./ResultPageAdmin/Filter";
import Dashboard from "./ResultPageAdmin/Dashboard";
import TestList from "./ResultPageAdmin/TestList";
import Chart from "./ResultPageAdmin/Chart";
import CustomPieChart from "./ResultPageAdmin/CustomPieChart";
import "./ResultPageAdmin/ResultPage.module.css"; // Giữ nguyên file CSS của bạn
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import { useParams } from "react-router-dom"; // Để lấy id từ URL
import { Paper } from "@mui/material"; // Sử dụng @mui/material thay vì material-ui
import styles from "./ResultPageAdmin/ResultPage.module.css"; // Import CSS Modules
import { SelectChangeEvent } from "@mui/material"; // Import SelectChangeEvent

export interface TestData {
  id: number;
  title: string;
  score: number;
  status: string;
  date: Date;
}

export interface TestResult {
  status: string;
  countTest: number;
}

export interface CourseData {
  id: number;
  duration: string;
  title: string;
  enrollment_date: string;
}

const ResultPage: React.FC = () => {
  const itemsPerPage = 5; // Số lượng bài kiểm tra hiển thị mỗi trang
  const [currentPage, setCurrentPage] = useState(1); // Bắt đầu từ trang 1
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState<string>("0");
  const [averageScore, setAverageScore] = useState<string>("0");
  const [passRate, setPassRate] = useState<string>("0");
  const [tests, setTests] = useState<TestData[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const refresh = useRefreshToken();

  // Sử dụng useParams để lấy id từ URL
  const { id: userId } = useParams<{ id: string }>(); // id lấy từ URL

  const fetchCourses = async () => {
    setLoading(true);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/accountADMIN/enrolled/${userId}?page=0&size=100`, // Dùng userId từ URL
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setCourses(data.content || []);
    } catch (error) {
      console.error("Error fetching test results:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    if (!selectedCourseId) return;

    setLoading(true);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      // Fetch từng API song song
      const [progressRes, avgScoreRes, passRateRes, testsRes, testResultsRes] =
        await Promise.all([
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/progress/calculateADMIN?accountId=${userId}&courseId=${selectedCourseId}`, // Dùng userId từ URL
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/test-results/average-scoreADMIN?accountId=${userId}&courseId=${selectedCourseId}`, // Dùng userId từ URL
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/test-results/pass-rateADMIN?accountId=${userId}&courseId=${selectedCourseId}`, // Dùng userId từ URL
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/test-results/result/detailADMIN?accountId=${userId}&courseId=${selectedCourseId}`, // Dùng userId từ URL
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/test-results/result-countADMIN?accountId=${userId}&courseId=${selectedCourseId}`, // Dùng userId từ URL
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      // Xử lý response
      if (progressRes.ok) setProgress(await progressRes.text());
      if (avgScoreRes.ok) setAverageScore(await avgScoreRes.text());
      if (passRateRes.ok) setPassRate(await passRateRes.text());
      if (testsRes.ok) {
        const data = await testsRes.json();
        setTests(
          data.map((test: any) => ({
            id: test[0],
            title: test[1],
            score: test[2],
            status: test[3],
            date: new Date(test[4]),
          }))
        );
      }
      if (testResultsRes.ok) {
        const data = await testResultsRes.json();
        setTestResults(
          data.map((result: any) => ({
            status: result[0],
            countTest: result[1],
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      setSelectedCourseId(courses[0].id.toString());
    }
  }, [courses]);

  useEffect(() => {
    fetchAllData();
  }, [selectedCourseId, userId]); // Lắng nghe userId

  const totalPages = Math.ceil(tests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTests = tests.slice(startIndex, startIndex + itemsPerPage);

  const handleCourseSelect = (event: SelectChangeEvent<string>) => {
    setSelectedCourseId(event.target.value);
    setCurrentPage(1); // Reset về trang đầu khi chọn khóa học mới
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const chartData = paginatedTests.map((test) => ({
    name: test.title,
    score: test.score,
  }));
  const pieData = testResults.map((item) => ({
    name: item.status,
    value: item.countTest,
  }));

  return (
    <Paper elevation={3} sx={{ padding: 4, margin: 4 }}>
      <div className={styles["result-page"]}>
        <a href={`/admin/hoc-tap/chi-tiet-hoc-vien/${selectedCourseId}`} className="btn btn-primary white-btn" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "150px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-arrow-bar-left"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"
            />
          </svg>
          <span>Quay lại</span>
        </a>
        <Dashboard
          progress={progress}
          averageScore={averageScore}
          passRate={passRate}
        />
        <TestList tests={paginatedTests} />

        <div className={`row ${styles.row}`}>
          <div className={`col-md-8 ${styles.colMd8}`}>
            <div className={styles["chart-container"]}>
              <Chart data={chartData} />
            </div>

            <div className={`pegi justify-content-center ${styles["mt-60"]}`}>
              <a
                href="#0"
                onClick={() => handlePageChange(currentPage - 1)}
                className={`border-none ${currentPage === 0 ? "disabled" : ""}`}
              >
                <i className="fa-regular fa-arrow-left primary-color transition"></i>
              </a>
              {[...Array(totalPages)].map((_, index) => (
                <a
                  key={index}
                  href="#0"
                  onClick={() => handlePageChange(index)}
                  className={index === currentPage ? "active" : ""}
                >
                  {index + 1}
                </a>
              ))}
              <a
                href="#0"
                onClick={() => handlePageChange(currentPage + 1)}
                className={`border-none ${currentPage === totalPages - 1 ? "disabled" : ""
                  }`}
              >
                <i className="fa-regular fa-arrow-right primary-color transition"></i>
              </a>
            </div>
          </div>

          <div className={`col-md-4 ${styles.colMd4}`}>
            <CustomPieChart data={pieData} />
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default ResultPage;
