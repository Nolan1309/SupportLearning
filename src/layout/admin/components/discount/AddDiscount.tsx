// AddDiscount.tsx

import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    Divider,
} from "@mui/material"; // Đổi từ @material-ui/core sang @mui/material
import { useNavigate } from "react-router-dom";
import { ADMIN_ADD_DISCOUNT } from "../../../../api/api"; // Import API endpoint
import RequireAdmin from "../../../DOM/RequireAdmin";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify
import styles from "./addDis.module.scss"; // Import SCSS Module
import { isTokenExpired } from "../../../util/fucntion/auth";
const AddDiscount: React.FC = () => {
    const [description, setDescription] = useState("");
    const [discountValue, setDiscountValue] = useState<string | number>("");
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Validate inputs
        if (!title || !description || !discountValue || !startDate || !endDate) {
            toast.error("Vui lòng điền đầy đủ thông tin!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        const parsedDiscountValue = parseFloat(discountValue.toString());
        if (isNaN(parsedDiscountValue) || parsedDiscountValue <= 0) {
            toast.error("Giá trị giảm giá phải lớn hơn 0.", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            toast.error("Ngày bắt đầu phải trước ngày kết thúc.", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        // Tạo payload - Đảm bảo đúng định dạng
        const newDiscount = {
            title, // Tên khuyến mãi
            description, // Mô tả khuyến mãi
            discount_value: parsedDiscountValue, // Giá trị giảm giá (số thập phân)
            start_date: new Date(startDate).toISOString(), // Định dạng ngày ISO 8601
            end_date: new Date(endDate).toISOString(), // Định dạng ngày ISO 8601
        };

        // Kiểm tra token
        let token = localStorage.getItem("authToken");
        try {
            if (isTokenExpired(token)) {
                const refresh = await import("../../../util/fucntion/useRefreshToken").then(
                    (mod) => mod.default()
                );
                token = await refresh();
                if (!token) {
                    navigate("/dang-nhap");
                    return;
                }
                localStorage.setItem("authToken", token);
            }

            // Gửi yêu cầu POST đến API
            const response = await fetch(ADMIN_ADD_DISCOUNT, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // Pass the token for authorization
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newDiscount), // Send data as JSON
            });

            if (!response.ok) {
                // Xử lý khi có lỗi 400 hoặc các lỗi khác
                let errorMessage = "Có lỗi xảy ra khi thêm khuyến mãi.";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage; // Thông báo lỗi từ server
                } catch (e) {
                    // Xử lý trường hợp không thể phân tích JSON
                    console.error("Error parsing response JSON:", e);
                }
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            // Nếu thành công
            toast.success("Thêm khuyến mãi thành công!", {
                position: "top-right",
                autoClose: 2000,
                onClose: () => {
                    navigate("/admin/discount");
                },
            });
        } catch (error) {
            console.error("Error adding discount:", error);
            toast.error("Có lỗi xảy ra khi thêm khuyến mãi.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className={styles.container}>
            <Paper elevation={3} className={styles.paper}>
                <Typography variant="h5" component="h2" className={styles.header}>
                    Thêm Khuyến Mãi Mới
                </Typography>
                <Divider className={styles.divider} />
                <Box component="form" onSubmit={handleSubmit} className={styles.formContainer}>
                    <TextField
                        fullWidth
                        label="Tiêu đề"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        variant="outlined"
                        required
                        className={styles.textField}
                    />
                    <TextField
                        fullWidth
                        label="Mô tả"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        variant="outlined"
                        required
                        multiline
                        rows={4}
                        className={styles.textField}
                    />
                    <TextField
                        fullWidth
                        label="Giá trị giảm giá"
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        variant="outlined"
                        required
                        inputProps={{ step: "0.01" }} // Cho phép nhập số thập phân
                        className={styles.textField}
                    />
                    <TextField
                        fullWidth
                        label="Ngày bắt đầu"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        variant="outlined"
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                        className={styles.textField}
                    />
                    <TextField
                        fullWidth
                        label="Ngày kết thúc"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        variant="outlined"
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                        className={styles.textField}
                    />
                    <Box className={styles.buttonContainer}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            disabled={
                                !title ||
                                !description ||
                                !discountValue ||
                                !startDate ||
                                !endDate
                            }
                        >
                            Thêm Khuyến Mãi
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate("/admin/discount")}
                            className={`${styles.button} ${styles.buttonSecondary}`}
                        >
                            Hủy
                        </Button>

                    </Box>
                </Box>
            </Paper>
            {/* Toast Notifications */}
            <ToastContainer />
        </div>
    );
};

export default RequireAdmin(AddDiscount);
