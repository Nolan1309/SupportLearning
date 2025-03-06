import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import { toast } from "react-toastify";

interface Question {
  id: number;
  content: string;
  result: string;
  level: string;
  type: string;
}

export interface OptionDTO {
  text: string; // Nội dung đáp án
  correct: boolean; // Đáp án đúng hay không
}
export interface OptionDTOV2 {
  text: string; // Nội dung đáp án
  isCorrect: boolean; // Đáp án đúng hay không
}

export interface CheckboxQuestionDTO_V2 {
  id: number;
  content: string; // Nội dung câu hỏi
  type: string; // Loại câu hỏi (checkbox)
  courseId: number; // ID khóa học
  accountId: number; // ID giáo viên/tài khoản
  level: string; // Mức độ câu hỏi
  instruction: string; // Hướng dẫn cho câu hỏi
  options: OptionDTO[]; // Danh sách các đáp án
}
export interface CheckboxQuestionDTO_V3 {
  id: number;
  content: string; // Nội dung câu hỏi
  type: string; // Loại câu hỏi (checkbox)
  courseId: number; // ID khóa học
  accountId: number; // ID giáo viên/tài khoản
  level: string; // Mức độ câu hỏi
  instruction: string; // Hướng dẫn cho câu hỏi
  options: OptionDTOV2[]; // Danh sách các đáp án
}
interface EditQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  question: Question;
  fetchQuestions: () => void;
}

const EditQuestionCheckboxDialog: React.FC<EditQuestionDialogProps> = ({
  open,
  onClose,
  question,
  fetchQuestions,
}) => {
  const [questionCheckbox, setQuestionCheckbox] =
    useState<CheckboxQuestionDTO_V2 | null>(null);
  const [questionCheckbox2, setQuestionCheckbox2] =
    useState<CheckboxQuestionDTO_V3 | null>(null);
  const [loading, setLoading] = useState(true);
  const isAPICalled = useRef(false);
  useEffect(() => {
    if (open && !isAPICalled.current) {
      // Chỉ gọi API nếu `open` là true và API chưa được gọi
      const fetchQuestionDetails = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/questions/detail/checkbox?id=${question.id}&type=${question.type}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch question details");
          }

          const data: CheckboxQuestionDTO_V2 = await response.json();
          setQuestionCheckbox(data);
          // Chuyển đổi từ DTO_V2 sang DTO_V3
          const convertedData: CheckboxQuestionDTO_V3 = {
            ...data,
            options: data.options.map((opt) => ({
              text: opt.text,
              isCorrect: opt.correct,
            })),
          };
          setQuestionCheckbox2(convertedData);
        } catch (error) {
          console.error(error);
          // toast.error("Không thể tải dữ liệu câu hỏi");
        } finally {
          setLoading(false);
          isAPICalled.current = true; // Đánh dấu API đã được gọi
        }
      };

      fetchQuestionDetails();
    }
  }, [open, question.id, question.type]);
  const handleDialogClose = () => {
    isAPICalled.current = false; // Reset cờ khi dialog đóng
    onClose();
  };
  // const handleChange = (
  //   e: React.ChangeEvent<{ name?: string; value: unknown }>
  // ) => {
  //   const { name, value } = e.target;
  //   setQuestionCheckbox((prev) =>
  //     prev ? { ...prev, [name as string]: value } : null
  //   );
  // };

  const handleOptionChange = (index: number, value: string) => {
    if (questionCheckbox2) {
      const updatedOptions = [...questionCheckbox2.options];
      updatedOptions[index].text = value;
      setQuestionCheckbox2({ ...questionCheckbox2, options: updatedOptions });
    }
  };

  const handleCheckboxChange = (index: number) => {
    if (questionCheckbox2) {
      const updatedOptions = [...questionCheckbox2.options];
      updatedOptions[index].isCorrect = !updatedOptions[index].isCorrect;
      setQuestionCheckbox2({ ...questionCheckbox2, options: updatedOptions });
    }
  };

  const handleSubmit = async () => {
    if (!questionCheckbox2 || !questionCheckbox2.content) {
      toast.warning("Vui lòng điền nội dung câu hỏi!");
      return;
    }

    if (!questionCheckbox2.options.some((isChecked) => isChecked.isCorrect)) {
      toast.warning("Vui lòng chọn ít nhất một đáp án đúng!");
      return;
    }

    if (!questionCheckbox2.level) {
      toast.warning("Vui lòng chọn độ khó câu hỏi!");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/update-v2-checkbox/${question.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(questionCheckbox2),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      toast.success("Cập nhật câu hỏi thành công");
      fetchQuestions();
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật câu hỏi");
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Đang tải dữ liệu...</DialogTitle>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
      <DialogTitle>Chỉnh Sửa Câu Hỏi Checkbox</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <label htmlFor="content">Nội dung câu hỏi</label>
          <textarea
            id="content"
            value={questionCheckbox2?.content || ""}
            onChange={(e) =>
              setQuestionCheckbox2((prev) =>
                prev ? { ...prev, content: e.target.value } : null
              )
            }
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
              resize: "vertical",
            }}
          />
        </Box>
        {questionCheckbox2?.options.map((option, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <TextField
              label={`Đáp án ${String.fromCharCode(65 + index)}`}
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              fullWidth
              variant="outlined"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={option.isCorrect}
                  onChange={() => handleCheckboxChange(index)}
                />
              }
              label="Đáp án đúng"
              style={{ marginLeft: "10px" }}
            />
          </Box>
        ))}
        <Box mb={2}>
          <label htmlFor="instruction">Hướng dẫn</label>
          <textarea
            id="instruction"
            value={questionCheckbox2?.instruction || ""}
            onChange={(e) =>
              setQuestionCheckbox2((prev) =>
                prev ? { ...prev, instruction: e.target.value } : null
              )
            }
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
              resize: "vertical",
            }}
          />
        </Box>
        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel id="level">Chọn độ khó</InputLabel>
          <Select
            labelId="level"
            value={questionCheckbox2?.level || ""}
            onChange={(e) =>
              setQuestionCheckbox2((prev) =>
                prev ? { ...prev, level: e.target.value as string } : null
              )
            }
            label="Độ khó"
          >
            <MenuItem value="1">Dễ</MenuItem>
            <MenuItem value="2">Trung bình</MenuItem>
            <MenuItem value="3">Khó</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color="secondary">
          Hủy Bỏ
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Cập Nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditQuestionCheckboxDialog;
