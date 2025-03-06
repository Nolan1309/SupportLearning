import React from "react";


function Result_Course() {
  return (
    <div>
      <h2>Tổng Kết Khóa Học</h2>
      <div className="top-result-course">
        <p>Tên khóa học : Lập trình web</p>
        <p>Thời gian : 8h30</p>
        <p>Bài học : 120 bài</p>
        <p>Tổng sinh viên : 30</p>
        <p>Đánh giá : 4.7/5 ( 133 )</p>
      </div>
      <div className="bottom-result-course">
        <div>
          <select
            name="showmore"
            id="showmore"
            className="select show-more course-result"
          >
            <option value="10">10</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
          <button className="btn btn-primary">Xuất File</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Mã học viên</th>
                <th>Tên học viên</th>
                <th>Tổng bài đã làm</th>
                <th>Tiến độ</th>
                <th>Điểm sơ bộ</th>
                <th>Xếp loại</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <a href={`/admin/hoc-tap/chi-tiet-hoc-tap/${1}`}>SV001</a>
                </td>
                <td>
                  <a href={`/admin/hoc-tap/chi-tiet-hoc-tap/${1}`}>
                    Nguyễn Văn A
                  </a>{" "}
                </td>
                <td>120</td>
                <td>100%</td>
                <td>30%</td>
                <td>Giỏi</td>
              </tr>
              <tr>
                <td>
                  <a href={`/admin/hoc-tap/chi-tiet-hoc-tap/${1}`}>SV001</a>
                </td>
                <td>
                  <a href={`/admin/hoc-tap/chi-tiet-hoc-tap/${1}`}>
                    Nguyễn Văn A
                  </a>{" "}
                </td>
                <td>115</td>
                <td>95%</td>
                <td>25%</td>
                <td>Khá</td>
              </tr>
              <tr>
                <td>
                  <a href={`/admin/hoc-tap/chi-tiet-hoc-tap/${1}`}>SV001</a>
                </td>
                <td>
                  <a href={`/admin/hoc-tap/chi-tiet-hoc-tap/${1}`}>
                    Nguyễn Văn A
                  </a>{" "}
                </td>
                <td>110</td>
                <td>92%</td>
                <td>20%</td>
                <td>Trung bình</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Result_Course;