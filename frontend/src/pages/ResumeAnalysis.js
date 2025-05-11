import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    Card,
    CardContent,
    Rating,
    Button,
} from '@mui/material';
import {
    Work as WorkIcon,
    School as SchoolIcon,
    Code as CodeIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import axios from 'axios';

function ResumeAnalysis() {
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedResumeId, setSelectedResumeId] = useState(null);

    useEffect(() => {
        if (selectedResumeId) {
            fetchResumeAnalysis();
        }
    }, [selectedResumeId]);

    const fetchResumeAnalysis = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/resumes/${selectedResumeId}/analysis`);
            setResume(response.data);
        } catch (err) {
            setError('Failed to fetch resume analysis');
            console.error('Error fetching resume analysis:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        try {
            await axios.post('/api/applications', {
                job_id: jobId,
                resume_id: selectedResumeId,
            });
            // Refresh the analysis to update application status
            fetchResumeAnalysis();
        } catch (err) {
            setError('Failed to submit application');
            console.error('Error submitting application:', err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!resume) {
        return (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" color="text.secondary" align="center">
                    Select a resume to view its analysis
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Resume Analysis
            </Typography>

            <Grid container spacing={3}>
                {/* Resume Details */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Resume Details
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Candidate
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {resume.candidate.name}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Experience
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {resume.candidate.experience_years} years
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Education
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {resume.candidate.education_level}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Skills and Experience */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Skills & Experience
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                {resume.skills.map((skill) => (
                                    <Chip
                                        key={skill.name}
                                        label={skill.name}
                                        icon={<CodeIcon />}
                                        color={skill.matched ? 'primary' : 'default'}
                                    />
                                ))}
                            </Box>

                            <Typography variant="subtitle2" gutterBottom>
                                Work Experience
                            </Typography>
                            <List>
                                {resume.experience.map((exp, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={exp.title}
                                                secondary={`${exp.company} • ${exp.duration}`}
                                            />
                                        </ListItem>
                                        {index < resume.experience.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>

                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                                Education
                            </Typography>
                            <List>
                                {resume.education.map((edu, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={edu.degree}
                                                secondary={`${edu.institution} • ${edu.year}`}
                                            />
                                        </ListItem>
                                        {index < resume.education.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    </Paper>
                </Grid>

                {/* Job Matches */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Job Matches
                        </Typography>
                        <Grid container spacing={2}>
                            {resume.job_matches.map((match) => (
                                <Grid item xs={12} md={6} key={match.job.id}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="h6">
                                                    {match.job.title}
                                                </Typography>
                                                <Rating
                                                    value={match.match_score * 5}
                                                    readOnly
                                                    precision={0.5}
                                                    icon={<StarIcon fontSize="inherit" />}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {match.job.description}
                                            </Typography>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Required Skills:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {match.job.required_skills.map((skill) => (
                                                        <Chip
                                                            key={skill}
                                                            label={skill}
                                                            size="small"
                                                            color={match.matched_skills.includes(skill) ? 'primary' : 'default'}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Match Score: {Math.round(match.match_score * 100)}%
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleApply(match.job.id)}
                                                    disabled={match.has_applied}
                                                >
                                                    {match.has_applied ? 'Applied' : 'Apply'}
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default ResumeAnalysis; 