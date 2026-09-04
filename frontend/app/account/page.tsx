"use client";

import { useState, useEffect } from "react";

import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  Alert,
  Divider,
  Stack,
  Chip,
  TextField,
} from "@mui/material";

import Link from "next/link";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import useAuthStore from "@/store/authStore";
import useRequireAuth from "@/hooks/useRequireAuth";
import { getMyProfile, updateMyProfile, changeMyPassword, deactivateMyAccount } from "@/services/userService";

import { useRouter } from "next/navigation";

type PageMode = "profile" | "profile-edit" | "change-password" | "deactivate-confirm";

export default function AccountPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  useRequireAuth("/account");

  const [mode, setMode] = useState<PageMode>("profile");
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [deactivating, setDeactivating] = useState(false);

  // Load profile on mount — call once when a screen needs the profile data.
  // Moved from render to useEffect to avoid "setState in useEffect" lint error
  // and repeated API requests on refresh.
  async function loadProfile() {
    const res = await getMyProfile();
    if (res.ok && res.data) {
      setProfile({
        firstName: res.data.firstName ?? "",
        lastName: res.data.lastName ?? "",
        email: res.data.email ?? "",
        phone: res.data.phone ?? "",
      });
      setProfileError(null);
      setProfileSuccess(null);
      // Sync the auth store user with the authoritative backend response
      useAuthStore.setState({
        user: {
          id: res.data.id,
          firstName: res.data.firstName ?? "",
          lastName: res.data.lastName ?? "",
          email: res.data.email ?? "",
          phone: res.data.phone ?? "",
        },
      });
    } else {
      setProfileError("Failed to load profile");
    }
  }

  useEffect(() => {
    if (token) {
      void loadProfile();
    }
  }, [token]);

  // --- Handler functions ---

  const handleProfileSubmit = async () => {
    setProfileError(null);
    setProfileSuccess(null);

    const res = await updateMyProfile({
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      phone: profile.phone.trim(),
    });

    if (res.ok && res.data) {
      setProfile({
        firstName: res.data.firstName ?? profile.firstName,
        lastName: res.data.lastName ?? profile.lastName,
        email: res.data.email ?? profile.email,
        phone: res.data.phone ?? profile.phone,
      });
      setProfileSuccess("Profile updated successfully");
      useAuthStore.setState({
        user: {
          id: res.data.id,
          firstName: res.data.firstName ?? "",
          lastName: res.data.lastName ?? "",
          email: res.data.email ?? "",
          phone: res.data.phone ?? "",
        },
      });
    } else {
      setProfileError("Failed to update profile");
    }
  };

  function validatePasswordForm(): string | null {
    const { currentPassword, newPassword, confirmPassword } = passwordFields;

    if (!currentPassword.trim()) return "Current password is required.";
    if (!newPassword.trim()) return "New password is required.";
    if (newPassword.length < 8) return "New password must be at least 8 characters.";
    if (newPassword !== confirmPassword.trim()) return "Confirm password must match new password.";
    return null;
  }

  const handlePasswordSubmit = async () => {
    const validationError = validatePasswordForm();
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    setPasswordError(null);
    setPasswordSuccess(null);

    const res = await changeMyPassword({
      currentPassword: passwordFields.currentPassword.trim(),
      newPassword: passwordFields.newPassword.trim(),
      confirmPassword: passwordFields.confirmPassword.trim(),
    });

    if (res.ok) {
      setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess("Password changed successfully");
    } else {
      setPasswordError("Failed to change password");
    }
  }

  function closeDeactivateConfirm() {
    setDeactivating(false);
  }

  const handleDeactivateConfirm = async () => {
    setDeactivating(false);

    const res = await deactivateMyAccount();

    if (res.ok) {
      useAuthStore.setState({
        user: null,
        token: null,
        refreshToken: null,
      });
      router.push("/login");
    }
  };

  // --- Profile section content ---
  let profileSection = null;
  if (mode === "profile") {
    profileSection = (
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Personal Information</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={4}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>First Name</Typography>
              <Typography variant="body1">{profile.firstName || "—"}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Last Name</Typography>
              <Typography variant="body1">{profile.lastName || "—"}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Email</Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>{profile.email || "—"}</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Phone</Typography>
              <Typography variant="body1">{profile.phone || "not provided"}</Typography>
            </Grid>
            <Grid size={4} sx={{ textAlign: "right" }}>
              <Button variant="outlined" sx={{ width: "100%" }} onClick={() => setMode("profile-edit")}>Edit Profile</Button>
            </Grid>
            <Grid size={4} sx={{ textAlign: "right" }}>
              <Button variant="outlined" sx={{ width: "100%" }} onClick={() => setMode("change-password")}>Change Password</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // --- Profile Edit section content ---
  let profileEditSection = null;
  if (mode === "profile-edit") {
    profileEditSection = (
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Edit Profile</Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField fullWidth label="First Name" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Last Name" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField fullWidth label="Phone (10 digits, starts with 6-9)" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} inputMode="numeric" />
            </Grid>
            <Grid size={6} sx={{ textAlign: "right" }}>
              <Button variant="contained" sx={{ width: "100%" }} onClick={handleProfileSubmit} disabled={profile.firstName.trim() === "" || profile.lastName.trim() === "" || profile.phone.trim().length !== 10}>{profileSuccess ? "Saved!" : "Save Changes"}</Button>
              {profileError && <Typography color="error" sx={{ mt: 1 }}>{profileError}</Typography>}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // --- Change Password section content ---
  let passwordSection = null;
  if (mode === "change-password") {
    passwordSection = (
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Security</Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>Change your password to keep your account secure.</Typography>
          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField fullWidth label="Current Password" type="password" value={passwordFields.currentPassword} onChange={(e) => setPasswordFields({ ...passwordFields, currentPassword: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="New Password" type="password" value={passwordFields.newPassword} onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })} />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField fullWidth label="Confirm New Password" type="password" value={passwordFields.confirmPassword} onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })} />
            </Grid>
            <Grid size={6} sx={{ textAlign: "right" }}>
              <Button variant="contained" sx={{ width: "100%" }} onClick={handlePasswordSubmit} disabled={passwordFields.currentPassword.trim() === "" || passwordFields.newPassword.trim() === "" || passwordFields.confirmPassword.trim() === ""}>{passwordSuccess ? "Updated!" : "Change Password"}</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // --- Deactivation section content ---
  let deactivateSection = null;
  if (deactivating) {
    deactivateSection = (
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Danger Zone</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Are you sure you want to deactivate your account?</Typography>
          <Typography color="text.error" sx={{ mb: 3 }}>Your account will be deactivated and you will no longer be able to use NextCart normally. This action cannot be undone.</Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="outlined" sx={{ flex: 1 }} onClick={closeDeactivateConfirm}>Cancel</Button>
            <Button variant="outlined" sx={{ flex: 1 }} onClick={handleDeactivateConfirm}>Deactivate Account</Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // --- Mode switch content ---

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          {profileSection}
        </Box>
        {profileEditSection}
        {passwordSection}
        {deactivateSection}
        <Divider sx={{ my: 4 }} />
        <Stack direction="column" spacing={2} sx={{ width: "100%" }}>
          <Button component={Link} href="/account/orders" sx={{ width: "100%", padding: "8px 12px", textAlign: "left", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>My Orders</Typography>
            <Chip label="Open" size="small" />
          </Button>
          <Button component={Link} href="/account/addresses" sx={{ width: "100%", padding: "8px 12px", textAlign: "left", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>My Addresses</Typography>
            <Chip label="Open" size="small" />
          </Button>
          <Button component={Link} href="/wishlist" sx={{ width: "100%", padding: "8px 12px", textAlign: "left", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Wishlist</Typography>
            <Chip label="Open" size="small" />
          </Button>
        </Stack>
        <Divider sx={{ my: 4 }} />
        <Button component={Link} href="/login" sx={{ width: "100%", padding: "8px 12px", textAlign: "left", borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "error.main", color: "error.contrastText" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Log Out</Typography>
        </Button>
        <Footer />
      </Container>
    </>
  );
}