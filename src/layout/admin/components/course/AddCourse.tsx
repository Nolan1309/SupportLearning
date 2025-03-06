// AddCourse.tsx

import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Box,
  Grid,
  InputLabel,
  Select,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_COURSE_GET_CATEGORY_COURSE,
  ADMIN_POST_COURSE,
  ADMIN_POST_CHAPTER,
  ADMIN_GET_CATEGORY_PARENT_ID,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1,
} from "../../../../api/api";
import styles from "./addCourse.module.scss";
import RequireAdmin from "../../../DOM/RequireAdmin";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface Category {
  id: number;
  name: string;
}
interface CategoryLevel {
  id: number;
  name: string;
  category: string | null;
  level: number;
  type: string;
}

export interface AccountTeacherDTO_V2 {
  id: number;
  birthday: string; // Hoặc Date nếu bạn muốn xử lý ngày tháng với đối tượng Date
  createdAt: string;
  deletedDate: string | null; // Có thể null nếu tài khoản chưa bị xóa
  email: string;
  fullname: string;
  gender: string;
  isDeleted: boolean;
  phone: string;
  updatedAt: string;
  roleId: number;
}

const AddCourse: React.FC = () => {
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseAuthor, setCourseAuthor] = useState<string>(""); // Author from authData
  const [courseDescription, setCourseDescription] = useState<string>(""); // For CKEditor
  const [courseDuration, setCourseDuration] = useState<string>("");
  const [courseLanguage, setCourseLanguage] = useState<string>("Vietnamese");
  const [courseCost, setCourseCost] = useState<number>(0);
  const [courseOutput, setCourseOutput] = useState<string>(""); // For CKEditor
  const [courseImageBase64, setCourseImageBase64] = useState<string>(""); // Save Base64 string here
  const [courseCategory, setCourseCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [courseType, setCourseType] = useState<string>("FEE"); // Loại khóa học
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const [teacherAccount, setTeacherAccount] = useState<AccountTeacherDTO_V2[]>([]);

  // Update
  const [mainCategory, setMainCategory] = useState<number | "">("");
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

  const refresh = useRefreshToken();
  const [selectedTeacher, setSelectedTeacher] = useState<
    number | null
  >(null);

  const fetchAccountTeacherList = async () => {
    let token = localStorage.getItem("authToken");
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/account/list-teacher-only`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setTeacherAccount(data);

    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };


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
            (category: CategoryLevel) => category.type === "course"
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
              (category: CategoryLevel) => category.type === "course"
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
              (category: CategoryLevel) => category.type === "course"
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

  useEffect(() => {
    // fetchCategories();
    fetchAccountTeacherList();
    if (authData) {
      setCourseAuthor(authData.fullname);
    }
    if (courseType === "FREE") {
      setCourseCost(0); // Nếu `type` là "FREE", `cost` sẽ tự động là 0
    }
  }, [courseType]);

  // const fetchCategories = async () => {
  //   try {
  //     const response = await fetch(ADMIN_COURSE_GET_CATEGORY_COURSE);
  //     const data = await response.json();
  //     const categoriesFromAPI = data._embedded.courseCategories;
  //     setCategories(categoriesFromAPI);
  //   } catch (error) {
  //     console.error("Failed to fetch categories:", error);
  //   }
  // };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!courseTitle.trim())
      newErrors.courseTitle = "Tên khóa học không được để trống.";
    if (!courseDescription.trim())
      newErrors.courseDescription = "Mô tả không được để trống.";
    if (!courseDuration.trim())
      newErrors.courseDuration = "Thời lượng không được để trống.";
    if (!courseLanguage.trim())
      newErrors.courseLanguage = "Ngôn ngữ không được để trống.";
    if (courseType === "FEE" && (!courseCost || courseCost <= 0))
      newErrors.courseCost = "Chi phí phải lớn hơn 0.";
    if (!courseOutput.trim())
      newErrors.courseOutput = "Course output không được để trống.";
    if (!courseImageBase64)
      newErrors.courseImageBase64 = "Hình ảnh không được để trống.";
    if (!subSubCategory)
      newErrors.courseCategory = "Danh mục khóa học không được để trống.";

    if (!selectedTeacher && authData.roleId === 1)
      newErrors.selectTeacher = "Giáo viên khóa học không được để trống.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Convert image file to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseImageBase64(reader.result as string); // Save Base64 string to state
      };
      reader.readAsDataURL(file); // Convert file to base64 string
    }
  };

  const handleAddCourse = async () => {
    if (!validateForm()) return;

    const confirmAdd = window.confirm(
      "Bạn có chắc chắn muốn thêm khóa học này?"
    );
    if (!confirmAdd) return;

    let accountIdParam = selectedTeacher;
    if (authData.roleId === 3) {
      accountIdParam = authData.roleId;
    }


    const courseData = {
      coursesTitle: courseTitle.trim(),
      author: courseAuthor.trim(),
      description: courseDescription.trim(),
      duration: courseDuration.trim(),
      language: courseLanguage.trim(),
      cost: courseType === "FREE" ? 0 : courseCost,
      price: courseCost,
      courseOutput: courseOutput.trim(),
      imageUrl: courseImageBase64,
      courseCategoryId: subSubCategory,
      accountId: accountIdParam,
      type: courseType,
    };
    // console.log(courseData);
    try {
      const response = await fetch(ADMIN_POST_COURSE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });
      if (response.ok) {
        toast.success("Thêm khóa học thành công!")
        setTimeout(() => {
          window.location.href = "/admin/khoa-hoc";
        }, 2000);
      } else {
        // const errorText = await response.text();
        // console.error("Fail  ed to add course:", errorText);
        toast.warn("Thêm khóa học thất bại. Vui lòng thử lại!")
        // alert("Thêm khóa học thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      toast.warn("Đã xảy ra lỗi khi thêm khóa học. Vui lòng thử lại!")
    }
  };
  const handleAccountChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedTeacherId = event.target.value as number;
    setSelectedTeacher(selectedTeacherId);
  };

  return (
    <Box className={styles["add-course-page"]}>
      <Paper elevation={3} className={styles["add-course-container"]}>
        <Typography variant="h4" gutterBottom>
          Thêm Khóa Học
        </Typography>
        {/* Form */}
        <Grid container spacing={3} className={styles["form-container"]}>
          {/* Các phần bên trái */}
          <Grid item xs={12} sm={6}>
            {/* Tên Khóa Học */}
            <TextField
              className={styles["text-field"]}
              label="Tên Khóa Học"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!!errors.courseTitle}
              helperText={errors.courseTitle}
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
                  setSubSubCategory("");
                  setSubSubCategories([]);
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

            </FormControl>

            {authData.roleId === 1 && (
              <div style={{ marginTop: '10px ' }}>
                <TextField
                  label="Chọn giáo viên"
                  variant="outlined"
                  fullWidth
                  select
                  value={selectedTeacher}
                  onChange={handleAccountChange}
                  sx={{ marginBottom: "20px" }}
                >
                  {teacherAccount.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.fullname}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            )}




            <FormControl
              variant="outlined"
              fullWidth
              margin="normal"
              required
              error={!!errors.courseType}
              className={styles["form-control"]}
            >
              <InputLabel id="course-type-label">Loại Khóa Học</InputLabel>
              <Select
                labelId="course-type-label"
                id="course-type-select"
                value={courseType}
                onChange={(e: SelectChangeEvent<string>) =>
                  setCourseType(e.target.value)
                }
                label="Loại Khóa Học"
              >
                <MenuItem value="FREE">FREE</MenuItem>
                <MenuItem value="FEE">FEE</MenuItem>
              </Select>
              {errors.courseType && (
                <FormHelperText>{errors.courseType}</FormHelperText>
              )}
            </FormControl>
            {/* Chi phí */}
            <TextField
              className={styles["text-field"]}
              label="Chi phí"
              type="number"
              value={courseType === "FREE" ? 0 : courseCost}
              onChange={(e) => {
                if (courseType === "FREE") {
                  setCourseCost(0);
                } else {
                  setCourseCost(parseFloat(e.target.value));
                }
              }}
              fullWidth
              margin="normal"
              required={courseType === "FEE"}
              error={!!errors.courseCost}
              helperText={errors.courseCost}
              disabled={courseType === "FREE"}
              InputProps={{ inputProps: { min: 0 } }}
            />

            {/* Thời lượng */}
            <TextField
              className={styles["text-field"]}
              label="Thời lượng"
              value={courseDuration}
              onChange={(e) => setCourseDuration(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!!errors.courseDuration}
              helperText={errors.courseDuration}
            />

            {/* Ngôn ngữ */}
            <FormControl
              variant="outlined"
              fullWidth
              margin="normal"
              required
              error={!!errors.courseLanguage}
              className={styles["form-control"]}
            >
              <InputLabel id="language-label">Ngôn ngữ</InputLabel>
              <Select
                labelId="language-label"
                id="language-select"
                value={courseLanguage}
                onChange={(e: SelectChangeEvent<string>) =>
                  setCourseLanguage(e.target.value)
                }
                label="Ngôn ngữ"
              >
                <MenuItem value="Vietnamese">Tiếng Việt</MenuItem>
                <MenuItem value="English">English</MenuItem>
              </Select>
              {errors.courseLanguage && (
                <FormHelperText>{errors.courseLanguage}</FormHelperText>
              )}
            </FormControl>

            {/* Loại Khóa Học */}

          </Grid>

          {/* Phần ảnh bên phải */}
          <Grid item xs={12} sm={6}>
            <Box className={styles["image-container-wrapper"]}>
              <Box className={styles["image-container"]}>
                {courseImageBase64 ? (
                  <img
                    src={courseImageBase64}
                    alt="Ảnh"
                    className={styles.image}
                  />
                ) : (
                  <Typography variant="subtitle1" color="textSecondary">
                    Không có ảnh được chọn
                  </Typography>
                )}
              </Box>
            </Box>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="upload-image"
              type="file"
              onChange={handleImageChange}
              required
            />
            <label htmlFor="upload-image" className={styles["upload-image"]}>
              <Button variant="contained" color="primary" component="span">
                Upload Image
              </Button>
            </label>
            {errors.courseImageBase64 && (
              <Typography color="error" variant="caption">
                {errors.courseImageBase64}
              </Typography>
            )}
          </Grid>

          {/* Phần Mô tả */}
          <Grid item xs={12}>
            <Box className={styles["editor-container"]}>
              <Typography variant="subtitle1" gutterBottom>
                Mô tả
              </Typography>
              <div style={{ height: '300px' }} className="description-add-course">
                <CKEditor
                  editor={ClassicEditor}

                  data={courseDescription}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setCourseDescription(data);
                  }}
                />
                {errors.courseDescription && (
                  <Typography color="error" variant="caption">
                    {errors.courseDescription}
                  </Typography>
                )}
              </div>

            </Box>
          </Grid>

          {/* Phần Course Output */}
          <Grid item xs={12}>
            <Box className={styles["editor-container"]}>
              <Typography variant="subtitle1" gutterBottom>
                Course Output
              </Typography>
              <CKEditor
                editor={ClassicEditor}
                data={courseOutput}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setCourseOutput(data);
                }}
              />
              {errors.courseOutput && (
                <Typography color="error" variant="caption">
                  {errors.courseOutput}
                </Typography>
              )}
            </Box>

            {/* Nút Thêm Khóa Học và Quay lại */}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                onClick={handleAddCourse}
                color="primary"
                variant="contained"
                size="large"
                className={styles["btn-primary"]}
              >
                Thêm Khóa Học
              </Button>
              <Button
                onClick={() => navigate("/admin/khoa-hoc")}
                color="secondary"
                variant="outlined"
                size="large"
                className={styles["btn-secondary"]}
              >
                Quay lại
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export const RequestAdminURL = RequireAdmin(AddCourse);
export default AddCourse;
