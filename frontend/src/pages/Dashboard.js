import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Card,
    CardContent,
} from '@mui/material';
import {
    Work as WorkIcon,
    People as PeopleIcon,
    Description as DescriptionIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Dashboard() {
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalCandidates: 0,
        totalResumes: 0,
        activeApplications: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [jobsRes, candidatesRes, resumesRes, applicationsRes] = await Promise.all([
                    axios.get('/api/jobs'),
                    axios.get('/api/candidates'),
                    axios.get('/api/resumes'),
                    axios.get('/api/applications'),
                ]);

                setStats({
                    totalJobs: jobsRes.data.length,
                    totalCandidates: candidatesRes.data.length,
                    totalResumes: resumesRes.data.length,
                    activeApplications: applicationsRes.data.filter(app => app.status === 'pending').length,
                });
            } catch (err) {
                setError('Failed to fetch dashboard statistics');
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            backgroundColor: `${color}20`,
                            borderRadius: '50%',
                            p: 1,
                            mr: 2,
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

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
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Jobs"
                        value={stats.totalJobs}
                        icon={<WorkIcon sx={{ color: '#1976d2' }} />}
                        color="#1976d2"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Candidates"
                        value={stats.totalCandidates}
                        icon={<PeopleIcon sx={{ color: '#2e7d32' }} />}
                        color="#2e7d32"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Resumes"
                        value={stats.totalResumes}
                        icon={<DescriptionIcon sx={{ color: '#ed6c02' }} />}
                        color="#ed6c02"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Applications"
                        value={stats.activeApplications}
                        icon={<TrendingUpIcon sx={{ color: '#9c27b0' }} />}
                        color="#9c27b0"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard; 