import React, { useState, useEffect } from "react";
import { TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Paper, Button, MenuItem } from "@mui/material";
import { DeleteForever, Restore } from "@mui/icons-material"; // Các icon Material UI
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';  // Để làm việc với đối tượng ngày
import ConfirmModal from "../../../../util/ConfirmModal";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../../util/fucntion/auth";
import { AdminCourseDTORestoreList } from "./CourseManagement";
import { ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1, ADMIN_DOCUMENT_GET_CATEGORY_LEVEL2, ADMIN_DOCUMENT_GET_CATEGORY_LEVEL3 } from "../../../../../api/api";
import DocumentAdminNav from "../../document/Components/DocumentAdminNax";
import DocumentManagementNav from "./DocumentManagementNav";
// import "./dashboardCompo.css";
interface Document {
    documentId: number;
    documentTitle: string;
    documentDescription: string;
    documentUrl: string;
    categoryLevel1: string;
    categoryLevel2: string;
    categoryLevel3: string;
    deleted: boolean;
    deletedDate: string | null;
    category_id: number;
    view: number;
    createdAt: string;
    status: boolean;
}

interface CategoryLevel {
    id: number;
    name: string;
    category: CategoryLevel[];
    level: number;
    parentId?: number | null;
    type: string;
}
export interface AdminBlogDTORestoreList {
    id: number;
    content: string;
    createdAt: string; // ISO Date format
    deletedDate: string | null; // Có thể null
    image: string;
    isDeleted: boolean;
    status: boolean;
    title: string;
    updatedAt: string;
    authorId: number;
    catBlogId: number;
}

const BlogManagement: React.FC = () => {

    const [blogs, setBlogs] = useState<AdminBlogDTORestoreList[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<AdminBlogDTORestoreList[]>([]);

    // const [chapters, setChapters] = useState<AdminChapterDTORestoreList[]>([]);  // Lưu danh sách khóa học
    const [courses, setCourses] = useState<AdminCourseDTORestoreList[]>([]);  // Lưu danh sách khóa học
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [totalElements, setTotalElements] = useState(0);

    const [page, setPage] = useState(0);  // Lưu trang hiện tại
    const [size, setSize] = useState(2);  // Lưu số lượng bản ghi mỗi trang
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const refresh = useRefreshToken();

    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);  // Lưu ngày chọn tìm kiếm
    const [isSearch, setIsSearch] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState<number | null>(null); // Khóa học đang được chọn
    const [searchTerm, setSearchTerm] = useState("");
    const [filterField, setFilterField] = useState<string>("");
    const [filterSector, setFilterSector] = useState<string>("");
    const [filterSubject, setFilterSubject] = useState<string>(""); const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý trạng thái modal
    const [modalTitle, setModalTitle] = useState(""); // Tiêu đề modal
    const [modalMessage, setModalMessage] = useState(""); // Nội dung thông báo trong modal
    const [action, setAction] = useState<"restore" | "delete" | null>(null); // Hành động xác nhận (restore hoặc delete)
    // const [filteredChapters, setFilteredChapters] = useState<AdminChapterDTORestoreList[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlog, setSelectedBlog] = useState<number | null>(null);
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
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
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
            setError(errorMessage);
            console.error("Error fetching categories:", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const RestoreBlogFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/blogs/restore/${selectedBlog}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updateBlogs = filteredBlogs.filter(blog => blog.id !== selectedBlog);
                setBlogs(updateBlogs);
                setFilteredBlogs(updateBlogs);
                setIsModalOpen(false);
            } else {
                console.error("Failed to restore blog");
            }
        } catch (error) {
            console.error("Error occurred while restoring blog", error);
        }
    };
    const DeleteBlogFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/blogs/delete/${selectedBlog}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedBlog = filteredBlogs.filter(blog => blog.id !== selectedBlog);
                setBlogs(updatedBlog);
                setFilteredBlogs(updatedBlog);
                setIsModalOpen(false); // Close modal
            } else {
                console.error("Failed to delete blog");
            }
        } catch (error) {
            console.error("Error occurred while deleting blog", error);
        }
    };

    const handleConfirm = async () => {
        if (action === "restore" && selectedBlog !== null) {
            RestoreBlogFunction();
        } else if (action === "delete" && selectedBlog !== null) {
            DeleteBlogFunction();
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        let tokenLocal = localStorage.getItem("authToken");

        if (isTokenExpired(tokenLocal)) {
            tokenLocal = await refresh();
            if (!tokenLocal) {
                navigate("/dang-nhap");
                return;
            }
            localStorage.setItem("authToken", tokenLocal);
        }

        const params = new URLSearchParams({
            ...(filterField && { categoryId1: filterField }),
            ...(filterSector && { categoryId2: filterSector }),
            ...(filterSubject && { categoryId3: filterSubject }),
            title: searchTerm || "",
            deletedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
            page: page.toString(),
            size: rowsPerPage.toString(),
        });
        const url = `${process.env.REACT_APP_SERVER_HOST}/api/blogs/restore/list-all-blogs?${params.toString()}`;
        try {
            const fetchDocuments = fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenLocal}`,
                    },
                }
            );

            const [documentsResponse] = await Promise.all([fetchDocuments]);

            if (!documentsResponse.ok) throw new Error("Failed to fetch blogs");

            const documentsData = await documentsResponse.json();

            setBlogs(documentsData.content || []);
            setFilteredBlogs(documentsData.content || []);
            setTotalElements(documentsData.totalElements || 0);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";
            setError(errorMessage);
            console.error("Error fetching documents:", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchAllData();
    }, []);


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

    // Hàm để xử lý tìm kiếm theo từ khóa
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Hàm để lọc danh sách khóa học theo ngày xóa
    // const filterByDate = (documents: AdminDocumentDTORestoreList[]) => {
    //     if (selectedDate) {
    //         return documents.filter(document => {
    //             // Chuyển đổi ngày xóa sang đối tượng ngày và so sánh
    //             const deletedDate = document.deletedDate ? dayjs(document.deletedDate) : null;
    //             return deletedDate && deletedDate.isSame(selectedDate, 'day');
    //         });
    //     }
    //     return documents;
    // };

    // Lọc danh sách khóa học theo từ khóa tìm kiếm
    // const filteredDocuments = filterByDate(
    //     documents.filter(document =>
    //         document.title.toLowerCase().includes(searchTerm.toLowerCase())
    //     )
    // );

    const handleRestore = (id: number) => {
        setSelectedBlog(id);
        setModalTitle("Khôi phục bài viết");
        setModalMessage("Bạn có chắc chắn muốn khôi phục bài viết này?");
        setAction("restore");
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setSelectedBlog(id);
        setModalTitle("Xóa vĩnh viễn bài viết");
        setModalMessage("Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này?");
        setAction("delete");
        setIsModalOpen(true);
    };
    const handleSearchClick = () => {
        setPage(0);
        fetchAllData();
    };

    const handleCancel = () => {
        setIsModalOpen(false); // Đóng modal nếu hủy bỏ
    };
    return (
        <Paper sx={{ padding: "20px" }}>
            <h2>Quản lý bài viết</h2>

            <div className="row">
                <div className="col-md-8"> <TextField
                    label="Tìm kiếm tên bài học"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginBottom: "20px" }}
                />
                    <DocumentManagementNav
                        filterField={filterField}
                        setFilterField={setFilterField}
                        filterSector={filterSector}
                        setFilterSector={setFilterSector}
                        filterSubject={filterSubject}
                        setFilterSubject={setFilterSubject}
                        categoriesLevel1={categoriesLevel1}
                        categoriesLevel2={filteredCategoriesLevel2}
                        categoriesLevel3={filteredCategoriesLevel3}
                    />
                </div>
                <div className="col-md-4">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Tìm kiếm theo ngày xóa"
                            value={selectedDate}
                            onChange={(date: Dayjs | null) => setSelectedDate(date)}
                            format="YYYY-MM-DD"
                        />
                    </LocalizationProvider>
                    <Button onClick={handleSearchClick}>Tìm kiếm</Button>
                </div>

            </div>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Tên bài kiểm tra</TableCell>
                        <TableCell>Ngày xóa</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredBlogs.map((blog) => (
                        <TableRow key={blog.id}>
                            <TableCell>{blog.id}</TableCell>
                            <TableCell>{blog.title}</TableCell>

                            <TableCell>{blog.deletedDate ? blog.deletedDate : "Chưa xóa"}</TableCell>
                            <TableCell>
                                {blog.isDeleted ? (
                                    <>
                                        {/* Khôi phục khóa học */}
                                        <IconButton onClick={() => handleRestore(blog.id)} color="primary">
                                            <Restore />
                                        </IconButton>
                                        {/* Xóa vĩnh viễn khóa học */}
                                        <IconButton onClick={() => handleDelete(blog.id)} color="secondary">
                                            <DeleteForever />
                                        </IconButton>
                                    </>
                                ) : (
                                    <span>Không có hành động</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div>

                <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                    disabled={page === 0 || totalPages === 0} // Không có dữ liệu thì disable
                >
                    Trước
                </button>
                <span> {totalPages === 0 ? `${page}/${totalPages}` : `${page + 1}/${totalPages}`}</span>
                <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                    disabled={totalPages === 0 || page >= totalPages - 1} // Không có dữ liệu hoặc trang cuối thì disable
                >
                    Tiếp
                </button>


            </div>
            <ConfirmModal
                isOpen={isModalOpen}
                title={modalTitle}
                message={modalMessage}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </Paper>
    );
};

export default BlogManagement;
