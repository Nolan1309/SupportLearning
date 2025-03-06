import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { ADMIN_ADD_QUESTION } from "../../../../api/api";
import RequireAdmin from "../../../DOM/RequireAdmin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface QuestionData {
  content: string;
  instruction: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  resultCheck: string;
}
interface AddQuestionProps {
  onClose: () => void;
  courseId?: string;
  accountId?: string;
  type: string;
}
const AddQuestion: React.FC<AddQuestionProps> = ({
  onClose,
  courseId,
  accountId,
  type,
}) => {
  const [questionData, setQuestionData] = useState<QuestionData>({
    content: "",
    instruction: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    resultCheck: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setQuestionData({
      ...questionData,
      [name as string]: value,
    });
  };

  const handleChangeTopic = (e: React.ChangeEvent<{ value: unknown }>) => {
    setTopic(e.target.value as string);
  };
  const handleSubmit = () => {
    if (!questionData.content) {
      toast.warning("Vui lòng điền nội dung câu hỏi!");
      return;
    }
    if (
      !questionData.optionA ||
      !questionData.optionB ||
      !questionData.optionC ||
      !questionData.optionD
    ) {
      toast.warning("Vui lòng điền đầy đủ các câu trả lời!");
      return;
    }

    if (!questionData.resultCheck) {
      toast.warning("Vui lòng chọn đáp án đúng!");
      return;
    }

    const requestBody = {
      ...questionData,
      type,
      level,
      topic,
      courseId,
      accountId,
    };

    fetch(ADMIN_ADD_QUESTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (response.ok) {
          toast.success("Thêm câu hỏi thành công!");
          onClose();
        } else {
          toast.error("Có lỗi xảy ra khi thêm câu hỏi!");
        }
      })
      .catch((error) => {
        toast.error("Có lỗi xảy ra khi thêm câu hỏi!");
      });
  };
  const handleLevelChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setLevel(e.target.value as string);
  };
  return (
    <Box p={2}>
      <Paper style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
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
        <TextField
          label="Nội dung chủ đề"
          name="topic"
          value={topic}
          onChange={handleChangeTopic}
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
          <InputLabel id="level">Chọn độ khó</InputLabel>
          <Select
            labelId="level"
            value={level}
            onChange={handleLevelChange}
            label="Độ khó"
          >
            <MenuItem value="1">Dễ</MenuItem>
            <MenuItem value="2">Trung bình</MenuItem>
            <MenuItem value="3">Khó</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            className="white-btn"
          >
            Thêm Câu Hỏi
          </Button>
          <Button variant="outlined" onClick={() => onClose?.()}>
            Hủy Bỏ
          </Button>
        </Box>
      </Paper>
      {/* <ToastContainer/> */}
    </Box>
  );
};

export default AddQuestion;
export const RequestAdminURL = RequireAdmin(AddQuestion);
