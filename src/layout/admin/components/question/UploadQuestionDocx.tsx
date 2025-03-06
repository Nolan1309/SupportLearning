import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import {
  ADMIN_POST_QUESTION,
  ADMIN_POST_QUESTION_DOCX,
} from "../../../../api/api"; // Import API URL
import RequireAdmin from "../../../DOM/RequireAdmin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { useNavigate } from "react-router-dom";
interface UploadQuestionsProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  dialogType: string | null;
  selectCourse: string | null;
  selectTeacher: string | null;
}

const UploadQuestionDocx: React.FC<UploadQuestionsProps> = ({
  open,
  onClose,
  onUploadSuccess,
  dialogType,
  selectCourse,
  selectTeacher,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  // Xử lý upload file lên server
  const handleUpload = async () => {
    if (!file) {
      setError("Vui lòng chọn một tệp O.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("dialogType", dialogType ?? "");
    formData.append("courseId", selectCourse ?? "");
    formData.append("accountId", selectTeacher ?? "");
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
    console.log(dialogType);
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
        // onUploadSuccess();
        onClose();
      } else {
        const error = await response.text();
        toast.error(`Lỗi: ${error}`);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải lên file!");
    }
  };
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "Trắc nghiệm";
      case "fill-in-the-blank":
        return "Điền khuyết";
      case "essay":
        return "Tự luận";
      case "checkbox":
        return "Câu hỏi checkbox";
      case "mixed":
        return "Câu hỏi hỗn hợp";
      default:
        return "Loại câu hỏi không xác định";
    }
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Thêm câu hỏi từ Docx</DialogTitle>
      <p style={{ marginLeft: "24px" }}>
        Loại câu hỏi:{" "}
        {dialogType ? getQuestionTypeLabel(dialogType) : "Không xác định"}
      </p>
      <DialogContent>
        <input type="file" accept=".docx" onChange={handleFileChange} />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleUpload} color="primary" disabled={!file}>
          Tải Lên
        </Button>
      </DialogActions>
      <ToastContainer />
    </Dialog>
  );
};

export default UploadQuestionDocx;
export const RequestAdminURL = RequireAdmin(UploadQuestionDocx);
