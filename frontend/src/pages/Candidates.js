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
    Tabs,
    Tab,
    Rating,
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
    Avatar,
} from '@mui/material';
import {
    Add as AddIcon,
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Share as ShareIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Candidates() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        experience: '',
        education_level: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        experience: '',
        education: '',
        skills: '',
    });
    const [sortBy, setSortBy] = useState('name');
    const [favoriteCandidates, setFavoriteCandidates] = useState(new Set());
    const [expandedCandidate, setExpandedCandidate] = useState(null);
    const [hoveredCandidate, setHoveredCandidate] = useState(null);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/candidates');
            setCandidates(response.data);
        } catch (err) {
            setError('Failed to fetch candidates');
            console.error('Error fetching candidates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (candidate = null) => {
        if (candidate) {
            setSelectedCandidate(candidate);
            setFormData({
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                experience: candidate.experience,
                education_level: candidate.education_level,
            });
        } else {
            setSelectedCandidate(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                experience: '',
                education_level: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCandidate(null);
        setSelectedFile(null);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
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
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            if (selectedFile) {
                formDataToSend.append('resume', selectedFile);
            }

            if (formData.id) {
                await axios.put(`/api/candidates/${formData.id}`, formDataToSend);
            } else {
                await axios.post('/api/candidates', formDataToSend);
            }
            handleCloseDialog();
            fetchCandidates();
        } catch (err) {
            setError('Failed to save candidate');
            console.error('Error saving candidate:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this candidate?')) {
            try {
                await axios.delete(`/api/candidates/${id}`);
                fetchCandidates();
            } catch (err) {
                setError('Failed to delete candidate');
                console.error('Error deleting candidate:', err);
            }
        }
    };

    const handleDeleteResume = async (candidateId, resumeId) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await axios.delete(`/api/candidates/${candidateId}/resumes/${resumeId}`);
                fetchCandidates();
            } catch (err) {
                setError('Failed to delete resume');
                console.error('Error deleting resume:', err);
            }
        }
    };

    const handleEdit = (candidate) => {
        setFormData(candidate);
        setOpenDialog(true);
    };

    const handleFavoriteToggle = (candidateId) => {
        setFavoriteCandidates(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(candidateId)) {
                newFavorites.delete(candidateId);
            } else {
                newFavorites.add(candidateId);
            }
            return newFavorites;
        });
    };

    const handleShare = async (candidate) => {
        try {
            await navigator.share({
                title: candidate.name,
                text: `Check out this candidate: ${candidate.name}`,
                url: window.location.href,
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleExpandCandidate = (candidateId) => {
        setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
    };

    const filteredCandidates = candidates
        .filter(candidate => {
            const matchesSearch =
                candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.phone.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesExperience = !filters.experience ||
                parseInt(candidate.experience) >= parseInt(filters.experience);

            const matchesEducation = !filters.education ||
                candidate.education_level.toLowerCase() === filters.education.toLowerCase();

            const matchesSkills = !filters.skills ||
                candidate.resumes?.some(resume =>
                    resume.skills?.toLowerCase().includes(filters.skills.toLowerCase())
                );

            return matchesSearch && matchesExperience && matchesEducation && matchesSkills;
        })
        .sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'experience') {
                return parseInt(b.experience) - parseInt(a.experience);
            } else if (sortBy === 'education') {
                return a.education_level.localeCompare(b.education_level);
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
                <Typography variant="h4">Candidates</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Candidate
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
                                placeholder="Search candidates..."
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
                                    <MenuItem value="name">Name</MenuItem>
                                    <MenuItem value="experience">Experience</MenuItem>
                                    <MenuItem value="education">Education</MenuItem>
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
                                    <InputLabel>Education Level</InputLabel>
                                    <Select
                                        value={filters.education}
                                        label="Education Level"
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
                                    label="Skills"
                                    value={filters.skills}
                                    onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                                    placeholder="e.g., Python, React"
                                />
                            </Grid>
                        </Grid>
                    </Collapse>
                </CardContent>
            </Card>

            {/* Candidates List */}
            <Grid container spacing={3}>
                {filteredCandidates.map((candidate, index) => (
                    <Grow in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                        <Grid item xs={12} key={candidate.id}>
                            <Card
                                elevation={hoveredCandidate === candidate.id ? 8 : 2}
                                onMouseEnter={() => setHoveredCandidate(candidate.id)}
                                onMouseLeave={() => setHoveredCandidate(null)}
                                sx={{
                                    transition: 'all 0.3s ease-in-out',
                                    transform: hoveredCandidate === candidate.id ? 'translateY(-4px)' : 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleExpandCandidate(candidate.id)}
                            >
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={8}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        bgcolor: 'primary.main',
                                                        fontSize: '1.5rem',
                                                    }}
                                                >
                                                    {candidate.name.split(' ').map(n => n[0]).join('')}
                                                </Avatar>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="h6" gutterBottom>
                                                        {candidate.name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <EmailIcon fontSize="small" color="action" />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {candidate.email}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <PhoneIcon fontSize="small" color="action" />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {candidate.phone}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                <Box>
                                                    <Tooltip title={favoriteCandidates.has(candidate.id) ? "Remove from favorites" : "Add to favorites"}>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleFavoriteToggle(candidate.id);
                                                            }}
                                                            color={favoriteCandidates.has(candidate.id) ? "warning" : "default"}
                                                        >
                                                            {favoriteCandidates.has(candidate.id) ? <StarIcon /> : <StarBorderIcon />}
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Share candidate">
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleShare(candidate);
                                                            }}
                                                        >
                                                            <ShareIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <WorkIcon color="action" />
                                                    <Typography variant="body2">
                                                        <strong>Experience:</strong> {candidate.experience} years
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <SchoolIcon color="action" />
                                                    <Typography variant="body2">
                                                        <strong>Education:</strong> {candidate.education_level}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Collapse in={expandedCandidate === candidate.id}>
                                                <Tabs
                                                    value={activeTab}
                                                    onChange={(e, newValue) => {
                                                        e.stopPropagation();
                                                        setActiveTab(newValue);
                                                    }}
                                                    sx={{ mb: 2 }}
                                                >
                                                    <Tab
                                                        icon={<DescriptionIcon />}
                                                        label="Resumes"
                                                        iconPosition="start"
                                                    />
                                                    <Tab
                                                        icon={<AssignmentIcon />}
                                                        label="Applications"
                                                        iconPosition="start"
                                                    />
                                                </Tabs>
                                                {activeTab === 0 && (
                                                    <Box>
                                                        {candidate.resumes?.map((resume) => (
                                                            <Paper
                                                                key={resume.id}
                                                                elevation={2}
                                                                sx={{ p: 2, mb: 2 }}
                                                            >
                                                                <Typography variant="subtitle2" gutterBottom>
                                                                    {resume.filename}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                                                    {resume.skills?.split(',').map((skill, index) => (
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
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <Button
                                                                        size="small"
                                                                        startIcon={<VisibilityIcon />}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open(resume.file_url, '_blank');
                                                                        }}
                                                                    >
                                                                        View
                                                                    </Button>
                                                                    <Button
                                                                        size="small"
                                                                        color="error"
                                                                        startIcon={<DeleteIcon />}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteResume(candidate.id, resume.id);
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </Box>
                                                            </Paper>
                                                        ))}
                                                        {(!candidate.resumes || candidate.resumes.length === 0) && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                No resumes uploaded
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                                {activeTab === 1 && (
                                                    <Box>
                                                        {candidate.applications?.map((application) => (
                                                            <Paper
                                                                key={application.id}
                                                                elevation={2}
                                                                sx={{ p: 2, mb: 2 }}
                                                            >
                                                                <Typography variant="subtitle2" gutterBottom>
                                                                    {application.job.title}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Status: {application.status}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Match Score: {Math.round(application.match_score * 100)}%
                                                                    </Typography>
                                                                </Box>
                                                            </Paper>
                                                        ))}
                                                        {(!candidate.applications || candidate.applications.length === 0) && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                No applications submitted
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Collapse>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                <Tooltip title="Edit candidate">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(candidate);
                                                        }}
                                                        color="primary"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete candidate">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(candidate.id);
                                                        }}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grow>
                ))}
            </Grid>

            {filteredCandidates.length === 0 && (
                <Fade in={true}>
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            No candidates found
                        </Typography>
                    </Box>
                </Fade>
            )}

            {/* Add/Edit Candidate Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {formData.id ? 'Edit Candidate' : 'Add New Candidate'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Experience (years)"
                                    name="experience"
                                    type="number"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Education Level"
                                    name="education_level"
                                    value={formData.education_level}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<UploadIcon />}
                                    fullWidth
                                >
                                    Upload Resume
                                    <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                {selectedFile && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Selected file: {selectedFile.name}
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button onClick={handleCloseDialog}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="contained">
                                        {formData.id ? 'Update' : 'Create'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Dialog>
        </Box>
    );
}

export default Candidates; 