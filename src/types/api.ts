export type UserProfile = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type MapPhotoFeature = {
  id: string;
  lat: number;
  lng: number;
  thumb_key: string | null;
};

export type MapPhotosResponse = {
  features: MapPhotoFeature[];
  count: number;
};

export type PhotoListItem = {
  id: string;
  lat: number;
  lng: number;
  thumb_key: string | null;
  ai_description: string | null;
  ai_status: string;
  created_at: string;
};

export type PhotoListResponse = {
  photos: PhotoListItem[];
  count: number;
};

export type PhotoUploadInitResponse = {
  photo_id: string;
  storage_path: string;
  upload_instructions: string;
};

export type PhotoDetail = {
  id: string;
  owner_id: string;
  storage_key_original: string;
  storage_key_medium: string | null;
  storage_key_thumb: string | null;
  mime_type: string;
  size_bytes: number;
  lat: number;
  lng: number;
  ai_description: string | null;
  ai_status: string;
  visibility: string;
  created_at: string;
};

export type Comment = {
  id: string;
  photo_id: string;
  author_id: string;
  body: string;
  created_at: string;
};
