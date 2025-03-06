import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tab,
  Tabs,
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  Typography,
} from "@mui/material";
import { isTokenExpired } from "../../../../util/fucntion/auth";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../../../../util/fucntion/useRefreshToken";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ADMIN_ADD_QUESTION_TO_TEST_V2 } from "../../../../../api/api";
import { AdminLessonDTOList } from "../ExamList";
interface Question {
  id: number;
  content: string;
  instruction: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  result: string;
  resultCheck: string;
  deleted: boolean;
  level: string;
  type: string;
  accountId: number;
  courseId: number;
  topic: string;
}

interface Exam {
  id: number;
  title: string;
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

interface AddQuestionToExamProps {
  open: boolean;
  onClose: () => void;
  exam: Exam;
  lesson: AdminLessonDTOList[];
  accountId: string; // Thông tin bài kiểm tra
}

const AddQuestionToExam: React.FC<AddQuestionToExamProps> = ({
  open,
  onClose,
  exam,
  lesson,
  accountId,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [questionTest, setQuestionTest] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [selectedQuestionsChecked, setSelectedQuestionsChecked] = useState<Question[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const navigate = useNavigate(); // Khởi tạo navigate
  const refresh = useRefreshToken();
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
  const questionTypes = [
    "fill-in-the-blank",
    "essay",
    "checkbox",
    "multiple-choice",
  ];
  const [pagination, setPagination] = useState(
    questionTypes.map(() => ({ page: 0, rowsPerPage: 10 })) // Mặc định cho mỗi tab
  );

  useEffect(() => {
    if (open) {
      // Reset về trang đầu tiên
      const updatedPagination = pagination.map((p, index) =>
        index === selectedTab ? { ...p, page: 0 } : p
      );
      setPagination(updatedPagination);

      const { rowsPerPage } = updatedPagination[selectedTab];
      fetchQuestions(questionTypes[selectedTab], levelFilter, 0, rowsPerPage);
    }
  }, [open, searchTerm, levelFilter, selectedTab]);

  useEffect(() => {
    setPage(0);
  }, [open, searchTerm, levelFilter, selectedTab]);


  useEffect(() => {
    const initialTab = questionTypes.findIndex((type) => exam.type.includes(type));
    if (initialTab !== -1) {
      setSelectedTab(initialTab); // Đặt tab đầu tiên hợp lệ
    }
  }, [exam.type]);


  //Lấy ra câu hỏi theo yêu cầu
  const fetchQuestions = async (
    typeFilter: string,
    levelFilter: string,
    page: number,
    rowsPerPage: number
  ) => {
    let token = localStorage.getItem("authToken");

    // Kiểm tra và làm mới token nếu cần
    if (!token || isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }
    let topic_tmp = "";
    if (lesson.length !== 0) {

      topic_tmp = lesson[0].topic;

    }


    try {

      const levelMap: Record<string, number> = {
        Dễ: 1,
        Vừa: 2,
        Khó: 3,
      };
      const levelParam = levelFilter ? levelMap[levelFilter] : undefined;
      const params = new URLSearchParams({
        topic: topic_tmp,
        courseId: exam.courseId.toString(),
        accountId: accountId,
        ...(typeFilter && { type: typeFilter }),
        ...(levelFilter && { level: levelParam?.toString() }),
        ...(searchTerm && { content: searchTerm }),
        page: page.toString(),
        size: rowsPerPage.toString(),
      });

      const url = `${process.env.REACT_APP_SERVER_HOST}/api/questions/all-filter?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Kiểm tra trạng thái HTTP
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      // Phân tích dữ liệu JSON
      const data = await response.json();
      setQuestions(data.content || []); // Đảm bảo content không null
      setTotalQuestionsCount(data.totalElements || 0); // Đảm bảo totalElements không null
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Không thể tải dữ liệu câu hỏi!");
    }
  };


  useEffect(() => {
    //Lấy ra các question cũ của bài test.
    const fetchQuestionTest = async () => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }


      const url = `${process.env.REACT_APP_SERVER_HOST}/api/test-questions/questions/${exam.id}`;
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
        setQuestionTest(data);

      } catch (error) {
        console.error("Failed to fetch exams:", error);
      }
    };;
    fetchQuestionTest();

  }, [open, exam, lesson]);

  const handleChangePage = (tabIndex: number, newPage: number) => {
    setPagination((prev) =>
      prev.map((p, index) => (index === tabIndex ? { ...p, page: newPage } : p))
    );

    const { rowsPerPage } = pagination[tabIndex];
    fetchQuestions(questionTypes[tabIndex], levelFilter, newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (
    tabIndex: number,
    newRowsPerPage: number
  ) => {
    setPagination((prev) =>
      prev.map((p, index) =>
        index === tabIndex
          ? { ...p, rowsPerPage: newRowsPerPage, page: 0 } // Reset về trang đầu tiên
          : p
      )
    );

    fetchQuestions(questionTypes[tabIndex], levelFilter, 0, newRowsPerPage);
  };

  const handleSelectQuestionChecked = (question: Question) => {
    setSelectedQuestionsChecked((prevSelected) => {
      const isAlreadySelected = prevSelected.some((q) => q.id === question.id);

      // Nếu đang bỏ chọn, cho phép thực hiện ngay
      if (isAlreadySelected) {
        return prevSelected.filter((q) => q.id !== question.id);
      }

      // Đếm số câu đã chọn theo từng độ khó
      const counts = countSelectedByDifficulty();

      // Kiểm tra nếu đã đạt giới hạn
      if (
        (question.level === "1" && counts.easy >= exam.easyQuestion) ||
        (question.level === "2" && counts.medium >= exam.mediumQuestion) ||
        (question.level === "3" && counts.hard >= exam.hardQuestion)
      ) {
        // Hiển thị thông báo lỗi nếu vượt quá giới hạn
        toast.error("Đã đạt giới hạn số lượng câu hỏi được phép chọn!", {
          position: "top-right",
          autoClose: 3000,
        });
        return prevSelected; // Không thay đổi danh sách
      }


      // Nếu chưa đạt giới hạn, thêm câu hỏi vào danh sách
      return [...prevSelected, question];
    });
  };

  const handleAddQuestions = async () => {
    // console.log(selectedQuestionsChecked);
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
      const response = await fetch(`${ADMIN_ADD_QUESTION_TO_TEST_V2}/${exam.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedQuestionsChecked), // Send the array of question IDs
      });

      if (!response.ok) throw new Error("Failed to add questions to test");


      toast.success("Thêm câu hỏi vào bài kiểm tra thành công!", {
        position: "top-right",
        autoClose: 2000,
        onClose,
      });


    } catch (error) {
      console.error("Thêm câu hỏi thất bại:", error);
      toast.error("Đã xảy ra lỗi khi thêm câu hỏi.");
    }
  };

  const countSelectedByDifficulty = () => {
    const counts = { easy: 0, medium: 0, hard: 0 };

    questionTest.forEach((question) => {
      if (question.level === "1") counts.easy++;
      else if (question.level === "2") counts.medium++;
      else if (question.level === "3") counts.hard++;
    });


    selectedQuestionsChecked.forEach((question) => {
      if (question.level === "1") counts.easy++;
      else if (question.level === "2") counts.medium++;
      else if (question.level === "3") counts.hard++;
    });
    return counts;
  };

  // const difficultyCounts = countQuestionsByDifficulty();
  // const difficultyCounts = countQuestionsByDifficulty();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth style={{ minHeight: "500px" }}>
      <DialogTitle>Thêm câu hỏi vào bài kiểm tra</DialogTitle>
      <DialogContent style={{ minHeight: "500px" }}>

        <Box mb={2} p={2} border="1px solid #ddd" borderRadius="8px" bgcolor="#f9f9f9">
          <Typography variant="h6">Thông tin bài kiểm tra</Typography>
          <Box display="flex" flexDirection="column" mt={1}>
            <Typography>
              <strong>Tên bài kiểm tra:</strong> {exam.title}
            </Typography>
            <Typography>
              <strong>Tổng số câu hỏi:</strong> {exam.totalQuestion}
            </Typography>
            <Typography>
              <strong>Số câu dễ:</strong> {countSelectedByDifficulty().easy}/{exam.easyQuestion}
            </Typography>
            <Typography>
              <strong>Số câu vừa:</strong> {countSelectedByDifficulty().medium}/{exam.mediumQuestion}
            </Typography>
            <Typography>
              <strong>Số câu khó:</strong> {countSelectedByDifficulty().hard}/{exam.hardQuestion}
            </Typography>
            <Typography>
              <strong>Các loại câu hỏi:</strong> {exam.type.join(", ")}
            </Typography>
            <Typography>
              <strong>Chủ đề bài học:</strong>{" "}
              {exam.summary && exam.lessonId === null ? "Tất cả" : lesson[0]?.topic || "Chưa có dữ liệu"}
            </Typography>
          </Box>
        </Box>
        {/* Tab Header */}
        <Tabs
          value={selectedTab}
          onChange={(event, newValue) => {
            if (exam.type.includes(questionTypes[newValue])) {
              setSelectedTab(newValue);
            }
          }}
          variant="scrollable"
        >
          {questionTypes.map((type, index) => (
            <Tab
              key={type}
              label={
                type === "fill-in-the-blank"
                  ? "Điền khuyết"
                  : type === "essay"
                    ? "Tự luận"
                    : type === "checkbox"
                      ? "Checkbox"
                      : "Trắc nghiệm"
              }
              disabled={!exam.type.includes(type)}
            />
          ))}
        </Tabs>



        <Box display="flex" justifyContent="flex-start" mt={2} mb={2}>
          <TextField
            label="Tìm kiếm câu hỏi"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination((prev) =>
                prev.map((p, index) =>
                  index === selectedTab ? { ...p, page: 0 } : p
                )
              );

              const { rowsPerPage } = pagination[selectedTab];
              fetchQuestions(questionTypes[selectedTab], levelFilter, 0, rowsPerPage);
            }}
          />



          <Box>
            <Button
              variant={levelFilter === "" ? "contained" : "outlined"}
              onClick={() => setLevelFilter("")}
              sx={{ mr: 1 }}
            >
              Tất cả
            </Button>
            <Button
              variant={levelFilter === "Dễ" ? "contained" : "outlined"}
              onClick={() => setLevelFilter("Dễ")}
              sx={{ mr: 1 }}
            >
              Dễ
            </Button>
            <Button
              variant={levelFilter === "Vừa" ? "contained" : "outlined"}
              onClick={() => setLevelFilter("Vừa")}
              sx={{ mr: 1 }}
            >
              Vừa
            </Button>
            <Button
              variant={levelFilter === "Khó" ? "contained" : "outlined"}
              onClick={() => setLevelFilter("Khó")}
            >
              Khó
            </Button>
          </Box>

        </Box>

        <Box>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestionsChecked.length === questions.length}
                          onChange={() => {
                            if (selectedQuestionsChecked.length > 0) {
                              // Bỏ chọn tất cả
                              setSelectedQuestionsChecked([]);
                            } else {
                              // Chọn tất cả với ràng buộc theo thứ tự và giới hạn
                              const counts = countSelectedByDifficulty(); // Đếm số câu đã chọn theo mức độ khó
                              const validQuestions: Question[] = []; // Danh sách câu hỏi hợp lệ
                              let isExceedingLimit = false; // Đánh dấu khi đạt giới hạn

                              questions.forEach((question) => {
                                if (isExceedingLimit || validQuestions.some((q) => q.id === question.id)) {
                                  return; // Bỏ qua nếu đã đạt giới hạn hoặc câu hỏi đã chọn
                                }

                                if (
                                  (question.level === "1" && counts.easy >= exam.easyQuestion) ||
                                  (question.level === "2" && counts.medium >= exam.mediumQuestion) ||
                                  (question.level === "3" && counts.hard >= exam.hardQuestion)
                                ) {
                                  isExceedingLimit = true; // Đánh dấu đạt giới hạn
                                  return;
                                }

                                // Thêm câu hỏi vào danh sách hợp lệ
                                validQuestions.push(question);

                                // Cập nhật số lượng đã chọn theo mức độ khó
                                if (question.level === "1") counts.easy++;
                                else if (question.level === "2") counts.medium++;
                                else if (question.level === "3") counts.hard++;
                              });

                              if (isExceedingLimit) {
                                toast.error("Đã đạt giới hạn số lượng câu hỏi được phép chọn!", {
                                  position: "top-right",
                                  autoClose: 3000,
                                });
                              }

                              // Cập nhật danh sách câu hỏi đã chọn
                              setSelectedQuestionsChecked(validQuestions);
                            }
                          }}
                          indeterminate={
                            selectedQuestionsChecked.length > 0 &&
                            selectedQuestionsChecked.length < questions.length
                          }
                        />
                      </TableCell>


                      <TableCell>ID</TableCell>
                      {questionTypes[selectedTab] === "fill-in-the-blank" ? (
                        <>
                          <TableCell>Nội dung</TableCell>
                          <TableCell>Từ khuyết</TableCell>
                          <TableCell>Chủ đề</TableCell>
                        </>
                      ) : questionTypes[selectedTab] === "essay" ? (
                        <>
                          <TableCell>Nội dung</TableCell>
                          <TableCell>Hướng dẫn</TableCell>
                          <TableCell>Chủ đề</TableCell>
                        </>
                      ) : questionTypes[selectedTab] === "multiple-choice" ? (
                        <>
                          <TableCell>Nội dung</TableCell>
                          <TableCell>Đáp án A</TableCell>
                          <TableCell>Đáp án B</TableCell>
                          <TableCell>Đáp án C</TableCell>
                          <TableCell>Đáp án D</TableCell>
                          <TableCell>Đáp án đúng</TableCell>
                          <TableCell>Chủ đề</TableCell>
                        </>
                      ) : questionTypes[selectedTab] === "checkbox" ? (
                        <>
                          <TableCell>Nội dung</TableCell>
                          <TableCell>Lựa chọn 1</TableCell>
                          <TableCell>Lựa chọn 2</TableCell>
                          <TableCell>Lựa chọn 3</TableCell>
                          <TableCell>Lựa chọn 4</TableCell>
                          <TableCell>Đáp án đúng</TableCell>
                          <TableCell>Chủ đề</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>Nội dung</TableCell>
                          <TableCell>Đáp án A</TableCell>
                          <TableCell>Đáp án B</TableCell>
                          <TableCell>Đáp án C</TableCell>
                          <TableCell>Đáp án D</TableCell>
                          <TableCell>Đáp án đúng</TableCell>
                          <TableCell>Chủ đề</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((question, index) => {
                      const isAlreadyInTest = questionTest.some((q) => q.id === question.id);

                      return (
                        <TableRow
                          key={question.id}
                          style={{
                            backgroundColor: selectedQuestionsChecked.some((q) => q.id === question.id)
                              ? "#BBDEFB"
                              : index % 2 === 0
                                ? "#FFFFFF"
                                : "#F5F5F5",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = selectedQuestionsChecked.some(
                            (q) => q.id === question.id
                          )
                            ? "#BBDEFB"
                            : "#E3F2FD")
                          }
                          onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = selectedQuestionsChecked.some(
                            (q) => q.id === question.id
                          )
                            ? "#BBDEFB"
                            : index % 2 === 0
                              ? "#FFFFFF"
                              : "#F5F5F5")
                          }
                        >
                          <TableCell>
                            <Checkbox
                              checked={
                                selectedQuestionsChecked.some((q) => q.id === question.id) || isAlreadyInTest
                              }
                              onChange={() => {
                                if (!questionTest.some((q) => q.id === question.id)) {
                                  handleSelectQuestionChecked(question);
                                }
                              }}
                            // disabled={questionTest.some((q) => q.id === question.id)} // Disable nếu câu hỏi đã có trong bài kiểm tra
                            />

                          </TableCell>

                          <TableCell>{question.id}</TableCell>
                          {questionTypes[selectedTab] === "fill-in-the-blank" ? (
                            <>
                              <TableCell>{question.content}</TableCell>
                              <TableCell>{question.result}</TableCell>
                              <TableCell>{question.topic}</TableCell>
                            </>
                          ) : questionTypes[selectedTab] === "essay" ? (
                            <>
                              <TableCell>{question.content}</TableCell>
                              <TableCell>{question.instruction}</TableCell>
                              <TableCell>{question.topic}</TableCell>
                            </>
                          ) : questionTypes[selectedTab] === "multiple-choice" ? (
                            <>
                              <TableCell>{question.content}</TableCell>
                              <TableCell>{question.optionA}</TableCell>
                              <TableCell>{question.optionB}</TableCell>
                              <TableCell>{question.optionC}</TableCell>
                              <TableCell>{question.optionD}</TableCell>
                              <TableCell>{question.result}</TableCell>
                              <TableCell>{question.topic}</TableCell>
                            </>
                          ) : questionTypes[selectedTab] === "checkbox" ? (
                            <>
                              <TableCell>{question.content}</TableCell>
                              <TableCell>{question.optionA}</TableCell>
                              <TableCell>{question.optionB}</TableCell>
                              <TableCell>{question.optionC}</TableCell>
                              <TableCell>{question.optionD}</TableCell>
                              <TableCell>{question.result}</TableCell>
                              <TableCell>{question.topic}</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{question.content}</TableCell>
                              <TableCell>{question.optionA}</TableCell>
                              <TableCell>{question.optionB}</TableCell>
                              <TableCell>{question.optionC}</TableCell>
                              <TableCell>{question.optionD}</TableCell>
                              <TableCell>{question.result}</TableCell>
                              <TableCell>{question.topic}</TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>

                </Table>

              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={totalQuestionsCount}
                rowsPerPage={pagination[selectedTab].rowsPerPage}
                page={pagination[selectedTab].page}
                onPageChange={(event, newPage) =>
                  handleChangePage(selectedTab, newPage)
                }
                onRowsPerPageChange={(event) =>
                  handleChangeRowsPerPage(
                    selectedTab,
                    parseInt(event.target.value, 10)
                  )
                }
                labelRowsPerPage="Số hàng mỗi trang:"
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button
          onClick={handleAddQuestions}
          color="primary"
          disabled={selectedQuestionsChecked.length === 0}
        >
          Thêm câu hỏi
        </Button>
      </DialogActions>
      <ToastContainer />
    </Dialog>
  );
};

export default AddQuestionToExam;
