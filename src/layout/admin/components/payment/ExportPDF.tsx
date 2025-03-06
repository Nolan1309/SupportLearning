import React, { useRef } from "react";
import { Button } from "@mui/material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const ExportPDF: React.FC = () => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = () => {
    const input = pdfRef.current;

    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        pdf.save("chi-tiet-thanh-toan.pdf");
      });
    }
  };

  return (
    <div>
      {/* Nội dung thông tin thanh toán */}
      <div ref={pdfRef} style={{ padding: "20px", backgroundColor: "#fff" }}>
        <h2 style={{ textAlign: "center" }}>Chi tiết giao dịch</h2>
        <p><strong>Người mua:</strong> Thảo admin</p>
        <p><strong>Số lượng:</strong> 2</p>
        <p><strong>Ngày thanh toán:</strong> 23:01:37 30/8/2024</p>
        <p><strong>Phương thức thanh toán:</strong> VNPAY</p>

        <table  cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Khóa học</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Kỹ năng tập trung</td>
              <td>100.000 VND</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Lập trình Python 2</td>
              <td>300.000 VND</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ textAlign: "right" }}>Tổng tiền: 400.000 VND</h3>
      </div>

      {/* Nút xuất PDF */}
      <Button variant="contained" color="primary" onClick={handleExportPDF} style={{ marginTop: "20px" }}>
        Xuất PDF
      </Button>
    </div>
  );
};

export default ExportPDF;
