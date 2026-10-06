import { supabase, isSupabaseConfigured } from './supabaseClient';

const BUCKET_NAME = 'resumes';

/**
 * Sanitize filename to avoid path traversal or special character issues
 */
const sanitizeFilename = (filename) => {
  return (filename || 'resume.pdf')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
};

/**
 * Upload original PDF to Supabase Storage and save metadata in Supabase DB
 */
export const saveResumeToSupabase = async (file, user, extractedData = null, options = {}) => {
  if (!isSupabaseConfigured || !user || !user.id) {
    console.warn('Supabase not configured or user not logged in. Skipping Supabase cloud save.');
    return null;
  }

  const cleanName = sanitizeFilename(file.name);
  const storagePath = `${user.id}/${cleanName}`;

  try {
    // 1. Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf'
      });

    if (storageError) {
      console.warn('Supabase storage upload notice:', storageError.message);
    }

    // 2. Obtain Public or Signed URL
    let fileUrl = '';
    try {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);
      fileUrl = publicUrlData?.publicUrl || '';
    } catch (urlErr) {
      console.warn('Could not generate public URL:', urlErr);
    }

    // 3. Save / Upsert metadata in Supabase Database ('user_resumes' table)
    const payload = {
      user_id: user.id,
      filename: file.name,
      file_path: storagePath,
      file_size: file.size || 0,
      file_url: fileUrl,
      extracted_data: extractedData || {},
      job_role: options.jobRole || 'Software Engineer',
      ats_score: options.atsScore || 75,
      updated_at: new Date().toISOString()
    };

    const { data: dbData, error: dbError } = await supabase
      .from('user_resumes')
      .upsert(payload, { onConflict: 'user_id,filename' })
      .select();

    if (dbError) {
      console.warn('Supabase DB metadata upsert notice:', dbError.message);
    }

    return {
      storagePath,
      fileUrl,
      dbRecord: dbData ? dbData[0] : null
    };
  } catch (error) {
    console.error('Error saving resume to Supabase:', error);
    return null;
  }
};

/**
 * Save complete Resume Builder state to Supabase Database ('user_resumes' table)
 * Guarantees one current active resume per user by upserting on user_id
 */
export const saveResumeBuilderToSupabase = async (user, resumeData, options = {}) => {
  if (!isSupabaseConfigured || !user || !user.id) {
    throw new Error('Supabase is not configured or user is not logged in.');
  }

  const payload = {
    user_id: user.id,
    filename: options.filename || 'builder_resume.pdf',
    extracted_data: resumeData,
    improved_resume: resumeData,
    selected_template: options.selectedTemplate || 'classic',
    job_role: options.jobRole || 'Software Engineer',
    ats_score: options.atsScore || 85,
    updated_at: new Date().toISOString()
  };

  let { data, error } = await supabase
    .from('user_resumes')
    .upsert(payload, { onConflict: 'user_id' })
    .select();

  // Fallback if unique constraint on user_id alone is not active yet
  if (error) {
    console.warn('Primary upsert on user_id notice:', error.message);
    const { data: existing } = await supabase
      .from('user_resumes')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      const { data: updateData, error: updateError } = await supabase
        .from('user_resumes')
        .update(payload)
        .eq('id', existing[0].id)
        .select();
      if (updateError) throw updateError;
      data = updateData;
      error = null;
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from('user_resumes')
        .insert(payload)
        .select();
      if (insertError) throw insertError;
      data = insertData;
      error = null;
    }
  }

  if (error) {
    throw error;
  }

  return data && data[0] ? data[0] : null;
};

/**
 * Fetch the latest current active resume for user from Supabase
 */
export const fetchLatestUserResumeFromSupabase = async (user) => {
  if (!isSupabaseConfigured || !user || !user.id) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    const item = data[0];
    const resumeObj = item.improved_resume && Object.keys(item.improved_resume).length > 0
      ? item.improved_resume
      : (item.extracted_data || {});

    return {
      _id: item.id,
      id: item.id,
      user_id: item.user_id,
      resumeData: resumeObj,
      selectedTemplate: item.selected_template || 'classic',
      jobRole: item.job_role || 'Software Engineer',
      atsScore: item.ats_score || 85,
      updatedAt: item.updated_at
    };
  } catch (err) {
    console.error('Error fetching latest user resume from Supabase:', err);
    return null;
  }
};

/**
 * Fetch all saved resumes for the current authenticated user from Supabase
 */
export const fetchUserResumesFromSupabase = async (user) => {
  if (!isSupabaseConfigured || !user || !user.id) {
    return [];
  }

  try {
    // 1. Query Supabase Database table
    const { data, error } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notice querying user_resumes table:', error.message);
      
      // Fallback: list files directly from storage if table isn't created yet
      const { data: storageFiles, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(user.id, {
          limit: 50,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError || !storageFiles) {
        return [];
      }

      return storageFiles
        .filter(f => f.name && !f.name.startsWith('.'))
        .map(f => ({
          _id: `storage_${f.id || f.name}`,
          id: `storage_${f.id || f.name}`,
          userId: user.id,
          user_id: user.id,
          filename: f.name,
          originalFile: {
            filename: f.name,
            size: f.metadata?.size || 0,
            path: `${user.id}/${f.name}`
          },
          file_path: `${user.id}/${f.name}`,
          jobRole: 'Extracted Profile',
          atsScore: 75,
          createdAt: f.created_at || new Date().toISOString(),
          created_at: f.created_at || new Date().toISOString(),
          isSupabase: true
        }));
    }

    // Map database records into unified resume format
    return (data || []).map((item) => ({
      _id: item.id,
      id: item.id,
      userId: item.user_id,
      user_id: item.user_id,
      filename: item.filename,
      originalFile: {
        filename: item.filename,
        size: item.file_size || 0,
        path: item.file_path
      },
      file_path: item.file_path,
      file_url: item.file_url,
      extracted_data: item.extracted_data || {},
      improvedResume: item.extracted_data || {},
      jobRole: item.job_role || 'Software Engineer',
      atsScore: item.ats_score || 75,
      createdAt: item.created_at || new Date().toISOString(),
      created_at: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString(),
      isSupabase: true
    }));
  } catch (error) {
    console.error('Error fetching resumes from Supabase:', error);
    return [];
  }
};

/**
 * Delete a user's resume from both Supabase Storage and Supabase Database
 */
export const deleteUserResumeFromSupabase = async (resumeId, filePath, user) => {
  if (!isSupabaseConfigured || !user || !user.id) {
    return false;
  }

  try {
    // 1. Delete from database
    if (resumeId && !resumeId.startsWith('storage_')) {
      await supabase
        .from('user_resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user.id);
    }

    // 2. Delete from storage
    if (filePath) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
    }

    return true;
  } catch (error) {
    console.error('Error deleting resume from Supabase:', error);
    return false;
  }
};

/**
 * Create a secure signed download URL for viewing/downloading stored original PDF
 */
export const getResumeDownloadUrl = async (filePath) => {
  if (!isSupabaseConfigured || !filePath) return null;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour validity

    if (error || !data?.signedUrl) {
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      return publicData?.publicUrl || null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed download URL:', error);
    return null;
  }
};
