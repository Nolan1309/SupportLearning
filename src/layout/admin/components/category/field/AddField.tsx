import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Divider,
  Box,
  Alert,
  MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import styles from "./addField.module.scss"; // Import SCSS Module
import { ADMIN_POST_FIELD } from "../../../../../api/api"; // Import API endpoint
import RequireAdmin from "../../../../DOM/RequireAdmin";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify

const AddField: React.FC = () => {
  const [name, setName] = useState("");
  const [level] = useState<number>(1); // Initialize level with default value of 1
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [success, setSuccess] = useState<boolean>(false); // State to handle success message
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken"); // Get auth token from local storage
  const [type, setType] = useState<string>("");
  const handleSave = async () => {
    // Validate input
    if (!name.trim()) {
      setError("Tên lĩnh vực không được để trống.");
      toast.error("Tên lĩnh vực không được để trống.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setError(null); // Reset error
    setSuccess(false); // Reset success state

    try {
      const response = await fetch(ADMIN_POST_FIELD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token for authorization
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, level ,type}), // Send data as JSON
      });

      if (response.ok) {
        setSuccess(true); // Set success state
        setName(""); // Reset name field
        toast.success("Lĩnh vực đã được thêm thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/admin/category-field");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to save field.");
        toast.error(data.message || "Failed to save field.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error saving field:", error);
      setError("Error saving field.");
      toast.error("Có lỗi xảy ra khi lưu lĩnh vực.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value);

    // Validate nếu cần
    if (!e.target.value) {
      setError("Vui lòng chọn một mã code!");
    } else {
      setError("");
    }
  };
  return (
    <div className={styles.addFieldContainer}>
      <Paper className={styles.paper}>
        <Typography variant="h2" className={styles.headerBold}>
          Thêm Lĩnh Vực
        </Typography>
        <Divider sx={{ marginBottom: "20px" }} />
        {error && (
          <Alert severity="error" className={styles.errorMessage}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" className={styles.successMessage}>
            Lĩnh vực đã được thêm thành công!
          </Alert>
        )}
        <Box className={styles.formContainer}>
          <TextField
            label="Tên Lĩnh Vực"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            variant="outlined"
            className={styles.textField}
          />
          <TextField
            label="Mã code"
            value={type}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            margin="normal"
            className={styles.textfield}
            select // Kích hoạt chế độ combobox
            error={Boolean(error)} // Highlight nếu có lỗi
            helperText={error} // Hiển thị thông báo lỗi bên dưới
          >
            <MenuItem value="">
              <em>Chọn mã code</em>
            </MenuItem>
            <MenuItem value="document">Document</MenuItem>
            <MenuItem value="course">Course</MenuItem>
            <MenuItem value="blog">Blog</MenuItem>
          </TextField>
          <TextField
            label="Cấp Độ"
            value={level}
            fullWidth
            disabled
            variant="outlined"
            className={styles.textField}
            InputProps={{
              readOnly: true,
            }}
          />
          <Box className={styles.buttonContainer}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Lưu
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/admin/category-field")}
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

export const RequestAdminURL = RequireAdmin(AddField);

export default AddField;
