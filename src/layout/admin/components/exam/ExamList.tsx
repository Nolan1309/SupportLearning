import React, { useState, useEffect } from "react";
import {
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  DialogContent,
  Select,
  TablePagination,
  MenuItem,
  Paper,
  FormControl,
  Divider,
  InputLabel,
} from "@material-ui/core";
import {
  Edit,
  Delete,
  PlaylistAdd,
  VisibilityOff,
  Add,
} from "@material-ui/icons";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import styles from "./examList.module.scss"; // Import CSS file
import {
  ADMIN_GET_CHAPTERS_LIST,
  ADMIN_GET_TEST,
  ADMIN_PUT_ACTIVE_TEST_CLEAR,
  ADMIN_PUT_DELETE_TEST_CLEAR,
} from "../../../../api/api";
import RequireAdmin from "../../../DOM/RequireAdmin";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import classNames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddExamDialog from "./AddExam";
import { SelectChangeEvent } from "@mui/material";
import AddMultipleExamsDialog from "./AddMultipleExamsDialog";
import AddQuestionToExam from "./AddQuestionToExam/AddQuestionToExam";
import EditExam from "./EditExam";
interface Exam {
  id: number;
  title: string;
  description: string;
  totalQuestion: number;
  easyQuestion: number; // Số câu dễ
  mediumQuestion: number; // Số câu vừa
  hardQuestion: number; // Số câu khó
  createdAt: string;
  deleted: boolean;
  summary: boolean;
  lessonId: number;
  courseId: number;
  chapterId: number;
  type: string[];
  assigned: boolean;
  topic: string;
}

interface AdminTestCheckInfoCourse {
  totalAssignedChapter: number;
  totalChapters: number;
  totalAssignedLessons: number;
  totalLessons: number;
  countAssignedTests: number;
  countUnassignedTests: number;
  countTestByCourse: number;
}


interface CourseModel {
  id: number; // Unique identifier for the course
  courseTitle: string; // Title of the course
  duration: string; // Duration of the course (e.g., "20 giờ")
  price: number; // Price of the course
  status: boolean; // Status indicating if the course is active
  deleted: boolean; // Status indicating if the course is deleted
  categoryName: string; // Name of the category the course belongs to
}

interface AccountTeacher {
  id: number;
  birthday: Date;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  fullname: string;
  gender: string;
  isDeleted: boolean;
  deletedDate: Date;
  phone: string;
  roleId: number;
}

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
  categoryNameLevel3: string | null; // Có thể null
  categoryIdLevel3: number | null; // Có thể null
  categoryNameLevel2: string | null; // Có thể null
  categoryIdLevel2: number | null; // Có thể null
  categoryNameLevel1: string | null; // Có thể null
  categoryIdLevel1: number | null; // Có thể null
  accountId: number | null; // Có thể null
  teacherName?: string;
}
interface chapter {
  course_id: number;
  deleted: boolean;
  id: number;
  title: string;
}
export interface AdminLessonDTOList {
  id: number;
  createdAt: string; // ISO Date format
  duration: number;
  lessonTitle: string;
  updatedAt: string;
  chapterId: number;
  courseId: number;
  deletedDate: string | null; // Có thể null
  isDeleted: boolean;
  isTestExcluded: string;
  topic: string;
  status: boolean;
}
const ExamList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [lesson, setLesson] = useState<AdminLessonDTOList[]>([]);
  const [courses, setCourses] = useState<CourseModel[]>([]);
  const [courseFilter, setCourseFilter] = useState<number | null>(null); // New state for course filter
  const [showUpload, setShowUpload] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<keyof Exam>("title");
  const [hiddenExams, setHiddenExams] = useState<Set<number>>(new Set());
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterCourse, setFilterCourse] = useState<string>("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(10); // Số bản ghi mỗi trang
  const [totalElements, setTotalElements] = useState(0); // Tổng số bản ghi
  const navigate = useNavigate(); // Khởi tạo navigate
  const refresh = useRefreshToken();
  const [accountTeacher, setAccountTeacher] = useState<AccountTeacher[]>([]);
  const [coursesT, setCoursesT] = useState<Course[]>([]);
  const [filteredCourse, setFilteredCourse] = useState<Course[]>(coursesT);
  const [selectCourse, setSelectCourse] = useState("");
  const [selectTeacher, setSelectTeacher] = useState("");
  const [testCheckInfoCourse, setTestCheckInfoCourse] = useState<AdminTestCheckInfoCourse | null>(null);
  const [lessonLoaded, setLessonLoaded] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const params = new URLSearchParams({
        courseId: selectCourse,
        ...(searchTerm && { title: searchTerm }),
        page: page.toString(),
        size: rowsPerPage.toString(),
      });
      const url = `${process.env.REACT_APP_SERVER_HOST}/api/tests/filter-all?${params.toString()}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setExams(data.content || []);
        setTotalElements(data.totalElements || 0);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      }
    };

    const fetchDetailCourseExam = async () => {
      let token = localStorage.getItem("authToken");

      if (!selectCourse) {
        return;
      }
      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const params = new URLSearchParams({
        courseId: selectCourse
      });
      const url = `${process.env.REACT_APP_SERVER_HOST}/api/tests/detail-course-test?${params.toString()}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (response.status === 400) {
          return;
        }
        setTestCheckInfoCourse(data);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      }
    };
    fetchExams();
    fetchDetailCourseExam();
  }, [page, rowsPerPage, selectTeacher, selectCourse, searchTerm]);

  const fetchAccountTeachers = async () => {
    let token = localStorage.getItem("authToken");

    if (!token || isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/account/list-teacher-only`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: AccountTeacher[] = await response.json();
      setAccountTeacher(data);
    } catch (error: any) {
      toast.error(error);
    }
  };
  const fetchCourseList = async () => {
    let token = localStorage.getItem("authToken");

    if (!token || isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/get-all-result-list`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: Course[] = await response.json();
      setCoursesT(data);
      setFilteredCourse(data);
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (selectTeacher) {
      if (!selectCourse) {
        const courseForTeacher = coursesT.filter(
          (course) => course.accountId === parseInt(selectTeacher)
        );
        setFilteredCourse(courseForTeacher);
        setSelectCourse("");
      } else {
        const courseForTeacher = coursesT.filter(
          (course) => course.accountId === parseInt(selectTeacher)
        );
        if (courseForTeacher.length <= 0) {
          setFilteredCourse(courseForTeacher);
          setSelectCourse("");
        } else {
          setFilteredCourse(courseForTeacher);
          const courseDT = coursesT.find(
            (course) => course.id === parseInt(selectCourse)
          );
          if (courseDT?.accountId !== parseInt(selectTeacher)) {
            setSelectCourse("");
          }
        }
      }
    } else {
      setFilteredCourse(coursesT);
      setSelectCourse("");
    }
  }, [selectTeacher, courses]);

  useEffect(() => {
    if (selectCourse) {
      const courseDT = coursesT.find(
        (course) => course.id === parseInt(selectCourse)
      );

      if (courseDT) {
        const courseForTeacher = accountTeacher.filter(
          (teacher) => teacher.id === courseDT.accountId
        );
        if (courseForTeacher.length > 0) {
          setSelectTeacher(courseForTeacher[0].id.toString());
        }
      }
    }
  }, [selectCourse, courses]);

  useEffect(() => {
    setPage(0);
  }, [selectCourse, selectTeacher, searchTerm]);

  const handleCloseUpload = () => {
    setShowUpload(false);
  };

  useEffect(() => {
    fetchAccountTeachers();
    fetchCourseList();
  }, []);

  const handleSort = (column: keyof Exam) => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);
    setSortColumn(column);

    const sortedExams = [...exams].sort((a, b) => {
      if (column === "title") {
        // Sắp xếp theo Tiêu đề (string)
        return newSortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      if (column === "assigned") {
        // Sắp xếp theo Trạng thái (boolean)
        return newSortDirection === "asc" ? (a.assigned ? 1 : -1) : a.assigned ? -1 : 1;
      }
      if (column === "type") {
        // Sắp xếp theo Loại bài kiểm tra (dựa trên summary và lessonId)
        const typeA = a.summary && a.lessonId === null ? "Chương" : "Bài học";
        const typeB = b.summary && b.lessonId === null ? "Chương" : "Bài học";
        return newSortDirection === "asc" ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
      }
      // Sắp xếp theo các cột khác
      if (a[column] < b[column]) return newSortDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return newSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setExams(sortedExams);
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

    fetch(`${ADMIN_PUT_DELETE_TEST_CLEAR}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setExams((prevExams) =>
            prevExams.map((exam) =>
              exam.id === id ? { ...exam, deleted: true } : exam
            )
          );
          alert("Bài kiểm tra đã được khóa thành công");
        } else {
          alert("Có lỗi xảy ra khi khóa Bài kiểm tra");
        }
      })
      .catch((error) => {
        console.error("Error deleting account:", error);
        alert("Có lỗi xảy ra khi khóa Bài kiểm tra");
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

    fetch(`${ADMIN_PUT_ACTIVE_TEST_CLEAR}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setExams((prevExams) =>
            prevExams.map((exam) =>
              exam.id === id ? { ...exam, deleted: false } : exam
            )
          );
          alert("Bài kiểm tra đã được kích hoạt thành công");
        } else {
          alert("Có lỗi xảy ra khi kích hoạt Bài kiểm tra");
        }
      })
      .catch((error) => {
        console.error("Error updating account activation status:", error);
        alert("Có lỗi xảy ra khi kích hoạt Bài kiểm tra");
      });
  };

  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterSubject(event.target.value as string);
  };

  const handleQuickEdit = (id: number) => {
    navigate(`/admin/edit-bai-kiem-tra/${id}`);
  };

  const handleAddQuestions = (id: number) => {
    navigate(`/admin/exams/${id}/add-questions`);
  };
  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openAddMutilDialog, setOpenAddMutilDialog] = useState(false);

  const [openEditExamDialog, setOpenEditExamDialog] = useState(false);

  const handleCourseChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setSelectCourse(value!.toString()); // Lưu ID khóa học được chọn
  };

  const handleAddExamClick = async () => {
    if (!selectCourse) {
      toast.error("Vui lòng chọn khóa học trước khi thêm bài kiểm tra.");
      return;
    }
    await fetchChapters(selectCourse);
    setOpenAddDialog(true);
  };

  const handleAddExamMutilClick = async () => {
    if (!selectCourse) {
      toast.error("Vui lòng chọn khóa học trước khi thêm bài kiểm tra.");
      return;
    }
    await fetchChapters(selectCourse);
    setOpenAddMutilDialog(true);
  };




  const [openAddQuestionDialog, setOpenAddQuestionDialog] = useState(false);
  const [selectedExamObject, setSelectedExamObject] = useState<Exam | null>(
    null
  );


  //Bài học của bài kiểm tra đó
  const fetchLesson = async (exam: Exam) => {
    let token = localStorage.getItem("authToken");
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    const searchParams = new URLSearchParams({
      lessonId: exam.lessonId && !isNaN(exam.lessonId) ? exam.lessonId.toString() : "",
      chapterId: exam.chapterId && !isNaN(exam.chapterId) ? exam.chapterId.toString() : "",
    });


    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/lessons/test/lesson/${exam.id}?${searchParams.toString()} `,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setLesson(data);

    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };


  const handleCloseMutilDialog = () => {
    setOpenAddMutilDialog(false);
  };
  const handleCloseDialog = () => {
    setOpenAddDialog(false);
  };
  const handleOpenAddQuestionDialog = async (exam: Exam) => {
    if (!exam.assigned) {
      toast.error("Bạn chưa phân bổ bài kiểm tra vào khóa học !");
      return;
    }
    setLessonLoaded(false); // Bắt đầu tải dữ liệu
    await fetchLesson(exam);
    setLessonLoaded(true);
    setSelectedExamObject(exam);
    setOpenAddQuestionDialog(true); // Mở dialog
  };

  const handleOpenEditExamDialog = (exam: Exam) => {
    setSelectedExamObject(exam); // Ghi nhận ID bài kiểm tra cần thêm câu hỏi
    setOpenEditExamDialog(true); // Mở dialog
  };

  const handleCloseAddQuestionDialog = () => {
    setOpenAddQuestionDialog(false); // Đóng dialog
    setSelectedExamObject(null); // Reset ID khi đóng
  };
  const handleCloseEditExamDialog = () => {
    setOpenEditExamDialog(false); // Đóng dialog
    setSelectedExamObject(null); // Reset ID khi đóng
  };

  const [chapters, setChapters] = useState<chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchChapters = async (courseId: string) => {
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
      const response = await fetch(ADMIN_GET_CHAPTERS_LIST, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("All Chapters:", data);

      // Lọc dữ liệu theo courseId trước khi set vào chapters
      const filteredChapters = data.filter(
        (chapter: any) => chapter.course_id === Number(courseId)
      );

      console.log("Filtered Chapters:", filteredChapters);

      setChapters(filteredChapters);
      setLoading(false); // Tắt trạng thái loading
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      toast.error("Không thể tải danh sách chương học.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>Danh Sách Bài Kiểm Tra Khóa Học</h2>
        <div className={styles.headContainer}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <TextField
              className={styles.searchField}
              size="small"
              label="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
            />
            <TextField
              select
              size="small"
              className={styles.filterselect}
              variant="outlined"
              value={selectTeacher}
              onChange={(e) => setSelectTeacher(e.target.value as string)}
              SelectProps={{
                displayEmpty: true,
              }}
            >
              <MenuItem value="">
                <em>Tất cả giáo viên</em>
              </MenuItem>
              {accountTeacher.map((account) => (
                <MenuItem key={account.id} value={account.id.toString()}>
                  {account.fullname}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              className={styles.filterselect}
              variant="outlined"
              value={selectCourse}
              onChange={(e) => setSelectCourse(e.target.value as string)}
              SelectProps={{
                displayEmpty: true,
              }}
            >
              <MenuItem value="">
                <em>Tất cả khóa học</em>
              </MenuItem>
              {filteredCourse.map((course) => (
                <MenuItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div>
            <Button
              className={classNames("btn", "btn-primary", styles.whiteBtn)}
              variant="contained"
              startIcon={<Add />}
              color="primary"
              onClick={handleAddExamMutilClick}
              style={{ marginRight: "10px" }}
            >
              Thêm Tự Động
            </Button>
            <Button
              className={classNames("btn", "btn-primary", styles.whiteBtn)}
              variant="contained"
              startIcon={<Add />}
              color="primary"
              onClick={handleAddExamClick}
              disabled={!selectCourse} // Vô hiệu hóa nếu chưa chọn khóa học
            >
              Thêm Tay
            </Button>
          </div>
        </div>
        <Divider style={{ marginBottom: "20px" }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={styles.headerCell}>ID</TableCell>
                <TableCell
                  className={styles.headerCell}
                  onClick={() => handleSort("title")}
                  style={{ cursor: "pointer", width: "30%" }}
                >
                  Tiêu đề
                  {sortColumn === "title" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell className={styles.headerCell}>
                  Số lượng câu hỏi
                </TableCell>
                <TableCell className={styles.headerCell}>Ngày tạo</TableCell>
                <TableCell
                  className={styles.headerCell}
                  onClick={() => handleSort("type")}
                  style={{ cursor: "pointer" }}
                >
                  Loại Bài Kiểm Tra
                  {sortColumn === "type" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  className={styles.headerCell}
                  onClick={() => handleSort("assigned")}
                  style={{ cursor: "pointer" }}
                >
                  Trạng thái
                  {sortColumn === "assigned" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  className={styles.headerCell}
                  style={{ width: "15%" }}
                >
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className={styles.bodyCell}>{exam.id}</TableCell>
                  <TableCell className={styles.bodyCell}>
                    {exam.title}
                  </TableCell>
                  <TableCell className={styles.bodyCell}>
                    {exam.totalQuestion}
                  </TableCell>
                  <TableCell className={styles.bodyCell}>
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className={styles.bodyCell}>
                    {exam.summary && exam.lessonId === null
                      ? `Chương`
                      : "Bài học"}
                  </TableCell>
                  <TableCell className={styles.bodyCell}>
                    {exam.assigned
                      ? `Đã phân bổ`
                      : "Chưa phân bổ"}
                  </TableCell>
                  <TableCell className={styles.bodyCell}>
                    <IconButton
                      onClick={() => handleOpenEditExamDialog(exam)}
                      sx={{ color: "#4CAF50" }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenAddQuestionDialog(exam)} // Mở Dialog
                      sx={{ color: "#0080c9" }}
                    >
                      <PlaylistAdd />
                    </IconButton>
                    <IconButton onClick={() => handleHide(exam.id)}>
                      <Delete />
                    </IconButton>
                    {/* {exam.deleted ? (
                      <IconButton onClick={() => handleShow(exam.id)} >
                        <ToggleOff style={{ width: "21px", height: "21px" }} />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleHide(exam.id)} >
                        <ToggleOn style={{ width: "21px", height: "21px" }} />
                      </IconButton>
                    )} */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Phân trang */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0px",
          }}
        >
          <div>
            <p style={{ fontSize: "14px" }}>
              Đã phân bổ: {testCheckInfoCourse?.countAssignedTests ?? "Lỗi"}/{testCheckInfoCourse?.countTestByCourse ?? "Lỗi"}
            </p>
            <p style={{ fontSize: "14px" }}>
              Chưa phân bổ: {testCheckInfoCourse?.countUnassignedTests ?? "Lỗi"}/{testCheckInfoCourse?.countTestByCourse ?? "Lỗi"}
            </p>
            <p style={{ fontSize: "14px" }}>
              Tống số chương: {testCheckInfoCourse?.totalAssignedChapter ?? "Lỗi"}/{testCheckInfoCourse?.totalChapters ?? "Lỗi"}
            </p>
            <p style={{ fontSize: "14px" }}>
              Tổng số bài học: {testCheckInfoCourse?.totalAssignedLessons ?? "Lỗi"}/{testCheckInfoCourse?.totalLessons ?? "Lỗi"}
            </p>
          </div>

          <div>
            <TablePagination
              rowsPerPageOptions={[100, 250, 500]}
              component="div"
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              labelRowsPerPage="Số hàng mỗi trang:"
            />
          </div>
        </div>

        <AddExamDialog
          open={openAddDialog}
          onClose={handleCloseDialog}
          courseId={selectCourse}
          chapters={chapters}
        />
        <AddMultipleExamsDialog
          open={openAddMutilDialog}
          onClose={handleCloseMutilDialog}
          courseId={selectCourse}
          chapters={chapters}
        />
        {selectedExamObject && (
          <AddQuestionToExam
            open={openAddQuestionDialog}
            onClose={handleCloseAddQuestionDialog}
            exam={selectedExamObject} // Truyền ID bài kiểm tra vào Dialog
            lesson={lesson}
            accountId={selectTeacher}
          />
        )}
        {selectedExamObject && (
          <EditExam
            open={openEditExamDialog}
            onClose={handleCloseEditExamDialog}
            examProps={selectedExamObject!} // Truyền ID bài kiểm tra vào Dialog
            courseId={selectCourse}


          />
        )}
      </div>

      <ToastContainer />
    </Paper>
  );
};
export const RequestAdminURL = RequireAdmin(ExamList);

export default ExamList;
