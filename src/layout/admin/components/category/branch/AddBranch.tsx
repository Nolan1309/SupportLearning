import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Divider,
  Box,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import styles from "./addBranch.module.scss"; // Import SCSS Module
import {
  ADMIN_POST_BRANCH,
  ADMIN_CATEGORY_GET_LEVEL1,
} from "../../../../../api/api"; // Import API endpoints
import RequireAdmin from "../../../../DOM/RequireAdmin";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify

interface CategoryLevel {
  id: number;
  name: string;
  type: string;
}

const AddBranch: React.FC = () => {
  const [branchName, setBranchName] = useState("");
  const [categories, setCategories] = useState<CategoryLevel[]>([]); // State for categories fetched from API
  const [selectedCategory, setSelectedCategory] = useState<number | string>(""); // State to handle selected category
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [success, setSuccess] = useState<boolean>(false); // State to handle success message
  const [type, setType] = useState<string>("");
  const token = localStorage.getItem("authToken"); // Get auth token from local storage
  const navigate = useNavigate();
  const [filteredCategories, setFilteredCategories] = useState<CategoryLevel[]>(
    []
  );
  useEffect(() => {
    if (type) {
      const filtered = categories.filter((category) => category.type === type);
      setFilteredCategories(filtered);
    }
    
  }, [type, categories]);
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(ADMIN_CATEGORY_GET_LEVEL1, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token for authorization
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data: CategoryLevel[] = await response.json();
          setCategories(data); // Set categories data
        } else {
          console.error("Failed to fetch categories.");
          setError("Không thể tải danh mục cấp 1.");
          toast.error("Không thể tải danh mục cấp 1.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Lỗi khi tải danh mục.");
        toast.error("Lỗi khi tải danh mục.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchCategories();
  }, [token]);

  const handleSave = async () => {
    // Validate input
    if (!branchName.trim()) {
      setError("Tên ngành không được để trống.");
      toast.error("Tên ngành không được để trống.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!selectedCategory) {
      setError("Vui lòng chọn danh mục.");
      toast.error("Vui lòng chọn danh mục.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setError(null); // Reset error
    setSuccess(false); // Reset success state

    // Prepare data for submission
    const requestData = {
      name: branchName, // Use branchName as name
      type: type,
      level: 2, // Set level to 2 by default
      parentId: selectedCategory, // Use selected category ID as parentId
    };

    try {
      const response = await fetch(ADMIN_POST_BRANCH, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token for authorization
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData), // Send data as JSON
      });

      if (response.ok) {
        setSuccess(true); // Set success state
        setBranchName(""); // Reset branch name field
        setSelectedCategory(""); // Reset selected category
        toast.success("Chi nhánh đã được thêm thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/admin/category-branch");
      } else {
        const data = await response.json();
        setError(data.message || "Lưu ngành thất bại.");
        toast.error(data.message || "Lưu ngành thất bại.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu ngành:", error);
      setError("Lỗi khi lưu ngành.");
      toast.error("Có lỗi xảy ra khi lưu ngành.", {
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
    <div className={styles.addBranchContainer}>
      <Paper className={styles.paper}>
        <Typography variant="h4" className={styles.headerBold}>
          Thêm Ngành
        </Typography>
        <Divider sx={{ marginBottom: "20px" }} />
        {error && (
          <Alert severity="error" className={styles.errorMessage}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" className={styles.successMessage}>
            Chi nhánh đã được thêm thành công!
          </Alert>
        )}
        <Box className={styles.formContainer}>
          <TextField
            label="Tên Ngành"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
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

          <FormControl
            fullWidth
            margin="normal"
            variant="outlined"
            className={styles.selectField}
          >
            <InputLabel id="category-label">Lĩnh vực</InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as number)}
              label="Lĩnh vực"
              disabled={!filteredCategories} // Vô hiệu hóa nếu không có danh mục phù hợp
            >
              {filteredCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Read-only TextField for Level */}
          <TextField
            label="Cấp Độ"
            value={2} // Fixed level value as 2
            fullWidth
            variant="outlined"
            className={styles.textField}
            disabled
            InputProps={{
              readOnly: true, // Make it read-only to prevent editing
            }}
          />
          <Box className={styles.buttonContainer}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Lưu
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/admin/category-branch")}
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

export const RequestAdminURL = RequireAdmin(AddBranch);

export default AddBranch;
