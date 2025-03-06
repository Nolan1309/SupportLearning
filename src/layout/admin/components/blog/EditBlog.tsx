// EditBlog.tsx

import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Input,
  FormControl,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";
import "./editBlog.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADMIN_UPDATE_BLOG,
  ADMIN_GET_ONE_BLOG,
  ADMIN_GET_CATEGORY_BLOG,
  ADMIN_CATEGORY_GET_LEVEL3,
  ADMIN_CATEGORY_GET_LEVEL2,
  ADMIN_CATEGORY_GET_LEVEL1,
} from "../../../../api/api";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import styles from "./editBlog.module.scss";
import classNames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Định nghĩa các interface để đảm bảo type safety
// interface BlogCategory {
//   id: number;
//   name: string;
// }

// interface GetCategoriesResponse {
//   _embedded: {
//     blogCategories: BlogCategory[];
//   };
// }

interface GetOneBlogResponse {
  title: string;
  content: string;
  //   catBlogId: number;
  status: boolean;
  image: string;
  level_3_id: number;
  level_2_id: number;
  level_1_id: number;
}

interface UpdateBlogResponse {
  message: string;
  // Thêm các trường khác nếu cần
}

interface CategoryLevel {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  type: string;
}

const CustomPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4), // 32px
  maxWidth: 700,
  margin: "40px auto",
  backgroundColor: "#f9f9f9",
}));
const EditBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  //   const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null); // Store image as Base64
  // const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [authData, setAuthData] = useState<{ id: number } | null>(null);

  const [selectedLevel1, setSelectedLevel1] = useState<number | "">("");
  const [selectedLevel2, setSelectedLevel2] = useState<number | "">("");
  const [selectedLevel3, setSelectedLevel3] = useState<number | "">("");
  const [categoriesLevel1, setCategoriesLevel1] = useState<CategoryLevel[]>([]);
  const [categoriesLevel2, setCategoriesLevel2] = useState<CategoryLevel[]>([]);
  const [categoriesLevel3, setCategoriesLevel3] = useState<CategoryLevel[]>([]);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Lấy thông tin xác thực người dùng
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
    // fetchCategories();
  }, [navigate]);

  // Lấy thông tin blog cần chỉnh sửa
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        toast.error("ID blog không hợp lệ.");
        navigate("/admin/blog");
        return;
      }

      setLoading(true);
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
        const response = await fetch(`${ADMIN_GET_ONE_BLOG}/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch blog. Status: ${response.status}. Response: ${errorText}`
          );
        }

        const data: GetOneBlogResponse = await response.json();
        setTitle(data.title);
        setContent(data.content);
        // setCategory(data.level_3_id.toString());
        setStatus(data.status);
        setImage(data.image);
        await fetchCategories(
          data.level_1_id,
          data.level_2_id,
          data.level_3_id
        );
      } catch (error) {
        console.error("Error fetching blog data:", error);
        toast.error("Đã xảy ra lỗi khi lấy dữ liệu blog.");
      } finally {
        setLoading(false);
      }
    };
    const fetchCategories = async (
      level1Id: number,
      level2Id: number,
      level3Id: number
    ) => {
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
        // Fetch categories for all levels
        const [level1Response, level2Response, level3Response] =
          await Promise.all([
            fetch(ADMIN_CATEGORY_GET_LEVEL1, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(ADMIN_CATEGORY_GET_LEVEL2, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(ADMIN_CATEGORY_GET_LEVEL3, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (!level1Response.ok || !level2Response.ok || !level3Response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const [level1Data, level2Data, level3Data] = await Promise.all([
          level1Response.json(),
          level2Response.json(),
          level3Response.json(),
        ]);

        const filteredLevel1 = level1Data.filter(
          (category: CategoryLevel) => category.type === "blog"
        );
        const filteredLevel2 = level2Data.filter(
          (category: CategoryLevel) => category.type === "blog"
        );
        const filteredLevel3 = level3Data.filter(
          (category: CategoryLevel) => category.type === "blog"
        );

        setCategoriesLevel1(filteredLevel1);
        setCategoriesLevel2(filteredLevel2);
        setCategoriesLevel3(filteredLevel3);

        setSelectedLevel1(
          level1Data.find((category: CategoryLevel) => category.id === level1Id)
            ?.id || ""
        );
        setSelectedLevel2(
          level2Data.find((category: CategoryLevel) => category.id === level2Id)
            ?.id || ""
        );
        setSelectedLevel3(
          level3Data.find((category: CategoryLevel) => category.id === level3Id)
            ?.id || ""
        );
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchBlog();
  }, [id, navigate]);

  // Xử lý cập nhật blog
  const handleUpdateBlog = async () => {
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
      image: image || "", // Nếu không thay đổi ảnh, có thể giữ nguyên hoặc để trống
      cat_id: selectedLevel3,
      level_2_id: selectedLevel2,
      level_1_id: selectedLevel1,
      author_id: authData.id,
    };

    try {
      setLoading(true); // Start loading
      const response = await fetch(`${ADMIN_UPDATE_BLOG}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật blog.");
      }

      const result: UpdateBlogResponse = await response.json();
      toast.success("Cập nhật blog thành công!", {
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
      console.error("Error updating blog:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi cập nhật blog.";
      toast.error(errorMessage);
    } finally {
      setLoading(false); 
    }
  };

  // Chuyển đổi ảnh thành Base64
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
          setImage(reader.result); 
        } else {
          toast.error("Không thể đọc file hình ảnh.");
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleLevel1Change = (e: SelectChangeEvent<number | "">) => {
    const level1Id = e.target.value as number;
    setSelectedLevel1(level1Id);
    setSelectedLevel2("");
    setSelectedLevel3("");
  };

  const handleLevel2Change = (e: SelectChangeEvent<number | "">) => {
    const level2Id = e.target.value as number;
    setSelectedLevel2(level2Id);
    setSelectedLevel3("");
  };

  const handleLevel3Change = (e: SelectChangeEvent<number | "">) => {
    const level3Id = e.target.value as number;
    setSelectedLevel3(level3Id);
  };
  return (
    <CustomPaper elevation={3}>
      <Box className={styles.Container}>
        <Typography variant="h4" align="center" gutterBottom>
          Cập Nhật Bài Viết
        </Typography>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateBlog();
          }}
          className={styles.Form}
        >
          <TextField
            label="Tiêu Đề"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.formField}
            // Đã loại bỏ các prop error và helperText
          />
          <FormControl
            fullWidth
            variant="outlined"
            required
            className={styles.formField}
            // Đã loại bỏ prop error
          >
            {/* <Select
              labelId="category-label"
              id="category-select"
              value={category}
              label="Danh Mục"
              onChange={(e) => setCategory(e.target.value as string)}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </MenuItem>
                ))
              )}
            </Select> */}
            <Box className={styles["input-group"]}>
              <FormControl
                fullWidth
                variant="outlined"
                margin="normal"
                required
                error={!!formErrors.idCategory}
                className={styles["form-control"]}
              >
                <InputLabel id="level1-label">Ngành học</InputLabel>
                <Select
                  labelId="level1-label"
                  id="level1-select"
                  value={selectedLevel1}
                  onChange={handleLevel1Change}
                  label="Ngành học"
                >
                  <MenuItem value="">
                    <em>Chọn ngành</em>
                  </MenuItem>
                  {categoriesLevel1.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.idCategory && (
                  <FormHelperText>{formErrors.idCategory}</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Category Level 2 */}
            <Box className={styles["input-group"]}>
              <FormControl
                fullWidth
                variant="outlined"
                margin="normal"
                required
                error={!!formErrors.idCategory}
                className={styles["form-control"]}
                disabled={selectedLevel1 === ""}
              >
                <InputLabel id="level2-label">Khoa</InputLabel>
                <Select
                  labelId="level2-label"
                  id="level2-select"
                  value={selectedLevel2}
                  onChange={handleLevel2Change}
                  label="Khoa"
                >
                  <MenuItem value="">
                    <em>Chọn khoa</em>
                  </MenuItem>
                  {categoriesLevel2
                    .filter((category) => category.parentId === selectedLevel1)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.idCategory && (
                  <FormHelperText>{formErrors.idCategory}</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Category Level 3 */}
            <Box className={styles["input-group"]}>
              <FormControl
                fullWidth
                variant="outlined"
                margin="normal"
                required
                error={!!formErrors.idCategory}
                className={styles["form-control"]}
                disabled={selectedLevel2 === ""}
              >
                <InputLabel id="level3-label">Môn học</InputLabel>
                <Select
                  labelId="level3-label"
                  id="level3-select"
                  value={selectedLevel3}
                  onChange={handleLevel3Change}
                  label="Môn học"
                >
                  <MenuItem value="">
                    <em>Chọn môn học</em>
                  </MenuItem>
                  {categoriesLevel3
                    .filter((category) => category.parentId === selectedLevel2)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.idCategory && (
                  <FormHelperText>{formErrors.idCategory}</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Đã loại bỏ FormHelperText */}
          </FormControl>
          <div style={{ maxWidth: "800px" }} className="ck-editor-edit">
            <CKEditor
              editor={ClassicEditor}
              data={content}
              onChange={(event, editor) => {
                const data = editor.getData();
                setContent(data);
              }}
            />
          </div>

          {/* Đã loại bỏ thông báo lỗi inline cho CKEditor */}
          <FormControlLabel
            control={
              <Checkbox
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
                color="primary"
              />
            }
            label="Hoạt Động"
          />

          {/* Thay Thế TextField Cho File Input */}
          <FormControl
            fullWidth
            variant="outlined"
            className={styles.formField}
          >
            <InputLabel htmlFor="image-upload" shrink={Boolean(image)}>
              Thay Đổi Hình Ảnh
            </InputLabel>
            <Input
              id="image-upload"
              type="file"
              onChange={handleImageChange}
              inputProps={{
                accept: "image/*",
              }}
            />
          </FormControl>

          {/* Khung hiển thị hình ảnh */}
          {image && (
            <Box className={styles.imagePreviewContainer}>
              <img
                src={image} // Nếu image là Base64 thì sẽ trực tiếp sử dụng
                alt="Blog"
                className={styles.imagePreview}
              />
            </Box>
          )}

          <Box className={styles.buttonContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={loading}
            >
              Cập nhật
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/admin/blog")}
              className={classNames(styles.button, styles.buttonSecondary)}
              size="small" // Kích thước nhỏ hơn
            >
              Huỷ
            </Button>
          </Box>
        </form>
      </Box>
      <ToastContainer />
    </CustomPaper>
  );
};

export default EditBlog;
