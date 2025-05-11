import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Collapse,
    Tooltip,
    Zoom,
    Fade,
    Grow,
    Paper,
    Divider,
    Badge,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    AccessTime as AccessTimeIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        min_experience: '',
        education_required: '',
        required_skills: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        experience: '',
        education: '',
        skills: '',
    });
    const [sortBy, setSortBy] = useState('date');
    const [favoriteJobs, setFavoriteJobs] = useState(new Set());
    const [expandedJob, setExpandedJob] = useState(null);
    const [hoveredJob, setHoveredJob] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/jobs');
            setJobs(response.data);
        } catch (err) {
            setError('Failed to fetch jobs');
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (job = null) => {
        if (job) {
            setEditingJob(job);
            setFormData({
                title: job.title,
                description: job.description,
                requirements: job.requirements,
                min_experience: job.min_experience,
                education_required: job.education_required,
                required_skills: job.required_skills.join(', '),
            });
        } else {
            setEditingJob(null);
            setFormData({
                title: '',
                description: '',
                requirements: '',
                min_experience: '',
                education_required: '',
                required_skills: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingJob(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const jobData = {
                ...formData,
                required_skills: formData.required_skills.split(',').map(skill => skill.trim()),
                min_experience: parseFloat(formData.min_experience),
            };

            if (editingJob) {
                await axios.put(`/api/jobs/${editingJob.id}`, jobData);
            } else {
                await axios.post('/api/jobs', jobData);
            }

            handleCloseDialog();
            fetchJobs();
        } catch (err) {
            setError('Failed to save job');
            console.error('Error saving job:', err);
        }
    };

    const handleDelete = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                await axios.delete(`/api/jobs/${jobId}`);
                fetchJobs();
            } catch (err) {
                setError('Failed to delete job');
                console.error('Error deleting job:', err);
            }
        }
    };

    const handleEdit = (job) => {
        setFormData(job);
        setOpenDialog(true);
    };

    const handleFavoriteToggle = (jobId) => {
        setFavoriteJobs(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(jobId)) {
                newFavorites.delete(jobId);
            } else {
                newFavorites.add(jobId);
            }
            return newFavorites;
        });
    };

    const handleShare = async (job) => {
        try {
            await navigator.share({
                title: job.title,
                text: `Check out this job opportunity: ${job.title}`,
                url: window.location.href,
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleExpandJob = (jobId) => {
        setExpandedJob(expandedJob === jobId ? null : jobId);
    };

    const filteredJobs = jobs
        .filter(job => {
            const matchesSearch =
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.required_skills.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesExperience = !filters.experience ||
                parseInt(job.min_experience) >= parseInt(filters.experience);

            const matchesEducation = !filters.education ||
                job.education_required.toLowerCase() === filters.education.toLowerCase();

            const matchesSkills = !filters.skills ||
                job.required_skills.toLowerCase().includes(filters.skills.toLowerCase());

            return matchesSearch && matchesExperience && matchesEducation && matchesSkills;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (sortBy === 'experience') {
                return parseInt(b.min_experience) - parseInt(a.min_experience);
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4">Jobs</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Job
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Search and Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Search jobs..."
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
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                Filters
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Sort By"
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <MenuItem value="date">Date Posted</MenuItem>
                                    <MenuItem value="experience">Experience Required</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Collapse in={showFilters}>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Minimum Experience</InputLabel>
                                    <Select
                                        value={filters.experience}
                                        label="Minimum Experience"
                                        onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                                    >
                                        <MenuItem value="">Any</MenuItem>
                                        <MenuItem value="0">Entry Level</MenuItem>
                                        <MenuItem value="1">1+ years</MenuItem>
                                        <MenuItem value="3">3+ years</MenuItem>
                                        <MenuItem value="5">5+ years</MenuItem>
                                        <MenuItem value="10">10+ years</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Education Required</InputLabel>
                                    <Select
                                        value={filters.education}
                                        label="Education Required"
                                        onChange={(e) => setFilters(prev => ({ ...prev, education: e.target.value }))}
                                    >
                                        <MenuItem value="">Any</MenuItem>
                                        <MenuItem value="High School">High School</MenuItem>
                                        <MenuItem value="Bachelor's">Bachelor's</MenuItem>
                                        <MenuItem value="Master's">Master's</MenuItem>
                                        <MenuItem value="PhD">PhD</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Required Skills"
                                    value={filters.skills}
                                    onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                                    placeholder="e.g., Python, React"
                                />
                            </Grid>
                        </Grid>
                    </Collapse>
                </CardContent>
            </Card>

            {/* Jobs List */}
            <Grid container spacing={3}>
                {filteredJobs.map((job, index) => (
                    <Grow in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                        <Grid item xs={12} key={job.id}>
                            <Card
                                elevation={hoveredJob === job.id ? 8 : 2}
                                onMouseEnter={() => setHoveredJob(job.id)}
                                onMouseLeave={() => setHoveredJob(null)}
                                sx={{
                                    transition: 'all 0.3s ease-in-out',
                                    transform: hoveredJob === job.id ? 'translateY(-4px)' : 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleExpandJob(job.id)}
                            >
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={8}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
                                                    {job.title}
                                                </Typography>
                                                <Tooltip title={favoriteJobs.has(job.id) ? "Remove from favorites" : "Add to favorites"}>
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFavoriteToggle(job.id);
                                                        }}
                                                        color={favoriteJobs.has(job.id) ? "warning" : "default"}
                                                    >
                                                        {favoriteJobs.has(job.id) ? <StarIcon /> : <StarBorderIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Share job">
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShare(job);
                                                        }}
                                                    >
                                                        <ShareIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {job.description}
                                            </Typography>
                                            <Collapse in={expandedJob === job.id}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Requirements:
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {job.requirements}
                                                    </Typography>
                                                </Box>
                                            </Collapse>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {job.required_skills.split(',').map((skill, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={skill.trim()}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{
                                                            transition: 'all 0.2s ease-in-out',
                                                            '&:hover': {
                                                                backgroundColor: 'primary.main',
                                                                color: 'white',
                                                            },
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AccessTimeIcon color="action" />
                                                    <Typography variant="body2">
                                                        <strong>Experience:</strong> {job.min_experience} years
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <SchoolIcon color="action" />
                                                    <Typography variant="body2">
                                                        <strong>Education:</strong> {job.education_required}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <Tooltip title="Edit job">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(job);
                                                            }}
                                                            color="primary"
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete job">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(job.id);
                                                            }}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grow>
                ))}
            </Grid>

            {filteredJobs.length === 0 && (
                <Fade in={true}>
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            No jobs found
                        </Typography>
                    </Box>
                </Fade>
            )}

            {/* Add/Edit Job Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingJob ? 'Edit Job' : 'Add New Job'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Job Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={4}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Requirements"
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Required Skills (comma-separated)"
                                    name="required_skills"
                                    value={formData.required_skills}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Minimum Experience (years)"
                                    name="min_experience"
                                    type="number"
                                    value={formData.min_experience}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Education Required"
                                    name="education_required"
                                    value={formData.education_required}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button onClick={handleCloseDialog}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="contained">
                                        {editingJob ? 'Update' : 'Create'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingJob ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Jobs; 