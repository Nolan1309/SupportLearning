import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

interface SidebarProps {
    onSelectSection: (section: string) => void;
}

const SidebarRestore: React.FC<SidebarProps> = ({ onSelectSection }) => {
    return (
        <div style={{ width: '240px', padding: '20px' }}>
            <List>
                <ListItem button onClick={() => onSelectSection('course')}>
                    <ListItemText primary="Quản lý Khóa học" />
                </ListItem>
                <ListItem button onClick={() => onSelectSection('chapter')}>
                    <ListItemText primary="Quản lý Chương" />
                </ListItem>
                <ListItem button onClick={() => onSelectSection('lesson')}>
                    <ListItemText primary="Quản lý Bài học" />
                </ListItem>
                <ListItem button onClick={() => onSelectSection('test')}>
                    <ListItemText primary="Quản lý Bài kiểm tra" />
                </ListItem>
                <ListItem button onClick={() => onSelectSection('question')}>
                    <ListItemText primary="Quản lý ngân hàng câu hỏi" />
                </ListItem>
                <ListItem button onClick={() => onSelectSection('document')}>
                    <ListItemText primary="Quản lý tài liệu" />
                </ListItem>
                <ListItem button onClick={() => onSelectSection('account')}>
                    <ListItemText primary="Quản lý tài khoản" />
                </ListItem>
                <ListItem button onClick={() => onSelectSection('blog')}>
                    <ListItemText primary="Quản lý bài viết" />
                </ListItem>
                <ListItem button onClick={() => onSelectSection('comment')}>
                    <ListItemText primary="Quản lý bình luận" />
                </ListItem>
                <ListItem button onClick={() => onSelectSection('discount')}>
                    <ListItemText primary="Quản lý giảm giá" />
                </ListItem>         
            </List>
        </div>
    );
};
export default SidebarRestore;