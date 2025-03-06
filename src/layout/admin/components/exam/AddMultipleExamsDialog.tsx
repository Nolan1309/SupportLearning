import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  ADMIN_ADD_LIST_TEST,
  ADMIN_ADD_TEST,
  ADMIN_GET_CHAPTERS_LIST,
} from "../../../../api/api";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminLessonDTOList } from "./ExamList";
interface QuestionType {
  label: string;
  selected: boolean;
}
interface Exam {
  title: string;
  description: string;
  totalQuestion: number;
  easyQuestion: number; // Số câu dễ
  mediumQuestion: number; // Số câu vừa
  hardQuestion: number; // Số câu khó
  chapterId?: number;
  courseId?: number;
  lessonId?: number;
  isSummary?: boolean;
  questionTypes: QuestionType[];
}
interface chapter {
  course_id: number;
  deleted: boolean;
  id: number;
  title: string;
}
const AddMultipleExamsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  courseId: string | null;
  chapters: chapter[]; // Giả sử danh sách chương được truyền vào
}> = ({ open, onClose, courseId, chapters }) => {

  // const [lessons, setLessons] = useState<AdminLessonDTOList[]>([]);
  const [lessonsByChapter, setLessonsByChapter] = useState<{ [key: number]: AdminLessonDTOList[] }>({});
  const [exams, setExams] = useState<Exam[]>([
    {
      title: "",
      description: "",
      totalQuestion: 0,
      easyQuestion: 0,
      mediumQuestion: 0,
      hardQuestion: 0,
      chapterId: undefined,
      courseId: Number(courseId),
      isSummary: false,
      questionTypes: [
        { label: "Trắc nghiệm", selected: false },
        { label: "Tự luận", selected: false },
        { label: "Điền khuyết", selected: false },
        { label: "Checkbox", selected: false },
      ],
    },
  ]);



  const [adding, setAdding] = useState(false);
  const navigate = useNavigate(); // Khởi tạo navigate
  const refresh = useRefreshToken();
  // Thêm item mới
  const handleAddItem = () => {
    setExams((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        totalQuestion: 0,
        easyQuestion: 0,
        mediumQuestion: 0,
        hardQuestion: 0,
        chapterId: undefined,
        courseId: Number(courseId),
        lessonId: undefined,
        isSummary: false,
        questionTypes: [
          { label: "Trắc nghiệm", selected: false },
          { label: "Tự luận", selected: false },
          { label: "Điền khuyết", selected: false },
          { label: "Checkbox", selected: false },
        ],
      },
    ]);
  };



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
      // setLessons(data);
      setLessonsByChapter((prev) => ({
        ...prev,
        [id]: data, // Lưu lessons riêng cho từng chapterId
      }));
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };


  // Xóa item
  const handleRemoveItem = (index: number) => {
    setExams((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (index: number, field: keyof Exam, value: any) => {
    setExams((prev) =>
      prev.map((exam, i) => {
        if (i === index) {
          const updatedExam = { ...exam, [field]: value };

          // Tính tổng số câu dễ, vừa và khó
          const totalCalculated =
            (updatedExam.easyQuestion || 0) +
            (updatedExam.mediumQuestion || 0) +
            (updatedExam.hardQuestion || 0);

          // Kiểm tra nếu tổng vượt quá tổng số câu hỏi
          if (
            field !== "totalQuestion" &&
            totalCalculated > updatedExam.totalQuestion
          ) {
            toast.error(
              "Tổng số câu dễ, vừa và khó không được vượt quá tổng số câu hỏi!",
              {
                position: "top-right",
                autoClose: 3000,
              }
            );
            return exam;
          }

          if (field === "totalQuestion" && value < totalCalculated) {
            toast.error(
              "Tổng số câu hỏi không được nhỏ hơn tổng số câu dễ, vừa và khó!",
              {
                position: "top-right",
                autoClose: 3000,
              }
            );
            return exam;
          }

          return updatedExam; // Cập nhật giá trị hợp lệ
        }
        return exam;
      })
    );
  };

  const handleQuestionTypeChange = (examIndex: number, typeIndex: number) => {
    setExams((prev) =>
      prev.map((exam, i) =>
        i === examIndex
          ? {
            ...exam,
            questionTypes: exam.questionTypes.map((type, j) =>
              j === typeIndex ? { ...type, selected: !type.selected } : type
            ),
          }
          : exam
      )
    );
  };

  const handleSubmit = async () => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }
    setAdding(true);
    try {
      const normalizedExams = exams.map((exam) => ({
        ...exam,
        courseId: courseId ? Number(courseId) : undefined, // Chuyển courseId thành số
        chapterId: exam.chapterId || undefined, // Xử lý chapterId hợp lệ
        lessonId: exam.lessonId || undefined,
        type: exam.questionTypes
          .filter((type) => type.selected) // Lấy các loại được chọn
          .map((type) => type.label.trim()), // Loại bỏ khoảng trắng
      }));
      // console.log(normalizedExams);
      const response = await fetch(ADMIN_ADD_LIST_TEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(normalizedExams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server Error");
      }
      const data = await response.text();
      if (response.status === 201) {
        toast.success("Thêm bài kiểm tra thành công!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        // return;
      } else if (response.status === 204) {
        toast.warning("Chương này đã có bài kiểm tra!");
        return;
      }
    } catch (error) {
      // console.error(error);
      toast.error("Đã xảy ra lỗi không mong muốn.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setAdding(false);
    }
  };
  const [selectedLesson, setSelectedLesson] = useState<string | undefined>(undefined);

  const [selectedChapter, setSelectedChapter] = useState<string | undefined>(undefined);

  const handleChapterChange = (index: number, e: SelectChangeEvent<string>) => {
    const chapterId = e.target.value === "" ? undefined : Number(e.target.value);

    setExams((prevExams) =>
      prevExams.map((exam, i) =>
        i === index ? { ...exam, chapterId, lessonId: undefined } : exam
      )
    );

    if (chapterId) {
      fetchLessonByChapter(chapterId); // Gọi API để tải bài học khi chọn chương
    }
  };

  const handleLessonChange = (index: number, e: SelectChangeEvent<string>) => {
    const lessonId = e.target.value === "" ? undefined : Number(e.target.value);

    setExams((prevExams) =>
      prevExams.map((exam, i) =>
        i === index ? { ...exam, lessonId } : exam
      )
    );
  };



  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Thêm Nhiều Bài Kiểm Tra</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3}>
          {exams.map((exam, index) => (
            <Box
              key={index}
              p={2}
              border="1px solid #ddd"
              borderRadius="8px"
              bgcolor="#f9f9f9"
              position="relative"
            >
              <Typography variant="h6" gutterBottom>
                Bài Kiểm Tra {index + 1}
              </Typography>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <TextField
                  label="Tiêu đề"
                  value={exam.title}
                  onChange={(e) =>
                    handleInputChange(index, "title", e.target.value)
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                  margin="normal"
                />

                <FormControl
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 0 }}
                >
                  <Select
                    displayEmpty
                    value={exam.chapterId?.toString() || ""}
                    onChange={(e) => handleChapterChange(index, e)}
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

                <FormControl fullWidth variant="outlined" sx={{ mb: 0 }}>
                  <Select
                    displayEmpty
                    value={exam.lessonId?.toString() || ""}
                    onChange={(e) => handleLessonChange(index, e)}
                    variant="outlined"
                    fullWidth
                  >
                    <MenuItem value="">
                      <em>{lessonsByChapter[exam.chapterId!]?.length ? "Chọn Bài Học" : "Không có bài học nào"}</em>
                    </MenuItem>
                    {lessonsByChapter[exam.chapterId!]?.map((lesson) => (
                      <MenuItem key={lesson.id} value={lesson.id.toString()}>
                        {lesson.lessonTitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </div>

              <Box
                display="flex"
                gap={2}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <TextField
                  label="Tổng số câu hỏi"
                  type="number"
                  value={exam.totalQuestion}
                  onChange={(e) =>
                    handleInputChange(index, "totalQuestion", +e.target.value)
                  }
                  fullWidth
                  inputProps={{ min: 0 }}
                  margin="normal"
                  style={{ marginTop: "8px" }}
                />
                <TextField
                  label="Số câu dễ"
                  type="number"
                  value={exam.easyQuestion}
                  onChange={(e) =>
                    handleInputChange(index, "easyQuestion", +e.target.value)
                  }
                  inputProps={{ min: 0 }}
                  fullWidth
                />
                <TextField
                  label="Số câu vừa"
                  type="number"
                  value={exam.mediumQuestion}
                  onChange={(e) =>
                    handleInputChange(index, "mediumQuestion", +e.target.value)
                  }
                  inputProps={{ min: 0 }}
                  fullWidth
                />
                <TextField
                  label="Số câu khó"
                  type="number"
                  value={exam.hardQuestion}
                  onChange={(e) =>
                    handleInputChange(index, "hardQuestion", +e.target.value)
                  }
                  inputProps={{ min: 0 }}
                  fullWidth
                />
              </Box>
              <TextField
                label="Mô tả"
                value={exam.description}
                onChange={(e) =>
                  handleInputChange(index, "description", e.target.value)
                }
                fullWidth
                multiline
                rows={2}
                margin="normal"
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <Typography variant="h6">Loại câu hỏi</Typography>
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={2}
                    justifyContent="space-between"
                  >
                    {exam.questionTypes.map((type, typeIndex) => (
                      <Box
                        key={type.label}
                        flexBasis="calc(50% - 8px)" // Mỗi item chiếm 50% chiều rộng, trừ khoảng cách
                        display="flex"
                        alignItems="center"
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={type.selected}
                              onChange={() =>
                                handleQuestionTypeChange(index, typeIndex)
                              }
                            />
                          }
                          label={type.label}
                        />
                      </Box>
                    ))}
                  </Box>
                </div>





                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exam.isSummary}
                      onChange={(e) =>
                        handleInputChange(index, "isSummary", e.target.checked)
                      }
                    />
                  }
                  label="Bài kiểm tra chương"
                />
              </div>

              <IconButton
                onClick={() => handleRemoveItem(index)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddItem}
          >
            Thêm Item
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={adding}
          >
            {adding ? "Đang thêm..." : "Thêm Bài Kiểm Tra"}
          </Button>
        </Box>
      </DialogContent>
      <ToastContainer />
    </Dialog>
  );
};

export default AddMultipleExamsDialog;
