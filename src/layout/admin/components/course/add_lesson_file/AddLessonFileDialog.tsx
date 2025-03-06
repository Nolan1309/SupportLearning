import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItem, ListItemIcon, TextField } from "@mui/material";
import { Add } from "@mui/icons-material";
import "./AddLessonFileDialog.css";
import { AttachFile, RemoveCircle } from "@material-ui/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const AddLessonFileDialog: React.FC<{ sectionId: number; open: boolean; onClose: (sectionId: number) => void; onFileUpload: (files: File[], sectionId: number) => void; }> = ({
    sectionId,
    open,
    onClose,
    onFileUpload

}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(files);
        }
    };
    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files) {
            const files = Array.from(e.dataTransfer.files);
            setSelectedFiles(files);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleUpload = async () => {

        
        if (selectedFiles.length === 0) return;

        const formData = new FormData();

        // Append từng file vào FormData
        selectedFiles.forEach((file) => {
            formData.append("files", file);
        });

        // Thêm chapterId vào FormData
        formData.append("chapterId", sectionId.toString());

        try {
            let token = localStorage.getItem("authToken");

            const response = await fetch("YOUR_API_UPLOAD_URL", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // Chỉ thêm headers cần thiết, không set Content-Type vì FormData tự xử lý
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Tải lên thành công:", data);
                toast.success("Tệp đã được tải lên thành công!");
                setSelectedFiles([]); // Xóa danh sách file sau khi tải lên thành công
                onClose(sectionId);
            } else {
                console.warn("Lỗi tải lên:", data.message);
                toast.error(data.message || "Có lỗi xảy ra khi tải lên tệp!");
            }
        } catch (error) {
            console.error("Lỗi hệ thống khi tải lên:", error);
            toast.error("Đã xảy ra lỗi khi tải lên. Vui lòng thử lại sau!");
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };
    return (
        <Dialog open={open} onClose={onClose} sx={{
            "& .MuiDialog-paper": {
                width: "80%"

            },
        }}>

            <DialogContent>
                <div className="file-upload-container" onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    style={{
                        padding: "20px",
                        border: "2px dashed #ccc",
                        borderRadius: "8px",
                        textAlign: "center",
                        marginBottom: "20px",
                    }}>
                    <label htmlFor="file-input" className="file-upload-label">
                        Click here or drop files to upload

                        <input
                            id="file-input"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="file-upload-input"
                        />
                    </label>
                </div>
                {selectedFiles.length > 0 && (
                    <div>

                        <ul>
                            <hr style={{ margin: "10px 0px 0px 0px" }} />
                            {selectedFiles.map((file, index) => (

                                <li key={index} style={{ display: "flex", justifyContent: "space-between", height: "50px", padding: "10px 0px", borderBottom: "0.5px solid #ccc" }}>

                                    <div>
                                        <AttachFile />
                                        {file.name}
                                    </div>
                                    <div>
                                        <Button
                                            size="small"
                                            onClick={() => handleRemoveFile(index)}
                                            style={{ marginLeft: '10px', float: "right" }}
                                        >
                                            <RemoveCircle style={{ color: "violot" }} />

                                        </Button>
                                    </div>

                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(sectionId)}>Hủy</Button>
                <Button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0}
                    color="primary"
                >
                    Tải lên
                </Button>
            </DialogActions>
        </Dialog>
    );
};