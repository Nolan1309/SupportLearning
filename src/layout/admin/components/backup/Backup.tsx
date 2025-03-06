import React, { useState } from "react";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../../../util/fucntion/auth";
import "./backup.css";
const Backup: React.FC = () => {
  const [backupStatus, setBackupStatus] = useState<string>("");
  const [restoreStatus, setRestoreStatus] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Tệp được chọn
  const refresh = useRefreshToken();
  const navigate = useNavigate();

  // Xử lý sao lưu
  const handleBackup = async () => {
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
      const response = await fetch("${process.env.REACT_APP_SERVER_HOST}/api/backup/export", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch backup.");
      }

      const data = await response.blob(); // Lấy dữ liệu dưới dạng Blob
      setBackupStatus("Sao lưu thành công!");

      // Tạo đường dẫn URL tạm thời để tải tệp về
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup.sql";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      setBackupStatus("Sao lưu thất bại.");
      console.error(error);
    }
  };

  // Xử lý khi chọn tệp phục hồi
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRestoreStatus(""); // Xóa thông báo trước đó
    }
  };

  // Xử lý phục hồi
  const handleRestore = async () => {
    if (!selectedFile) {
      setRestoreStatus("Vui lòng chọn tệp trước khi phục hồi.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

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
      const response = await fetch("${process.env.REACT_APP_SERVER_HOST}/api/backup/restore", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Restore failed.");
      }

      const result = await response.json();
      setRestoreStatus(result.message || "Phục hồi thành công.");
    } catch (error) {
      setRestoreStatus("Phục hồi thất bại.");
      console.error(error);
    }
  };

  return (
    <div className="backup-container backup">
      <h2 className="header backup">Quản lý Cơ sở dữ liệu</h2>

      {/* Sao lưu cơ sở dữ liệu */}
      <div className="backup-section backup">
        <button className="button backup-button backup" onClick={handleBackup}>
          Sao lưu cơ sở dữ liệu
        </button>
        <p className="status backup">{backupStatus}</p>
      </div>

      {/* Phục hồi cơ sở dữ liệu */}
      <div className="restore-section backup">
        <label htmlFor="restoreFile" className="file-label backup">
          Chọn tệp phục hồi:
        </label>
        <input
          type="file"
          id="restoreFile"
          accept=".sql"
          onChange={handleFileSelect}
          className="file-input backup"
        />
        <button
          className="button restore-button backup"
          onClick={handleRestore}
          disabled={!selectedFile} // Vô hiệu hóa nút nếu chưa chọn tệp
        >
          Phục hồi
        </button>
        <p className="status backup">{restoreStatus}</p>
      </div>
    </div>
  );
};

export default Backup;
