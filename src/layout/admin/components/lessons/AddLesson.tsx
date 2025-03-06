/* AddLesson.tsx */

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Container,
  Paper,
  Divider
} from "@mui/material"; // Updated to @mui/material for consistency
import { useNavigate } from "react-router-dom";
import {
  ADMIN_GET_CHAPTER_ALL,
  ADMIN_GET_CB_COURSE,
  ADMIN_POST_LESSONS_ADD,
} from "../../../../api/api";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import RequireAdmin from "../../../DOM/RequireAdmin";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import react-toastify CSS
import styles from "./addLesson.module.scss"; // Import the new CSS module

interface Chapter {
  id: number;
  title: string;
  course_id: number;
  deleted: boolean;
}

interface Course {
  id: number;
  courseTitle: string;
}

const AddLesson: React.FC = () => {
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonDuration, setLessonDuration] = useState<number | "">("");
  const [lessonChapter, setLessonChapter] = useState<number | "">("");
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();
  const refresh = useRefreshToken();

  // Helper function to get and refresh token if necessary
  const getValidToken = async (): Promise<string | null> => {
    let token = localStorage.getItem("authToken");
    if (token && isTokenExpired(token)) {
      token = await refresh();
      if (token) {
        localStorage.setItem("authToken", token);
      } else {
        navigate("/dang-nhap");
        return null;
      }
    }
    return token;
  };

  useEffect(() => {
    fetchChapters();
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchChapters = async () => {
    const token = await getValidToken();
    if (!token) return;

    try {
      const response = await fetch(ADMIN_GET_CHAPTER_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Error fetching chapters: ${response.statusText}`);
      }
      const data: Chapter[] = await response.json();
      setChapters(data);
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      toast.error("Không thể tải danh sách chương học.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchCourses = async () => {
    const token = await getValidToken();
    if (!token) return;
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");

    const accountId = authData ? authData.id : null;
    try {
      const response = await fetch(`${ADMIN_GET_CB_COURSE}/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Error fetching courses: ${response.statusText}`);
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Không thể tải danh sách khóa học.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Filter chapters based on selected course
  useEffect(() => {
    if (selectedCourse !== "") {
      setFilteredChapters(
        chapters.filter((chapter) => chapter.course_id === selectedCourse)
      );
    } else {
      setFilteredChapters([]);
      setLessonChapter("");
    }
  }, [selectedCourse, chapters]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!lessonTitle.trim()) {
      newErrors.lessonTitle = "Tên bài học không được để trống.";
    }

    if (lessonDuration === "" || lessonDuration <= 0) {
      newErrors.lessonDuration = "Thời lượng phải là số dương.";
    }

    if (lessonChapter === "") {
      newErrors.lessonChapter = "Chương không được để trống.";
    }

    if (selectedCourse === "") {
      newErrors.selectedCourse = "Khóa học không được để trống.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLesson = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng sửa các lỗi trong biểu mẫu.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const confirmAdd = window.confirm(
      "Bạn có chắc chắn muốn thêm bài học này?"
    );
    if (!confirmAdd) return;

    const newLesson = {
      title: lessonTitle.trim(),
      duration: Number(lessonDuration),
      chapter_id: Number(lessonChapter),
      course_id: Number(selectedCourse),
    };

    const token = await getValidToken();
    if (!token) return;

    try {
      const response = await fetch(ADMIN_POST_LESSONS_ADD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLesson),
      });

      if (response.ok) {
        toast.success("Thêm bài học thành công!", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => {
            navigate("/admin/bai-hoc");
          },
        });
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Thêm bài học thất bại.";
        console.error("Failed to add lesson:", errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to add lesson:", error);
      toast.error("Đã xảy ra lỗi khi thêm bài học.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any
  ) => {
    setter(value);
    setErrors((prev) => ({ ...prev, [value]: "" }));
  };

  return (
    <div className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h5" component="h2" className={styles.header}>
          Thêm Bài Học Mới
        </Typography>
        <Divider className={styles.divider} />
        <Grid container spacing={3} className={styles.formContainer}>
          {/* Lesson Title */}
          <Grid item xs={12}>
            <TextField
              label="Tên Bài Học"
              value={lessonTitle}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(setLessonTitle, e.target.value)
              }
              fullWidth
              required
              error={!!errors.lessonTitle}
              helperText={errors.lessonTitle}
              className={styles.textField}
            />
          </Grid>

          {/* Lesson Duration */}
          <Grid item xs={12}>
            <TextField
              label="Thời lượng (phút)"
              type="number"
              value={lessonDuration}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(
                  setLessonDuration,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              fullWidth
              required
              error={!!errors.lessonDuration}
              helperText={errors.lessonDuration}
              inputProps={{ min: 1 }}
              className={styles.textField}
            />
          </Grid>

          {/* Selected Course */}
          <Grid item xs={12}>
            <TextField
              select
              label="Khóa Học"
              value={selectedCourse}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(
                  setSelectedCourse,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              fullWidth
              required
              error={!!errors.selectedCourse}
              helperText={errors.selectedCourse}
              className={styles.textField}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.courseTitle}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Selected Chapter */}
          <Grid item xs={12}>
            <TextField
              select
              label="Chương"
              value={lessonChapter}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(
                  setLessonChapter,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              fullWidth
              required
              error={!!errors.lessonChapter}
              helperText={errors.lessonChapter}
              disabled={selectedCourse === ""}
              className={styles.textField}
            >
              {filteredChapters.map((chapter) => (
                <MenuItem key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Button Actions */}
          <Grid item xs={12}>
            <div className={styles.buttonContainer}>
              <Button
                onClick={handleAddLesson}
                variant="contained"
                color="primary"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={
                  !lessonTitle ||
                  !lessonDuration ||
                  !selectedCourse ||
                  !lessonChapter
                }
              >
                Thêm Bài Học
              </Button>
              <Button
                onClick={() => navigate("/admin/bai-hoc")}
                variant="outlined"
                color="secondary"
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                Quay lại
              </Button>
            </div>
          </Grid>
        </Grid>
      </Paper>
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export const RequestAdminURL = RequireAdmin(AddLesson);
export default AddLesson;
