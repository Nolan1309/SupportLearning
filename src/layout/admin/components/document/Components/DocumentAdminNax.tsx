import React from "react";
import { TextField, MenuItem } from "@material-ui/core";
import DocumentActions from "./DocumentAction";
import styles from "./documentAdminNax.module.scss";

interface CategoryLevel {
  id: number;
  name: string;
  category: CategoryLevel[];
  level: number;
  parentId?: number | null;
}

interface DocumentNavProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterField: string;
  setFilterField: (field: string) => void;
  filterSector: string;
  setFilterSector: (sector: string) => void;
  filterSubject: string;
  setFilterSubject: (subject: string) => void;
  categoriesLevel1: CategoryLevel[];
  categoriesLevel2: CategoryLevel[]; // Danh sách ngành đã lọc theo lĩnh vực
  categoriesLevel3: CategoryLevel[]; // Danh sách môn học đã lọc theo ngành
  handleAddDocumentClick: () => void;
  handleDeleteSelected: () => void;
  selectedDocumentsCount: number;
}

const DocumentAdminNav: React.FC<DocumentNavProps> = ({
  searchTerm,
  setSearchTerm,
  filterField,
  setFilterField,
  filterSector,
  setFilterSector,
  filterSubject,
  setFilterSubject,
  categoriesLevel1,
  categoriesLevel2,
  categoriesLevel3,
  handleAddDocumentClick,
  handleDeleteSelected,
  selectedDocumentsCount,
}) => {
  return (
    <div className={styles.headContainer}>
      <TextField
        className={styles.searchField}
        size="small"
        label="Tìm kiếm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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
          className={styles.filterselect}
          variant="outlined"
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value as string)}
          SelectProps={{
            displayEmpty: true,
          }}
          // disabled={!filterField}
        >
          <MenuItem value="">
            <em>Tất cả các ngành</em>
          </MenuItem>
          {categoriesLevel2
            // .filter((category) => category.parentId === parseInt(filterField)) // Lọc theo parentId
            .map((category) => (
              <MenuItem key={category.id} value={category.id.toString()}>
                {category.name}
              </MenuItem>
            ))}
        </TextField>

        {/* Combobox Môn học (Level 3) */}
        <TextField
          select
          size="small"
          className={styles.filterselect}
          variant="outlined"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value as string)}
          SelectProps={{
            displayEmpty: true,
          }}
          // disabled={!filterSector}
        >
          <MenuItem value="">
            <em>Tất cả các môn học</em>
          </MenuItem>

          {categoriesLevel3
            // .filter((category) => category.parentId === parseInt(filterSector)) // Lọc theo parentId
            .map((category) => (
              <MenuItem key={category.id} value={category.id.toString()}>
                {category.name}
              </MenuItem>
            ))}
        </TextField>
      </div>

      <DocumentActions
        handleAddDocumentClick={handleAddDocumentClick}
        handleDeleteSelected={handleDeleteSelected}
        selectedDocumentsCount={selectedDocumentsCount}
      />
    </div>
  );
};

export default DocumentAdminNav;
