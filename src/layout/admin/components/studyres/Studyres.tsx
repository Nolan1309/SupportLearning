import React, { useState, useEffect } from "react";
import {
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Snackbar,
  TablePagination,
  Paper,
  Divider,
} from "@material-ui/core";
import { ToggleOff, ToggleOn } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_GETALL_RESULT,
  ADMIN_GET_COURSE_OF_ACCOUNT,
  ADMIN_UNSTATUS_COURSE,
  ADMIN_STATUS_COURSE,
} from "../../../../api/api";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import styles from "./studyres.module.scss";
import classNames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// type Course = {
//   id: number;
//   courseTitle: string;
//   duration: string;
//   price: number;
//   status: boolean;
//   deleted: boolean;
//   categoryName: string;
// };
interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  courseOutput: string;
  language: string;
  author: string;
  duration: string;
  cost: number; // BigDecimal được biểu diễn dưới dạng number
  price: number; // BigDecimal được biểu diễn dưới dạng number
  createdAt: string; // LocalDateTime được biểu diễn dưới dạng chuỗi ISO
  updatedAt: string; // LocalDateTime được biểu diễn dưới dạng chuỗi ISO
  status: boolean; // Có thể null (nullable)
  type: string;
  deletedDate: string | null; // Có thể null
  isDeleted: boolean;
  categoryName: string | null; // Có thể null
  categoryId: number | null; // Có thể null
  accountId: number | null; // Có thể null
  teacherName?: string;
}
const Studyres: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const navigate = useNavigate();
  const refresh = useRefreshToken();

  // Lấy role và accountId từ authData
  const getAuthData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        return JSON.parse(authData);
      } catch (error) {
        console.error("Error parsing authData:", error);
        return null;
      }
    }
    return null;
  };

  const fetchCourses = async () => {
    const authData = getAuthData();

    const { id: accountId, roleId } = authData;

    if (!roleId) {
      alert("Không thể xác định quyền truy cập. Vui lòng đăng nhập lại.");
      navigate("/dang-nhap");
      return;
    }

    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    const apiEndpoint =
      roleId === 1
        ? `${ADMIN_GETALL_RESULT}?page=${page}&size=${rowsPerPage}`
        : roleId === 3
        ? `${ADMIN_GET_COURSE_OF_ACCOUNT}/${accountId}?page=${page}&size=${rowsPerPage}`
        : null;

    if (!apiEndpoint) {
      alert("Không xác định được API phù hợp cho vai trò của bạn.");
      return;
    }

    fetch(apiEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // const fetchedCourses: Course[] = data.content.map((course: any) => ({
        //   id: course.id,
        //   courseTitle: course.courseTitle,
        //   duration: course.duration,
        //   price: course.price,
        //   status: course.status,
        //   deleted: course.deleted,
        //   categoryName: course.categoryName,
        // }));

        setCourses(data.content);
        setTotalElements(data.totalElements);
      })
      .catch((error) => console.error("Error fetching courses:", error));
  };

  useEffect(() => {
    fetchCourses();
  }, [page, rowsPerPage, navigate]);

  const handleSort = () => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);

    const sortedCourses = [...courses].sort((a, b) => {
      if (a.title < b.title)
        return newSortDirection === "asc" ? -1 : 1;
      if (a.title > b.title)
        return newSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setCourses(sortedCourses);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCourseClick = (courseId: number) => {
    // Điều hướng đến trang chi tiết của khóa học
    navigate(`/admin/hoc-tap/chi-tiet-hoc-vien/${courseId}`);
  };
  const handleStatusToggle = async (
    courseId: number,
    currentStatus: boolean
  ) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    // Tạo URL động cho API, thay thế {id} bằng courseId
    const url = `${
      currentStatus ? ADMIN_UNSTATUS_COURSE : ADMIN_STATUS_COURSE
    }/${courseId}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to change course status");
      }

      // setSnackbarMessage("");
      toast.success("Trạng thái khóa học đã được cập nhật.");
      fetchCourses(); // Lấy lại danh sách khóa học sau khi cập nhật
    } catch (error) {
      //   console.error("Failed to update course status:", error);
      //   setSnackbarMessage(".");
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái khóa học.");
    }
  };

  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>
          Danh Sách Kết Quả Học Tập Theo Khóa Học
        </h2>
        <div className={styles.headContainer}>
          <TextField
            className={styles.searchField}
            label="Tìm kiếm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
          />
        </div>
        <Divider style={{ marginBottom: "20px" }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={styles.headerCell}>ID</TableCell>
                <TableCell
                  className={styles.headerCell}
                  onClick={handleSort}
                  style={{ cursor: "pointer" }}
                >
                  Tên khóa học {sortDirection === "asc" ? "↑" : "↓"}
                </TableCell>
                <TableCell className={styles.headerCell}>Thời lượng</TableCell>
                <TableCell className={styles.headerCell}>Danh mục</TableCell>
                <TableCell className={styles.headerCell}>Giá</TableCell>
                {/* <TableCell>Trạng thái</TableCell> */}
                {/* <TableCell>Hành động</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {courses
                .filter((c) =>
                  c.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleCourseClick(course.id)}>
                        {course.title}
                      </Button>
                    </TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>{course.categoryName}</TableCell>
                    <TableCell>
                      {course.price.toLocaleString("vi-VN")} VND
                    </TableCell>
                    {/* <TableCell>
                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: course.status ? "green" : "red",
                        color: "white",
                      }}
                      onClick={() => handleStatusToggle(course.id, course.status)}
                    >
                      {course.status ? "Kích hoạt" : "Không kích hoạt"}
                    </Button>
                  </TableCell> */}
                    {/* <TableCell>
                    {course.deleted ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => alert(`Khôi phục khóa học ID ${course.id}`)}
                      >
                        <ToggleOff />
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => alert(`Ẩn khóa học ID ${course.id}`)}
                      >
                        <ToggleOn />
                      </Button>
                    )}
                  </TableCell> */}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={Boolean(snackbarMessage)}
          autoHideDuration={6000}
          onClose={() => setSnackbarMessage("")}
          message={snackbarMessage}
        />
      </div>
    </Paper>
  );
};

export default Studyres;
