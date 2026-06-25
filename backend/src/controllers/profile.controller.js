
export const getProfile = async (req, res) => {
  res.json({
    message: 'Profil user berhasil diambil.',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.user_metadata?.name,
      username: req.user.user_metadata?.username,
      avatar: req.user.user_metadata?.picture,
      role: req.user.app_metadata?.role || 'user',
    },
  });
};

export const updateProfile = async (req, res) => {
  const { name, avatar, username } = req.body;

  if (!name && !avatar && !username) {
    return res.status(400).json({ error: 'Minimal salah satu field (name, avatar, username) harus diisi.' });
  }

  try {
    const updates = { data: {} };
    if (name) updates.data.name = name;
    if (avatar) updates.data.picture = avatar;
    if (username) updates.data.username = username;

    const { data, error } = await supabase.auth.updateUser(updates);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Profil berhasil diperbarui.',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        avatar: data.user.user_metadata?.picture,
        username: data.user.user_metadata?.username,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res.status(400).json({ error: 'old_password dan new_password wajib diisi.' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
  }

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: old_password,
    });

    if (signInError) {
      return res.status(401).json({ error: 'Password lama salah.' });
    }

    const { data, error } = await supabase.auth.updateUser({
      password: new_password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Password berhasil diubah. Silakan login kembali dengan password baru.',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};