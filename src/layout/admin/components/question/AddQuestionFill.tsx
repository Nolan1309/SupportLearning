import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button as MuiButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@material-ui/core";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ADMIN_ADD_QUESTION } from "../../../../api/api";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
interface AddQuestionProps {
  onClose: () => void;
  courseId?: string;
  accountId?: string;
  type: string;
}
const AddQuestionFill: React.FC<AddQuestionProps> = ({
  onClose,
  courseId,
  accountId,
  type,
}) => {
  const [instruction, setInstruction] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const navigate = useNavigate();
  const refresh = useRefreshToken();

  const handleSubmit = async () => {
    if (!content) {
      toast.warning("Vui lòng điền nội dung câu hỏi!");
      return;
    }

    if (!result) {
      toast.warning("Vui lòng điền từ khuyết!");
      return;
    }

    if (!instruction) {
      toast.warning("Vui lòng điền hướng dẫn câu hỏi!");
      return;
    }

    if (!level) {
      toast.warning("Vui lòng chọn độ khó câu hỏi!");
      return;
    }

    const requestBody = {
      content,
      result,
      instruction,
      type,
      level,
      topic,
      courseId,
      accountId,
    };

    let token = localStorage.getItem("authToken");

    if (!token || isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }
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
  const [topic, setTopic] = useState("");
  const handleChangeTopic = (e: React.ChangeEvent<{ value: unknown }>) => {
    setTopic(e.target.value as string);
  };
  return (
    <Box p={3}>
      <Paper style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
        <Typography variant="h5" gutterBottom>
          Thêm Câu Hỏi Điền Khuyết
        </Typography>
        <Box mb={2}>
          <label
            htmlFor="content"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 500,
            }}
          >
            Nội dung câu hỏi (dùng ___ để đánh dấu chỗ cần điền)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              minHeight: "200px",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
              resize: "vertical",
            }}
          />
        </Box>

        <Box mb={2}>
          <label
            htmlFor="answer"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 500,
            }}
          >
            Đáp án
          </label>
          <textarea
            id="answer"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
              resize: "vertical",
            }}
          />
        </Box>
        <Box mb={2}>
          <label
            htmlFor="instruction"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 500,
            }}
          >
            Hướng dẫn
          </label>
          <textarea
            id="instruction"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            style={{
              width: "100%",
              minHeight: "200px",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
              resize: "vertical",
            }}
          />
        </Box>
        <TextField
          label="Nội dung chủ đề"
          name="topic"
          value={topic}
          onChange={handleChangeTopic}
          fullWidth
          margin="normal"
        />
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
          <MuiButton variant="contained" color="primary" onClick={handleSubmit}>
            Thêm Câu Hỏi
          </MuiButton>
          <MuiButton variant="outlined" onClick={onClose}>
            Hủy Bỏ
          </MuiButton>
        </Box>
      </Paper>
      {/* <ToastContainer /> */}
    </Box>
  );
};

export default AddQuestionFill;
