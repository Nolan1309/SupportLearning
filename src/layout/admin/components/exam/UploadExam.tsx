import React, { useState, useEffect } from "react";
import {
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  TablePagination,
  CircularProgress,
  Paper,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
} from "@mui/material";

import CloudUpload from "@mui/icons-material/CloudUpload";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADMIN_ADD_QUESTION_TO_TEST,
  ADMIN_QUESTION_OF_TEST,
  ADMIN_GET_QUESTION,
  ADMIN_GET_ONE_TEST,
} from "../../../../api/api";
import RequireAdmin from "../../../DOM/RequireAdmin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./uploadExam.module.scss";

interface Question {
  id: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  result: string;
  instruction: string;
  result_check: string;
  deleted: boolean;
}
interface Exam {
  id: number;
  title: string;
  description: string;
  total_question: number;
  created_at: string;
  chapter_id?: number; // ID của chương sẽ được cập nhật từ Select
  course_id?: number; // ID của khóa học sẽ được cập nhật từ Select
  isSummary?: boolean;
}

const UploadExam: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Test ID from URL
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0); // Current page for "Danh Sách Câu Hỏi"
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0); // Total question count
  const [examPage, setExamPage] = useState(0); // Current page for "Câu Hỏi Trong Đề"
  const [examRowsPerPage, setExamRowsPerPage] = useState(50); // Rows per page for "Câu Hỏi Trong Đề"
  const [examTotalCount, setExamTotalCount] = useState(0); // Total exam question count
  const [searchTerm, setSearchTerm] = useState<string>(""); // Search term
  const [selectAll, setSelectAll] = useState<boolean>(false); // State for Select All
  const [isAdding, setIsAdding] = useState<boolean>(false); // State for adding questions
  const [openConfirm, setOpenConfirm] = useState<boolean>(false); // State for confirmation dialog
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [exam, setExam] = useState<Exam | null>(null);
  // Function to fetch all questions with pagination
  const fetchQuestions = async () => {
    try {
      const response = await fetch("${process.env.REACT_APP_SERVER_HOST}/api/questions/all-list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch questions");

      const data = await response.json();
      setQuestions(data);
      // setTotalQuestionsCount(data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      toast.error("Không thể tải danh sách câu hỏi.");
    }
  };

  const fetchExam = async () => {
    try {
      const response = await fetch(`${ADMIN_GET_ONE_TEST}/${id}`, {
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
      setExam({
        id: data.id,
        title: data.title,
        description: data.description,
        total_question: data.totalQuestion,
        created_at: data.createdAt,
        chapter_id: data.chapterId,
        course_id: data.courseId,
        isSummary: data.isSummary,
      });
    } catch (error) {
      console.error("Failed to fetch exam:", error);
      toast.error("Không thể tải dữ liệu bài kiểm tra.");
    } finally {
      setLoading(false);
    }
  };
  // Function to fetch exam-specific questions with pagination
  const fetchExamQuestions = async () => {
    try {
      const response = await fetch(
        `${ADMIN_QUESTION_OF_TEST(Number(id))}?page=${examPage}&size=${examRowsPerPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch exam questions");

      const data = await response.json();
      setExamQuestions(data.content || []);
      setExamTotalCount(data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch exam questions:", error);
      toast.error("Không thể tải danh sách câu hỏi trong đề.");
    }
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchQuestions(), fetchExamQuestions(), fetchExam()]);
      setLoading(false);
    };

    fetchData();
  }, [page, rowsPerPage, examPage, examRowsPerPage, token, id]);

  // Handlers for pagination
  const handlePageChange = (event: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to the first page
  };

  const handleExamPageChange = (event: unknown, newPage: number) =>
    setExamPage(newPage);
  const handleExamRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setExamRowsPerPage(parseInt(event.target.value, 10));
    setExamPage(0); // Reset exam page to the first page
  };

  // Handler for search/filter
  const handleFilter = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setSearchTerm(e.target.value.toLowerCase());

  // Handlers to select/deselect questions
  const handleSelectQuestion = (id: number) => {
    const selected = questions.find((q) => q.id === id);
    if (selected && !examQuestions.some((q) => q.id === id)) {
      setExamQuestions((prev) => [...prev, selected]);
    }
  };

  const handleDeselectQuestion = (id: number) => {
    setExamQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Handler for Select All
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      const newSelected = questions.filter(
        (q) => !examQuestions.some((eq) => eq.id === q.id)
      );
      setExamQuestions((prev) => [...prev, ...newSelected]);
    } else {
      setExamQuestions((prev) =>
        prev.filter((q) => !questions.some((question) => question.id === q.id))
      );
    }
  };

  // Handler to open confirmation dialog
  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  // Handler to close confirmation dialog
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  // Handler to confirm adding questions
  const handleConfirmAdd = async () => {
    setOpenConfirm(false);
    setIsAdding(true);

    if (examQuestions.length > exam?.total_question!) {
      toast.warning("Số câu hỏi không được vượt quá tổng số câu đề tài!.");
      setIsAdding(false);
      return;
    }

    try {
      const response = await fetch(`${ADMIN_ADD_QUESTION_TO_TEST}/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examQuestions.map((q) => q.id)), // Send the array of question IDs
      });

      if (!response.ok) throw new Error("Failed to add questions to test");

      toast.success("Thêm câu hỏi vào bài kiểm tra thành công.");
      fetchExamQuestions();
      setTimeout(() => {
        window.location.href = '/admin/bai-kiem-tra';
      }, 2000);

    } catch (error) {
      console.error("Thêm câu hỏi thất bại:", error);
      toast.error("Đã xảy ra lỗi khi thêm câu hỏi.");
    } finally {
      setIsAdding(false);
    }
  };

  // Display loading spinner while fetching data
  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress />
      </div>
    );

  // Filter questions based on search term
  const filteredQuestions = questions.filter((q) =>
    q.content.toLowerCase().includes(searchTerm)
  );

  return (
    <div className={styles.uploadExamContainer}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h5" component="h2" gutterBottom>
          Thêm Câu Hỏi Vào Bài Kiểm Tra
        </Typography>

        {/* Search Field */}
        <Box className={styles.searchContainer}>
          <TextField
            label="Tìm kiếm câu hỏi"
            onChange={handleFilter}
            variant="outlined"
            fullWidth
            size="small"
            margin="normal"

          />
        </Box>

        {/* Layout for Questions Tables */}
        <Box className={styles.tableContainer}>
          {/* Danh Sách Câu Hỏi */}
          <Box className={styles.questionsList}>
            <Typography variant="h6" gutterBottom>
              Danh Sách Câu Hỏi
            </Typography>
            <Table className={styles.table} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.selectAllCheckbox}>
                    <Checkbox
                      indeterminate={
                        examQuestions.length > 0 &&
                        examQuestions.length < filteredQuestions.length
                      }
                      checked={
                        filteredQuestions.length > 0 &&
                        examQuestions.length === filteredQuestions.length
                      }
                      onChange={handleSelectAll}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell className={styles.headerCell}>ID</TableCell>
                  <TableCell className={styles.headerCell}>Nội dung</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án A</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án B</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án C</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án D</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <Checkbox
                        checked={examQuestions.some(
                          (q) => q.id === question.id
                        )}
                        onChange={(e) => {
                          e.target.checked
                            ? handleSelectQuestion(question.id)
                            : handleDeselectQuestion(question.id);
                        }}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{question.id}</TableCell>
                    <TableCell>{question.content}</TableCell>
                    <TableCell>{question.optionA}</TableCell>
                    <TableCell>{question.optionB}</TableCell>
                    <TableCell>{question.optionC}</TableCell>
                    <TableCell>{question.optionD}</TableCell>
                    <TableCell>{question.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>

        <Box className={styles.tableContainer}>
          <Box className={styles.examQuestions}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" gutterBottom>
                Câu Hỏi Trong Đề (Tối đa : {exam?.total_question} câu)
              </Typography>
              <Typography variant="h6" gutterBottom style={{ marginRight: "20px" }}>
                Số câu đã chọn: {examQuestions.length}
              </Typography>
            </div>

            <Table className={styles.table} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.headerCell}>ID</TableCell>
                  <TableCell className={styles.headerCell}>Nội dung</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án A</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án B</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án C</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án D</TableCell>
                  <TableCell className={styles.headerCell}>Đáp án</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {examQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.id}</TableCell>
                    <TableCell>{question.content}</TableCell>
                    <TableCell>{question.optionA}</TableCell>
                    <TableCell>{question.optionB}</TableCell>
                    <TableCell>{question.optionC}</TableCell>
                    <TableCell>{question.optionD}</TableCell>
                    <TableCell>{question.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={examTotalCount}
              rowsPerPage={examRowsPerPage}
              page={examPage}
              onPageChange={handleExamPageChange}
              onRowsPerPageChange={handleExamRowsPerPageChange}
            /> */}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box className={styles.actionButtons}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenConfirm}
            disabled={examQuestions.length === 0 || isAdding}
            startIcon={isAdding ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {isAdding ? "Đang thêm..." : "Thêm Câu Hỏi Vào Đề Thi"}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/admin/bai-kiem-tra")}
            disabled={isAdding}
          >
            Quay lại
          </Button>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={openConfirm}
          onClose={handleCloseConfirm}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <DialogTitle id="confirm-dialog-title">Xác Nhận Thêm Câu Hỏi</DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              Bạn có chắc chắn muốn thêm {examQuestions.length} câu hỏi vào bài kiểm tra này không?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirm} color="secondary">
              Hủy
            </Button>
            <Button onClick={handleConfirmAdd} color="primary" autoFocus>
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notifications */}
        <ToastContainer />
      </Paper>
    </div>
  );
};

export const RequestAdminURL = RequireAdmin(UploadExam);

export default UploadExam;
