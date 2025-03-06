// EditSubject.tsx

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
import styles from "./editSubject.module.scss"; // Import SCSS module
import {
  ADMIN_CATEGORY_GET_ONE_SUBJECT,
  ADMIN_UPDATE_SUBJECT,
  ADMIN_SUBJECT_GET_CATEGORY_PARENT_ID,
  ADMIN_CATEGORY_GET_LEVEL1,
} from "../../../../../api/api"; // Thay thế bằng đường dẫn API chính xác
import RequireAdmin from "../../../../DOM/RequireAdmin";

interface Category {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
}

const EditSubject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<number>(3); // Level of subject
  const [categoriesLevel2, setCategoriesLevel2] = useState<Category[]>([]);
  const [categoriesLevel1, setCategoriesLevel1] = useState<Category[]>([]);
  const [selectedCategoryLevel2, setSelectedCategoryLevel2] = useState<
    number | null
  >(null);
  const [selectedCategoryLevel1, setSelectedCategoryLevel1] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [type, setType] = useState<string>(""); 
  const token = localStorage.getItem("authToken");

  // Fetch Level 1 categories
  const fetchCategoriesLevel1 = async () => {
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
        setCategoriesLevel1(data); // Set level 1 categories
        console.log("Fetched categories level 1:", data); // Debugging: Log fetched data
      } else {
        console.error("Failed to fetch categories level 1");
        setError("Failed to fetch categories cấp 1.");
      }
    } catch (error) {
      console.error("Error fetching categories level 1:", error);
      setError("Error fetching categories cấp 1.");
    }
  };

  // Fetch Level 2 categories based on the selected Level 1 category
  const fetchCategoriesLevel2 = async (parentId: number) => {
    try {
      const apiUrl = ADMIN_SUBJECT_GET_CATEGORY_PARENT_ID(parentId);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategoriesLevel2(data); // Set level 2 categories
        console.log("Fetched categories level 2:", data); // Debugging: Log fetched data
      } else {
        console.error("Failed to fetch categories level 2");
        setError("Failed to fetch categories cấp 2.");
      }
    } catch (error) {
      console.error("Error fetching categories level 2:", error);
      setError("Error fetching categories cấp 2.");
    }
  };

  useEffect(() => {
    const fetchSubject = async () => {
      if (!id) {
        setError("ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const apiUrl = ADMIN_CATEGORY_GET_ONE_SUBJECT(Number(id));
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const subject = data[0];
            setName(subject.name);
            setLevel(subject.level);
            setType(subject.type);
            // Set selected categories based on fetched data
            setSelectedCategoryLevel2(subject.category.id); // Set Level 2 selection
            setSelectedCategoryLevel1(subject.category.category.id); // Set Level 1 selection

            // Fetch Level 2 categories based on selected Level 1
            fetchCategoriesLevel2(subject.category.category.id);
          } else {
            console.error("Unexpected data format:", data);
            setError("Unexpected data format received.");
          }
        } else {
          console.error(
            "Failed to fetch subject:",
            response.status,
            response.statusText
          );
          setError(
            `Failed to fetch subject: ${response.status} - ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error fetching subject:", error);
        setError("Failed to fetch subject");
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
    fetchCategoriesLevel1(); // Fetch Level 1 categories on component mount
  }, [id, token]);

  const handleCategoryLevel1Change = (event: SelectChangeEvent<number>) => {
    const selectedId = event.target.value as number;
    setSelectedCategoryLevel1(selectedId);
    setSelectedCategoryLevel2(null); // Reset selected level 2 category

    // Fetch level 2 categories based on the selected level 1 category
    fetchCategoriesLevel2(selectedId);
  };

  const handleCategoryLevel2Change = (event: SelectChangeEvent<number>) => {
    const selectedId = event.target.value as number;
    setSelectedCategoryLevel2(selectedId);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Tên môn học không được để trống.");
      return;
    }

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn lưu các thay đổi không?"
    );
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const updateApiUrl = ADMIN_UPDATE_SUBJECT(Number(id));

    try {
      const response = await fetch(updateApiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          level,
          parentId: selectedCategoryLevel2,
        }),
      });

      if (response.ok) {
        navigate("/admin/category-subject");
      } else {
        console.error(
          "Failed to update subject:",
          response.status,
          response.statusText
        );
        setError(
          `Failed to update subject: ${response.status} - ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error updating subject:", error);
      setError("Failed to update subject");
    } finally {
      setLoading(false);
    }
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
        variant="h4"
        component="h2"
        gutterBottom
        className={styles.h2}
      >
        Chỉnh sửa Môn Học
      </Typography>
      {loading ? (
        <CircularProgress className={styles.circularProgress} />
      ) : (
        <form onSubmit={handleSubmit} className={styles.editForm}>
          {error && (
            <Typography className={styles.errorMessage}>{error}</Typography>
          )}
          <TextField
            label="Tên Môn Học"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            fullWidth
            className={styles.textfield}
            error={Boolean(error)}
            helperText={error}
          />
          <FormControl
            variant="outlined"
            fullWidth
            className={styles.textfield}
          >
            <InputLabel id="category-level1-label">Lĩnh vực</InputLabel>
            <Select
              labelId="category-level1-label"
              value={
                selectedCategoryLevel1 !== null ? selectedCategoryLevel1 : ""
              }
              onChange={handleCategoryLevel1Change}
              label="Lĩnh vực"
            >
              {categoriesLevel1.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            variant="outlined"
            fullWidth
            className={styles.textfield}
          >
            <InputLabel id="category-level2-label">Ngành</InputLabel>
            <Select
              labelId="category-level2-label"
              value={
                selectedCategoryLevel2 !== null ? selectedCategoryLevel2 : ""
              }
              onChange={handleCategoryLevel2Change}
              label="Ngành"
              disabled={!selectedCategoryLevel1}
            >
              {categoriesLevel2.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
            type="number"
            value={level}
            variant="outlined"
            fullWidth
            disabled
            className={styles.textfield}
            InputProps={{
              readOnly: true,
            }}
          />
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

export const RequestAdminURL = RequireAdmin(EditSubject);

export default EditSubject;
