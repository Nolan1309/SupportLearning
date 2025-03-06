// EditBranch.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  SelectChangeEvent, // Import SelectChangeEvent
} from "@mui/material";
import styles from "./editBranch.module.scss"; // Import SCSS module
import {
  ADMIN_CATEGORY_GET_ONE_BRANCH,
  ADMIN_UPDATE_BRANCH,
  ADMIN_CATEGORY_GET_LEVEL1,
} from "../../../../../api/api"; // Thay thế bằng đường dẫn API chính xác
import RequireAdmin from "../../../../DOM/RequireAdmin";

interface Category {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
}

const EditBranch: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy ID ngành từ URL
  const [name, setName] = useState("");
  const [level, setLevel] = useState<number>(2); // Giả sử cấp độ là số cho Branch
  const [categories, setCategories] = useState<Category[]>([]); // State cho danh mục
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // State cho danh mục được chọn
  const [categoryName, setCategoryName] = useState<string>(""); // State cho tên danh mục
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [type, setType] = useState<string>("");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchBranch = async () => {
      if (!id) {
        setError("ID is missing.");
        setLoading(false);
        return;
      }

      console.log("Fetching branch with ID:", id);
      try {
        // Sử dụng ADMIN_CATEGORY_GET_ONE_BRANCH để tạo URL API
        const apiUrl = ADMIN_CATEGORY_GET_ONE_BRANCH(Number(id));
        console.log("API URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("API Response:", response);

        if (response.ok) {
          try {
            const data = await response.json();
            console.log("Data received:", data);

            // Nếu data là một mảng, lấy phần tử đầu tiên
            if (Array.isArray(data) && data.length > 0) {
              const branch = data[0]; // Lấy đối tượng đầu tiên từ mảng
              setName(branch.name);
              setLevel(branch.level); // Set trạng thái cấp độ
              setSelectedCategory(branch.category.id); // Set ID danh mục được chọn
              setCategoryName(branch.category.name); // Set tên danh mục được chọn
              setType(branch.type);
            } else {
              console.error("Unexpected data format:", data);
              setError("Unexpected data format received.");
            }
          } catch (jsonError) {
            console.error("Failed to parse JSON:", jsonError);
            setError("Failed to parse JSON.");
          }
        } else {
          console.error(
            "Failed to fetch branch:",
            response.status,
            response.statusText
          );
          setError(
            `Failed to fetch branch: ${response.status} - ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error fetching branch:", error);
        setError("Failed to fetch branch");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(ADMIN_CATEGORY_GET_LEVEL1, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Categories received:", data);
          setCategories(data);
        } else {
          console.error("Failed to fetch categories");
          setError("Failed to fetch categories.");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to fetch categories.");
      }
    };

    fetchBranch();
    fetchCategories();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Kiểm tra xem tên ngành có bị trống không
    if (!name.trim()) {
      setError("Tên ngành không được để trống.");
      return; // Dừng lại nếu tên ngành trống
    }

    // Thêm xác nhận trước khi chỉnh sửa
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn lưu các thay đổi không?"
    );
    if (!confirmed) {
      return; // Nếu người dùng không xác nhận, dừng lại.
    }

    setLoading(true);
    setError(""); // Reset trạng thái lỗi

    // Cập nhật URL API với id từ tham số URL
    const updateApiUrl = ADMIN_UPDATE_BRANCH(Number(id));

    try {
      // Đảm bảo rằng `parentId` được gửi lên đúng tên thuộc tính.
      const response = await fetch(updateApiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name, // Tên ngành
          type,
          level, // Cấp độ
          parentId: selectedCategory, // Đặt parentId là `selectedCategory` từ combobox
        }),
      });


      console.log("Update Response:", response);

      if (response.ok) {
        navigate("/admin/category-branch"); // Chuyển hướng đến trang danh sách ngành sau khi cập nhật thành công
      } else {
        console.error(
          "Failed to update branch:",
          response.status,
          response.statusText
        );
        setError(
          `Failed to update branch: ${response.status} - ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error updating branch:", error);
      setError("Failed to update branch");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    const selectedId = Number(event.target.value);
    setSelectedCategory(selectedId);

    // Tìm tên danh mục tương ứng
    const selectedCategoryObj = categories.find(
      (category) => category.id === selectedId
    );
    setCategoryName(selectedCategoryObj ? selectedCategoryObj.name : "");
  };

  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước đó
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
    <Box className={styles.container}>
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        className={styles.h2}
      >
        Chỉnh sửa Ngành
      </Typography>
      {loading ? (
        <CircularProgress className={styles.circularProgress} />
      ) : (
        <form onSubmit={handleSubmit} className={styles.editForm}>
          {error && (
            <Typography className={styles.errorMessage}>{error}</Typography>
          )}
          <TextField
            label="Tên Ngành"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            fullWidth
            className={styles.textfield}
            error={Boolean(error)}
            helperText={error}
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
          {/* TextField cho cấp độ, chỉ để xem */}
          <TextField
            label="Cấp Độ"
            type="number"
            value={level}
            variant="outlined"
            fullWidth
            className={styles.textfield}
            disabled
            InputProps={{
              readOnly: true,
            }}
          />
          <FormControl
            variant="outlined"
            fullWidth
            className={styles.textfield}
          >
            <InputLabel id="category-label">Danh mục</InputLabel>
            <Select
              labelId="category-label"
              value={
                selectedCategory !== null ? selectedCategory.toString() : ""
              }
              onChange={handleCategoryChange}
              label="Danh mục"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box className={styles.buttonContainer}>
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
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleGoBack}
              className={styles.button}
            >
              Quay lại
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export const RequestAdminURL = RequireAdmin(EditBranch);

export default EditBranch;
