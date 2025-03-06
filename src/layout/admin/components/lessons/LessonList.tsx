import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TextField,
  TablePagination,
  Paper,
  Divider,
} from "@material-ui/core";
import { Edit, Delete, Add } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_GET_LESSONS,
  ADMIN_PUT_ACTIVE_LESSON,
  ADMIN_PUT_DELETE_LESSON,
} from "../../../../api/api"; // Đảm bảo đường dẫn API chính xác
import RequireAdmin from "../../../DOM/RequireAdmin";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import styles from './lessonList.module.scss'
import classNames from 'classnames';
interface Lesson {
  id: number;
  lessonTitle: string; // Tên bài học
  courseName: string | null; // Tên khóa học, có thể là null
  chapterName: string | null; // Tên chương, có thể là null
  deleted: boolean;
}
const LessonList: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(10); // Số bản ghi mỗi trang
  const [totalElements, setTotalElements] = useState(0); // Tổng số bản ghi
  const [originalLessons, setOriginalLessons] = useState<Lesson[]>([]);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  useEffect(() => {
    fetchLessons(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Hàm lấy dữ liệu bài học từ API
  const fetchLessons = async (currentPage: number, pageSize: number) => {
    let token = localStorage.getItem("authToken");

    // Xử lý refresh token nếu token hết hạn
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      // Gọi API
      const response = await fetch(
        `${ADMIN_GET_LESSONS}?page=${currentPage}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm header Authorization
          },
        }
      );

      // Kiểm tra trạng thái phản hồi
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Xử lý dữ liệu từ API
      const data = await response.json();
      setOriginalLessons(data.content);
      setLessons(data.content); // Lấy danh sách bài học từ `content`
      setTotalElements(data.totalElements); // Cập nhật tổng số phần tử
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
  }
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term.trim()) {
      // Nếu term rỗng, quay lại dữ liệu gốc
      setLessons(originalLessons);
    } else {
      const filtered = originalLessons.filter((lesson) =>
        lesson.lessonTitle.toLowerCase().includes(term)
      );
      setLessons(filtered);
    }
  };


  const handleDeleteLesson = async (id: number) => {
    const token = localStorage.getItem("authToken"); // Lấy token từ localStorage
    if (window.confirm("Bạn có chắc muốn xóa bài học này?")) {
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

        await fetch(`${ADMIN_GET_LESSONS}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Failed to delete lesson:", error);
      }
    }
  };

  const handleViewLessonDetails = (id: number) => {
    navigate(`/admin/edit-bai-hoc/${id}`);
  };

  const handleOpenDialog = () => {
    navigate("/admin/add-bai-hoc"); // Điều hướng đến trang AddLesson
  };

  const handleHide = async (id: number) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    fetch(`${ADMIN_PUT_DELETE_LESSON}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setLessons((prevLessons) =>
            prevLessons.map((lesson) =>
              lesson.id === id ? { ...lesson, deleted: true } : lesson
            )
          );
          alert("Bài học đã được khóa thành công");
        } else {
          alert("Có lỗi xảy ra khi khóa Bài học");
        }
      })
      .catch((error) => {
        console.error("Error deleting account:", error);
        alert("Có lỗi xảy ra khi khóa Bài học");
      });
  };
  const handleShow = async (id: number) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    fetch(`${ADMIN_PUT_ACTIVE_LESSON}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setLessons((prevLessons) =>
            prevLessons.map((lesson) =>
              lesson.id === id ? { ...lesson, deleted: false } : lesson
            )
          );
          alert("Bài học đã được kích hoạt thành công");
        } else {
          alert("Có lỗi xảy ra khi kích hoạt Bài học");
        }
      })
      .catch((error) => {
        console.error("Error updating account activation status:", error);
        alert("Có lỗi xảy ra khi kích hoạt Bài học");
      });
  };

  const handlePageChange = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi số hàng mỗi trang
  };

  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>Danh Sách Bài Học</h2>
        <div className={styles.headContainer}>
          <TextField
            className={styles.searchField}
            size="small"
            label="Tìm kiếm bài học"
            value={searchTerm}
            onChange={handleSearch}
            variant="outlined"
          />
          <Button
            className={classNames('btn', 'btn-primary', styles.whiteBtn)}
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            Thêm Bài Học
          </Button>
        </div >
        <Divider style={{ marginBottom: '20px' }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={styles.headerCell}>ID</TableCell>
                <TableCell className={styles.headerCell}>Tiêu đề</TableCell>
                <TableCell className={styles.headerCell}>Khóa học</TableCell>
                <TableCell className={styles.headerCell}>Chương</TableCell>
                <TableCell className={styles.headerCell}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lessons.map((lesson: Lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>{lesson.id}</TableCell>
                  <TableCell>{lesson.lessonTitle}</TableCell>
                  <TableCell>{lesson.courseName || "N/A"}</TableCell>
                  <TableCell>{lesson.chapterName || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewLessonDetails(lesson.id)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteLesson(lesson.id)}>
                      <Delete />
                    </IconButton>
                    {lesson.deleted ? (
                      <IconButton onClick={() => handleShow(lesson.id)}>
                        <ToggleOff />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleHide(lesson.id)}>
                        <ToggleOn />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Phân trang */}
        <TablePagination
          rowsPerPageOptions={[50, 100, 200]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
    </Paper>

  );
};
export const RequestAdminURL = RequireAdmin(LessonList);
export default LessonList;
