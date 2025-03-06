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
import { SelectChangeEvent } from "@mui/material/Select"; // Import SelectChangeEvent
import { useNavigate } from "react-router-dom";
import styles from "./addSubject.module.scss"; // Import SCSS Module
import {
  ADMIN_POST_SUBJECT,
  ADMIN_CATEGORY_GET_LEVEL1,
  ADMIN_SUBJECT_GET_CATEGORY_PARENT_ID,
} from "../../../../../api/api"; // Import API endpoints
import RequireAdmin from "../../../../DOM/RequireAdmin";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify

interface CategoryLevel {
  id: number;
  name: string;
  type: string;
}

const AddSubject: React.FC = () => {
  const [subjectName, setSubjectName] = useState(""); // State for the subject name
  const [categoriesLevel1, setCategoriesLevel1] = useState<CategoryLevel[]>([]); // State for Level 1 categories fetched from API
  const [categoriesLevel2, setCategoriesLevel2] = useState<CategoryLevel[]>([]); // State for Level 2 categories based on selected Level 1
  const [selectedCategoryLevel1, setSelectedCategoryLevel1] = useState<
    number | string
  >(""); // State for selected Level 1 category
  const [selectedCategoryLevel2, setSelectedCategoryLevel2] = useState<
    number | string
  >(""); // State for selected Level 2 category
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [success, setSuccess] = useState<boolean>(false); // State to handle success message
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken"); // Get auth token from local storage
  const [type, setType] = useState<string>("");

  // useEffect(() => {
  //   if (type) {
  //     const filtered = categoriesLevel1.filter(
  //       (category) => category.type === type
  //     );
  //     setCategoriesLevel1(filtered);
  //   }
  // }, [type, categoriesLevel1]);

  // Fetch Level 1 categories from API
  useEffect(() => {
    if (type) {
      const fetchFilteredCategoriesLevel1 = async () => {
        try {
          const response = await fetch(ADMIN_CATEGORY_GET_LEVEL1, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data: CategoryLevel[] = await response.json();

            // Lọc danh mục cấp 1 theo type
            const filteredCategories = data.filter(
              (category) => category.type === type
            );

            setCategoriesLevel1(filteredCategories); // Cập nhật danh mục cấp 1 đã lọc
            setSelectedCategoryLevel1(""); // Reset lựa chọn cấp 1
            setCategoriesLevel2([]); // Reset danh mục cấp 2
            setSelectedCategoryLevel2(""); // Reset lựa chọn cấp 2
          } else {
            setError("Không thể tải danh mục cấp 1.");
            toast.error("Không thể tải danh mục cấp 1.", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } catch (error) {
          console.error("Error fetching filtered categories level 1:", error);
          setError("Lỗi khi tải danh mục cấp 1.");
          toast.error("Lỗi khi tải danh mục cấp 1.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      };

      fetchFilteredCategoriesLevel1();
    } else {
      // Nếu mã code bị reset, reset tất cả danh sách
      setCategoriesLevel1([]);
      setCategoriesLevel2([]);
      setSelectedCategoryLevel1("");
      setSelectedCategoryLevel2("");
    }
  }, [type, token]);

  const fetchCategoriesLevel2 = async (parentId: number) => {
    try {
      const apiUrl = ADMIN_SUBJECT_GET_CATEGORY_PARENT_ID(parentId);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token for authorization
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: CategoryLevel[] = await response.json();

        // Lọc danh mục cấp 2 theo type
        const filteredCategories = data.filter(
          (category) => category.type === type
        );

        setCategoriesLevel2(filteredCategories); // Cập nhật danh mục cấp 2 đã lọc
        setSelectedCategoryLevel2(""); // Reset lựa chọn cấp 2
      } else {
        setError("Không thể tải danh mục cấp 2.");
        toast.error("Không thể tải danh mục cấp 2.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching filtered categories level 2:", error);
      setError("Lỗi khi tải danh mục cấp 2.");
      toast.error("Lỗi khi tải danh mục cấp 2.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleLevel1Change = (event: SelectChangeEvent<string | number>) => {
    const selectedId = event.target.value as number;
    setSelectedCategoryLevel1(selectedId); // Set selected Level 1 category
    setSelectedCategoryLevel2(""); // Reset selected Level 2 category
    fetchCategoriesLevel2(selectedId); // Fetch Level 2 categories based on selected Level 1 category
  };

  const handleLevel2Change = (event: SelectChangeEvent<string | number>) => {
    const selectedId = event.target.value as number;
    setSelectedCategoryLevel2(selectedId); // Set selected Level 2 category
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value;
    setType(newType);

    // Reset lỗi nếu có
    if (!newType) {
      setError("Vui lòng chọn một mã code!");
      setCategoriesLevel1([]);
      setCategoriesLevel2([]);
      setSelectedCategoryLevel1("");
      setSelectedCategoryLevel2("");
    } else {
      setError("");
    }
  };

  const handleSave = async () => {
    // Validate input
    if (!subjectName.trim()) {
      setError("Tên môn học không được để trống.");
      toast.error("Tên môn học không được để trống.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!selectedCategoryLevel1 || !selectedCategoryLevel2) {
      setError("Vui lòng chọn danh mục cấp 1 và cấp 2.");
      toast.error("Vui lòng chọn danh mục cấp 1 và cấp 2.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setError(null); // Reset error
    setSuccess(false); // Reset success state

    // Prepare data for submission
    const requestData = {
      name: subjectName,
      type: type,
      level: 3, // Set level to 3 by default
      parentId: selectedCategoryLevel2, // Use selected Level 2 category ID as parentId
    };

    try {
      const response = await fetch(ADMIN_POST_SUBJECT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token for authorization
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData), // Send data as JSON
      });

      if (response.ok) {
        setSuccess(true); // Set success state
        setSubjectName(""); // Reset subject name field
        setSelectedCategoryLevel1(""); // Reset selected Level 1 category
        setSelectedCategoryLevel2(""); // Reset selected Level 2 category
        toast.success("Môn học đã được thêm thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/admin/category-subject");
      } else {
        const data = await response.json();
        setError(data.message || "Lưu môn học thất bại.");
        toast.error(data.message || "Lưu môn học thất bại.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu môn học:", error);
      setError("Lỗi khi lưu môn học.");
      toast.error("Có lỗi xảy ra khi lưu môn học.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setType(e.target.value);

  //   // Validate nếu cần
  //   if (!e.target.value) {
  //     setError("Vui lòng chọn một mã code!");
  //   } else {
  //     setError("");
  //   }
  // };
  return (
    <div className={styles.addSubjectContainer}>
      <Paper className={styles.paper}>
        <Typography variant="h4" className={styles.headerBold}>
          Thêm Môn Học
        </Typography>
        <Divider sx={{ marginBottom: "20px" }} />
        {error && (
          <Alert severity="error" className={styles.errorMessage}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" className={styles.successMessage}>
            Môn học đã được thêm thành công!
          </Alert>
        )}
        <Box className={styles.formContainer}>
          <TextField
            label="Tên Môn Học"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
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
            <InputLabel id="category-level1-label">Danh Mục Cấp 1</InputLabel>
            <Select
              labelId="category-level1-label"
              value={selectedCategoryLevel1}
              onChange={handleLevel1Change}
              label="Danh Mục Cấp 1"
              disabled={!categoriesLevel1.length} // Vô hiệu hóa nếu danh mục rỗng
            >
              {categoriesLevel1.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            variant="outlined"
            className={styles.selectField}
          >
            <InputLabel id="category-level2-label">Danh Mục Cấp 2</InputLabel>
            <Select
              labelId="category-level2-label"
              value={selectedCategoryLevel2}
              onChange={handleLevel2Change}
              label="Danh Mục Cấp 2"
              disabled={!selectedCategoryLevel1 || !categoriesLevel2.length} // Vô hiệu hóa nếu chưa chọn cấp 1 hoặc danh mục rỗng
            >
              {categoriesLevel2.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Cấp Độ"
            value={3} // Fixed level value as 3
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
              onClick={() => navigate("/admin/category-subject")}
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

export const RequestAdminURL = RequireAdmin(AddSubject);

export default AddSubject;
