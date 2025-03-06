import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, CircularProgress, MenuItem } from "@mui/material"; // Import từ @mui/material
import styles from "./editField.module.scss"; // Import SCSS module
import {
  ADMIN_CATEGORY_GET_ONE_FIELD,
  ADMIN_UPDATE_FIELD,
} from "../../../../../api/api"; // Replace with the correct API paths
import RequireAdmin from "../../../../DOM/RequireAdmin";

const EditField: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the field ID from URL parameters
  const [name, setName] = useState("");
  const [level, setLevel] = useState<number>(1); // Assuming level is a number
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [type, setCodeType] = useState<string>("");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchField = async () => {
      try {
        const response = await fetch(`${ADMIN_CATEGORY_GET_ONE_FIELD}/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setName(data.name);
          setLevel(data.level); 
          setCodeType(data.type);
        } else {
          console.error("Failed to fetch field");
          setError("Failed to fetch field");
        }
      } catch (error) {
        console.error("Error fetching field:", error);
        setError("Failed to fetch field");
      } finally {
        setLoading(false);
      }
    };

    fetchField();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Kiểm tra xem tên lĩnh vực có bị trống không
    if (!name.trim()) {
      setError("Tên lĩnh vực không được để trống.");
      return; // Dừng lại nếu tên lĩnh vực trống
    }

    // Thêm xác nhận trước khi chỉnh sửa
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn lưu các thay đổi không?"
    );
    if (!confirmed) {
      return; // Nếu người dùng không xác nhận, dừng lại.
    }

    setLoading(true);
    setError(""); // Reset error state

    try {
      const response = await fetch(`${ADMIN_UPDATE_FIELD}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, type, level }),
      });

      if (response.ok) {
        navigate("/admin/category-field");
      } else {
        console.error("Failed to update field");
        setError("Failed to update field");
      }
    } catch (error) {
      console.error("Error updating field:", error);
      setError("Failed to update field");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeType(e.target.value);

    // Validate nếu cần
    if (!e.target.value) {
      setError("Vui lòng chọn một mã code!");
    } else {
      setError("");
    }
  };
  return (
    <div className={styles.container}>
      <h2>Chỉnh sửa Lĩnh Vực</h2>
      {loading ? (
        <CircularProgress className={styles.circularProgress} />
      ) : (
        <form onSubmit={handleSubmit} className={styles.editForm}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <TextField
            label="Tên Lĩnh Vực"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            className={styles.textfield}
            error={Boolean(error)} // Highlight the input if there's an error
            helperText={error} // Show the error message below the input
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
          {/* TextField chỉ để hiển thị, không thể sửa */}
          <TextField
            label="Cấp Độ"
            type="number"
            value={level}
            variant="outlined"
            fullWidth
            margin="normal"
            disabled
            InputProps={{
              readOnly: true, // Chỉ để xem
            }}
            className={styles.textfield}
          />
          <div className={styles.buttonContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              className={styles.button}
            >
              Lưu
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(-1)} // Quay lại trang trước đó
              className={styles.button}
            >
              Quay lại
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export const RequestAdminURL = RequireAdmin(EditField);

export default EditField;
