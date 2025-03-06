import React from "react";
import { TextField, MenuItem } from "@material-ui/core";

import styles from "./documentAdminNax.module.scss";
import DocumentManagementAction from "./DocumentManagementAction";

interface CategoryLevel {
    id: number;
    name: string;
    category: CategoryLevel[];
    level: number;
    parentId?: number | null;
}

interface DocumentNavProps {
    filterField: string;
    setFilterField: (field: string) => void;
    filterSector: string;
    setFilterSector: (sector: string) => void;
    filterSubject: string;
    setFilterSubject: (subject: string) => void;
    categoriesLevel1: CategoryLevel[];
    categoriesLevel2: CategoryLevel[]; // Danh sách ngành đã lọc theo lĩnh vực
    categoriesLevel3: CategoryLevel[]; // Danh sách môn học đã lọc theo ngành
}

const DocumentManagementNav: React.FC<DocumentNavProps> = ({
    filterField,
    setFilterField,
    filterSector,
    setFilterSector,
    filterSubject,
    setFilterSubject,
    categoriesLevel1,
    categoriesLevel2,
    categoriesLevel3,
}) => {
    return (
        <div className={styles.headContainer}>
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

            {/* <DocumentManagementAction
                handleAddDocumentClick={handleAddDocumentClick}
                handleDeleteSelected={handleDeleteSelected}
                selectedDocumentsCount={selectedDocumentsCount}
            /> */}
        </div>
    );
};

export default DocumentManagementNav;
