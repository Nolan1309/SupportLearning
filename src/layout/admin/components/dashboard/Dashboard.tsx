import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  Button,
  MenuItem,
} from "@material-ui/core";
import { Description, School, QuestionAnswer, Group } from "@material-ui/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import "./dashboard.scss";
import RequireAdmin from "../../../DOM/RequireAdmin";
import { ADMIN_GET_CATEGORY_COURSE } from "../../../../api/api";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
interface CourseReport {
  courseName: string; // Tên khóa học
  students: number; // Số lượng học viên
  revenue: number; // Doanh thu
  status: boolean; // Trạng thái khóa học
  authorName: string; // Tên tác giả
}

type MonthlySalesData = {
  paymentYear?: number;
  paymentMonth?: number;
  month: string;
  revenue: number;
};

interface DashboardReport {
  totalRevenueToday: number; // Tổng doanh thu hôm nay
  totalDocuments: number; // Tổng số tài liệu
  totalCourses: number; // Tổng số khóa học
  totalQuestions: number; // Tổng số câu hỏi
  totalUsers: number; // Tổng số người dùng
  totalTeachers: number; // Tổng số giáo viên
}
const Dashboard: React.FC = () => {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const createDefaultMonthlyData = (): MonthlySalesData[] => {
    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    return months.map((month) => ({ month, revenue: 0 }));
  };

  const refresh = useRefreshToken();
  const navigate = useNavigate();

  // const [filteredData, setFilteredData] = useState(revenueData);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [courseReport, setCourseReport] = useState<CourseReport[]>([]);
  const fetchReport = async () => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchStats = async (year: number) => {
    let token = localStorage.getItem("authToken");

    // Kiểm tra token hết hạn
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token); // Lưu token mới
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/monthly-sales?year=${year}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Lỗi khi gọi API: ${response.statusText}`);
      }
      const data: [number, number, string, number][] = await response.json();

      console.log(data);
      // Tạo dữ liệu mặc định 12 tháng
      const defaultData = createDefaultMonthlyData();
      console.log(defaultData);
      data.forEach(([year, month, monthLabel, revenue]) => {
        const index = defaultData.findIndex((m) => m.month === monthLabel);
        if (index !== -1) {
          defaultData[index].revenue = revenue; // Gán giá trị doanh thu
        }
      });

      // Cập nhật vào state
      setMonthlySales(defaultData);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };
  const fetchCourseReport = async () => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        "${process.env.REACT_APP_SERVER_HOST}/api/courses/report-admin",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi khi gọi API: ${response.statusText}`);
      }

      const data = await response.json();
      setCourseReport(data);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      throw error;
    }
  };
  useEffect(() => {
    fetchReport();
    fetchStats(new Date().getFullYear());
    fetchCourseReport();
    // console.log(monthlySales);
  }, []);

  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const year = event.target.value as number;
    setSelectedYear(year);
    fetchStats(year);
  };
  const handleExport = async () => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      // Gửi yêu cầu GET đến API để xuất báo cáo
      const response = await axios.get(
        "${process.env.REACT_APP_SERVER_HOST}/api/report/export-revenue-report",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Tạo URL để tải file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "doanh_thu_bao_cao.xlsx";
      link.click(); // Bắt đầu tải file

      // Hủy URL sau khi tải xong
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Có lỗi khi xuất báo cáo");
    }
  };
  const handleDownload = async () => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}/api/report/export-year?year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Để tải file binary
        }
      );

      // Tạo URL cho file Excel
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "doanh_thu_theo_thang.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Lỗi khi tải file Excel:", error);
    }
  };
  return (
    <div className="dashboard-container">
      <Typography variant="h4" className="dashboard-title">
        Thống kê báo cáo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <div className="card-content">
                <Description className="card-icon" />
                <div className="card-info">
                  <Typography variant="h6">Doanh thu hôm nay</Typography>
                  <Typography variant="h4">
                    {report?.totalRevenueToday}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <div className="card-content">
                <Description className="card-icon" />
                <div className="card-info">
                  <Typography variant="h6">Tài Liệu</Typography>
                  <Typography variant="h4">{report?.totalDocuments}</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <div className="card-content">
                <School className="card-icon" />
                <div className="card-info">
                  <Typography variant="h6">Khóa Học</Typography>
                  <Typography variant="h4">{report?.totalCourses}</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <div className="card-content">
                <QuestionAnswer className="card-icon" />
                <div className="card-info">
                  <Typography variant="h6">Câu Hỏi</Typography>
                  <Typography variant="h4">{report?.totalQuestions}</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <div className="card-content">
                <Group className="card-icon" />
                <div className="card-info">
                  <Typography variant="h6">Thành Viên</Typography>
                  <Typography variant="h4">{report?.totalUsers}</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <div className="card-content">
                <Group className="card-icon" />
                <div className="card-info">
                  <Typography variant="h6">Giáo viên</Typography>
                  <Typography variant="h4">{report?.totalTeachers}</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          style={{
            textAlign: "right",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" style={{ marginRight: "20px" }}>
            Chọn Năm
          </Typography>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            <MenuItem value={2022}>2022</MenuItem>
            <MenuItem value={2023}>2023</MenuItem>
            <MenuItem value={2024}>2024</MenuItem>
          </Select>
        </Grid>

        <Grid item xs={12} style={{ margin: "auto" }}>
          <Typography variant="h6" style={{ textAlign: "center" }}>
            Doanh Thu Theo Năm {selectedYear}</Typography>
          <BarChart
            width={1000}
            height={500}
            data={monthlySales}
            style={{ margin: "auto" }}
            margin={{ top: 20, right: 20, left: 20, bottom: 5 }}

          // barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" interval={0} tickMargin={10} />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="revenue" fill="#8884d8" />
          </BarChart>
        </Grid>

        <div
          className="revenue-report"
          style={{ margin: "auto", width: "100%" }}
        >
          <h2 className="revenue-report-title">
            Doanh thu các khóa học
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "white"
            }}
          >
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                className="white-btn"
                onClick={handleExport}
                style={{
                  marginLeft: "20px",
                  color: "white",
                  padding: "10px 20px",
                  fontSize: "16px",
                  marginBottom: "20px",
                }}
              >
                Xuất Báo Cáo Khóa Học
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                className="white-btn"
                onClick={handleDownload}
                style={{
                  marginLeft: "20px",
                  color: "white",
                  padding: "10px 20px",
                  fontSize: "16px",
                  marginBottom: "20px",
                }}
              >
                Xuất Báo Cáo Năm
              </Button>
            </Grid>
          </div>

          <table className="revenue-report-table">
            <thead className="revenue-report-thead">
              <tr>
                <th className="revenue-report-th">Tên khóa</th>
                <th className="revenue-report-th">Lượng học viên</th>
                <th className="revenue-report-th">Doanh thu</th>
                <th className="revenue-report-th">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="revenue-report-tbody">
              {courseReport.map((course, index) => (
                <tr key={index} className="revenue-report-tr">
                  <td>{course.courseName || "Không xác định"}</td>
                  <td>{course.students ?? 0}</td>
                  <td>
                    {(course.revenue ?? 0).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                  <td>
                    {course.status ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Grid>
    </div>
  );
};

const DashboardAdmin = RequireAdmin(Dashboard);

export default DashboardAdmin;
