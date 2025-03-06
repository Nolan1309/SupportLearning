import React, { useEffect, useState } from "react";
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
} from "@material-ui/core";
import { toast } from "react-toastify";
import { Question } from "./QuestionsList";

// interface Question {
//   id: number;
//   content: string;
//   instruction: string;
//   optionA: string;
//   optionB: string;
//   optionC: string;
//   optionD: string;
//   result: string;
//   resultCheck: string;
//   deleted: boolean;
//   level: string;
//   type: string;
//   accountId: number;
//   courseId: number;
// }

interface EditQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  question: Question; // Use the full Question object
  fetchQuestions: () => void; // Function to refresh the question list
}

const EditQuestionMultipleChoiceDialog: React.FC<EditQuestionDialogProps> = ({
  open,
  onClose,
  question,
  fetchQuestions,
}) => {
  const [questionData, setQuestionData] = useState<Question | null>(null);

  useEffect(() => {
    if (open) {
      setQuestionData({ ...question }); // Initialize state from `question` prop
    }
  }, [open, question]);

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setQuestionData((prev) =>
      prev ? { ...prev, [name as string]: value } : null
    );
  };

  const handleSubmit = async () => {
    if (
      !questionData ||
      !questionData.content ||
      !questionData.optionA ||
      !questionData.optionB ||
      !questionData.optionC ||
      !questionData.optionD ||
      !questionData.resultCheck
    ) {
      toast.warning("Vui lòng điền đủ thông tin");
      return;
    }

    const updatedQuestion = { ...questionData };

    // Determine the correct answer
    switch (updatedQuestion.resultCheck) {
      case "A":
        updatedQuestion.result = updatedQuestion.optionA;
        break;
      case "B":
        updatedQuestion.result = updatedQuestion.optionB;
        break;
      case "C":
        updatedQuestion.result = updatedQuestion.optionC;
        break;
      case "D":
        updatedQuestion.result = updatedQuestion.optionD;
        break;
      default:
        break;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/update-v2/${question.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(updatedQuestion),
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

  if (!questionData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chỉnh Sửa Câu Hỏi</DialogTitle>
      <DialogContent>
        <TextField
          label="Nội dung câu hỏi"
          name="content"
          value={questionData.content}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
        <TextField
          label="Hướng dẫn"
          name="instruction"
          value={questionData.instruction}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Đáp án A"
          name="optionA"
          value={questionData.optionA}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Đáp án B"
          name="optionB"
          value={questionData.optionB}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Đáp án C"
          name="optionC"
          value={questionData.optionC}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Đáp án D"
          name="optionD"
          value={questionData.optionD}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel id="resultCheck">Đáp án đúng</InputLabel>
          <Select
            labelId="resultCheck"
            name="resultCheck"
            value={questionData.resultCheck}
            onChange={handleChange}
            label="Đáp án đúng"
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="D">D</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel id="level">Mức độ</InputLabel>
          <Select
            labelId="level"
            name="level"
            value={questionData.level}
            onChange={handleChange}
            label="Mức độ"
          >
            <MenuItem value="1">Dễ</MenuItem>
            <MenuItem value="2">Trung bình</MenuItem>
            <MenuItem value="3">Khó</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy Bỏ
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Cập Nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditQuestionMultipleChoiceDialog;
