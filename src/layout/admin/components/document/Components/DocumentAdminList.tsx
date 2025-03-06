import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Checkbox,
  Button,
  TablePagination,
  Divider,
  Paper,
} from "@material-ui/core";
import { Edit, Delete } from "@material-ui/icons";
import RequireAdmin from "../../../../DOM/RequireAdmin";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import styles from "./documentAdminList.module.scss";
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

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: number[];
  setSelectedDocuments: (selected: number[]) => void;
  handleDelete: (id: number) => void;
  handleEdit: (document: Document) => void;
  handleAddDocumentClick: () => void;
  handleDeleteSelected: () => void;
  handleSelectAll: () => void;
  handleSortByTitle: () => void;
  sortDirection: "asc" | "desc";
  searchTerm: string;
  filterField: string;
  filterSector: string;
  filterSubject: string;
  totalElements: number; // Thêm prop này
  rowsPerPage: number; // Thêm prop này
  page: number; // Thêm prop này
  handlePageChange: (event: unknown, newPage: number) => void; // Thêm prop này
  handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Thêm prop này
  handleHide: (id: number) => void; // Thêm hàm này
  handleShow: (id: number) => void; // Thêm hàm này
  categoriesLevel1: CategoryLevel[];
  categoriesLevel2: CategoryLevel[];
  categoriesLevel3: CategoryLevel[];
  handleStatusToggle: (id: number, currentStatus: boolean) => void;
  openModal: (id: number) => void;
}
interface CategoryLevel {
  id: number;
  name: string;
  category: CategoryLevel[];
  level: number;
  parentId?: number | null;
}
const DocumentAdminList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocuments,
  setSelectedDocuments,
  handleDelete,
  handleEdit,
  handleAddDocumentClick,
  handleDeleteSelected,
  handleSelectAll,
  handleSortByTitle,
  handlePageChange,
  handleRowsPerPageChange,
  handleHide,
  handleShow,
  sortDirection,
  searchTerm,
  filterField,
  filterSector,
  filterSubject,
  totalElements,
  rowsPerPage,
  page,
  categoriesLevel1,
  categoriesLevel2,
  categoriesLevel3,
  handleStatusToggle,
  openModal,
}) => {
  return (
    <Paper>
      <Divider style={{ marginBottom: "20px" }} />
      <div className={styles.tableContainer}>
        <Table className={styles.table} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={styles.headerCell}>
                <Checkbox
                  checked={selectedDocuments.length === documents.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell className={styles.headerCell}>ID</TableCell>
              <TableCell
                className={styles.headerCell}
                onClick={handleSortByTitle}
                style={{ cursor: "pointer" }}
              >
                Tiêu đề {sortDirection === "asc" ? "▲" : "▼"}
              </TableCell>
              <TableCell className={styles.headerCell}>Lĩnh vực</TableCell>
              <TableCell className={styles.headerCell}>Ngành</TableCell>
              <TableCell className={styles.headerCell}>Môn học</TableCell>
              <TableCell className={styles.headerCell}>Lượt xem</TableCell>
              <TableCell className={styles.headerCell}>Trạng thái</TableCell>
              <TableCell className={styles.headerCell}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          {Array.isArray(documents) &&
            documents
              .filter((document) =>
                document.documentTitle
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )

              .filter((document) => {
                // Lọc theo cấp 3 (filterSubject), nếu có
                if (filterSubject) {
                  return document.category_id === Number(filterSubject);
                }

                // Lọc theo cấp 2 (filterSector), nếu có
                if (filterSector) {
                  return categoriesLevel3.some(
                    (category) =>
                      category.parentId === Number(filterSector) &&
                      category.id === document.category_id
                  );
                }

                // Lọc theo cấp 1 (filterField), nếu có
                if (filterField) {
                  return categoriesLevel2.some(
                    (category) =>
                      category.parentId === Number(filterField) &&
                      categoriesLevel3.some(
                        (subCategory) =>
                          subCategory.parentId === category.id &&
                          subCategory.id === document.category_id
                      )
                  );
                }

                // Hiển thị tất cả nếu không có bộ lọc nào
                return true;
              })
              .map((document) => (
                <TableRow key={document.documentId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedDocuments.includes(document.documentId)}
                      onChange={() => {
                        if (selectedDocuments.includes(document.documentId)) {
                          setSelectedDocuments(
                            selectedDocuments.filter(
                              (id) => id !== document.documentId
                            )
                          );
                        } else {
                          setSelectedDocuments([
                            ...selectedDocuments,
                            document.documentId,
                          ]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{document.documentId}</TableCell>
                  <TableCell>{document.documentTitle}</TableCell>
                  <TableCell>{document.categoryLevel1}</TableCell>
                  <TableCell>{document.categoryLevel2}</TableCell>
                  <TableCell>{document.categoryLevel3}</TableCell>
                  <TableCell>{document.view}</TableCell>
                  <TableCell>
                    {document.status ? "Đang hiển thị" : "Đang khóa"}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(document)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => openModal(document.documentId)}>
                      <Delete />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        handleStatusToggle(document.documentId, document.status)
                      }
                      disabled={false}
                    >
                      {!document.status ? <ToggleOff /> : <ToggleOn />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
        </Table>
      </div>
      <TablePagination
        rowsPerPageOptions={[100, 200, 500]}
        component="div"
        count={totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage="Số hàng mỗi trang:"
      />
    </Paper>
  );
};
export default DocumentAdminList;
