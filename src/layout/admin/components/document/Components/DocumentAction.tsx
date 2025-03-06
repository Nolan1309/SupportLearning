import React from 'react';
import { Button } from '@material-ui/core';
import { Edit, Delete, Add } from "@material-ui/icons";
import styles from './documentAction.module.scss';
import classNames from 'classnames';
interface DocumentActionsProps {
  handleAddDocumentClick: () => void;
  handleDeleteSelected: () => void;
  selectedDocumentsCount: number;
}
const DocumentActions: React.FC<DocumentActionsProps> = ({
  handleAddDocumentClick,
  handleDeleteSelected,
  selectedDocumentsCount
}) => {
  return (
    <div className="actions admin-document">
      <Button style={{ marginRight: 10 }} className={classNames('btn', 'btn-primary', styles.whiteBtn)} startIcon={<Add />} onClick={handleAddDocumentClick} variant="contained" color="primary" >
        Thêm
      </Button>
      <Button onClick={handleDeleteSelected} variant="contained" color="secondary" className={classNames('btn', 'btn-warning', styles.whiteBtn)}>
        Xóa
      </Button>
    </div>
  );
};

export default DocumentActions;