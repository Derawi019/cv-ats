import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/applications');
            setApplications(response.data);
        } catch (err) {
            setError('Failed to fetch applications');
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await axios.put(`/api/applications/${applicationId}`, {
                status: newStatus
            });
            // Update local state
            setApplications(applications.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            setError('Failed to update application status');
            console.error('Error updating application:', err);
        }
    };

    const filteredApplications = applications
        .filter(app => {
            const matchesSearch =
                app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.job.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (sortBy === 'match') {
                return b.match_score - a.match_score;
            }
            return 0;
        });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Applications
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Filters and Search */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search by candidate or job..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="reviewing">Reviewing</MenuItem>
                                <MenuItem value="shortlisted">Shortlisted</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                                <MenuItem value="hired">Hired</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sort By"
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <MenuItem value="date">Date</MenuItem>
                                <MenuItem value="match">Match Score</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Applications List */}
            <Grid container spacing={3}>
                {filteredApplications.map((application) => (
                    <Grid item xs={12} key={application.id}>
                        <Paper sx={{ p: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={3}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {application.candidate.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {application.candidate.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {application.job.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {application.job.company}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Chip
                                        label={`${Math.round(application.match_score * 100)}% Match`}
                                        color={
                                            application.match_score >= 0.8 ? 'success' :
                                                application.match_score >= 0.6 ? 'primary' :
                                                    application.match_score >= 0.4 ? 'warning' : 'error'
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <Select
                                            value={application.status}
                                            onChange={(e) => handleStatusChange(application.id, e.target.value)}
                                            size="small"
                                        >
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="reviewing">Reviewing</MenuItem>
                                            <MenuItem value="shortlisted">Shortlisted</MenuItem>
                                            <MenuItem value="rejected">Rejected</MenuItem>
                                            <MenuItem value="hired">Hired</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        Applied: {new Date(application.created_at).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {filteredApplications.length === 0 && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No applications found
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default Applications; 