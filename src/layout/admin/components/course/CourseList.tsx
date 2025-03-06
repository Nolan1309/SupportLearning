import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  CircularProgress,
  Paper,
  Divider,
} from "@material-ui/core";
import { Add, Edit } from "@material-ui/icons";
import { Delete } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import { TablePagination } from "@material-ui/core";
import clsx from "clsx";
import {
  ADMIN_GETALL_RESULT,
  ADMIN_GET_COURSE_OF_ACCOUNT,
  // ADMIN_PUT_ACTIVE_COURSE_CLEAR,
  ADMIN_PUT_DELETE_COURSE_CLEAR,
  ADMIN_GET_CATEGORY_COURSE,
  ADMIN_STATUS_COURSE,
  ADMIN_UNSTATUS_COURSE,
  ADMIN_GET_ACCOUNT_TEACHER,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL2,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL3,
} from "../../../../api/api";
import RequireAdmin from "../../../DOM/RequireAdmin";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import styles from "./courseList.module.scss";
import classNames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "../../../util/ConfirmModal";
interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  courseOutput: string;
  language: string;
  author: string;
  duration: string;
  cost: number; // BigDecimal được biểu diễn dưới dạng number
  price: number; // BigDecimal được biểu diễn dưới dạng number
  createdAt: string; // LocalDateTime được biểu diễn dưới dạng chuỗi ISO
  updatedAt: string; // LocalDateTime được biểu diễn dưới dạng chuỗi ISO
  status: boolean; // Có thể null (nullable)
  type: string;
  deletedDate: string | null; // Có thể null
  isDeleted: boolean;
  categoryNameLevel3: string | null; // Có thể null
  categoryIdLevel3: number | null; // Có thể null
  categoryNameLevel2: string | null; // Có thể null
  categoryIdLevel2: number | null; // Có thể null
  categoryNameLevel1: string | null; // Có thể null
  categoryIdLevel1: number | null; // Có thể null
  accountId: number | null; // Có thể null
  teacherName?: string;
  countStudent: string;
}

interface AdminAccountV2 {
  id: number;
  birthday: string | null; // LocalDateTime chuyển sang string (ISO format)
  createdAt: string; // LocalDateTime chuyển sang string (ISO format)
  deletedDate: string | null; // Có thể null
  email: string;
  fullname: string;
  gender: string;
  googleId: string | null; // Có thể null
  isDeleted: boolean;
  isGoogleAccount: boolean;
  phone: string;
  updatedAt: string; // LocalDateTime chuyển sang string (ISO format)
  roleId: number; // ID của vai trò
}
interface Category {
  id: number;
  name: string;
}
interface AccountTeacher {
  id: number;
  birthday: Date;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  fullname: string;
  gender: string;
  isDeleted: boolean;
  deletedDate: Date;
  phone: string;
  roleId: number;
}
interface CategoryLevel {
  id: number;
  name: string;
  category: CategoryLevel[];
  level: number;
  parentId?: number | null;
  type: string;
}
const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [accountTeacher, setAccountTeacher] = useState<AdminAccountV2[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedCategory, setSelectedCategory] =
  //   useState<string>("Tất cả danh mục");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const [filterField, setFilterField] = useState<string>("");
  const [filterSector, setFilterSector] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [categoriesLevel1, setCategoriesLevel1] = useState<CategoryLevel[]>([]);
  const [categoriesLevel2, setCategoriesLevel2] = useState<CategoryLevel[]>([]);
  const [categoriesLevel3, setCategoriesLevel3] = useState<CategoryLevel[]>([]);

  const [filteredCategoriesLevel1, setFilteredCategoriesLevel1] =
    useState<CategoryLevel[]>(categoriesLevel1);

  const [filteredCategoriesLevel2, setFilteredCategoriesLevel2] = useState<
    CategoryLevel[]
  >([]);
  const [filteredCategoriesLevel3, setFilteredCategoriesLevel3] = useState<
    CategoryLevel[]
  >([]);
  //Filter
  const [accountTeachers, setAccountTeachers] = useState<AccountTeacher[]>([]);
  const [selectTeacher, setSelectTeacher] = useState("");
  const navigate = useNavigate();
  const refresh = useRefreshToken();

  const getAuthData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        return JSON.parse(authData);
      } catch (error) {
        console.error("Error parsing authData:", error);
        return null;
      }
    }
    return null;
  };

  // const fetchAccountTeachers = async () => {
  //   let token = localStorage.getItem("authToken");

  //   if (!token || isTokenExpired(token)) {
  //     token = await refresh();
  //     if (!token) {
  //       navigate("/dang-nhap");
  //       return;
  //     }
  //     localStorage.setItem("authToken", token);
  //   }
  //   try {
  //     const response = await fetch(
  //       "${process.env.REACT_APP_SERVER_HOST}/api/account/list-teacher-only",
  //       {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch data");
  //     }
  //     const data: AccountTeacher[] = await response.json();
  //     setAccountTeachers(data);
  //   } catch (error: any) {
  //     toast.error(error);
  //   }
  // };

  const fetchCourses = async () => {
    const authData = getAuthData();
    if (!authData) {
      alert("Vui lòng đăng nhập lại.");
      navigate("/dang-nhap");
      return;
    }

    const { id: accountId, roleId } = authData;
    if (!roleId) {
      alert("Không thể xác định quyền truy cập.");
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
    const params = new URLSearchParams({
      ...(filterField && { categoryId1: filterField }),
      ...(filterSector && { categoryId2: filterSector }),
      ...(filterSubject && { categoryId3: filterSubject }),
      ...(searchTerm && { searchTerm: searchTerm }),
      page: page.toString(),
      size: rowsPerPage.toString(),
    });
    const url = `${process.env.REACT_APP_SERVER_HOST}/api/courses/all-get-result-search?${params.toString()}`;

    // const apiEndpoint =
    //   roleId === 1
    //     ? `${ADMIN_GETALL_RESULT}?page=${page}&size=${rowsPerPage}`
    //     : roleId === 3
    //     ? `${ADMIN_GET_COURSE_OF_ACCOUNT}/${accountId}?page=${page}&size=${rowsPerPage}`
    //     : null;

    // if (!apiEndpoint) {
    //   alert("Không xác định được API.");
    //   return;
    // }

    setLoading(true);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setCourses(data.content);

      setTotalElements(data.totalElements);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // setLoading(true);
    let tokenLocal = localStorage.getItem("authToken");

    if (isTokenExpired(tokenLocal)) {
      tokenLocal = await refresh();
      if (!tokenLocal) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", tokenLocal);
    }

    try {
      const [level1Res, level2Res, level3Res] = await Promise.all([
        fetch(ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenLocal}`,
          },
        }),
        fetch(ADMIN_DOCUMENT_GET_CATEGORY_LEVEL2, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenLocal}`,
          },
        }),
        fetch(ADMIN_DOCUMENT_GET_CATEGORY_LEVEL3, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenLocal}`,
          },
        }),
      ]);

      if (!level1Res.ok) throw new Error("Failed to fetch Level 1 categories");
      if (!level2Res.ok) throw new Error("Failed to fetch Level 2 categories");
      if (!level3Res.ok) throw new Error("Failed to fetch Level 3 categories");

      const level1Data: CategoryLevel[] = await level1Res.json();
      const level2Data: CategoryLevel[] = await level2Res.json();
      const level3Data: CategoryLevel[] = await level3Res.json();

      const filteredLevel1 = level1Data.filter(
        (category) => category.type === "course"
      );
      const filteredLevel2 = level2Data.filter(
        (category) => category.type === "course"
      );
      const filteredLevel3 = level3Data.filter(
        (category) => category.type === "course"
      );
      setCategoriesLevel1(filteredLevel1 || []);
      setCategoriesLevel2(filteredLevel2 || []);
      setCategoriesLevel3(filteredLevel3 || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      // setError(errorMessage);
      console.error("Error fetching categories:", errorMessage);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, filterSubject, filterField, filterSector, searchTerm, rowsPerPage, navigate]);
  useEffect(() => {
    fetchCategories();
    // fetchAccountTeachers();
  }, []);
  useEffect(() => {
    // const fetchCategories = async () => {
    //   let token = localStorage.getItem("authToken");
    //   if (isTokenExpired(token)) {
    //     token = await refresh();
    //     if (!token) {
    //       navigate("/dang-nhap");
    //       return;
    //     }
    //     localStorage.setItem("authToken", token);
    //   }

    //   try {
    //     const response = await fetch(`${ADMIN_GET_CATEGORY_COURSE}`, {
    //       method: "GET",
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //     });

    //     const data = await response.json();
    //     setCategories(data._embedded.courseCategories);
    //   } catch (error) {
    //     console.error("Error fetching categories:", error);
    //   }
    // };
    const fetchAccountTeacher = async () => {
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
        const response = await fetch(`${ADMIN_GET_ACCOUNT_TEACHER}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setAccountTeacher(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    // fetchCategories();
    fetchAccountTeacher();
  }, []);
  const handleEdit = (course: Course) => {
    navigate(`/admin/chi-tiet-khoa-hoc/${course.id}`);
  };

  useEffect(() => {
    // Lọc dữ liệu cấp 2 dựa trên cấp 1
    if (filterField) {
      const parent = categoriesLevel1.filter(
        (category) => category.id === parseInt(filterField)
      );
      const children = categoriesLevel2.filter(
        (category) => category.id === parseInt(filterSector)
      );
      const child = children[0];
      const par = parent[0];
      if (
        parent.length > 0 &&
        children.length > 0 &&
        child.parentId?.toString() === par.id?.toString()
      ) {
        setFilteredCategoriesLevel2(
          categoriesLevel2.filter(
            (category) => category.parentId === parseInt(filterField)
          )
        );
        const check = categoriesLevel2.filter(
          (category) => category.parentId === parseInt(filterField)
        );
        if (check.length > 0) {
          setFilterSector(filterSector);
        }
      } else {
        setFilteredCategoriesLevel2(
          categoriesLevel2.filter(
            (category) => category.parentId === parseInt(filterField)
          )
        );
        setFilterSector("");
      }

      // Lọc dữ liệu cấp 3 dựa trên cấp 2
      setFilteredCategoriesLevel3(
        categoriesLevel3.filter((category) =>
          categoriesLevel2
            .filter((cat) => cat.parentId === parseInt(filterField))
            .map((cat) => cat.id)
            .includes(category.parentId || 0)
        )
      );

      setFilterSubject("");
    } else {
      setFilteredCategoriesLevel2(categoriesLevel2);
      setFilteredCategoriesLevel3(categoriesLevel3);
      setFilterSector("");
      setFilterSubject("");
    }
  }, [filterField, categoriesLevel2, categoriesLevel3]);

  useEffect(() => {
    // Lọc dữ liệu cấp 3 dựa trên cấp 2
    if (filterSector) {
      setFilteredCategoriesLevel3(
        categoriesLevel3.filter(
          (category) => category.parentId === parseInt(filterSector)
        )
      );

      const level2 = categoriesLevel2.find(
        (cate) => cate.id === parseInt(filterSector)
      );
      if (level2) {
        const filteredLevel1 = categoriesLevel1.filter(
          (category) => category.id === level2.parentId
        );
        if (filteredLevel1.length > 0) {
          setFilterField(filteredLevel1[0].id.toString());
        }
      }
    } else if (filterField) {
      setFilteredCategoriesLevel3(
        categoriesLevel3.filter((category) =>
          categoriesLevel2
            .filter((cat) => cat.parentId === parseInt(filterField))
            .map((cat) => cat.id)
            .includes(category.parentId || 0)
        )
      );
    } else {
      setFilteredCategoriesLevel3(categoriesLevel3);
    }
    setFilterSubject(""); // Reset cấp 3 khi chọn lại cấp 2
  }, [filterSector, categoriesLevel2, categoriesLevel3]);

  useEffect(() => {
    const filtered = courses
      // .map((course) => {
      //   const teacher = accountTeacher.find(
      //     (acc) => acc.id === course.accountId
      //   );
      //   return {
      //     ...course,
      //     teacherName: teacher ? teacher.fullname : "Không rõ",
      //   };
      // })
      .filter((course) => {
        const matches =
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.author.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLevel1 =
          !filterField || course.categoryIdLevel1?.toString() === filterField;
        const matchesLevel2 =
          !filterSector || course.categoryIdLevel2?.toString() === filterSector;
        const matchesLevel3 =
          !filterSubject ||
          course.categoryIdLevel3?.toString() === filterSubject;

        return matches && matchesLevel1 && matchesLevel2 && matchesLevel3;
      });

    setFilteredCourses(filtered);
  }, [
    courses,
    accountTeacher,
    searchTerm,
    filterField,
    filterSector,
    filterSubject,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // const handleCategoryChange = (
  //   event: React.ChangeEvent<{ value: unknown }>
  // ) => {
  //   setSelectedCategory(event.target.value as string);
  // };
  const handleSort = () => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);

    const sortedCourses = [...courses].sort((a, b) => {
      if (a.title < b.title) return newSortDirection === "asc" ? -1 : 1;
      if (a.title > b.title) return newSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setCourses(sortedCourses);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewCourseDetails = (id: number) => {
    navigate(`/admin/chi-tiet-khoa-hoc/${id}`);
  };

  const handleOpenDialog = () => {
    navigate("/admin/add-khoa-hoc");
  };

  const handleHide = async () => {
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
      const response = await fetch(
        `${ADMIN_PUT_DELETE_COURSE_CLEAR}/${selectedItem}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to hide course");
      }
      toast.success("Khóa học đã được xóa thành công!");
      setIsModalOpen(false);
      setSelectedItem(null);
      fetchCourses();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa Khóa học !");
    }
  };

  // const handleShow = async (id: number) => {
  //   let token = localStorage.getItem("authToken");

  //   if (isTokenExpired(token)) {
  //     token = await refresh();
  //     if (!token) {
  //       navigate("/dang-nhap");
  //       return;
  //     }
  //     localStorage.setItem("authToken", token);
  //   }

  //   try {
  //     const response = await fetch(`${ADMIN_PUT_ACTIVE_COURSE_CLEAR}/${id}`, {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to activate course");
  //     }

  //     // setSnackbarMessage("Khóa học đã được kích hoạt thành công");
  //     toast.success("Khóa học đã được khôi phục thành công!");
  //     fetchCourses();
  //   } catch (error) {
  //     console.error("Failed to activate course:", error);
  //     toast.error("Có lỗi xảy ra khi khôi phục Khóa học!");
  //     // setSnackbarMessage("");
  //   }
  // };
  const checkExist = async (courseId: number) => {
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
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/courses/${courseId}/check-completion`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to hide course");
      }

      const result = await response.json(); // Giải mã phản hồi JSON

      if (result) {
        return true; // Khóa học hoàn chỉnh
      } else {
        return false; // Khóa học không hoàn chỉnh
      }
    } catch (error) {
      return false; // Nếu có lỗi, trả về false
    }
  };
  const handleStatusToggle = async (
    courseId: number,
    currentStatus: boolean
  ) => {
    const isComplete = await checkExist(courseId);
    if (!isComplete) {
      toast.warning("Khóa học chưa hoàn chỉnh. Không thể cập nhật trạng thái.");
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

    // Tạo URL động cho API, thay thế {id} bằng courseId
    const url = `${currentStatus ? ADMIN_UNSTATUS_COURSE : ADMIN_STATUS_COURSE
      }/${courseId}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to change course status");
      }
      toast.success("Trạng thái khóa học đã được cập nhật.");
      fetchCourses();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái khóa học.");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const openModal = (itemId: number) => {
    setSelectedItem(itemId);
    setIsModalOpen(true);
  };

  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>Danh Sách Khóa Học</h2>
        <div className={styles.headContainer}>
          <div className={styles.searchAndSelect}>
            <TextField
              className={styles.searchField}
              size="small"
              label="Tìm kiếm khóa học"
              value={searchTerm}
              onChange={handleSearch}
              variant="outlined"
            />

            <div className={styles.filtersContainer}>
              {/* Combobox Lĩnh vực (Level 1) */}
              <TextField
                select
                size="small"
                className={styles.filterselect}
                variant="outlined"
                value={filterField}
                onChange={(e) => setFilterField(e.target.value as string)}
                SelectProps={{
                  displayEmpty: true,
                }}
              >
                <MenuItem value="">
                  <em>Tất cả các lĩnh vực</em>
                </MenuItem>
                {categoriesLevel1.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Combobox Ngành (Level 2) */}
              <TextField
                select
                size="small"
                // className={styles.filterselect}
                variant="outlined"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value as string)}
                SelectProps={{
                  displayEmpty: true,
                }}
              >
                <MenuItem value="">
                  <em>Tất cả các ngành</em>
                </MenuItem>
                {filteredCategoriesLevel2.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Combobox Môn học (Level 3) */}
              <TextField
                select
                size="small"
                // className={styles.filterselect}
                variant="outlined"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value as string)}
                SelectProps={{
                  displayEmpty: true,
                }}
              >
                <MenuItem value="">
                  <em>Tất cả các môn học</em>
                </MenuItem>
                {filteredCategoriesLevel3.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>
          <div className={styles.addButton}>
            <Button
              className={classNames("btn", "btn-primary", styles.whiteBtn)}
              variant="contained"
              color="primary"
              style={{ float: "right" }}
              startIcon={<Add />}
              onClick={handleOpenDialog}
            >
              Thêm khóa học
            </Button>
          </div>
        </div>
        <Divider style={{ marginBottom: "20px" }} />
        <div className={styles.tableContainer}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Table className={styles.table} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.headerCell}>ID</TableCell>
                  <TableCell
                    className={styles.headerCell}
                    onClick={handleSort}
                    style={{ cursor: "pointer" }}
                  >
                    Tên khóa học {sortDirection === "asc" ? "↑" : "↓"}
                  </TableCell>
                  <TableCell className={styles.headerCell}>
                    Tên giáo viên
                  </TableCell>
                  <TableCell className={styles.headerCell}>
                    Thời lượng
                  </TableCell>
                  <TableCell className={styles.headerCell}>Danh mục</TableCell>
                  {/* <TableCell className={styles.headerCell}>Giá</TableCell>
                  <TableCell className={styles.headerCell}>Giá gốc</TableCell> */}
                  <TableCell className={styles.headerCell}>
                    Lượng học viên
                  </TableCell>
                  <TableCell className={styles.headerCell}>
                    Khuyến mãi
                  </TableCell>
                  <TableCell className={styles.headerCell}>Giá bán</TableCell>
                  <TableCell className={styles.headerCell}>
                    Trạng thái
                  </TableCell>
                  <TableCell className={styles.headerCell}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.author}</TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>{course.categoryNameLevel3}</TableCell>
                    {/* <TableCell>
                      {course.price.toLocaleString("vi-VN")} VND
                    </TableCell>
                    <TableCell>
                      {course.cost.toLocaleString("vi-VN")} VND
                    </TableCell> */}
                    <TableCell >
                      {course.countStudent}
                    </TableCell>
                    <TableCell>
                      {course.price === 0
                        ? "Miễn phí"
                        : course.price === course.cost
                          ? "Chưa giảm"
                          : "Đã giảm"}
                    </TableCell>
                    <TableCell>
                      {course.type === "FREE"
                        ? "Miễn phí"
                        : new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(course.price)}
                    </TableCell>

                    <TableCell>
                      {course.status ? "Đã mở khóa" : "Chưa mở khóa"}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(course)}>
                        <Edit />
                      </IconButton>
                      {/* {course.deleted ? (
                        <IconButton onClick={() => handleShow(course.id)}>
                          <ToggleOff />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => handleHide(course.id)}>
                          <ToggleOn />
                        </IconButton>
                      )} */}

                      <IconButton onClick={() => openModal(course.id)}>
                        <Delete />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          handleStatusToggle(course.id, course.status)
                        }
                        disabled={false}
                      >
                        {!course.status ? <ToggleOff /> : <ToggleOn />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <TablePagination
          rowsPerPageOptions={[50, 100, 200]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={Boolean(snackbarMessage)}
          autoHideDuration={6000}
          onClose={() => setSnackbarMessage("")}
          message={snackbarMessage}
        />
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa khóa học ID ${selectedItem}?`}
        onConfirm={handleHide}
        onCancel={handleCancel}
      />
      <ToastContainer />
    </Paper>
  );
};
export const RequestAdminURL = RequireAdmin(CourseList);
export default CourseList;
