import React, { useState } from 'react';
import { Typography, TextField, Box, FormControlLabel, Switch, Button, Tabs, Tab } from '@mui/material';
import './lesson.scss'; // Import the SCSS file

const initialVideoData = {
    title: 'Sample Video Lesson',
    sourceType: 'YouTube',
    embedContent: '<iframe src="https://www.youtube.com/embed/sample" width="560" height="315"></iframe>',
    duration: '15 minutes',
    preview: true,
    description: 'This is a sample description for a video lesson.',
    videoFile: null as File | null, // Ensure TypeScript recognizes this as File | null
};

const initialQAData = {
    questionTitle: 'Sample Question',
    questionDescription: 'This is a sample question description.',
    answer: 'This is a sample answer.',
};

const initialDocumentData = {
    documentTitle: 'Sample Document',
    documentDescription: 'This is a sample document description.',
};

const Lesson: React.FC = () => {
    const [lessonType, setLessonType] = useState<'video' | 'qa' | 'document'>('video');
    const [videoData, setVideoData] = useState(initialVideoData);
    const [qaData, setQAData] = useState(initialQAData);
    const [documentData, setDocumentData] = useState(initialDocumentData);

    const handleChangeLessonType = (event: React.SyntheticEvent, newValue: 'video' | 'qa' | 'document') => {
        setLessonType(newValue);
    };

    const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setVideoData(prev => ({ ...prev, videoFile: file }));
    };

    return (
        <div className="lesson-container">
            <Typography variant="h5" className="title">Lesson Details</Typography>
            <Tabs
                value={lessonType}
                onChange={handleChangeLessonType}
                aria-label="lesson type tabs"
                className="tabs"
            >
                <Tab label="Video" value="video" />
                <Tab label="Q&A" value="qa" />
                <Tab label="Document" value="document" />
            </Tabs>

            {lessonType === 'video' && (
                <>
                    <TextField
                        label="Lesson Title"
                        fullWidth
                        value={videoData.title}
                        className="text-field"
                        onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
                        <TextField
                            label="Source type"
                            fullWidth
                            value={videoData.sourceType}
                            style={{ marginRight: '10px' }}
                            onChange={(e) => setVideoData({ ...videoData, sourceType: e.target.value })}
                        />
                        <TextField
                            label="Embed iframe content"
                            fullWidth
                            value={videoData.embedContent}
                            onChange={(e) => setVideoData({ ...videoData, embedContent: e.target.value })}
                        />
                    </Box>
                    <TextField
                        label="Lesson duration"
                        fullWidth
                        value={videoData.duration}
                        className="text-field"
                        onChange={(e) => setVideoData({ ...videoData, duration: e.target.value })}
                    />
                    <FormControlLabel
                        control={<Switch color="primary" checked={videoData.preview} onChange={(e) => setVideoData({ ...videoData, preview: e.target.checked })} />}
                        label="Lesson preview (Everyone can see this lesson)"
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="Short description of the lesson"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        value={videoData.description}
                        onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                    />
                    <Button
                        variant="contained"
                        component="label"
                        className="file-upload-button"
                    >
                        Upload Video
                        <input
                            type="file"
                            accept="video/*"
                            hidden
                            onChange={handleVideoFileChange}
                        />
                    </Button>
                    {videoData.videoFile && (
                        <div className="file-info">
                            <Typography variant="body1">
                                Selected file: {videoData.videoFile.name}
                            </Typography>
                        </div>
                    )}
                </>
            )}

            {lessonType === 'qa' && (
                <>
                    <TextField
                        label="Question Title"
                        fullWidth
                        value={qaData.questionTitle}
                        className="text-field"
                        onChange={(e) => setQAData({ ...qaData, questionTitle: e.target.value })}
                    />
                    <TextField
                        label="Question Description"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        className="text-field"
                        value={qaData.questionDescription}
                        onChange={(e) => setQAData({ ...qaData, questionDescription: e.target.value })}
                    />
                    <TextField
                        label="Answer"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        value={qaData.answer}
                        onChange={(e) => setQAData({ ...qaData, answer: e.target.value })}
                    />
                </>
            )}

            {lessonType === 'document' && (
                <>
                    <TextField
                        label="Document Title"
                        fullWidth
                        value={documentData.documentTitle}
                        className="text-field"
                        onChange={(e) => setDocumentData({ ...documentData, documentTitle: e.target.value })}
                    />
                    <TextField
                        label="Document Description"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        className="text-field"
                        value={documentData.documentDescription}
                        onChange={(e) => setDocumentData({ ...documentData, documentDescription: e.target.value })}
                    />
                    <Button variant="contained" component="label">
                        Upload Document
                        <input type="file" hidden />
                    </Button>
                </>
            )}
        </div>
    );
};

export default Lesson;
