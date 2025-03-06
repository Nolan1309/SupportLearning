import React, { useState, useEffect } from "react";
import {
  Dialog,
  TextField,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
  Box,
  SelectChangeEvent,
  FormGroup,
  FormControl,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADMIN_UPDATE_TEST,
  ADMIN_GET_ONE_TEST,
  ADMIN_GET_CHAPTERS,
  ADMIN_GET_CB_COURSE1,
  ADMIN_GET_CHAPTER_ALL,
  ADMIN_GET_CHAPTERS_LIST,
} from "../../../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RequireAdmin from "../../../DOM/RequireAdmin";
import { AdminLessonDTOList } from "./ExamList";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";

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
  lessonId?: number;
  courseId?: number;
  chapterId?: number;
  type: string[];
  assigned: boolean;
}
interface chapter {
  course_id: number;
  deleted: boolean;
  id: number;
  title: string;
}
// interface EditExamProps {
//   open: boolean;
//   onClose: () => void;
//   examProps: Exam;
//   courseId: string | null;
//   accountId: string;
//   chapters: chapter[];
// }

const EditExam: React.FC<{
  open: boolean;
  onClose: () => void;
  examProps: Exam;
  courseId: string;


}> = ({
  open,
  onClose,
  examProps,
  courseId,

}) => {
    // const { id } = useParams<{ id: string }>(); // Lấy id từ URL
    const [exam, setExam] = useState<Exam | null>(null);

    // const [chapters, setChapters] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [updating, setUpdating] = useState<boolean>(false);
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<AdminLessonDTOList[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<string | undefined>(undefined);
    const token = localStorage.getItem("authToken");
    const [chapters, setChapters] = useState<chapter[]>([]);
    useEffect(() => {
      const fetchExam = async () => {
        try {
          const response = await fetch(`${ADMIN_GET_ONE_TEST}/${examProps.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setExam(data);
        } catch (error) {
          console.error("Failed to fetch exam:", error);
          toast.error("Không thể tải dữ liệu bài kiểm tra.");
        } finally {
          setLoading(false);
        }
      };
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

      const fetchData = async () => {
        await Promise.all([
          fetchExam(), fetchChapters(courseId)
        ]);
      };


      // fetchChapters(courseId);
      fetchData();
    }, [examProps.id, token]);

    const refresh = useRefreshToken();
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


    // Hàm thay đổi thông tin bài kiểm tra dựa trên input từ người dùng
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setExam((prevExam) => (prevExam ? { ...prevExam, [name]: value } : null));
    };

    const handleChapterChange = (e: SelectChangeEvent<string>) => {

      const value = e.target.value === "" ? undefined : Number(e.target.value);

      setExam((prevExam) => {
        if (!prevExam) return prevExam;

        return { ...prevExam, chapterId: value, lessonId: undefined };
      });

      if (value) {
        fetchLessonByChapter(value);
      } else {
        setLessons([]);
      }
    };



    // Hàm thay đổi thuộc tính tóm tắt
    const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const summary = e.target.checked;
      setExam((prevExam) => (prevExam ? { ...prevExam, summary } : null));
    };

    const handleUpdateExam = async () => {
      if (!exam) {
        toast.error("Vui lòng nhập thông tin bài kiểm tra.");
        return;
      }
      setUpdating(true);
      console.log(exam);
      try {
        const response = await fetch(ADMIN_UPDATE_TEST(Number(examProps.id)), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(exam),
        });
        const responseData = await response.text();
        if (!response.ok) {
          toast.error(responseData);
          return;
        }

        toast.success("Cập nhật bài kiểm tra thành công!", {
          position: "top-right",
          autoClose: 1500,
          onClose,
        });
      } catch (error) {
        toast.error("Cập nhật bài kiểm tra thất bại.");
      } finally {
        setUpdating(false);
      }
    };

    const handleTypeChange = (selectedType: string) => {
      setExam((prevExam) => {
        if (!prevExam) return prevExam; // Nếu prevExam là null, không làm gì cả

        const updatedTypes = prevExam.type?.includes(selectedType)
          ? prevExam.type.filter((type) => type !== selectedType) // Bỏ loại đã chọn
          : [...prevExam.type, selectedType]; // Thêm loại mới được chọn

        return { ...prevExam, type: updatedTypes };
      });
    };

    const getQuestionTypeLabel = (type: string) => {
      switch (type) {
        case "multiple-choice":
          return "Câu hỏi trắc nghiệm";
        case "essay":
          return "Câu hỏi tự luận";
        case "fill-in-the-blank":
          return "Câu hỏi điền khuyết";
        case "checkbox":
          return "Câu hỏi checkbox";
        default:
          return type;
      }
    };

    const handleQuestionChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      type: "easy" | "medium" | "hard"
    ) => {
      const { value } = e.target;
      const intValue = parseInt(value) || 0;

      if (type === "easy") {
        if (intValue + exam!.mediumQuestion + exam!.hardQuestion <= exam!.totalQuestion) {
          setExam((prevExam) => prevExam ? { ...prevExam, easyQuestion: intValue } : null);
        } else {
          toast.error("Số câu hỏi dễ không thể vượt quá tổng số câu hỏi.");
        }
      }

      if (type === "medium") {
        if (exam!.easyQuestion + intValue + exam!.hardQuestion <= exam!.totalQuestion) {
          setExam((prevExam) => prevExam ? { ...prevExam, mediumQuestion: intValue } : null);
        } else {
          toast.error("Số câu hỏi vừa không thể vượt quá tổng số câu hỏi.");
        }
      }

      if (type === "hard") {
        if (exam!.easyQuestion + exam!.mediumQuestion + intValue <= exam!.totalQuestion) {
          setExam((prevExam) => prevExam ? { ...prevExam, hardQuestion: intValue } : null);
        } else {
          toast.error("Số câu hỏi khó không thể vượt quá tổng số câu hỏi.");
        }
      }
    };
    const handleTotalQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const total = parseInt(value) || 0;

      if (total >= exam!.easyQuestion + exam!.mediumQuestion + exam!.hardQuestion) {
        setExam((prevExam) => prevExam ? { ...prevExam, totalQuestion: total } : null);
      } else {
        toast.error("Tổng số câu hỏi không thể nhỏ hơn tổng số câu hỏi đã phân bổ.");
      }
    };

    const handleLessonChange = (e: SelectChangeEvent<string>) => {
      const value = e.target.value === "" ? undefined : Number(e.target.value);
      setSelectedLesson(value?.toString());
    };

    // if (loading) {
    //   return (
    //     <Box
    //       display="flex"
    //       justifyContent="center"
    //       alignItems="center"
    //       height="100vh"
    //     >
    //       <CircularProgress />
    //     </Box>
    //   );
    // }

    if (!exam) {
      return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth style={{ minHeight: "500px" }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            bgcolor="#f5f5f5"
            p={2}
          >
            <Typography variant="h6" color="error">
              Không tìm thấy bài kiểm tra!
            </Typography>
          </Box>
        </Dialog>
      );
    }

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth style={{ minHeight: "500px" }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"

          bgcolor="#f5f5f5"
          p={2}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              width: "100%",
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Chỉnh Sửa Bài Kiểm Tra
            </Typography>
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <TextField
                label="Tiêu đề"
                name="title"
                value={exam.title}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                margin="dense"
                sx={{ mb: 2 }}
              />
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
                sx={{ mb: 2 }}
              />
              <TextField
                label="Số lượng câu hỏi"
                name="totalQuestion"
                type="number"
                value={exam.totalQuestion}
                onChange={handleTotalQuestionChange}
                variant="outlined"
                fullWidth
                margin="dense"
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ mb: 2 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <TextField
                  label="Số lượng câu hỏi dễ"
                  name="easyQuestion"
                  type="number"
                  value={exam.easyQuestion}
                  onChange={(e) => handleQuestionChange(e, "easy")}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Số lượng câu hỏi trung bình"
                  name="mediumQuestion"
                  type="number"
                  value={exam.mediumQuestion}
                  onChange={(e) => handleQuestionChange(e, "medium")}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Số lượng câu hỏi khó"
                  name="hardQuestion"
                  type="number"
                  value={exam.hardQuestion}
                  onChange={(e) => handleQuestionChange(e, "hard")}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ mb: 2 }}
                />
              </div>

              <div>
                <h4>Loại bài kiểm tra</h4>
                <FormGroup sx={{ mb: 2, flexDirection: "row", flexWrap: "nowrap" }}>
                  {["multiple-choice", "essay", "fill-in-the-blank", "checkbox"].map(
                    (questionType) => (
                      <FormControlLabel
                        key={questionType}
                        control={
                          <Checkbox
                            checked={exam.type?.includes(questionType)}
                            onChange={() => handleTypeChange(questionType)}
                            name={questionType}
                            color="primary"
                          />
                        }
                        style={{ display: "block", width: "50%" }}
                        label={getQuestionTypeLabel(questionType)}
                      />
                    )
                  )}
                </FormGroup>
              </div>


              <FormControl
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}

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
                    checked={exam.summary || false}
                    onChange={handleSummaryChange}
                    name="summary"
                    color="primary"
                  />
                }
                label="Bài kiểm tra chương"
                sx={{ mb: 2 }}
              />
              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateExam}
                  disabled={updating}
                  startIcon={updating ? <CircularProgress size={24} /> : null}
                >
                  {updating ? "Đang cập nhật..." : "Cập Nhật Bài Kiểm Tra"}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={onClose}
                  disabled={updating}
                >
                  Hủy Bỏ
                </Button>
              </Box>
            </Box>
            <ToastContainer />
          </Paper>
        </Box>
      </Dialog>
    );
  };

export const RequestAdminURL = RequireAdmin(EditExam);

export default EditExam;
