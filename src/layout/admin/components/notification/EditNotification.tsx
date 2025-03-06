import React, { useState, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import {
    ADMIN_GET_NOTIFICATION_BY_ID,
    ADMIN_UPDATE_NOTIFICATION,
} from "../../../../api/api";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./editNotifition.module.scss"; // Import SCSS Module

// Định nghĩa kiểu dữ liệu Notification
type Notification = {
    id: number;
    title: string;
    message: string;
    topic: string;
};

const EditNotification: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Lấy ID từ URL
    const [notification, setNotification] = useState<Notification | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // State để quản lý loading
    const [isUpdating, setIsUpdating] = useState<boolean>(false); // State cho quá trình cập nhật
    const [openConfirm, setOpenConfirm] = useState<boolean>(false); // State cho Dialog xác nhận
    const navigate = useNavigate();
    const refresh = useRefreshToken();

    // Các chủ đề thông báo (Topic)
    const topics = [
        { value: "general", label: "Chung" },
        { value: "system", label: "Hệ thống" },
        { value: "message", label: "Tin nhắn" },
        { value: "update", label: "Cập nhật" },
    ];

    // Fetch thông báo từ API
    useEffect(() => {
        const fetchNotification = async () => {
            let token = localStorage.getItem("authToken");

            if (isTokenExpired(token)) {
                token = await refresh();
                if (!token) {
                    navigate("/dang-nhap");
                    return;
                }
                localStorage.setItem("authToken", token);
            }

            try {
                const response = await fetch(`${ADMIN_GET_NOTIFICATION_BY_ID}/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch notification");
                }

                const data: Notification = await response.json();
                setNotification(data);
            } catch (error) {
                console.error("Failed to fetch notification:", error);
                toast.error("Không thể tải thông báo.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotification();
    }, [id, navigate]);

    // Xử lý khi nhập liệu
    const handleChange = (field: keyof Notification, value: string) => {
        if (notification) {
            setNotification({
                ...notification,
                [field]: value,
            });
        }
    };

    // Mở Dialog xác nhận
    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    // Đóng Dialog xác nhận
    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    // Xử lý xác nhận cập nhật thông báo
    const handleConfirmUpdate = async () => {
        if (!notification) return;

        setOpenConfirm(false);
        setIsUpdating(true);

        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                navigate("/dang-nhap");
                return;
            }
            localStorage.setItem("authToken", token);
        }

        try {
            const response = await fetch(`${ADMIN_UPDATE_NOTIFICATION}/${notification.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: notification.title,
                    message: notification.message,
                    topic: notification.topic,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update notification");
            }

            toast.success("Cập nhật thông báo thành công!", {
                position: "top-right",
                autoClose: 2000, // Tự động đóng sau 2 giây
                onClose: () => {
                    navigate("/admin/thong-bao"); // Điều hướng sau khi thông báo đóng
                },
            });
        } catch (error) {
            console.error("Failed to update notification:", error);
            toast.error("Có lỗi xảy ra khi cập nhật thông báo.", {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // Hiển thị spinner khi đang tải dữ liệu
    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Typography variant="h6">Đang tải thông báo...</Typography>
            </div>
        );
    }

    // Nếu không tìm thấy thông báo
    if (!notification) {
        return (
            <div className={styles.editNotificationContainer}>
                <Paper elevation={3} className={styles.paper}>
                    <Typography variant="h6" color="error" className={styles.header}>
                        Không tìm thấy thông báo.
                    </Typography>
                    <Box className={styles.buttonContainer}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate("/admin/thong-bao")}
                        >
                            Quay lại
                        </Button>
                    </Box>
                </Paper>
            </div>
        );
    }

    return (
        <div className={styles.editNotificationContainer}>
            <Paper elevation={3} className={styles.paper}>
                <Typography variant="h5" component="h2" className={styles.header}>
                    Chỉnh Sửa Thông Báo
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
                                isUpdating
                            }
                        >
                            {isUpdating ? "Đang cập nhật..." : "Cập Nhật"}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate("/admin/thong-bao")}
                            disabled={isUpdating}
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
                    <DialogTitle id="confirm-dialog-title">Xác Nhận Cập Nhật</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="confirm-dialog-description">
                            Bạn có chắc chắn muốn cập nhật thông báo này không?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirm} color="secondary">
                            Hủy
                        </Button>
                        <Button onClick={handleConfirmUpdate} color="primary" autoFocus>
                            Xác nhận
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Toast Notifications */}
                <ToastContainer />
            </Paper>
        </div>
    );
};

export default EditNotification;
