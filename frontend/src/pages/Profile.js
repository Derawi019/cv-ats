import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Alert,
    Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
    const { user, changePassword } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setError('New passwords do not match');
        }

        try {
            setLoading(true);
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            setSuccess('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err) {
            setError('Failed to change password. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Profile
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Account Information
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Email
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {user?.email}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Role
                            </Typography>
                            <Typography variant="body1">
                                {user?.is_admin ? 'Administrator' : 'User'}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Change Password
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                                {success}
                            </Alert>
                        )}
                        <Box component="form" onSubmit={handlePasswordChange} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Current Password"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        currentPassword: e.target.value,
                                    })
                                }
                                required
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value,
                                    })
                                }
                                required
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                required
                                margin="normal"
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ mt: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Profile; 