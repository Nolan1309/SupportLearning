// AddExam.tsx

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Button,
  Select,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
  Box,
  SelectChangeEvent,
  FormControl,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import CircularSlider from "@fseehawer/react-circular-slider";
import { TextField, MenuItem, InputLabel } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_ADD_TEST,
  ADMIN_GET_CHAPTERS_LIST,
  ADMIN_GET_CB_COURSE1,
} from "../../../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RequireAdmin from "../../../DOM/RequireAdmin";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import "./addexam.css";
import { AdminLessonDTOList } from "./ExamList";
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
  chapterId?: number;
  lessonId?: number;
  courseId?: number;
  isSummary?: boolean;
  type: string[];
  assigned: boolean;
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
interface QuestionType {
  label: string;
  selected: boolean;
}
interface chapter {
  course_id: number;
  deleted: boolean;
  id: number;
  title: string;
}
const AddExamDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  courseId: string | null;
  chapters: chapter[];
}> = ({ open, onClose, courseId, chapters }) => {

  const [exam, setExam] = useState<Exam>({
    id: 0,
    title: "",
    description: "",
    totalQuestion: 0,
    easyQuestion: 0,
    mediumQuestion: 0,
    hardQuestion: 0,
    createdAt: "",
    deleted: false,
    chapterId: undefined,
    lessonId: undefined,
    courseId: Number(courseId),
    isSummary: false,
    type: [],
    assigned: false
  });

  const [courses, setCourses] = useState<any[]>([]);

  const [lessons, setLessons] = useState<AdminLessonDTOList[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);
  const [selectedLesson, setSelectedLesson] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const refresh = useRefreshToken();
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { label: "Trắc nghiệm", selected: false },
    { label: "Tự luận", selected: false },
    { label: "Điền khuyết", selected: false },
    { label: "Checkbox", selected: false },
  ]);

  const fetchLessonByChapter = async (id: number) => {

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
      courseId: courseId ? courseId.toString() : "",
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/lessons/chapter/${id}?${searchParams.toString()} `,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setLessons(data);

    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    if (chapters) {
      setLoading(false);
      fetchLessonByChapter(0)
      // console.log(chapters);
    }
  }, [chapters]);


  const handleClose = () => {
    onClose();
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExam((prevExam) => ({ ...prevExam, [name]: value }));
    // setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };



  const handleChapterChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value === "" ? undefined : Number(e.target.value);
    setExam((prevExam) => ({ ...prevExam, chapterId: value, lessonId: undefined })); // ✅ Reset lessonId khi chọn chương mới

    if (value) {
      fetchLessonByChapter(value); // ✅ Gọi API lấy danh sách bài học theo chương
    } else {
      setLessons([]); // Nếu không có chương, xóa danh sách bài học
    }
  };



  const handleCheckboxChange = (index: number) => {
    setQuestionTypes((prev) =>
      prev.map((q, i) => {
        if (i === index) {
          // Toggle selection
          const updatedSelected = !q.selected;

          // Update the exam.type array
          setExam((prevExam) => ({
            ...prevExam,
            type: updatedSelected
              ? [...prevExam.type, q.label] // Add the type if selected
              : prevExam.type.filter((type) => type !== q.label), // Remove if unselected
          }));

          return { ...q, selected: updatedSelected };
        }
        return q;
      })
    );
  };


  // Handle Summary Change
  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSummary = e.target.checked;
    setExam((prevExam) => ({ ...prevExam, isSummary }));
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      description?: string;
      totalQuestion?: string;
      chapterId?: string;
      // courseId?: string;
    } = {};

    if (!exam.title.trim()) {
      newErrors.title = "Tiêu đề không được để trống.";
    }

    if (!exam.description.trim()) {
      newErrors.description = "Mô tả không được để trống.";
    }

    if (exam.totalQuestion <= 0 || isNaN(exam.totalQuestion)) {
      newErrors.totalQuestion = "Số lượng câu hỏi phải là số dương.";
    }

    if (!exam.chapterId) {
      newErrors.chapterId = "Vui lòng chọn chương.";
    }

    // setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle Add Exam
  const handleAddExam = async () => {

    if (!validateForm()) {
      toast.error("Vui lòng điền các thông tin cần thiết", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const updatedExam = {
      ...exam,
      courseId: Number(courseId), // Ensure courseId is a number
      chapterId: exam.chapterId || undefined, // Ensure chapterId is handled properly
      lessonId: selectedLesson || undefined,
      type: exam.type.map((t) => t.trim()), // Trim spaces from type elements
    };
    // console.log(courseId);
    // console.log(updatedExam);

    setAdding(true);
    try {
      const response = await fetch(ADMIN_ADD_TEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedExam),
      });

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error("Bài test đã có trong bài test chương.");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add exam.");
        }
      }

      toast.success("Thêm bài kiểm tra thành công!", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => {
          window.location.reload();
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        // setErrorMessage(error.message);
        toast.error(error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // setErrorMessage("Đã xảy ra lỗi không mong muốn.");
        toast.error("Đã xảy ra lỗi không mong muốn.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setAdding(false);
    }
  };
  const handleTotalQuestionChange = (value: number) => {
    setExam((prev) => {
      // Nếu tổng số câu hỏi mới nhỏ hơn tổng của easy, medium, hard, điều chỉnh giảm các giá trị này
      const currentTotal = prev.easyQuestion + prev.mediumQuestion + prev.hardQuestion;
      if (value < currentTotal) {
        const scaleFactor = value / currentTotal || 0; // Tránh chia cho 0
        return {
          ...prev,
          totalQuestion: value,
          easy: Math.floor(prev.easyQuestion * scaleFactor),
          medium: Math.floor(prev.mediumQuestion * scaleFactor),
          hard: Math.floor(prev.hardQuestion * scaleFactor),
        };
      }
      return { ...prev, totalQuestion: value };
    });
  };
  const handleLevelChange = (
    field: "easyQuestion" | "mediumQuestion" | "hardQuestion",
    value: number
  ) => {
    setExam((prev) => {
      const otherLevelsSum = prev.easyQuestion + prev.mediumQuestion + prev.hardQuestion - prev[field];
      const maxForField = prev.totalQuestion - otherLevelsSum;

      return {
        ...prev,
        [field]: Math.min(value, maxForField), // Giới hạn giá trị không vượt quá tổng
      };
    });
  };
  const handleLessonChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value === "" ? undefined : Number(e.target.value);
    setSelectedLesson(value?.toString());
    // const chapter = chapters.find(
    //   (chap) => chap.id === value
    // );

  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Thêm Bài Kiểm Tra Mới</DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          justifyContent="center"
          minHeight="80vh"
          bgcolor="#ffffff"
          p={2}
          width="100%"
        >
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
            width="100%"
            height="100%"
            minHeight="80vh"
          >
            {/* Tiêu đề */}
            <TextField
              label="Tiêu đề"
              name="title"
              value={exam.title}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              margin="dense"
            // error={!!errors.title}
            // helperText={errors.title}
            // sx={{ mb: 2 }}
            />
            {/* Mô tả */}
            <TextField
              label="Mô tả"
              name="description"
              value={exam.description}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              margin="dense"
              multiline
              rows={4}
            // error={!!errors.description}
            // helperText={errors.description}
            // sx={{ mb: 2 }}
            />
            <TextField
              label="Tổng số câu hỏi"
              type="number"
              value={exam.totalQuestion}
              onChange={(e) =>
                handleTotalQuestionChange(parseInt(e.target.value || "0", 10))
              }
              fullWidth
              inputProps={{ min: 0 }}
              style={{ marginTop: "10px" }}
            />
            <Typography variant="h6" mt={2} marginBottom={1}>
              Loại bài kiểm tra
            </Typography>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {questionTypes.map((q, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  mb={1}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={q.selected}
                        onChange={() => handleCheckboxChange(index)}
                      />
                    }
                    label={q.label}
                  />
                </Box>
              ))}
            </div>

            <Typography variant="h6" mt={2}>
              Mức độ bài kiểm tra
            </Typography>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={4}
              p={4}
            >
              <CircularSlider
                label="Tiến trình phân bổ"
                width={200}
                dataIndex={Math.min(
                  ((exam.easyQuestion + exam.mediumQuestion + exam.hardQuestion) /
                    exam.totalQuestion) *
                  100,
                  100
                )}
                min={0}
                max={100}
                knobColor="#007bff"
                progressColorFrom="#007bff"
                progressColorTo="#0056b3"
                labelColor="#000"
                appendToValue="%"
              // disabled
              />

              <Box display="flex" flexDirection="column" gap={2} width="100%">
                <TextField
                  label="Số câu dễ"
                  type="number"
                  value={exam.easyQuestion}
                  onChange={(e) =>
                    handleLevelChange(
                      "easyQuestion",
                      parseInt(e.target.value || "0", 10)
                    )
                  }
                  fullWidth
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Số câu vừa"
                  type="number"
                  value={exam.mediumQuestion}
                  onChange={(e) =>
                    handleLevelChange(
                      "mediumQuestion",
                      parseInt(e.target.value || "0", 10)
                    )
                  }
                  fullWidth
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Số câu khó"
                  type="number"
                  value={exam.hardQuestion}
                  onChange={(e) =>
                    handleLevelChange(
                      "hardQuestion",
                      parseInt(e.target.value || "0", 10)
                    )
                  }
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Box>
            </Box>
            <FormControl
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
            // error={!!errors.chapterId}
            >
              <Select
                displayEmpty
                value={exam.chapterId?.toString() || ""}
                onChange={handleChapterChange}
                variant="outlined"
                fullWidth
              >
                <MenuItem value="">
                  <em>
                    {chapters.length
                      ? "Chọn Chương"
                      : "Không có chương học nào"}
                  </em>
                </MenuItem>
                {chapters.map((chapter) => (
                  <MenuItem key={chapter.id} value={chapter.id.toString()}>
                    {chapter.title}
                  </MenuItem>
                ))}
              </Select>


            </FormControl>


            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              {/* <InputLabel>Chọn Bài Học</InputLabel> */}
              <Select
                displayEmpty
                value={selectedLesson}
                onChange={handleLessonChange}
                variant="outlined"
                fullWidth
              >
                <MenuItem value="">
                  <em>{lessons.length ? "Chọn Bài Học" : "Không có bài học nào"}</em>
                </MenuItem>
                {lessons.map((lesson) => (
                  <MenuItem key={lesson.id} value={lesson.id.toString()}>
                    {lesson.lessonTitle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>



            <FormControlLabel
              control={
                <Checkbox
                  checked={exam.isSummary || false}
                  onChange={handleSummaryChange}
                  name="isSummary"
                  color="primary"
                />
              }
              label="Chọn làm bài kiểm tra chương"
              sx={{ mb: 2 }}
            />

            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddExam}
                disabled={adding}
                startIcon={adding ? <CircularProgress size={24} /> : null}
              >
                {adding ? "Đang thêm..." : "Thêm Bài Kiểm Tra"}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleClose}
                disabled={adding}
              >
                Hủy Bỏ
              </Button>
            </Box>
          </Box>
          <ToastContainer />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export const RequestAdminURL = RequireAdmin(AddExamDialog);

export default AddExamDialog;
