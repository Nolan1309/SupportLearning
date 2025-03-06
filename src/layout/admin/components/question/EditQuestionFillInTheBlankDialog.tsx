import React, { useState, useEffect } from "react";
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
  question: Question;
  fetchQuestions: () => void;
}

const EditQuestionFillInTheBlankDialog: React.FC<EditQuestionDialogProps> = ({
  open,
  onClose,
  question,
  fetchQuestions,
}) => {
  const [questionData, setQuestionData] = useState<Question | null>(null);
  const [instruction, setInstruction] = useState<string>("");
  useEffect(() => {
    if (open) {
      setQuestionData({ ...question });
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
      !questionData.result ||
      !questionData.instruction
    ) {
      toast.warning("Vui lòng điền đủ thông tin");
      return;
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
          body: JSON.stringify(questionData),
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
      <DialogTitle>Chỉnh Sửa Câu Hỏi Điền Khuyết</DialogTitle>
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
          label="Từ khuyết"
          name="result"
          value={questionData.result}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Hướng dẫn"
          name="instruction"
          value={questionData.instruction}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
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

export default EditQuestionFillInTheBlankDialog;
