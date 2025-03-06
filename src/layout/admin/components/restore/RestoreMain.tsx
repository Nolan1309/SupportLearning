// Dashboard.tsx
import React, { useState, Suspense, lazy } from 'react';
import SidebarRestore from './sidebarComponet/SidebarRestore';
import CourseManagement from './dashboardComponent/CourseManagement';
import ChapterManagement from './dashboardComponent/ChapterManagement';
import LessonManagement from './dashboardComponent/LessonManagement';
import TestManagement from './dashboardComponent/TestManagement';
import DocumentManagement from './dashboardComponent/DocumentManagement';
import QuestionManagement from './dashboardComponent/QuestionManagement';
import AccountManagementComponent from './dashboardComponent/AccountManagementComponent';
import BlogManagement from './dashboardComponent/BlogManagement';
import CommentManagement from './dashboardComponent/CommentManagement';
import DiscountManagement from './dashboardComponent/DiscountManagement';


const RestoreMain: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>('course');
    const handleSectionChange = (section: string) => {
        setSelectedSection(section);
    };
    return (
        <div style={{ display: 'flex' }}>

            <SidebarRestore onSelectSection={handleSectionChange} />

            <div style={{ flexGrow: 1, padding: '20px' }}>
                <Suspense fallback={<div>Loading...</div>}>
                    {selectedSection === 'course' && <CourseManagement />}
                    {selectedSection === 'chapter' && <ChapterManagement />}
                    {selectedSection === 'lesson' && <LessonManagement />}
                    {selectedSection === 'test' && <TestManagement />}
                    {selectedSection === 'document' && <DocumentManagement />}
                    {selectedSection === 'question' && <QuestionManagement />}
                    {selectedSection === 'account' && <AccountManagementComponent />}
                    {selectedSection === 'blog' && <BlogManagement />}
                    {selectedSection === 'comment' && <CommentManagement />}
                    {selectedSection === 'discount' && <DiscountManagement />}
                </Suspense>
            </div>
        </div>
    );
};

export default RestoreMain;
