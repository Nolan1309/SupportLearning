import { useState } from "react";

export const FilterBar: React.FC<{ onFilterApply: (filter: any) => void }> = ({
  onFilterApply,
}) => {
  const [filter, setFilter] = useState({});

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleApplyFilter = () => {
    onFilterApply(filter);
  };

  return (
    <div className="filter-bar">
      <input
        type="text"
        name="courseName"
        placeholder="Course Name"
        onChange={handleFilterChange}
      />
      <input
        type="number"
        name="minStudents"
        placeholder="Min Students"
        onChange={handleFilterChange}
      />
      <button onClick={handleApplyFilter}>Apply Filter</button>
    </div>
  );
};
