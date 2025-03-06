// DocumentAdmin.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_GET_DOCUMENT,
  ADMIN_DELETE_DOCUMENT,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL2,
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL3,
  ADMIN_HIDE_DOCUMENT,
  ADMIN_SHOW_DOCUMENT,
  ADMIN_UNSTATUS_GeneralDocument,
  ADMIN_STATUS_GeneralDocument,
} from "../../../../api/api";
import { Paper } from "@mui/material"; // Sử dụng @mui/material
import DocumentAdminList from "./Components/DocumentAdminList";
import DocumentAdminNav from "./Components/DocumentAdminNax";
import styles from "./documentAdmin.module.scss";
import RequireAdmin from "../../../DOM/RequireAdmin";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "../../../util/ConfirmModal";
interface Document {
  documentId: number;
  documentTitle: string;
  documentDescription: string;
  documentUrl: string;
  categoryLevel1: string;
  categoryLevel2: string;
  categoryLevel3: string;
  deleted: boolean;
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

const DocumentAdmin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<string>("");
  const [filterSector, setFilterSector] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [loading, setLoading] = useState(true);
  const refresh = useRefreshToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  // Fetch Categories (Level 1, 2, 3)
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
        (category) => category.type === "document"
      );
      const filteredLevel2 = level2Data.filter(
        (category) => category.type === "document"
      );
      const filteredLevel3 = level3Data.filter(
        (category) => category.type === "document"
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

  // Fetch Documents
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
      ...(searchTerm && { searchTerm }),
      page: page.toString(),
      size: rowsPerPage.toString(),
    });
    const url = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/documents-with-categories-search?${params.toString()}`;
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

      if (!documentsResponse.ok) throw new Error("Failed to fetch documents");

      const documentsData = await documentsResponse.json();

      setDocuments(documentsData.content || []);
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
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [page, filterSubject, filterField, filterSector, searchTerm, rowsPerPage]);


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


  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(ADMIN_DELETE_DOCUMENT(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc.documentId !== id));
      } else {
        console.error("Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleEdit = (document: Document) => {
    navigate(`/admin/sua-tai-lieu/${document.documentId}`, {
      state: document,
    });
  };

  const handleAddDocumentClick = () => {
    navigate("/admin/upload");
  };

  const handleDeleteSelected = () => {
    selectedDocuments.forEach((id) => handleDelete(id));
    setSelectedDocuments([]);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map((doc) => doc.documentId));
    }
  };

  const handleSortByTitle = () => {
    const sortedDocuments = [...documents].sort((a, b) => {
      if (a.documentTitle < b.documentTitle)
        return sortDirection === "asc" ? -1 : 1;
      if (a.documentTitle > b.documentTitle)
        return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    setDocuments(sortedDocuments);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handlePageChange = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi số hàng mỗi trang
  };

  const handleHide = async () => {
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
      const response = await fetch(`${ADMIN_HIDE_DOCUMENT}/${selectedItem}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${tokenLocal}`,
        },
      });

      if (response.ok) {
        setDocuments((prevDocuments) =>
          prevDocuments.map((document) =>
            document.documentId === selectedItem
              ? { ...document, deleted: true }
              : document
          )
        );
        toast.success("Tài liệu đã được xóa thành công !");
        setIsModalOpen(false);
        setSelectedItem(null);
        fetchAllData();
      } else {
        toast.error("Có lỗi xảy ra khi ẩn tài liệu !");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi ẩn tài liệu !");
    }
  };

  const handleShow = async (id: number) => {
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
      const response = await fetch(`${ADMIN_SHOW_DOCUMENT}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${tokenLocal}`,
        },
      });

      if (response.ok) {
        setDocuments((prevDocuments) =>
          prevDocuments.map((document) =>
            document.documentId === id
              ? { ...document, deleted: false }
              : document
          )
        );
        alert("Tài liệu đã được hiển thị thành công");
      } else {
        alert("Có lỗi xảy ra khi hiển thị tài liệu");
      }
    } catch (error) {
      console.error("Error showing document:", error);
      alert("Có lỗi xảy ra khi hiển thị tài liệu");
    }
  };

  const handleStatusToggle = async (
    generaidocumentId: number,
    currentStatus: boolean
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

    // Tạo URL động cho API, thay thế {id} bằng courseId
    const url = `${currentStatus
      ? ADMIN_UNSTATUS_GeneralDocument
      : ADMIN_STATUS_GeneralDocument
      }/${generaidocumentId}`;

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
      toast.success("Trạng thái tài liệu đã được cập nhật.");
      fetchAllData();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái tài liệu.");
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
        <h2 className={styles.title}>Danh Sách Tài Liệu</h2>
        <DocumentAdminNav
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterField={filterField}
          setFilterField={setFilterField}
          filterSector={filterSector}
          setFilterSector={setFilterSector}
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          categoriesLevel1={categoriesLevel1}
          categoriesLevel2={filteredCategoriesLevel2}
          categoriesLevel3={filteredCategoriesLevel3}
          handleAddDocumentClick={handleAddDocumentClick}
          handleDeleteSelected={handleDeleteSelected}
          selectedDocumentsCount={selectedDocuments.length}
        />
        <DocumentAdminList
          documents={documents}
          selectedDocuments={selectedDocuments}
          setSelectedDocuments={setSelectedDocuments}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          handleAddDocumentClick={handleAddDocumentClick}
          handleDeleteSelected={handleDeleteSelected}
          handleSelectAll={handleSelectAll}
          handleSortByTitle={handleSortByTitle}
          sortDirection={sortDirection}
          searchTerm={searchTerm}
          filterField={filterField}
          filterSector={filterSector}
          filterSubject={filterSubject}
          totalElements={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          handleRowsPerPageChange={handleRowsPerPageChange}
          handleHide={handleHide}
          handleShow={handleShow}
          categoriesLevel1={categoriesLevel1}
          categoriesLevel2={categoriesLevel2}
          categoriesLevel3={categoriesLevel3}
          handleStatusToggle={handleStatusToggle}
          openModal={openModal}
        />
        <ConfirmModal
          isOpen={isModalOpen}
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa tài liệu ID ${selectedItem}?`}
          onConfirm={handleHide}
          onCancel={handleCancel}
        />
      </div>
      <ToastContainer />
    </Paper>
  );
};

export const DocumentAdminPage = RequireAdmin(DocumentAdmin);

export default DocumentAdmin;
