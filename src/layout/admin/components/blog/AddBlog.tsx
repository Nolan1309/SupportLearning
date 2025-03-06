// AddBlog.tsx

import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_ADD_BLOG,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1,
  ADMIN_GET_CATEGORY_BLOG,
  ADMIN_GET_CATEGORY_PARENT_ID,
} from "../../../../api/api";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import styles from "./addBlog.module.scss";
import classNames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define interfaces for type safety
interface BlogCategory {
  id: number;
  name: string;
}

interface GetCategoriesResponse {
  _embedded: {
    blogCategories: BlogCategory[];
  };
}

interface AddBlogResponse {
  message: string;
  // Add other fields if necessary
}

const CustomPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4), // 32px
  maxWidth: 700,
  margin: "40px auto",
  backgroundColor: "#f9f9f9",
}));

const CustomButton = styled(Button)(({ theme }) => ({
  padding: "6px 12px", // Reduced padding
  fontSize: "14px", // Reduced font size
  height: "40px", // Reduced height
  backgroundColor: "#3f51b5",
  color: "white",
  border: "none",
  "&:hover": {
    backgroundColor: "#303f9f",
  },
  "&:disabled": {
    backgroundColor: "#9fa8da",
    cursor: "not-allowed",
  },
}));
interface CategoryLevel {
  id: number;
  name: string;
  category: string | null;
  level: number;
  type: string;
}
const AddBlog: React.FC = () => {
  const [mainCategory, setMainCategory] = useState<number | "">("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [subCategory, setSubCategory] = useState<number | "">("");
  const [subSubCategory, setSubSubCategory] = useState<number | "">("");
  const [categoriesLevel1, setCategoriesLevel1] = useState<CategoryLevel[]>([]);
  const [subCategories, setSubCategories] = useState<CategoryLevel[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<CategoryLevel[]>([]);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<
    number | null
  >(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | null
  >(null);

  const [image, setImage] = useState<string | null>(null); // Store image as Base64
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [authData, setAuthData] = useState<{ id: number } | null>(null);

  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const refresh = useRefreshToken();

  useEffect(() => {
    const fetchAuthData = () => {
      const storedAuthData = localStorage.getItem("authData");
      if (storedAuthData) {
        setAuthData(JSON.parse(storedAuthData));
      } else {
        navigate("/dang-nhap"); // Redirect to login if not found
      }
    };

    fetchAuthData();
  }, [navigate]);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     setLoading(true);
  //     let token = localStorage.getItem("authToken");

  //     if (isTokenExpired(token)) {
  //       token = await refresh();
  //       if (!token) {
  //         navigate("/dang-nhap");
  //         return;
  //       }
  //       localStorage.setItem("authToken", token);
  //     }

  //     try {
  //       const response = await fetch(ADMIN_GET_CATEGORY_BLOG, {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (!response.ok) {
  //         const errorText = await response.text();
  //         throw new Error(
  //           `Failed to fetch categories. Status: ${response.status}. Response: ${errorText}`
  //         );
  //       }

  //       const data: GetCategoriesResponse = await response.json();
  //       const fetchedCategories = data._embedded.blogCategories.map(
  //         (category) => ({
  //           id: category.id,
  //           name: category.name,
  //         })
  //       );
  //       setCategories(fetchedCategories);
  //     } catch (error) {
  //       console.error("Error fetching categories:", error);
  //       toast.error("Có lỗi xảy ra khi lấy danh mục.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCategories();
  // }, [navigate]);

  useEffect(() => {
    const fetchCategoriesLevel1 = async () => {
      try {
        const response = await fetch(ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const filteredLevel1 = data.filter(
            (category: CategoryLevel) => category.type === "blog"
          );
          setCategoriesLevel1(filteredLevel1);
        } else {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch categories level 1. Status: ${response.status}. Response: ${errorText}`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        // setError(errorMessage);
        console.error("Failed to fetch categories level 1:", errorMessage);
      }
    };
    fetchCategoriesLevel1();
  }, [token]);
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (selectedMainCategoryId !== null) {
        try {
          const response = await fetch(
            ADMIN_GET_CATEGORY_PARENT_ID(selectedMainCategoryId),
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const filteredLevel2 = data.filter(
              (category: CategoryLevel) => category.type === "blog"
            );
            setSubCategories(filteredLevel2);
          } else {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch subcategories. Status: ${response.status}. Response: ${errorText}`
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          // setError(errorMessage);
          console.error("Failed to fetch subcategories:", errorMessage);
        }
      }
    };
    fetchSubCategories();
  }, [selectedMainCategoryId, token]);
  useEffect(() => {
    const fetchSubSubCategories = async () => {
      if (selectedSubCategoryId !== null) {
        try {
          const response = await fetch(
            ADMIN_GET_CATEGORY_PARENT_ID(selectedSubCategoryId),
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const filteredLevel3 = data.filter(
              (category: CategoryLevel) => category.type === "blog"
            );
            setSubSubCategories(filteredLevel3);
          } else {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch sub-subcategories. Status: ${response.status}. Response: ${errorText}`
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          // setError(errorMessage);
          console.error("Failed to fetch sub-subcategories:", errorMessage);
        }
      }
    };
    fetchSubSubCategories();
  }, [selectedSubCategoryId, token]);

  const handleAddBlog = async () => {
    // Validate inputs using toast notifications
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề!");
      return;
    }

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung!");
      return;
    }

    // if (!category) {
    //   toast.error("Vui lòng chọn danh mục!");
    //   return;
    // }

    if (!image) {
      toast.error("Vui lòng chọn ảnh!");
      return;
    }

    if (!authData) {
      toast.error("Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại.");
      navigate("/dang-nhap");
      return;
    }

    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    const blogData = {
      title: title.trim(),
      content: content.trim(),
      status,
      image: image,
      cat_id: subSubCategory, // Ensure this is a number
      author_id: authData.id,
    };

    try {
      setLoading(true); // Start loading
      const response = await fetch(ADMIN_ADD_BLOG, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể thêm bài viết.");
      }

      const result: AddBlogResponse = await response.json();
      toast.success("Thêm bài viết thành công!", {
        position: "top-right",
        autoClose: 3000, // Tự động đóng sau 3 giây
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate("/admin/blog");
      }, 2000); // 2000 milliseconds = 2 giây
    } catch (error) {
      console.error("Error adding blog:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi thêm bài viết.";
      toast.error(errorMessage);
    } finally {
      setLoading(false); // End loading
    }
  };

  // Convert image to Base64
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn một file hình ảnh hợp lệ.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result); // image is a base64 string
        } else {
          toast.error("Không thể đọc file hình ảnh.");
        }
      };
      reader.readAsDataURL(file); // Convert image to Base64
    }
  };

  return (
    <CustomPaper elevation={3}>
      <div className={styles.Container}>
        <Typography variant="h4" align="center" gutterBottom>
          Thêm Bài Viết Mới
        </Typography>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddBlog();
          }}
          className={styles.Form}
        >
          <TextField
            label="Tiêu đề"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.textField}
            // Removed error and helperText
          />
          <FormControl
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
            required
            // error={mainCategory === "" && error === "Vui lòng chọn lĩnh vực."}
          >
            <InputLabel id="main-category-label">Lĩnh vực</InputLabel>
            <Select
              labelId="main-category-label"
              id="main-category-select"
              value={mainCategory}
              label="Lĩnh vực"
              onChange={(e) => {
                const value = e.target.value as number;
                setMainCategory(value);
                setSelectedMainCategoryId(value);
                setSubCategory("");
                setSubSubCategory("");
                setSubCategories([]);
                setSubSubCategories([]);
              }}
            >
              {categoriesLevel1.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
            {/* {mainCategory === "" && error === "Vui lòng chọn lĩnh vực." && (
              <FormHelperText>Lĩnh vực là bắt buộc.</FormHelperText>
            )} */}
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
            required
            // error={subCategory === "" && error === "Vui lòng chọn ngành."}
          >
            <InputLabel id="sub-category-label">Ngành</InputLabel>
            <Select
              labelId="sub-category-label"
              id="sub-category-select"
              value={subCategory}
              label="Ngành"
              onChange={(e) => {
                const value = e.target.value as number;
                setSubCategory(value);
                setSelectedSubCategoryId(value);
                setSubSubCategory(""); // Reset subSubCategory when subCategory changes
                setSubSubCategories([]); // Clear subSubCategories when subCategory changes
              }}
            >
              {subCategories.map((subCat) => (
                <MenuItem key={subCat.id} value={subCat.id}>
                  {subCat.name}
                </MenuItem>
              ))}
            </Select>
            {/* {subCategory === "" && error === "Vui lòng chọn ngành." && (
              <FormHelperText>Ngành là bắt buộc.</FormHelperText>
            )} */}
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
            required
            // error={subSubCategory === "" && error === "Vui lòng chọn môn học."}
          >
            <InputLabel id="sub-sub-category-label">Môn học</InputLabel>
            <Select
              labelId="sub-sub-category-label"
              id="sub-sub-category-select"
              value={subSubCategory}
              label="Môn học"
              onChange={(e) => setSubSubCategory(e.target.value as number)}
            >
              {subSubCategories.map((subSubCat) => (
                <MenuItem key={subSubCat.id} value={subSubCat.id}>
                  {subSubCat.name}
                </MenuItem>
              ))}
            </Select>
            {/* {subSubCategory === "" && error === "Vui lòng chọn môn học." && (
              <FormHelperText>Môn học là bắt buộc.</FormHelperText>
            )} */}
          </FormControl>

          <div className="add-blog-ck-editor">
            <CKEditor
              editor={ClassicEditor}
              data={content}
              onChange={(event, editor) => {
                const data = editor.getData();
                setContent(data);
              }}
            />
          </div>

          {/* Removed inline error message for CKEditor */}
          <FormControlLabel
            control={
              <Checkbox
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
                color="primary"
              />
            }
            label="Kích hoạt"
          />
          <Box className={styles.imageUpload}>
            <input
              accept="image/*"
              id="contained-button-file"
              multiple
              type="file"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="contained"
                color="primary"
                component="span"
                size="small" // Smaller size
              >
                Chọn Ảnh
              </Button>
            </label>
            {image && (
              <Box className={styles.preview}>
                <Typography variant="body2">Ảnh đã chọn:</Typography>
                <img
                  src={image}
                  alt="Preview"
                  className={styles.imagePreview}
                />
              </Box>
            )}
          </Box>
          <Box className={styles.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={
                !title.trim() ||
                !content.trim() ||
                // !category ||
                !image ||
                !authData ||
                loading
              }
            >
              Thêm Bài Viết
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/admin/blog")}
              className={classNames(styles.button, styles.buttonSecondary)}
              size="small" // Smaller size
            >
              Hủy
            </Button>
          </Box>
        </form>
      </div>
      <ToastContainer />
    </CustomPaper>
  );
};

export default AddBlog;
