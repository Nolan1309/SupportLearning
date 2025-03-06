import React, { useState, useEffect } from "react";
import {
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@material-ui/core";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
} from "@mui/material";
import { toast } from "react-toastify";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../../../util/fucntion/auth";

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

interface AddQuestionsToCourseProps {
  open: boolean;
  onClose: () => void;
  selectedQuestions: number[];
  fetchQuestions: () => void;
}

const AddQuestionsToCourse: React.FC<AddQuestionsToCourseProps> = ({
  open,
  onClose,
  selectedQuestions,
  fetchQuestions,
}) => {
  const [accountTeacher, setAccountTeacher] = useState<AccountTeacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  useEffect(() => {
    if (open) {
      fetchAccountTeachers();
      fetchCourseList();
    }
  }, [open]);

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
        "${process.env.REACT_APP_SERVER_HOST}/api/account/list-teacher-only",
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
        "${process.env.REACT_APP_SERVER_HOST}/api/courses/get-all-result-list",
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

  const handleTeacherChange = (teacherId: number) => {
    setSelectedTeacher(teacherId);
    const filtered = courses.filter((course) => course.accountId === teacherId);
    setFilteredCourses(filtered);
  };

  const handleAddToCourse = async (courseId: number) => {
    if (selectedQuestions.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một câu hỏi");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/copy-to-course`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            questionIds: selectedQuestions,
            targetCourseId: courseId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add questions to course");

      toast.success("Thêm câu hỏi vào khóa học thành công");
      fetchQuestions();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi thêm câu hỏi vào khóa học");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          minHeight: "500px",
          maxHeight: "600px",
        },
      }}
    >
      <DialogTitle>Thêm Câu Hỏi Vào Khóa Học</DialogTitle>
      <FormControl margin="normal" style={{ padding: "0px 40px" }}>
        <InputLabel style={{ marginBottom: "15px" }}>Chọn Giáo Viên</InputLabel>
        <Select
          value={selectedTeacher || ""}
          onChange={(e) => handleTeacherChange(Number(e.target.value))}
        >
          {accountTeacher.map((teacher) => (
            <MenuItem key={teacher.id} value={teacher.id}>
              {teacher.fullname}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <DialogContent>
        <List>
          {filteredCourses.map((course) => (
            <ListItem key={course.id}>
              <ListItemText primary={course.title} />
              <ListItemSecondaryAction>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddToCourse(course.id)}
                >
                  Thêm vào
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddQuestionsToCourse;
