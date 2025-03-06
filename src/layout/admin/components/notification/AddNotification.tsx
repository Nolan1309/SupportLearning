import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"; // Đổi từ @material-ui/core sang @mui/material
import { useNavigate } from "react-router-dom";
import { ADMIN_POST_NOTIFICATION_AND_SEND } from "../../../../api/api";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./addNotication.module.scss"; // Import SCSS Module

// Định nghĩa kiểu dữ liệu Notification
type Notification = {
  title: string;
  message: string;
  topic: string;
};

const AddNotification: React.FC = () => {
  const [notification, setNotification] = useState<Notification>({
    title: "",
    message: "",
    topic: "",
  });
  const [isAdding, setIsAdding] = useState<boolean>(false); // State cho quá trình thêm
  const [openConfirm, setOpenConfirm] = useState<boolean>(false); // State cho Dialog xác nhận
  const navigate = useNavigate();
  const refresh = useRefreshToken();

  // Các chủ đề thông báo (Topic)
  const topics = [
    { value: "general", label: "Hệ thống" },
    { value: "notifications", label: "Thông báo" },
  ];

  // Xử lý khi nhập liệu
  const handleChange = (field: keyof Notification, value: string) => {
    setNotification({ ...notification, [field]: value });
  };

  // Mở Dialog xác nhận
  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  // Đóng Dialog xác nhận
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  // Xử lý xác nhận thêm thông báo
  const handleConfirmSubmit = async () => {
    setOpenConfirm(false);
    setIsAdding(true);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    fetch(ADMIN_POST_NOTIFICATION_AND_SEND, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    })
      .then((response) => {
        if (response.ok) {
          setNotification({ title: "", message: "", topic: "" }); // Reset trạng thái

          // Hiển thị thông báo thành công và điều hướng sau khi đóng
          toast.success("Gửi thông báo thành công!", {
            position: "top-right",
            autoClose: 2000, // Tự động đóng sau 2 giây
            onClose: () => {
              navigate("/admin/thong-bao"); // Điều hướng sau khi thông báo đóng
            },
          });
        } else {
          // Nếu phản hồi không thành công, ném lỗi để xử lý ở catch
          throw new Error("Failed to add notification");
        }
      })
      .catch(() => {
        // Hiển thị thông báo lỗi
        toast.error("Có lỗi xảy ra khi thêm thông báo", {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .finally(() => {
        setIsAdding(false); // Kết thúc quá trình thêm
      });
  };

  return (
    <div className={styles.addNotificationContainer}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h5" component="h2" className={styles.header}>
          Thêm Thông Báo Mới
        </Typography>
        <Box className={styles.formContainer}>
          <TextField
            label="Tiêu đề"
            value={notification.title}
            onChange={(e) => handleChange("title", e.target.value)}
            variant="outlined"
            fullWidth
            required
          />
          <TextField
            label="Nội dung"
            value={notification.message}
            onChange={(e) => handleChange("message", e.target.value)}
            variant="outlined"
            fullWidth
            required
            multiline
            rows={4}
          />
          <TextField
            label="Chủ đề"
            value={notification.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
            variant="outlined"
            fullWidth
            required
            select
          >
            {topics.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Box className={styles.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenConfirm}
              disabled={
                !notification.title ||
                !notification.message ||
                !notification.topic ||
                isAdding
              }
            >
              {isAdding ? "Đang thêm..." : "Thêm Thông Báo"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/admin/thong-bao")}
              disabled={isAdding}
            >
              Hủy
            </Button>
          </Box>
        </Box>

        {/* Dialog Xác Nhận */}
        <Dialog
          open={openConfirm}
          onClose={handleCloseConfirm}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <DialogTitle id="confirm-dialog-title">Xác Nhận Thêm Thông Báo</DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              Bạn có chắc chắn muốn thêm thông báo này không?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirm} color="secondary">
              Hủy
            </Button>
            <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer />
      </Paper>
    </div>
  );
};

export default AddNotification;
