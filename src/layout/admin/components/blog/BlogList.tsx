import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  IconButton,
  Divider,
  Checkbox,
  Paper,
  TextField,
} from "@material-ui/core";
import { MenuItem } from "@material-ui/core";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import { Edit, Delete, Add } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL2,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL3,
  ADMIN_GET_BLOG,
} from "../../../../api/api";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import styles from "./blogList.module.scss";
import classNames from "classnames";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SelectChangeEvent } from "@mui/material";
type Blog = {
  blogId: number; // ID của blog
  title: string; // Tiêu đề của blog
  content: string; // Nội dung của blog
  authorName: string; // Tên tác giả
  level3Id: number | null; // ID danh mục cấp 3
  categoryNameLevel3: string | null; // Tên danh mục cấp 3
  level2Id: number | null; // ID danh mục cấp 2
  categoryNameLevel2: string | null; // Tên danh mục cấp 2
  level1Id: number | null; // ID danh mục cấp 1
  categoryNameLevel1: string | null; // Tên danh mục cấp 1
  status: boolean; // Trạng thái của blog
  isDeleted: boolean; // Trạng thái xóa của blog
};
interface CategoryLevel {
  id: number;
  name: string;
  category: CategoryLevel[];
  level: number;
  parentId?: number | null;
  type: string;
}
const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const [searchQuery, setSearchQuery] = useState<string>(""); // state for search query
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]); // state for filtered blogs
  const [selectedQuestionCheckbox, setSelectedQuestionCheckbox] = useState<
    number[]
  >([]);
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
        (category) => category.type === "blog"
      );
      const filteredLevel2 = level2Data.filter(
        (category) => category.type === "blog"
      );
      const filteredLevel3 = level3Data.filter(
        (category) => category.type === "blog"
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

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage); // Cập nhật trang hiện tại
  };

  const handleSelectAll = () => {
    if (selectedQuestionCheckbox.length === filteredBlogs.length) {
      setSelectedQuestionCheckbox([]);
    } else {
      setSelectedQuestionCheckbox(filteredBlogs.map((d) => d.blogId));
    }
  };
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Cập nhật số bản ghi mỗi trang
    setPage(0); // Reset về trang đầu tiên
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/edit-blog/${id}`);
  };
  const handleDeleteBlog = async () => {
    let token = localStorage.getItem("authToken");

    // Kiểm tra nếu token đã hết hạn
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    // const blogIdsToDelete = [1, 2, 3, 4];

    try {
      const response = await axios.delete(
        "${process.env.REACT_APP_SERVER_HOST}/api/blogs/delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: selectedQuestionCheckbox,
        }
      );

      if (response.status === 200) {
        // alert("Các bài viết đã được xóa thành công.");
        toast.success("Các bài viết được xóa thành công !");
        // Cập nhật giao diện hoặc làm mới dữ liệu sau khi xóa
      } else {
        toast.warning("Có lỗi xảy ra khi xóa bài viết. !");
        // alert("");
      }
    } catch (error) {
      // console.error("Error deleting blogs:", error);
      toast.warning("Không thể xóa các bài viết. Vui lòng thử lại.!");
      // alert("Không thể xóa các bài viết. Vui lòng thử lại.");
    }
  };
  const handleAddBlog = () => {
    navigate("/admin/add-blog"); // Navigate to AddBlog page
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter blogs based on title (case insensitive)
    const filtered = blogs.filter((blog) =>
      blog.title.toLowerCase().includes(query)
    );
    setFilteredBlogs(filtered); // Update filtered list
  };

  const handleHide = async (id: number) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_HOST}/api/blogs/hide/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
          },
        }
      );

      if (response.status === 200) {
        setFilteredBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.blogId === id ? { ...blog, status: true } : blog
          )
        );
        toast.success("Kích hoạt bài viết thành công !");
      }
    } catch (error) {
      //   console.error("Error deleting blog:", error);
      toast.warning("Có lỗi xảy ra khi kích hoạt bài viết!");
      //   alert(".");
    }
  };
  const handleRestore = async (id: number) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_HOST}/api/blogs/restore/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setFilteredBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.blogId === id ? { ...blog, status: false } : blog
          )
        );
        toast.success("Khóa bài viết thành công !");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi khóa bài viết !");
    }
  };
  const handleDelete = async (id: number) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_HOST}/api/blogs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setFilteredBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog.blogId !== id)
        );
        toast.success("Xóa bài viết thành công!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài viết !");
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
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
        ...(searchQuery && { searchTerm: searchQuery }),
        page: page.toString(),
        size: rowsPerPage.toString(),
      });
      const url = `${process.env.REACT_APP_SERVER_HOST}/api/blogs/all-get-list-search?${params.toString()}`;

      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setBlogs(data.content);
          setFilteredBlogs(data.content);
          setTotalElements(data.totalElements);
        })
        .catch((error) => console.error("Error fetching blogs:", error));
    };
    fetchBlogs();
  }, [page, filterSubject, filterField, filterSector, searchQuery, rowsPerPage, navigate]);

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
    const filtered = blogs.filter((blog) => {
      const matchesSearchQuery = blog.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesLevel1 =
        !filterField || blog.level1Id?.toString() === filterField;
      const matchesLevel2 =
        !filterSector || blog.level2Id?.toString() === filterSector;
      const matchesLevel3 =
        !filterSubject || blog.level3Id?.toString() === filterSubject;

      return (
        matchesSearchQuery && matchesLevel1 && matchesLevel2 && matchesLevel3
      );
    });

    setFilteredBlogs(filtered);
  }, [blogs, searchQuery, filterField, filterSector, filterSubject]);

  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>Danh Sách Bài Viết</h2>
        <div className={styles.headContainer}>
          <TextField
            label="Tìm kiếm"
            // className={styles.searchField}
            size="small"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
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

          <div style={{ float: "right" }}>
            <Button
              className={classNames("btn", "btn-primary", styles.whiteBtn)}
              startIcon={<Add />}
              variant="contained"
              color="primary"
              onClick={handleAddBlog}
            >
              Thêm bài viết
            </Button>
            <Button
              className={classNames("btn", "btn-secondary", styles.whiteBtn)}
              variant="contained"
              color="secondary"
              onClick={handleDeleteBlog}
              style={{ marginLeft: "10px" }}
            >
              Xóa Tất Cả
            </Button>
          </div>
        </div>
        <Divider style={{ marginBottom: "20px" }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox
                    className={styles.checkbox}
                    checked={
                      selectedQuestionCheckbox.length === filteredBlogs.length
                    }
                    onChange={handleSelectAll}
                    indeterminate={
                      selectedQuestionCheckbox.length > 0 &&
                      selectedQuestionCheckbox.length < filteredBlogs.length
                    }
                  />
                </TableCell>
                <TableCell className={styles.headerCell}>ID</TableCell>
                <TableCell className={styles.headerCell}>Tiêu đề</TableCell>
                <TableCell className={styles.headerCell}>Người tạo</TableCell>
                <TableCell className={styles.headerCell}>Lĩnh vực</TableCell>
                <TableCell className={styles.headerCell}>Ngành</TableCell>
                <TableCell className={styles.headerCell}>Môn học</TableCell>
                <TableCell className={styles.headerCell}>Trạng thái</TableCell>
                <TableCell className={styles.headerCell}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.blogId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedQuestionCheckbox.includes(blog.blogId)}
                      onChange={() => {
                        setSelectedQuestionCheckbox((prevSelected) =>
                          prevSelected.includes(blog.blogId)
                            ? prevSelected.filter((id) => id !== blog.blogId)
                            : [...prevSelected, blog.blogId]
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>{blog.blogId}</TableCell>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.authorName}</TableCell>
                  <TableCell>{blog.categoryNameLevel1}</TableCell>
                  <TableCell>{blog.categoryNameLevel2}</TableCell>
                  <TableCell>{blog.categoryNameLevel3}</TableCell>
                  <TableCell>
                    {blog.status ? "Hoạt động" : "Không hoạt động"}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(blog.blogId)}>
                      <Edit />
                    </IconButton>

                    {blog.status ? (
                      <IconButton onClick={() => handleRestore(blog.blogId)}>
                        <ToggleOn />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleHide(blog.blogId)}>
                        <ToggleOff />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleDelete(blog.blogId)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
      </div>
      <ToastContainer />
    </Paper>
  );
};

export default BlogList;
