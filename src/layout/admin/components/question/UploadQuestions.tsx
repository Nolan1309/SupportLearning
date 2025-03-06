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
interface UploadQuestionsProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  dialogType: string | null;
  selectCourse: string | null;
  selectTeacher: string | null;
}

const UploadQuestions: React.FC<UploadQuestionsProps> = ({
  open,
  onClose,
  onUploadSuccess,
  dialogType,
  selectCourse,
  selectTeacher,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    try {
      // Gọi API để upload file
      const response = await fetch(ADMIN_POST_QUESTION_DOCX, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success("Tải câu hỏi thành công");
        setTimeout(() => {
          onUploadSuccess();
          onClose();
        }, 2000);
      } else {
        setError("Tải lên thất bại.");
      }
    } catch (error) {
      setError("Lỗi khi xử lý file.");
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
      default:
        return "Loại câu hỏi không xác định";
    }
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Thêm câu hỏi từ Excel</DialogTitle>
      <p style={{ marginLeft: "24px" }}>
        Loại câu hỏi:{" "}
        {dialogType ? getQuestionTypeLabel(dialogType) : "Không xác định"}
      </p>
      <DialogContent>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
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

export default UploadQuestions;
export const RequestAdminURL = RequireAdmin(UploadQuestions);
