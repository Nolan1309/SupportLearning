import React, { useState } from 'react';
import { TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, MenuItem, Select, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { Add, Edit, Delete } from '@material-ui/icons';
import './studentList.scss';

interface Course {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  enrolledCourses: Course[];
}

const initialStudents: Student[] = [
  { id: 1, name: 'Student A', enrolledCourses: [{ id: 1, name: 'Course 1' }, { id: 2, name: 'Course 2' }] },
  { id: 2, name: 'Student B', enrolledCourses: [{ id: 2, name: 'Course 2' }, { id: 3, name: 'Course 3' }] },
  { id: 3, name: 'Student C', enrolledCourses: [{ id: 1, name: 'Course 1' }] },
  // Add more students as needed
];

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCourse, setFilterCourse] = useState<number | ''>('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterStudents(term, filterCourse);
  };

  const handleFilterChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const courseId = e.target.value as number | '';
    setFilterCourse(courseId);
    filterStudents(searchTerm, courseId);
  };

  const handleSort = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newSortDirection);

    const sortedStudents = [...filteredStudents].sort((a, b) => {
      if (a.name < b.name) return newSortDirection === 'asc' ? -1 : 1;
      if (a.name > b.name) return newSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStudents(sortedStudents);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  const filterStudents = (term: string, courseId: number | '') => {
    const filtered = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(term);
      const matchesCourse = courseId === '' || student.enrolledCourses.some(course => course.id === courseId);
      return matchesSearch && matchesCourse;
    });
    setFilteredStudents(filtered);
  };

  return (
    <div className="container">
      <h2 className="title">Danh Sách Học Viên</h2>
      <div className="header-container">
      <Select
          className="filter-select"
          value={filterCourse}
          onChange={handleFilterChange}
          displayEmpty
        >
          <MenuItem value="">
            <em>Tất cả khóa học</em>
          </MenuItem>
          <MenuItem value={1}>Course 1</MenuItem>
          <MenuItem value={2}>Course 2</MenuItem>
          <MenuItem value={3}>Course 3</MenuItem>
          {/* Add more courses as needed */}
        </Select>
        <TextField
          className="search-bar"
          label="Tìm sinh viên"
          value={searchTerm}
          onChange={handleSearch}
          variant="outlined"
        />
    
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell onClick={handleSort} style={{ cursor: 'pointer' }}>
              Tên Sinh Viên {sortDirection === 'asc' ? '↑' : '↓'}
            </TableCell>
            <TableCell>Khóa Học</TableCell>
            <TableCell>Hành Động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredStudents.map(student => (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>
                {student.enrolledCourses.map(course => (
                  <div key={course.id}>{course.name}</div>
                ))}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleViewDetails(student)}><Edit /></IconButton>
                <IconButton><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Chi Tiết Học Viên</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <div>
              <h3>{selectedStudent.name}</h3>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Khóa Học</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedStudent.enrolledCourses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell>{course.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentList;
