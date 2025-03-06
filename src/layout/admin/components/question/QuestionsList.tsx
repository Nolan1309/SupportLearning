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
  DialogContent,
  DialogActions,
  Select,
  Checkbox,
  MenuItem,
  Paper,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { IconButton } from "@mui/material";
import {
  FaFolderOpen,
  FaFile,
  FaPlus,
  FaDownload,
  FaFileExcel,
  FaFileWord,
} from "react-icons/fa";
import { MoreVert } from "@mui/icons-material";
import { TablePagination } from "@material-ui/core";
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  PlaylistAdd,
} from "@material-ui/icons";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import styles from "./questionlist.module.scss";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  ADMIN_GET_QUESTION,
  ADMIN_DELETE_CHOOSE_QUESTION,
  ADMIN_DELETE_QUESTION,
  ADMIN_EXPORT_QUESTION_EXCEL,
  ADMIN_HIDE_QUESTION,
  ADMIN_SHOW_QUESTION,
  ADMIN_EXPORT_QUESTION_DOCX,
} from "../../../../api/api";
import RequireAdmin from "../../../DOM/RequireAdmin";
import UploadQuestions from "./UploadQuestions";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import classNames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddQuestion from "./AddQuestions";
import AddQuestionFill from "./AddQuestionFill";
import AddQuestionEssay from "./AddQuestionEssay";
import AddQuestionCheckbox from "./AddQuestionCheckbox";
import EditQuestionDialog from "./EditQuestionMultipleChoiceDialog";
import EditQuestionMultipleChoiceDialog from "./EditQuestionMultipleChoiceDialog";
import EditQuestionEssayDialog from "./EditQuestionEssayDialog";
import EditQuestionCheckboxDialog from "./EditQuestionCheckboxDialog";
import EditQuestionFillInTheBlankDialog from "./EditQuestionFillInTheBlankDialog";
import AddQuestionsToCourse from "./AddQuestionsToCourse";
import UploadQuestionDocx from "./UploadQuestionDocx";
import QuestionDetailDialog from "./QuestionDetailDialog";

export interface Question {
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

const QuestionsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showUploadDocx, setShowUploadDocx] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [selectedQuestionCheckbox, setSelectedQuestionCheckbox] = useState<
    number[]
  >([]);
  const [showDetails, setShowDetails] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [deleteMultipleConfirmationOpen, setDeleteMultipleConfirmationOpen] =
    useState(false);
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0); // Đếm tổng số câu hỏi
  const refresh = useRefreshToken();

  const token = localStorage.getItem("authToken");
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const [typeFilter, setTypeFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [accountTeacher, setAccountTeacher] = useState<AccountTeacher[]>([]);
  const [selectTeacher, setSelectTeacher] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourse, setFilteredCourse] = useState<Course[]>(courses);
  const [selectCourse, setSelectCourse] = useState("");

  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [isAddToCourseDialogOpen, setIsAddToCourseDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "manual" | "upload-docx" | "upload-excel"
  >("manual");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    const fetchQuestions = async () => {
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

      try {
        const params = new URLSearchParams({
          topic: "",
          courseId: selectCourse,
          accountId: selectTeacher,
          ...(typeFilter && { type: typeFilter }),
          ...(levelFilter && { level: levelFilter }),
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

    fetchQuestions();
  }, [
    page,
    rowsPerPage,
    token,
    selectCourse,
    selectTeacher,
    typeFilter,
    levelFilter,
    searchTerm,
  ]);

  useEffect(() => {
    fetchAccountTeachers();
    fetchCourseList();
  }, []);

  useEffect(() => {
    if (selectTeacher) {
      if (!selectCourse) {
        const courseForTeacher = courses.filter(
          (course) => course.accountId === parseInt(selectTeacher)
        );
        setFilteredCourse(courseForTeacher);
        setSelectCourse("");
        setTypeFilter("");
        setLevelFilter("");
      } else {
        const courseForTeacher = courses.filter(
          (course) => course.accountId === parseInt(selectTeacher)
        );
        if (courseForTeacher.length <= 0) {
          setFilteredCourse(courseForTeacher);
          setSelectCourse("");
          setTypeFilter("");
          setLevelFilter("");
        } else {
          setFilteredCourse(courseForTeacher);
          setTypeFilter("");
          setLevelFilter("");
        }
      }
    } else {
      setFilteredCourse(courses);
      setSelectCourse("");
      setTypeFilter("");
      setLevelFilter("");
    }
  }, [selectTeacher, courses]);
  useEffect(() => {
    if (selectCourse) {
      const courseDT = courses.find(
        (course) => course.id === parseInt(selectCourse)
      );

      if (courseDT) {
        const courseForTeacher = accountTeacher.filter(
          (teacher) => teacher.id === courseDT.accountId
        );
        if (courseForTeacher.length > 0) {
          setSelectTeacher(courseForTeacher[0].id.toString());
          setTypeFilter("");
          setLevelFilter("");
        }
      }
    }
  }, [selectCourse, courses]);

  useEffect(() => {
    setPage(0);
  }, [selectCourse, selectTeacher, typeFilter, levelFilter, searchTerm]);

  const handleOpenTypeSelectionDialog = () => {
    if (!selectCourse || selectCourse === "") {
      toast.error("Vui lòng chọn khóa học trước khi thêm câu hỏi!");
      return;
    }
    setOpenTypeDialog(true);
  };

  const handleTypeSelection = () => {
    // if (!selectedType) {
    //   toast.warning("Vui lòng chọn loại câu hỏi!");
    //   return;
    // }

    setDialogType(selectedType);
    setOpenTypeDialog(false);

    if (actionType === "upload-docx") {
      setShowUploadDocx(true); // Mở hộp thoại tải file DOCX
    } else if (actionType === "manual") {
      setOpenAddDialog(true); // Mở hộp thoại nhập câu hỏi thủ công
    } else if (actionType === "upload-excel") {
      setShowUpload(true);
    }
  };

  const handleCloseTypeSelectionDialog = () => {
    setOpenTypeDialog(false);
    setSelectedType("");
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  // Hàm mở hộp thoại xác nhận xóa một câu hỏi
  const handleOpenDeleteConfirmation = (id: number) => {
    setDeleteQuestionId(id);
    setDeleteConfirmationOpen(true);
  };

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

  // /api/account/list-teacher-only
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
      setCourses(data);
    } catch (error: any) {
      toast.error(error);
    }
  };

  // Hàm đóng hộp thoại xác nhận xóa một câu hỏi
  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
    setDeleteQuestionId(null);
  };

  // Hàm xóa câu hỏi sau khi người dùng xác nhận
  const handleDeleteConfirmed = () => {
    if (deleteQuestionId !== null) {
      const deleteUrl = ADMIN_DELETE_QUESTION(deleteQuestionId);

      fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            // Nếu xóa thành công, cập nhật lại danh sách câu hỏi
            setQuestions(questions.filter((q) => q.id !== deleteQuestionId));
          } else {
            console.error("Failed to delete question");
          }
        })
        .catch((error) => {
          console.error("Error deleting question:", error);
        })
        .finally(() => {
          handleCloseDeleteConfirmation();
        });
    }
  };
  const handleHide = async () => {
    try {
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

      // Kiểm tra xem đã chọn câu hỏi để xóa chưa
      if (deleteQuestionId === null) {
        toast.warning("Chưa chọn câu hỏi để xóa!");
        return;
      }

      const response = await fetch(
        `${ADMIN_HIDE_QUESTION}/${deleteQuestionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Kiểm tra phản hồi từ API
      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi khóa Bài kiểm tra");
      }

      // Cập nhật trạng thái của câu hỏi trong danh sách
      setQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question.id !== deleteQuestionId)
      );

      toast.success("Câu hỏi đã được xóa thành công", {
        autoClose: 2000, // 2 giây
      });
    } catch (error) {
      console.error("Error in handleHide:", error);
      toast.error("Vui lòng thử lại sau!");
    } finally {
      handleCloseDeleteConfirmation(); // Đóng hộp thoại xác nhận
    }
  };

  const handleShow = async (id: number) => {
    try {
      let token = localStorage.getItem("authToken");

      if (!token || isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const response = await fetch(`${ADMIN_SHOW_QUESTION}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi kích hoạt Bài kiểm tra");
      }

      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question.id === id ? { ...question, deleted: false } : question
        )
      );
      // alert();
      toast.success("Bài kiểm tra đã được khôi phục thành công");
    } catch (error) {
      // console.error("Error unlocking question:", error);
      toast.error("Vui lòng thử lại sau!");
    }
  };

  // Hàm mở hộp thoại xác nhận xóa nhiều câu hỏi
  const handleOpenDeleteMultipleConfirmation = () => {
    setDeleteMultipleConfirmationOpen(true);
  };

  // Hàm đóng hộp thoại xác nhận xóa nhiều câu hỏi
  const handleCloseDeleteMultipleConfirmation = () => {
    setDeleteMultipleConfirmationOpen(false);
  };

  // Hàm xóa nhiều câu hỏi sau khi người dùng xác nhận
  const handleDeleteMultipleConfirmed = () => {
    if (selectedQuestionCheckbox.length === 0) {
      return;
    }

    fetch(ADMIN_DELETE_CHOOSE_QUESTION, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedQuestionCheckbox), // Gửi danh sách các câu hỏi đã chọn
    })
      .then((response) => {
        if (response.ok) {
          // Nếu xóa thành công, cập nhật lại danh sách câu hỏi
          setQuestions(
            questions.filter((q) => !selectedQuestionCheckbox.includes(q.id))
          );
          setSelectedQuestionCheckbox([]);
        } else {
          console.error("Failed to delete selected questions");
        }
      })
      .catch((error) => {
        console.error("Error deleting selected questions:", error);
      })
      .finally(() => {
        handleCloseDeleteMultipleConfirmation();
      });
  };

  // Hàm thêm câu hỏi từ file (mở dialog)
  const handleAddQuestionClick = () => {
    if (!selectCourse || selectCourse === "") {
      toast.error("Vui lòng chọn khóa học trước khi thêm câu hỏi!");
      return;
    }
    if (!typeFilter || typeFilter === "") {
      toast.error("Vui lòng chọn loại câu hỏi!");
      return;
    }
    setShowUpload(true);
  };
  // Hàm thêm câu hỏi từ file (mở dialog)
  // const handleAddQuestionDocxClick = () => {
  //   if (!selectCourse || selectCourse === "") {
  //     toast.error("Vui lòng chọn khóa học trước khi thêm câu hỏi!");
  //     return;
  //   }
  //   if (!typeFilter || typeFilter === "") {
  //     toast.error("Vui lòng chọn loại câu hỏi!");
  //     return;
  //   }
  //   setShowUploadDocx(true);
  // };
  const handleAddFileClick = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectCourse || selectCourse === "") {
      toast.error("Vui lòng chọn khóa học trước khi thêm câu hỏi!");
      return;
    }
    // if (!typeFilter || typeFilter === "") {
    //   toast.error("Vui lòng chọn loại câu hỏi!");
    //   return;
    // }

    const file = event.target.files?.[0];
    if (!file) {
      toast.error("Vui lòng chọn một file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

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

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/upload-docx`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.text();
        toast.success("Thêm câu hỏi thành công!");
        // Gọi API để tải lại dữ liệu mới
        // fetchQuestions();
      } else {
        const error = await response.text();
        toast.error(`Lỗi: ${error}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Có lỗi xảy ra khi tải lên file!");
    }
  };

  // Hàm đóng dialog upload
  const handleCloseUpload = () => {
    setShowUpload(false);
  };

  const handleCloseUploadDocx = () => {
    setShowUploadDocx(false);
  };

  // Hàm chọn tất cả các câu hỏi
  const handleSelectAll = () => {
    if (selectedQuestionCheckbox.length === questions.length) {
      setSelectedQuestionCheckbox([]);
    } else {
      setSelectedQuestionCheckbox(questions.map((d) => d.id));
    }
  };

  // Hàm đóng dialog chi tiết câu hỏi
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedQuestion(null);
  };

  // Hàm sắp xếp câu hỏi theo chiều tăng hoặc giảm
  const handleSort = () => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);

    const sortedQuestions = [...questions].sort((a, b) => {
      if (a.content < b.content) return newSortDirection === "asc" ? -1 : 1;
      if (a.content > b.content) return newSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setQuestions(sortedQuestions);
  };

  // Hàm lọc câu hỏi theo danh mục
  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterCategory(event.target.value as string);
  };

  // // Hàm chỉnh sửa câu hỏi
  // const handleEdit = (question: Question) => {
  //   navigate(`/admin/edit-question/${question.id}`);
  // };

  // Hàm hiển thị chi tiết câu hỏi
  const handleViewDetails = (question: Question) => {
    setSelectedQuestion(question);
    setShowDetails(true);
  };
  const handleExportQuestions = () => {
    if (!selectCourse || selectCourse === "") {
      toast.error("Vui lòng chọn khóa học trước khi xuất câu hỏi!");
      return;
    }

    if (selectedQuestionCheckbox.length <= 0) {
      toast.error("Vui lòng chọn ít nhất một câu hỏi để xuất.");
      return;
    }
    fetch(ADMIN_EXPORT_QUESTION_EXCEL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedQuestionCheckbox),
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error("Failed to export questions");
        }
      })
      .then((blob) => {
        // Tạo URL cho file Excel để tải xuống
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "questions.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      })
      .catch((error) => {
        console.error("Error exporting questions:", error);
      });
  };
  const handleExportQuestionsDocx = () => {
    if (!selectCourse || selectCourse === "") {
      toast.error("Vui lòng chọn khóa học trước khi xuất câu hỏi!");
      return;
    }

    if (selectedQuestionCheckbox.length <= 0) {
      toast.error("Vui lòng chọn ít nhất một câu hỏi để xuất.");
      return;
    }
    fetch(ADMIN_EXPORT_QUESTION_DOCX, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedQuestionCheckbox),
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error("Failed to export questions");
        }
      })
      .then((blob) => {
        // Tạo URL cho file Excel để tải xuống
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "questions.docx");
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      })
      .catch((error) => {
        console.error("Error exporting questions:", error);
      });
  };
  const fetchUpdatedQuestions = async () => {
    try {
      // Gọi API lấy danh sách câu hỏi mới nhất
      const params = new URLSearchParams({
        topic: "",
        courseId: selectCourse,
        accountId: selectTeacher,
        ...(typeFilter && { type: typeFilter }),
        ...(levelFilter && { level: levelFilter }),
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

      if (!response.ok) {
        throw new Error("Failed to fetch updated questions");
      }

      const data = await response.json();
      setQuestions(data.content || []);
      setTotalQuestionsCount(data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching updated questions:", error);
      toast.error("Không thể tải lại danh sách câu hỏi!");
    }
  };
  const handleEdit = (question: Question) => {
    setDialogType(question.type); // Xác định loại dialog dựa vào type
    setSelectedQuestion(question); // Lưu thông tin câu hỏi được chọn
    setOpenEditDialog(true); // Mở dialog
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedQuestion(null); // Reset câu hỏi được chọn
  };

  // const handleCloseEditDialog = () => {
  //   setOpenEditDialog(false);
  //   setSelectedQuestionId(null);
  // };
  const handleOpenAddToCourseDialog = () => {
    if (selectedQuestionCheckbox.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một câu hỏi");
      return;
    }
    setIsAddToCourseDialogOpen(true);
  };

  // Close Dialog
  const handleCloseAddToCourseDialog = () => {
    setIsAddToCourseDialogOpen(false);
  };
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""; // Nếu không có nội dung, trả về chuỗi rỗng
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>Danh Sách Câu Hỏi Khóa Học</h2>
        <div className={styles.toolbar}>
          <div className={styles.toolbarleft}>
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
            <TextField
              select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              variant="outlined"
              size="small"
              className={styles.filterField}
              SelectProps={{
                displayEmpty: true,
              }}
            >
              <MenuItem value="">
                <em>Loại câu hỏi</em>
              </MenuItem>
              <MenuItem value="fill-in-the-blank">Điền khuyết</MenuItem>
              <MenuItem value="essay">Tự luận</MenuItem>
              <MenuItem value="multiple-choice">Trắc nghiệm</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
            </TextField>
            <TextField
              select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              variant="outlined"
              size="small"
              className={styles.filterField}
              SelectProps={{
                displayEmpty: true,
              }}
            >
              <MenuItem value="">
                <em>Mức độ câu hỏi</em>
              </MenuItem>
              <MenuItem value="1">Dễ</MenuItem>
              <MenuItem value="2">Trung bình</MenuItem>
              <MenuItem value="3">Khó</MenuItem>
            </TextField>
          </div>

          <div className={styles.actions}>
            <IconButton
              aria-controls={open ? "actions-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleMenuClick}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "20px", // Làm tròn nút
                backgroundColor: "rgb(37, 150, 190)",
                color: "#fff", // Màu chữ
                padding: "8px 16px", // Khoảng cách bên trong nút
                textTransform: "none", // Không viết hoa chữ
                fontSize: "14px", // Kích thước chữ
                "&:hover": {
                  backgroundColor: "#095f98",
                },
              }}
            >
              <span style={{ marginRight: "8px", display: "flex" }}>
                <MoreVert sx={{ color: "white" }} /> {/* Biểu tượng ba chấm */}
              </span>
              Mở rộng
            </IconButton>

            <Menu
              id="actions-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom", // Gắn vào phía dưới nút
                horizontal: "right", // Căn theo bên phải
              }}
              transformOrigin={{
                vertical: "top", // Menu bắt đầu từ trên
                horizontal: "right", // Menu căn theo bên phải
              }}
              PaperProps={{
                style: {
                  marginTop: 50, // Thêm khoảng cách giữa menu và nút ba chấm
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setActionType("manual");
                  setOpenTypeDialog(true);
                }}
              >
                <ListItemIcon>
                  <FaPlus size={20} /> {/* Biểu tượng Thêm Câu Hỏi */}
                </ListItemIcon>
                <ListItemText>Thêm Câu Hỏi</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setActionType("upload-excel");
                  setOpenTypeDialog(true);
                }}
              >
                <ListItemIcon>
                  <FaFileExcel size={20} style={{ color: "green" }} />
                </ListItemIcon>
                <ListItemText>Nhập từ Excel</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setActionType("upload-docx");
                  setOpenTypeDialog(true);
                }}
              >
                <ListItemIcon>
                  <FaFileWord size={20} style={{ color: "blue" }} />{" "}
                  {/* Biểu tượng Word */}
                </ListItemIcon>
                <ListItemText>Nhập từ Word (Docx)</ListItemText>
              </MenuItem>

              <MenuItem onClick={handleExportQuestions}>
                <ListItemIcon>
                  <FaDownload size={20} style={{ color: "green" }} />{" "}
                  {/* Biểu tượng Xuất Excel */}
                </ListItemIcon>
                <ListItemText>Xuất Excel</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleExportQuestionsDocx}>
                <ListItemIcon>
                  <FaDownload size={20} style={{ color: "blue" }} />{" "}
                  {/* Biểu tượng Xuất Word */}
                </ListItemIcon>
                <ListItemText>Xuất Word (Docx)</ListItemText>
              </MenuItem>
              {/* <MenuItem onClick={handleOpenAddToCourseDialog}>
                <ListItemIcon>
                  <FaFolderOpen size={20} style={{ color: "#ccb02f" }} />
                </ListItemIcon>
                <ListItemText>Thêm vào khóa khác</ListItemText>
              </MenuItem> */}
            </Menu>
          </div>
        </div>

        <div className={styles.tableContainer}>
          {questions.length === 0 ? (
            <div className={styles.noDataMessage}>
              <p>
                Không có câu hỏi nào ! Vui lòng chọn Giáo viên và khóa học !
              </p>
            </div>
          ) : (
            <Table className={styles.table} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.headerCell}>
                    <Checkbox
                      className={styles.checkbox}
                      checked={
                        selectedQuestionCheckbox.length === questions.length
                      }
                      onChange={handleSelectAll}
                      indeterminate={
                        selectedQuestionCheckbox.length > 0 &&
                        selectedQuestionCheckbox.length < questions.length
                      }
                    />
                  </TableCell>
                  <TableCell className={styles.headerCell}>ID</TableCell>
                  {typeFilter === "fill-in-the-blank" ? (
                    <>
                      <TableCell className={styles.headerCell}>
                        Câu điền khuyết
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Từ khuyết
                      </TableCell>

                    </>
                  ) : typeFilter === "essay" ? (
                    <>
                      <TableCell className={styles.headerCell}>
                        Câu hỏi tự luận
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Hướng dẫn
                      </TableCell>
                    </>
                  ) : typeFilter === "multiple-choice" ? (
                    <>
                      <TableCell className={styles.headerCell}>
                        Câu hỏi
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án A
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án B
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án C
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án D
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án đúng
                      </TableCell>
                    </>
                  ) : typeFilter === "checkbox" ? (
                    <>
                      <TableCell className={styles.headerCell}>
                        Câu hỏi checkbox
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Lựa chọn 1
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Lựa chọn 2
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Lựa chọn 3
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Lựa chọn 4
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án đúng
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className={styles.headerCell}>
                        Câu hỏi
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án A
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án B
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án C
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án D
                      </TableCell>
                      <TableCell className={styles.headerCell}>
                        Đáp án đúng
                      </TableCell>
                    </>
                  )}
                  <TableCell className={styles.headerCell}>Thể loại</TableCell>
                  <TableCell className={styles.headerCell}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.map((question, index) => (
                  <TableRow
                    key={question.id}
                    className={
                      selectedQuestionCheckbox.includes(question.id)
                        ? "selected"
                        : ""
                    }
                    style={{
                      fontFamily: "Arial, sans-serif",
                      cursor: "pointer", // Thay đổi con trỏ chuột
                      backgroundColor: selectedQuestionCheckbox.includes(
                        question.id
                      )
                        ? "#BBDEFB" // Màu khi hàng được chọn
                        : index % 2 === 0
                          ? "#FFFFFF" // Hàng lẻ: Trắng
                          : "#F5F5F5", // Hàng chẵn: Xám nhạt
                    }}
                    onMouseEnter={
                      (e) =>
                      (e.currentTarget.style.backgroundColor =
                        selectedQuestionCheckbox.includes(question.id)
                          ? "#BBDEFB" // Giữ màu nếu đã chọn
                          : "#E3F2FD") // Hover: Xanh nhạt
                    }
                    onMouseLeave={
                      (e) =>
                      (e.currentTarget.style.backgroundColor =
                        selectedQuestionCheckbox.includes(question.id)
                          ? "#BBDEFB" // Giữ màu nếu đã chọn
                          : index % 2 === 0
                            ? "#FFFFFF" // Hàng lẻ
                            : "#F5F5F5") // Hàng chẵn
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedQuestionCheckbox.includes(question.id)}
                        onChange={() => {
                          setSelectedQuestionCheckbox((prevSelected) =>
                            prevSelected.includes(question.id)
                              ? prevSelected.filter((id) => id !== question.id)
                              : [...prevSelected, question.id]
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>{question.id}</TableCell>
                    {typeFilter === "fill-in-the-blank" ? (
                      <>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.content}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.result}
                        </TableCell>
                      </>
                    ) : typeFilter === "essay" ? (
                      <>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.content}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.instruction}
                        </TableCell>
                      </>
                    ) : typeFilter === "multiple-choice" ? (
                      <>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.content}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.optionA}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.optionB}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.optionC}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.optionD}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.result}
                        </TableCell>
                      </>
                    ) : typeFilter === "checkbox" ? (
                      <>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.content}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.optionA}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.optionB}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.optionC}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.optionD}
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {question.result}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          <div title={question.content}>
                            {truncateText(question.content, 70)}
                          </div>
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          <div title={question.optionA}>
                            {truncateText(question.optionA, 20)}
                          </div>
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          <div title={question.optionB}>
                            {truncateText(question.optionB, 20)}
                          </div>
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          <div title={question.optionC}>
                            {truncateText(question.optionC, 20)}
                          </div>
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          <div title={question.optionD}>
                            {truncateText(question.optionD, 20)}
                          </div>
                        </TableCell>
                        <TableCell
                          onClick={() => handleViewDetails(question)}
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          <div title={question.result}>
                            {truncateText(question.result, 20)}
                          </div>
                        </TableCell>
                      </>
                    )}
                    <TableCell style={{ fontFamily: "Arial, sans-serif" }}>
                      {question.type === "essay" && "Tự luận"}
                      {question.type === "multiple-choice" && "Trắc nghiệm"}
                      {question.type === "fill-in-the-blank" && "Điền khuyết"}
                      {question.type === "checkbox" && "Checkbox"}
                    </TableCell>

                    <TableCell>
                      {/* <IconButton onClick={() => handleViewDetails(question)}>
                        <Visibility />
                      </IconButton> */}
                      <IconButton
                        onClick={() => handleEdit(question)}
                        sx={{ color: "#4CAF50" }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          handleOpenDeleteConfirmation(question.id)
                        }
                        sx={{ color: "#F44336" }}
                      >
                        <Delete />
                      </IconButton>
                      {/* {question.deleted ? (
                        <IconButton onClick={() => handleShow(question.id)}>
                          <ToggleOff />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => handleHide(question.id)}>
                          <ToggleOn />
                        </IconButton>
                      )} */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <TablePagination
          rowsPerPageOptions={[100, 200, 500]}
          count={totalQuestionsCount} // Tổng số câu hỏi
          rowsPerPage={rowsPerPage}
          page={page} // Trang hiện tại
          onPageChange={(event, newPage) => {
            if (newPage !== page) {
              setPage(newPage); // Cập nhật trang hiện tại
            }
          }}
          labelRowsPerPage="Số hàng mỗi trang:"
          onRowsPerPageChange={(event) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            setRowsPerPage(newRowsPerPage); // Cập nhật số câu hỏi mỗi trang
            setPage(0);
          }}
        />

        <Dialog open={openTypeDialog} onClose={handleCloseTypeSelectionDialog}>
          <DialogTitle>Chọn Loại Câu Hỏi</DialogTitle>
          <DialogContent>
            <RadioGroup
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <FormControlLabel
                value="multiple-choice"
                control={<Radio />}
                label="Câu hỏi trắc nghiệm"
              />
              <FormControlLabel
                value="essay"
                control={<Radio />}
                label="Câu hỏi tự luận"
              />
              <FormControlLabel
                value="fill-in-the-blank"
                control={<Radio />}
                label="Câu hỏi điền khuyết"
              />
              <FormControlLabel
                value="checkbox"
                control={<Radio />}
                label="Câu hỏi checkbox"
              />
              {actionType === "upload-docx" && (
                <FormControlLabel
                  value="mixed"
                  control={<Radio />}
                  label="Câu hỏi hỗn hợp"
                />
              )}
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTypeSelectionDialog} color="primary">
              Hủy
            </Button>
            <Button onClick={handleTypeSelection} color="primary">
              Tiếp tục
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {dialogType === "multiple-choice" && (
            <AddQuestion
              onClose={() => {
                setOpenAddDialog(false);
                fetchUpdatedQuestions();
              }}
              courseId={selectCourse}
              accountId={selectTeacher}
              type={dialogType}
            />
          )}
          {dialogType === "essay" && (
            <AddQuestionEssay
              onClose={() => {
                setOpenAddDialog(false);
                fetchUpdatedQuestions();
              }}
              courseId={selectCourse}
              accountId={selectTeacher}
              type={dialogType}
            />
          )}
          {dialogType === "fill-in-the-blank" && (
            <AddQuestionFill
              onClose={() => {
                setOpenAddDialog(false);
                fetchUpdatedQuestions();
              }}
              courseId={selectCourse}
              accountId={selectTeacher}
              type={dialogType}
            />
          )}
          {dialogType === "checkbox" && (
            <AddQuestionCheckbox
              onClose={() => {
                setOpenAddDialog(false);
                fetchUpdatedQuestions();
              }}
              courseId={selectCourse}
              accountId={selectTeacher}
              type={dialogType}
            />
          )}
        </Dialog>

        <Dialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          maxWidth="md"
          fullWidth
        >
          {dialogType === "multiple-choice" && selectedQuestion && (
            <EditQuestionMultipleChoiceDialog
              open={openEditDialog}
              question={selectedQuestion}
              onClose={handleCloseEditDialog}
              fetchQuestions={fetchUpdatedQuestions}
            />
          )}
          {dialogType === "fill-in-the-blank" && selectedQuestion && (
            <EditQuestionFillInTheBlankDialog
              question={selectedQuestion}
              onClose={handleCloseEditDialog}
              fetchQuestions={fetchUpdatedQuestions}
              open={openEditDialog}
            />
          )}
          {dialogType === "essay" && selectedQuestion && (
            <EditQuestionEssayDialog
              question={selectedQuestion}
              onClose={handleCloseEditDialog}
              fetchQuestions={fetchUpdatedQuestions}
              open={openEditDialog}
            />
          )}
          {dialogType === "checkbox" && selectedQuestion && (
            <EditQuestionCheckboxDialog
              question={selectedQuestion}
              onClose={handleCloseEditDialog}
              fetchQuestions={fetchUpdatedQuestions}
              open={openEditDialog}
            />
          )}
        </Dialog>

        <AddQuestionsToCourse
          open={isAddToCourseDialogOpen}
          onClose={handleCloseAddToCourseDialog}
          selectedQuestions={selectedQuestionCheckbox}
          fetchQuestions={fetchUpdatedQuestions}
        />

        <QuestionDetailDialog
          open={showDetails}
          onClose={handleCloseDetails}
          selectedQuestion={selectedQuestion}
        />

        {/* Dialog xác nhận xóa một câu hỏi */}
        <Dialog
          open={deleteConfirmationOpen}
          onClose={handleCloseDeleteConfirmation}
        >
          <DialogTitle>Xác Nhận Xóa</DialogTitle>
          <DialogContent>
            <p>Bạn có chắc chắn muốn xóa câu hỏi này không?</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteConfirmation} color="primary">
              Hủy
            </Button>
            <Button onClick={handleHide} color="secondary">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog xác nhận xóa nhiều câu hỏi */}
        <Dialog
          open={deleteMultipleConfirmationOpen}
          onClose={handleCloseDeleteMultipleConfirmation}
        >
          <DialogTitle>Xác Nhận Xóa Nhiều Câu Hỏi</DialogTitle>
          <DialogContent>
            <p>Bạn có chắc chắn muốn xóa tất cả các câu hỏi đã chọn không?</p>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDeleteMultipleConfirmation}
              color="primary"
            >
              Hủy
            </Button>
            <Button onClick={handleDeleteMultipleConfirmed} color="secondary">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        <UploadQuestions
          open={showUpload}
          onClose={handleCloseUpload}
          onUploadSuccess={() => {
            fetch(ADMIN_GET_QUESTION(page, rowsPerPage), {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
              .then((response) => response.json())
              .then((data) => {
                const fetchedQuestions = data.content;
                setQuestions(fetchedQuestions);
                setTotalQuestionsCount(data.totalElements); // Cập nhật tổng số câu hỏi từ API
              })
              .catch((error) => {
                console.error("Error fetching questions:", error);
              });
          }}
          dialogType={dialogType}
          selectCourse={selectCourse}
          selectTeacher={selectTeacher}
        />
        <UploadQuestionDocx
          open={showUploadDocx}
          onClose={handleCloseUploadDocx}
          onUploadSuccess={() => {
            fetch(ADMIN_GET_QUESTION(page, rowsPerPage), {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
              .then((response) => response.json())
              .then((data) => {
                const fetchedQuestions = data.content;
                setQuestions(fetchedQuestions);
                setTotalQuestionsCount(data.totalElements); // Cập nhật tổng số câu hỏi từ API
              })
              .catch((error) => {
                console.error("Error fetching questions:", error);
              });
          }}
          dialogType={dialogType}
          selectCourse={selectCourse}
          selectTeacher={selectTeacher}
        />
      </div>
      <ToastContainer />
    </Paper>
  );
};
export const RequestAdminURL = RequireAdmin(QuestionsList);

export default QuestionsList;
