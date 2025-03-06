import React from "react";
import { CategoryCourse } from "../../../../model/CategoryCourse";
import "./style.css";
interface CourseNavProps {
  categories: CategoryCourse[];
  onCategoryChange: (id: number) => void;
  onSearchChange: (query: string) => void;
}

const CourseNav: React.FC<CourseNavProps> = ({
  categories,
  onCategoryChange,
  onSearchChange,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };
  
  return (
    <div className="mui-uxxhp5">
      <div className="item search-course mb-4">
        <h3 className="item search-course">Tìm kiếm</h3>
        <div className="input-wrp search-course">
          <input
            type="text"
            placeholder="Search .."
            onChange={handleInputChange}
          />
          <button>
            <i className="fa-regular fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <h3 className="MuiBox-root mui-zt2g19" style={{ marginBottom: "30px" }}>
        Danh mục khóa học
      </h3>
      {categories.map((category) => (
        <div key={category.id}>
          <span className="MuiButtonBase-root MuiCheckbox-root MuiCheckbox-colorSuccess MuiCheckbox-sizeMedium PrivateSwitchBase-root MuiCheckbox-root MuiCheckbox-colorSuccess MuiCheckbox-sizeMedium Mui-checked MuiCheckbox-root MuiCheckbox-colorSuccess MuiCheckbox-sizeMedium mui-13upn6v">
            <input
              type="checkbox"
              id={`category-${category.id}`}
              onChange={() => onCategoryChange(category.id)}
            />
          </span>
          <label
            className="MuiChip-root MuiChip-filled MuiChip-sizeSmall MuiChip-colorDefault MuiChip-filledDefault mui-1r33y07"
            htmlFor={`category-${category.id}`}
            style={{ marginRight: "15px" }}
          >
            <span className="MuiChip-label MuiChip-labelSmall mui-tavflp">
              {category.name}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default CourseNav;
