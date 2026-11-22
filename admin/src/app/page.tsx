"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ShieldCheck,
  User,
  Lock,
  Trash2,
  RefreshCw,
  LogOut,
  ExternalLink,
  MessageCircle,
  Heart,
  Trophy,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Filter,
  Camera,
  Plus,
  Edit3,
  X,
  Upload,
  GripVertical,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Tag,
  Hash,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Star,
  RotateCcw,
} from "lucide-react";
import {
  adminLogin,
  verifyAdminToken,
  adminGetStats,
  adminGetComments,
  adminDeleteComment,
  adminGetWishes,
  adminDeleteWish,
  adminGetTrivia,
  adminDeleteTrivia,
  adminGetPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminUploadImage,
  adminReorderPosts,
  adminGetLocations,
  adminCreateLocation,
  adminUpdateLocation,
  adminDeleteLocation,
  adminReorderLocations,
} from "@/lib/api";
import type {
  AdminStats,
  BackendComment,
  GuestWish,
  TriviaLeaderboardEntry,
  AdminInstagramPost,
  InstagramMedia,
  InstagramAspectRatio,
  AdminMapLocation,
  MapLocationCategory,
} from "@/lib/types";
import dynamic from "next/dynamic";

const AdminLocationPickerMap = dynamic(
  () => import("@/components/AdminLocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full rounded-2xl border-2 border-[#C68A2C]/40 bg-champagne/30 flex items-center justify-center text-xs text-soft-brown font-medium animate-pulse">
        🗺️ Loading interactive map...
      </div>
    ),
  }
);

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:3000";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/saa\/?$/, "").replace(/\/$/, "") ||
  "https://68.233.104.235.sslip.io";

function resolveMediaUrl(src?: string): string {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  if (src.startsWith("/uploads/")) {
    return `${BACKEND_URL}${src}`;
  }
  return src;
}

type TabId = "comments" | "wishes" | "trivia" | "instagram" | "locations";

const CATEGORIES = [
  { value: "wedding", label: "Wedding", emoji: "💍" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
  { value: "milestone", label: "Milestone", emoji: "🏆" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "celebration", label: "Celebration", emoji: "🎉" },
];

const LOCATION_CATEGORIES: { value: MapLocationCategory; label: string; emoji: string }[] = [
  { value: "first-meeting", label: "First Meeting", emoji: "💕" },
  { value: "wedding", label: "Wedding Venue", emoji: "💒" },
  { value: "home", label: "Family Home", emoji: "🏠" },
  { value: "holiday", label: "Holiday / Vacation", emoji: "🏖️" },
  { value: "special", label: "Special Memory", emoji: "✨" },
];

const CITY_PRESETS = [
  { name: "Hyderabad", nameTe: "హైదరాబాద్", lat: 17.385, lng: 78.4867, emoji: "🏛️" },
  { name: "Secunderabad", nameTe: "సికింద్రాబాద్", lat: 17.4399, lng: 78.4983, emoji: "💒" },
  { name: "Visakhapatnam (Vizag)", nameTe: "విశాఖపట్నం (వైజాగ్)", lat: 17.6868, lng: 83.2185, emoji: "🌊" },
  { name: "Goa", nameTe: "గోవా", lat: 15.2993, lng: 74.124, emoji: "🏖️" },
  { name: "Agra (Taj Mahal)", nameTe: "ఆగ్రా (తాజ్ మహల్)", lat: 27.1751, lng: 78.0421, emoji: "🕌" },
  { name: "Delhi", nameTe: "ఢిల్లీ", lat: 28.6139, lng: 77.209, emoji: "🏛️" },
  { name: "Shimla", nameTe: "సిమ్లా", lat: 31.1048, lng: 77.1734, emoji: "❄️" },
  { name: "Alleppey (Kerala)", nameTe: "ఆలప్పుళ (కేరళ)", lat: 9.4981, lng: 76.3388, emoji: "🌴" },
  { name: "Tirupati", nameTe: "తిరుపతి", lat: 13.6288, lng: 79.4192, emoji: "🛕" },
  { name: "Bengaluru", nameTe: "బెంగళూరు", lat: 12.9716, lng: 77.5946, emoji: "🏙️" },
  { name: "Mumbai", nameTe: "ముంబై", lat: 19.076, lng: 72.8777, emoji: "🌆" },
  { name: "Kolkata", nameTe: "కోల్‌కతా", lat: 22.5726, lng: 88.3639, emoji: "🌉" },
];

const EMOJI_OPTIONS = [
  "💕", "💒", "🏠", "🏡", "🏖️", "🕌", "❄️", "🚤",
  "🏔️", "🌴", "🛕", "🚗", "✈️", "🍽️", "🎉", "👑", "❤️", "📍"
];

const ASPECT_RATIOS: { value: InstagramAspectRatio; label: string; ratio: string }[] = [
  { value: "landscape", label: "Landscape", ratio: "3:2" },
  { value: "portrait", label: "Portrait", ratio: "4:5" },
  { value: "square", label: "Square", ratio: "1:1" },
];

function emptyPost(): Partial<AdminInstagramPost> {
  return {
    id: "",
    year: new Date().getFullYear(),
    dateStr: "",
    title: "",
    titleTe: "",
    location: "",
    locationTe: "",
    aspectRatio: "landscape",
    category: "milestone",
    caption: "",
    captionTe: "",
    hashtags: [],
    images: [],
  };
}

function emptyLocation(): Partial<AdminMapLocation> {
  return {
    id: "",
    name: "",
    nameTe: "",
    lat: 17.385,
    lng: 78.4867,
    year: new Date().getFullYear(),
    story: "",
    storyTe: "",
    image: "",
    category: "holiday",
    icon: "🏖️",
  };
}

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Dashboard state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("comments");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data
  const [comments, setComments] = useState<BackendComment[]>([]);
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [triviaScores, setTriviaScores] = useState<TriviaLeaderboardEntry[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<AdminInstagramPost[]>([]);
  const [locations, setLocations] = useState<AdminMapLocation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Instagram modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<AdminInstagramPost> | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);
  const [draggedPostIndex, setDraggedPostIndex] = useState<number | null>(null);
  const [dragOverPostIndex, setDragOverPostIndex] = useState<number | null>(null);
  const [isReorderingPosts, setIsReorderingPosts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memory Map modal & state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Partial<AdminMapLocation>>(emptyLocation());
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isUploadingLocationImage, setIsUploadingLocationImage] = useState(false);
  const [locationCategoryFilter, setLocationCategoryFilter] = useState<string>("all");
  const [isReorderingLocations, setIsReorderingLocations] = useState(false);
  const locationFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshAllData = useCallback(async (token: string = adminToken) => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [statsRes, commentsRes, wishesRes, triviaRes, postsRes, locationsRes] = await Promise.all([
        adminGetStats(token),
        adminGetComments(token, 200),
        adminGetWishes(token, 200),
        adminGetTrivia(token, 200),
        adminGetPosts(token),
        adminGetLocations(token),
      ]);

      if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
      if (commentsRes.success) setComments(commentsRes.comments);
      if (wishesRes.success) setWishes(wishesRes.wishes);
      if (triviaRes.success) setTriviaScores(triviaRes.scores);
      if (postsRes.success) setInstagramPosts(postsRes.posts);
      if (locationsRes.success) setLocations(locationsRes.locations);
    } catch (err) {
      console.warn("Error refreshing admin data:", err);
    }
    setIsLoadingData(false);
  }, [adminToken]);

  // Auto-login from saved token
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const savedToken = localStorage.getItem("saa_admin_token");
        if (savedToken) {
          setIsVerifying(true);
          const res = await verifyAdminToken(savedToken);
          if (res.success) {
            setAdminToken(savedToken);
            setIsAuthenticated(true);
            await refreshAllData(savedToken);
          } else {
            localStorage.removeItem("saa_admin_token");
          }
          setIsVerifying(false);
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshAllData]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsVerifying(true);
    setAuthError("");

    const res = await adminLogin(username.trim(), password.trim());
    if (res.success && res.token) {
      setIsAuthenticated(true);
      setAdminToken(res.token);
      try {
        localStorage.setItem("saa_admin_token", res.token);
      } catch {}
      await refreshAllData(res.token);
    } else {
      setIsAuthenticated(false);
      setAuthError(res.error || "Invalid username or password. Please try again.");
    }
    setIsVerifying(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminToken("");
    setPassword("");
    try {
      localStorage.removeItem("saa_admin_token");
    } catch {}
  };

  // Delete Actions
  const handleDeleteComment = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete Comment #${id}?`)) return;

    const res = await adminDeleteComment(id, adminToken);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      showToast(`Comment #${id} deleted`);
      refreshAllData();
    } else {
      alert(res.error || "Failed to delete comment");
    }
  };

  const handleDeleteWish = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete Wish #${id}?`)) return;

    const res = await adminDeleteWish(id, adminToken);
    if (res.success) {
      setWishes((prev) => prev.filter((w) => w.id !== id));
      showToast(`Wish #${id} deleted`);
      refreshAllData();
    } else {
      alert(res.error || "Failed to delete wish");
    }
  };

  const handleDeleteTrivia = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete Trivia Score #${id}?`)) return;

    const res = await adminDeleteTrivia(id, adminToken);
    if (res.success) {
      setTriviaScores((prev) => prev.filter((t) => t.id !== id));
      showToast(`Trivia score #${id} deleted`);
      refreshAllData();
    } else {
      alert(res.error || "Failed to delete trivia score");
    }
  };

  // ═══════════════════════════════════════
  // INSTAGRAM POST CRUD
  // ═══════════════════════════════════════

  const openCreateModal = () => {
    setEditingPost(emptyPost());
    setHashtagInput("");
    setIsPostModalOpen(true);
  };

  const openEditModal = (post: AdminInstagramPost) => {
    setEditingPost({ ...post });
    setHashtagInput("");
    setIsPostModalOpen(true);
  };

  const closeModal = () => {
    setIsPostModalOpen(false);
    setEditingPost(null);
    setHashtagInput("");
  };

  const handleSavePost = async () => {
    if (!editingPost) return;
    if (!editingPost.id?.trim() || !editingPost.title?.trim() || !editingPost.caption?.trim()) {
      alert("Please fill in the required fields: ID, Title, and Caption");
      return;
    }

    setIsSavingPost(true);
    const isEditing = instagramPosts.some((p) => p.id === editingPost.id);

    let res;
    if (isEditing) {
      res = await adminUpdatePost(editingPost.id!, editingPost, adminToken);
    } else {
      res = await adminCreatePost(editingPost, adminToken);
    }

    if (res.success) {
      showToast(isEditing ? `Post "${editingPost.title}" updated` : `Post "${editingPost.title}" created`);
      closeModal();
      refreshAllData();
    } else {
      alert(res.error || "Failed to save post");
    }
    setIsSavingPost(false);
  };

  const handleDeletePost = async (postId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete the post "${title}"?`)) return;

    const res = await adminDeletePost(postId, adminToken);
    if (res.success) {
      setInstagramPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast(`Post "${title}" deleted`);
      refreshAllData();
    } else {
      alert(res.error || "Failed to delete post");
    }
  };

  const movePost = async (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= instagramPosts.length) return;
    await reorderPostToIndex(fromIndex, toIndex);
  };

  const reorderPostToIndex = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= instagramPosts.length) return;
    const reordered = [...instagramPosts];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setInstagramPosts(reordered);

    // Persist to backend immediately
    setIsReorderingPosts(true);
    const orderIds = reordered.map((p) => p.id);
    const res = await adminReorderPosts(orderIds, adminToken);
    if (res.success) {
      showToast(`Moved "${moved.title}" to position #${toIndex + 1}`);
    } else {
      showToast(res.error || "Failed to save post order");
    }
    setIsReorderingPosts(false);
  };

  const resetPostsToChronological = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all posts to chronological order (sorted by year: 1999 → 2024)?"
      )
    )
      return;

    const sorted = [...instagramPosts].sort((a, b) => a.year - b.year);
    setInstagramPosts(sorted);

    setIsReorderingPosts(true);
    const orderIds = sorted.map((p) => p.id);
    const res = await adminReorderPosts(orderIds, adminToken);
    if (res.success) {
      showToast("Reset all posts to chronological order (1999 → 2024)!");
    } else {
      showToast(res.error || "Failed to reset order");
    }
    setIsReorderingPosts(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingPost) return;

    setIsUploadingImage(true);
    const newImages = [...(editingPost.images || [])];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res = await adminUploadImage(file, adminToken);
      if (res.success && res.url) {
        newImages.push({
          src: res.url,
          alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          caption: "",
          tag: "",
        });
      } else {
        alert(`Failed to upload ${file.name}: ${res.error}`);
      }
    }

    setEditingPost({ ...editingPost, images: newImages });
    setIsUploadingImage(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    if (!editingPost) return;
    const updated = [...(editingPost.images || [])];
    updated.splice(index, 1);
    setEditingPost({ ...editingPost, images: updated });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    if (!editingPost || !editingPost.images) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editingPost.images.length) return;
    const updated = [...editingPost.images];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setEditingPost({ ...editingPost, images: updated });
  };

  const moveImageToIndex = (fromIndex: number, toIndex: number) => {
    if (!editingPost || !editingPost.images) return;
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= editingPost.images.length) return;
    const updated = [...editingPost.images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setEditingPost({ ...editingPost, images: updated });
  };

  const setCoverImage = (index: number) => {
    if (!editingPost || !editingPost.images || index === 0) return;
    moveImageToIndex(index, 0);
  };

  const updateImageField = (index: number, field: keyof InstagramMedia, value: string) => {
    if (!editingPost) return;
    const updated = [...(editingPost.images || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditingPost({ ...editingPost, images: updated });
  };

  const addHashtag = () => {
    if (!editingPost || !hashtagInput.trim()) return;
    let tag = hashtagInput.trim();
    if (!tag.startsWith("#")) tag = "#" + tag;
    const updated = [...(editingPost.hashtags || []), tag];
    setEditingPost({ ...editingPost, hashtags: updated });
    setHashtagInput("");
  };

  const removeHashtag = (index: number) => {
    if (!editingPost) return;
    const updated = [...(editingPost.hashtags || [])];
    updated.splice(index, 1);
    setEditingPost({ ...editingPost, hashtags: updated });
  };

  // Filtered lists based on search
  const [selectedPostFilter, setSelectedPostFilter] = useState<string>("all");

  const filteredComments = comments.filter(
    (c) =>
      c.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.post_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group comments post-wise
  const postGroups = useMemo(() => {
    const postsToDisplay =
      selectedPostFilter === "all"
        ? instagramPosts
        : instagramPosts.filter((p) => p.id === selectedPostFilter);

    return postsToDisplay.map((post) => {
      const postComments = filteredComments.filter((c) => c.post_id === post.id);
      return {
        post,
        comments: postComments,
      };
    });
  }, [selectedPostFilter, filteredComments, instagramPosts]);

  const filteredWishes = wishes.filter(
    (w) =>
      w.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.relation && w.relation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTrivia = triviaScores.filter((t) =>
    t.player_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstagramPosts = instagramPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.year).includes(searchQuery)
  );

  // ─── Memory Map Handlers ───────────────────────
  const openCreateLocationModal = () => {
    setEditingLocation(emptyLocation());
    setIsLocationModalOpen(true);
  };

  const openEditLocationModal = (loc: AdminMapLocation) => {
    setEditingLocation({ ...loc });
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
    setEditingLocation(emptyLocation());
  };

  const handleSelectCityPreset = (preset: typeof CITY_PRESETS[0]) => {
    setEditingLocation((prev) => ({
      ...prev,
      lat: preset.lat,
      lng: preset.lng,
      name: prev?.name?.trim() ? prev.name : preset.name,
      nameTe: prev?.nameTe?.trim() ? prev.nameTe : preset.nameTe,
    }));
    showToast(`Set coordinates to ${preset.name}!`);
  };

  const handleUploadLocationImage = async (file: File) => {
    if (!adminToken) return;
    setIsUploadingLocationImage(true);
    try {
      const res = await adminUploadImage(file, adminToken);
      if (res.success && res.url) {
        setEditingLocation((prev) => ({ ...prev, image: res.url }));
        showToast("Location photo uploaded successfully!");
      } else {
        alert(res.error || "Failed to upload image");
      }
    } catch {
      alert("Error uploading image");
    } finally {
      setIsUploadingLocationImage(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!adminToken || !editingLocation) return;
    const name = editingLocation.name?.trim();
    const lat = Number(editingLocation.lat);
    const lng = Number(editingLocation.lng);
    const year = Number(editingLocation.year);

    if (!name || isNaN(lat) || isNaN(lng) || !year) {
      alert("Place Name, Latitude, Longitude, and Year are required.");
      return;
    }

    setIsSavingLocation(true);
    try {
      const isEdit = Boolean(editingLocation.id && locations.some((l) => l.id === editingLocation.id));
      if (isEdit && editingLocation.id) {
        const res = await adminUpdateLocation(editingLocation.id, editingLocation, adminToken);
        if (res.success) {
          showToast(`Updated "${name}" pin!`);
          closeLocationModal();
          refreshAllData(adminToken);
        } else {
          alert(res.error || "Failed to update location");
        }
      } else {
        const newLoc = {
          ...editingLocation,
          id: editingLocation.id?.trim() || `loc-${Date.now()}`,
          orderIndex: locations.length,
        };
        const res = await adminCreateLocation(newLoc, adminToken);
        if (res.success) {
          showToast(`Added "${name}" pin to Memory Map!`);
          closeLocationModal();
          refreshAllData(adminToken);
        } else {
          alert(res.error || "Failed to create location");
        }
      }
    } catch {
      alert("Error saving location pin");
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the Memory Map?`)) return;
    try {
      const res = await adminDeleteLocation(id, adminToken);
      if (res.success) {
        showToast(`Deleted "${name}"`);
        refreshAllData(adminToken);
      } else {
        alert(res.error || "Failed to delete location");
      }
    } catch {
      alert("Error deleting location");
    }
  };

  const handleMoveLocation = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= locations.length || isReorderingLocations) return;

    setIsReorderingLocations(true);
    const updated = [...locations];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setLocations(updated);

    try {
      const orderIds = updated.map((l) => l.id);
      const res = await adminReorderLocations(orderIds, adminToken);
      if (res.success) {
        showToast("Memory Map journey reordered!");
      } else {
        refreshAllData(adminToken);
        alert(res.error || "Failed to reorder locations");
      }
    } catch {
      refreshAllData(adminToken);
    } finally {
      setIsReorderingLocations(false);
    }
  };

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch =
        searchQuery === "" ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.nameTe && loc.nameTe.toLowerCase().includes(searchQuery.toLowerCase())) ||
        loc.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(loc.year).includes(searchQuery);

      const matchesCat =
        locationCategoryFilter === "all" || loc.category === locationCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [locations, searchQuery, locationCategoryFilter]);

  // ──────────────────────────────────────────────
  // 1. LOGIN SCREEN (Username & Password)
  // ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-peach-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border-2 border-gold/40 bg-warm-white p-8 sm:p-10 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-peach-100 text-burgundy shadow-sm mb-4">
            <ShieldCheck className="h-8 w-8 text-burgundy" />
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
            Admin Moderation Portal
          </h2>
          <p className="mt-1 text-xs text-soft-brown">
            25 Years of Us — Sign in with your admin credentials
          </p>

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            {/* Username Input */}
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-soft-brown mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Enter admin username..."
                  required
                  autoComplete="username"
                  className="w-full rounded-2xl border-2 border-warm-beige bg-champagne/30 pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soft-brown/50 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-soft-brown mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Enter admin password..."
                  required
                  autoComplete="current-password"
                  className="w-full rounded-2xl border-2 border-warm-beige bg-champagne/30 pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soft-brown/50 pointer-events-none" />
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 text-left bg-red-50 p-2.5 rounded-xl border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !username.trim() || !password.trim()}
              className="w-full rounded-2xl bg-burgundy py-3 text-sm font-semibold text-warm-white shadow-md hover:bg-deep-burgundy transition-all disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? "Verifying..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-warm-beige/40">
            <a
              href={FRONTEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-soft-brown hover:text-burgundy transition-colors"
            >
              <span>Go to Anniversary Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 2. AUTHENTICATED DASHBOARD (Clean Admin UI)
  // ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-peach-50/50 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-charcoal text-white px-4 py-2.5 text-xs font-semibold shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Admin Header */}
      <header className="sticky top-0 z-40 bg-warm-white/95 backdrop-blur-md border-b border-warm-beige px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-charcoal leading-none">
              Admin Moderation Portal
            </h1>
            <span className="text-[10px] text-soft-brown font-medium">
              Adhi &amp; Satya — 25 Years of Us
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={FRONTEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-warm-beige bg-warm-white px-3.5 py-1.5 text-xs font-medium text-charcoal hover:bg-champagne/40 transition-all"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3 w-3 text-soft-brown" />
          </a>

          <button
            type="button"
            onClick={() => refreshAllData()}
            className="flex items-center gap-1.5 rounded-full border border-warm-beige bg-warm-white px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-champagne/40 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingData ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-100 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-warm-beige bg-warm-white p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Comments</span>
              <MessageCircle className="h-4 w-4 text-gold" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_comments ?? comments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-beige bg-warm-white p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Likes</span>
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_likes ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-beige bg-warm-white p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Wishes</span>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_wishes ?? wishes.length}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-beige bg-warm-white p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Trivia</span>
              <Trophy className="h-4 w-4 text-gold" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_trivia_players ?? triviaScores.length}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-beige bg-warm-white p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">IG Posts</span>
              <Camera className="h-4 w-4 text-purple-500" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_posts ?? instagramPosts.length}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-beige bg-warm-white p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Map Pins</span>
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_locations ?? locations.length}
            </p>
          </div>
        </div>

        {/* Tab Controls & Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-warm-beige/70 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {([
              { id: "comments" as TabId, label: `Comments (${comments.length})` },
              { id: "wishes" as TabId, label: `Wishes (${wishes.length})` },
              { id: "trivia" as TabId, label: `Trivia (${triviaScores.length})` },
              { id: "instagram" as TabId, label: `📸 IG Posts (${instagramPosts.length})` },
              { id: "locations" as TabId, label: `🗺️ Memory Map (${locations.length})` },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-burgundy text-warm-white shadow-xs"
                    : "bg-warm-white text-soft-brown hover:bg-champagne/60 border border-warm-beige"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-soft-brown/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by author or keyword..."
              className="w-full sm:w-64 rounded-xl border border-warm-beige bg-warm-white pl-9 pr-3 py-1.5 text-xs text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
            />
          </div>
        </div>

        {/* TAB 1: COMMENTS MODERATION (Grouped Post-Wise) */}
        {activeTab === "comments" && (
          <div className="mt-6 space-y-6">
            {/* Filter by Post Dropdown */}
            <div className="flex items-center justify-between bg-warm-white p-3.5 rounded-2xl border border-warm-beige shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-soft-brown">
                <Filter className="h-4 w-4 text-burgundy" />
                <span>Filter by Post:</span>
              </div>
              <select
                value={selectedPostFilter}
                onChange={(e) => setSelectedPostFilter(e.target.value)}
                className="rounded-xl border border-warm-beige bg-champagne/30 px-3 py-1.5 text-xs font-medium text-charcoal focus:border-burgundy focus:outline-hidden"
              >
                <option value="all">All Posts ({instagramPosts.length} posts)</option>
                {instagramPosts.map((post) => {
                  const count = comments.filter((c) => c.post_id === post.id).length;
                  return (
                    <option key={post.id} value={post.id}>
                      {post.year} • {post.title} ({count} {count === 1 ? "comment" : "comments"})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Post Groups Display */}
            {postGroups.every((g) => g.comments.length === 0) ? (
              <div className="rounded-2xl border border-warm-beige bg-warm-white p-12 text-center text-soft-brown">
                <MessageCircle className="mx-auto h-8 w-8 text-gold mb-2 opacity-50" />
                <p className="font-heading text-lg font-semibold">No comments found</p>
                <p className="text-xs mt-1">
                  {searchQuery ? "Try clearing your search query" : "No user has left a comment on these posts yet."}
                </p>
              </div>
            ) : (
              postGroups.map((group) => {
                if (group.comments.length === 0) return null;

                return (
                  <div
                    key={group.post.id}
                    className="rounded-2xl border border-warm-beige bg-warm-white shadow-xs overflow-hidden"
                  >
                    {/* Post Header Banner */}
                    <div className="bg-champagne/60 px-5 py-3 border-b border-warm-beige flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-burgundy/10 text-burgundy px-2 py-0.5 text-xs font-bold font-sans">
                          {group.post.year}
                        </span>
                        <h3 className="font-heading text-base font-bold text-charcoal">
                          {group.post.title}
                        </h3>
                      </div>
                      <span className="text-xs font-medium text-soft-brown/80 bg-warm-white px-2.5 py-0.5 rounded-full border border-warm-beige">
                        {group.comments.length} {group.comments.length === 1 ? "comment" : "comments"}
                      </span>
                    </div>

                    {/* Post Comments Table */}
                    <div className="divide-y divide-warm-beige/40">
                      {group.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-4 flex items-start justify-between gap-4 hover:bg-peach-50/40 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-sans text-xs font-bold text-charcoal">
                                @{comment.author_name}
                              </span>
                              <span className="text-[10px] text-soft-brown/60">
                                {comment.created_at}
                              </span>
                              <span className="text-[10px] bg-champagne text-soft-brown px-1.5 py-0.2 rounded-sm border border-warm-beige/60">
                                ID #{comment.id}
                              </span>
                            </div>
                            <p className="mt-1 text-xs sm:text-sm text-charcoal/90 leading-relaxed">
                              {comment.text}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center gap-1 rounded-xl bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
                            title="Delete comment permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: GUEST WISHES */}
        {activeTab === "wishes" && (
          <div className="mt-6 space-y-3">
            {filteredWishes.length === 0 ? (
              <div className="rounded-2xl border border-warm-beige bg-warm-white p-12 text-center text-soft-brown">
                <Sparkles className="mx-auto h-8 w-8 text-gold mb-2 opacity-50" />
                <p className="font-heading text-lg font-semibold">No guest wishes yet</p>
                <p className="text-xs mt-1">Wishes submitted via the Guest Wishes Wall will appear here.</p>
              </div>
            ) : (
              filteredWishes.map((wish) => (
                <div
                  key={wish.id}
                  className="rounded-2xl border border-warm-beige bg-warm-white p-4 shadow-xs flex items-start justify-between gap-4 hover:border-gold/50 transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 text-left">
                    <span className="text-2xl p-2 rounded-xl bg-champagne/60 shrink-0">
                      {wish.emoji || "💐"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base font-bold text-charcoal">
                          {wish.author_name}
                        </span>
                        {wish.relation && (
                          <span className="text-[10px] font-semibold text-burgundy bg-peach-100 px-2 py-0.5 rounded-full">
                            {wish.relation}
                          </span>
                        )}
                        <span className="text-[10px] text-soft-brown/60">
                          {wish.created_at}
                        </span>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-charcoal/90 leading-relaxed italic font-heading">
                        &ldquo;{wish.message}&rdquo;
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWish(wish.id)}
                    className="flex items-center gap-1 rounded-xl bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
                    title="Delete wish permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: TRIVIA LEADERBOARD */}
        {activeTab === "trivia" && (
          <div className="mt-6">
            {filteredTrivia.length === 0 ? (
              <div className="rounded-2xl border border-warm-beige bg-warm-white p-12 text-center text-soft-brown">
                <Trophy className="mx-auto h-8 w-8 text-gold mb-2 opacity-50" />
                <p className="font-heading text-lg font-semibold">No trivia scores yet</p>
                <p className="text-xs mt-1">Scores recorded by family members will appear here.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-warm-beige bg-warm-white shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-champagne/60 border-b border-warm-beige text-soft-brown font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Accuracy</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-beige/40">
                    {filteredTrivia.map((entry, index) => (
                      <tr key={entry.id} className="hover:bg-peach-50/40">
                        <td className="py-3 px-4 font-bold text-burgundy">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                        </td>
                        <td className="py-3 px-4 font-bold text-charcoal">
                          {entry.player_name}
                        </td>
                        <td className="py-3 px-4 font-semibold text-charcoal">
                          {entry.score} / {entry.total}
                        </td>
                        <td className="py-3 px-4">
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                            {entry.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-soft-brown/70">
                          {entry.created_at}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteTrivia(entry.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 p-1 cursor-pointer"
                            title="Delete score"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INSTAGRAM POSTS MANAGEMENT */}
        {activeTab === "instagram" && (
          <div className="mt-6 space-y-6">
            {/* Create New Post Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-warm-white p-4 rounded-2xl border border-warm-beige shadow-xs">
              <div>
                <h2 className="font-heading text-lg font-bold text-charcoal flex items-center gap-2">
                  <Camera className="h-5 w-5 text-burgundy" />
                  Memory Posts ({instagramPosts.length})
                </h2>
                <p className="text-xs text-soft-brown/70 mt-0.5">
                  💡 Drag cards or use <span className="font-semibold text-burgundy">↑</span> / <span className="font-semibold text-burgundy">↓</span> buttons to rearrange timeline posts. Changes save immediately to the website!
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={resetPostsToChronological}
                  disabled={isReorderingPosts}
                  className="flex items-center gap-1.5 rounded-xl border border-warm-beige bg-champagne/40 text-charcoal hover:bg-champagne px-3 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  title="Reset all posts to chronological order (sorted by year: 1999 → 2024)"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-soft-brown" />
                  Reset to Year Order
                </button>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="flex items-center gap-2 rounded-xl bg-burgundy text-warm-white px-4 py-2 text-xs font-semibold hover:bg-deep-burgundy shadow-md transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  New Memory Post
                </button>
              </div>
            </div>

            {/* Posts Grid */}
            {filteredInstagramPosts.length === 0 ? (
              <div className="rounded-2xl border border-warm-beige bg-warm-white p-12 text-center text-soft-brown">
                <Camera className="mx-auto h-8 w-8 text-gold mb-2 opacity-50" />
                <p className="font-heading text-lg font-semibold">No posts found</p>
                <p className="text-xs mt-1">Create your first memory post to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInstagramPosts.map((post) => {
                  const realIndex = instagramPosts.findIndex((p) => p.id === post.id);
                  const isFirst = realIndex === 0;
                  const isLast = realIndex === instagramPosts.length - 1;
                  const isDragOver = dragOverPostIndex === realIndex;
                  const isDragging = draggedPostIndex === realIndex;

                  return (
                    <div
                      key={post.id}
                      draggable={!searchQuery}
                      onDragStart={(e) => {
                        setDraggedPostIndex(realIndex);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        if (!searchQuery) {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          if (dragOverPostIndex !== realIndex) {
                            setDragOverPostIndex(realIndex);
                          }
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverPostIndex === realIndex) {
                          setDragOverPostIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedPostIndex !== null && draggedPostIndex !== realIndex) {
                          reorderPostToIndex(draggedPostIndex, realIndex);
                        }
                        setDraggedPostIndex(null);
                        setDragOverPostIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedPostIndex(null);
                        setDragOverPostIndex(null);
                      }}
                      className={`rounded-2xl border transition-all overflow-hidden group bg-warm-white ${
                        isDragOver
                          ? "border-burgundy ring-2 ring-burgundy/40 shadow-xl scale-[1.02]"
                          : isDragging
                          ? "opacity-50 border-dashed border-soft-brown"
                          : "border-warm-beige shadow-xs hover:border-gold/50 hover:shadow-md"
                      }`}
                    >
                      {/* Top Reorder Control Banner */}
                      <div className="bg-gradient-to-r from-champagne/80 to-peach-50 px-3.5 py-2 border-b border-warm-beige flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="cursor-grab active:cursor-grabbing text-soft-brown/40 hover:text-burgundy p-0.5"
                            title="Drag to rearrange post order"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-burgundy bg-warm-white border border-warm-beige px-2 py-0.5 rounded-md shadow-2xs font-mono">
                            #{realIndex + 1}
                          </span>
                          <span className="text-[10px] text-soft-brown/70 font-medium">
                            {isFirst ? "⭐ First on Timeline" : `Position ${realIndex + 1}`}
                          </span>
                        </div>

                        {/* Move Up / Down Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => movePost(realIndex, "up")}
                            disabled={isFirst || isReorderingPosts}
                            title="Move earlier on timeline"
                            className="p-1 rounded-md text-soft-brown hover:text-burgundy hover:bg-warm-beige/50 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors border border-warm-beige/60"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePost(realIndex, "down")}
                            disabled={isLast || isReorderingPosts}
                            title="Move later on timeline"
                            className="p-1 rounded-md text-soft-brown hover:text-burgundy hover:bg-warm-beige/50 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors border border-warm-beige/60"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Post Image Preview */}
                      <div className="relative h-40 bg-champagne/40 overflow-hidden">
                        {post.images && post.images.length > 0 && post.images[0].src ? (
                          <div className="relative w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveMediaUrl(post.images[0].src)}
                              alt={post.images[0].alt || post.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If image fails locally, try frontend URL fallback
                                const target = e.currentTarget as HTMLImageElement;
                                if (!target.src.startsWith("http") && FRONTEND_URL) {
                                  target.src = `${FRONTEND_URL}${post.images[0].src}`;
                                } else {
                                  target.style.display = "none";
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50">
                            <ImageIcon className="h-10 w-10 text-soft-brown/30" />
                          </div>
                        )}
                        {/* Year Badge */}
                        <div className="absolute top-2 left-2 rounded-lg bg-burgundy text-white px-2 py-0.5 text-xs font-bold shadow">
                          {post.year}
                        </div>
                        {/* Category Badge */}
                        <div className="absolute top-2 right-2 rounded-lg bg-warm-white/90 text-charcoal px-2 py-0.5 text-[10px] font-semibold shadow border border-warm-beige">
                          {CATEGORIES.find((c) => c.value === post.category)?.emoji}{" "}
                          {post.category}
                        </div>
                        {/* Aspect Ratio Badge */}
                        <div className="absolute bottom-2 left-2 rounded-md bg-charcoal/70 text-white px-1.5 py-0.5 text-[10px] font-medium">
                          {post.aspectRatio}
                        </div>
                      </div>

                      {/* Post Details */}
                      <div className="p-4">
                        <h3 className="font-heading text-sm font-bold text-charcoal line-clamp-1">
                          {post.title}
                          {post.titleTe && (
                            <span className="ml-1.5 text-xs font-normal text-burgundy font-serif">
                              ({post.titleTe})
                            </span>
                          )}
                        </h3>
                        {post.location && (
                          <p className="mt-0.5 text-[10px] text-soft-brown/70 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {post.location}
                            {post.locationTe && <span>• {post.locationTe}</span>}
                          </p>
                        )}
                        <p className="mt-1.5 text-[11px] text-charcoal/70 line-clamp-2 leading-relaxed">
                          {post.caption}
                        </p>
                        {post.captionTe && (
                          <p className="mt-1 text-[11px] text-burgundy/90 line-clamp-1 italic">
                            🇮🇳 {post.captionTe}
                          </p>
                        )}

                        {/* Hashtags */}
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {post.hashtags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="text-[9px] text-blue-600/70 font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.hashtags.length > 3 && (
                              <span className="text-[9px] text-soft-brown/50">
                                +{post.hashtags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-3 pt-3 border-t border-warm-beige/50 flex items-center justify-between">
                          <span className="text-[10px] text-soft-brown/50 font-medium">
                            ID: {post.id}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(post)}
                              className="flex items-center gap-1 rounded-lg bg-champagne/60 text-charcoal border border-warm-beige px-2.5 py-1 text-[10px] font-semibold hover:bg-champagne transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="flex items-center gap-1 rounded-lg bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 text-[10px] font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MEMORY MAP LOCATIONS MANAGEMENT */}
        {activeTab === "locations" && (
          <div className="mt-6 space-y-6">
            {/* Header / Add Button Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-warm-white p-4 sm:p-5 rounded-2xl border border-warm-beige shadow-xs">
              <div>
                <h2 className="font-heading text-lg font-bold text-charcoal flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <span>Memory Map Destinations ({locations.length})</span>
                </h2>
                <p className="text-xs text-soft-brown mt-0.5">
                  Manage all travel destinations, family homes, and milestone pins plotted across the 3D map.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateLocationModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-burgundy px-4 py-2.5 text-xs sm:text-sm font-semibold text-warm-white shadow-md hover:bg-deep-burgundy transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add Destination Pin</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setLocationCategoryFilter("all")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  locationCategoryFilter === "all"
                    ? "bg-burgundy text-white shadow-2xs"
                    : "bg-warm-white text-soft-brown border border-warm-beige hover:bg-champagne/40"
                }`}
              >
                All Categories ({locations.length})
              </button>
              {LOCATION_CATEGORIES.map((cat) => {
                const count = locations.filter((l) => l.category === cat.value).length;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setLocationCategoryFilter(cat.value)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                      locationCategoryFilter === cat.value
                        ? "bg-burgundy text-white shadow-2xs"
                        : "bg-warm-white text-soft-brown border border-warm-beige hover:bg-champagne/40"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label} ({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Locations Cards List */}
            {filteredLocations.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-warm-beige bg-warm-white/60 p-12 text-center">
                <MapPin className="mx-auto h-12 w-12 text-soft-brown/40 mb-3" />
                <h3 className="font-heading text-base font-bold text-charcoal">No Map Pins Found</h3>
                <p className="text-xs text-soft-brown mt-1 max-w-sm mx-auto">
                  {searchQuery || locationCategoryFilter !== "all"
                    ? "No pins match your current filter. Try resetting your search or category."
                    : "No travel milestones have been added yet. Click 'Add Destination Pin' above to add your first memory!"}
                </p>
                <button
                  type="button"
                  onClick={openCreateLocationModal}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-burgundy px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-deep-burgundy cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Destination Pin
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLocations.map((loc) => {
                  const realIndex = locations.findIndex((l) => l.id === loc.id);
                  const isFirst = realIndex === 0;
                  const isLast = realIndex === locations.length - 1;
                  const catMeta = LOCATION_CATEGORIES.find((c) => c.value === loc.category);

                  return (
                    <div
                      key={loc.id}
                      className="rounded-2xl border border-warm-beige bg-warm-white shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      {/* Top Header Bar with Sequence & Move Buttons */}
                      <div className="bg-gradient-to-r from-champagne/70 to-peach-50 px-3.5 py-2 border-b border-warm-beige flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{loc.icon || "📍"}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-burgundy bg-warm-white border border-warm-beige px-2 py-0.5 rounded-md shadow-2xs font-mono">
                            #{realIndex + 1}
                          </span>
                          <span className="text-[10px] text-soft-brown/80 font-medium">
                            {isFirst ? "⭐ First Stop on Journey" : `Stop ${realIndex + 1}`}
                          </span>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveLocation(realIndex, "up")}
                            disabled={isFirst || isReorderingLocations}
                            title="Move earlier on map"
                            className="p-1 rounded-md text-soft-brown hover:text-burgundy hover:bg-warm-beige/50 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors border border-warm-beige/60"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLocation(realIndex, "down")}
                            disabled={isLast || isReorderingLocations}
                            title="Move later on map"
                            className="p-1 rounded-md text-soft-brown hover:text-burgundy hover:bg-warm-beige/50 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors border border-warm-beige/60"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content with Image & Details */}
                      <div className="p-4 flex-1">
                        <div className="flex items-start gap-3.5">
                          {/* Image Thumbnail */}
                          <div className="w-24 h-24 rounded-xl border border-warm-beige/70 overflow-hidden bg-champagne/30 shrink-0 relative">
                            {loc.image ? (
                              <img
                                src={resolveMediaUrl(loc.image)}
                                alt={loc.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/Golden South Indian Mandap Setting.png";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-soft-brown/40">
                                <MapPin className="h-6 w-6 text-emerald-600/40" />
                                <span className="text-[9px] mt-1">No photo</span>
                              </div>
                            )}
                            <div className="absolute top-1 left-1 bg-burgundy/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-2xs">
                              {loc.year}
                            </div>
                          </div>

                          {/* Place Names & Category Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading text-sm font-bold text-charcoal truncate">
                              {loc.name}
                            </h3>
                            {loc.nameTe && (
                              <p className="text-xs font-serif text-burgundy font-medium truncate">
                                {loc.nameTe}
                              </p>
                            )}

                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-md bg-warm-white border border-warm-beige px-2 py-0.5 text-[10px] font-semibold text-soft-brown">
                                <span>{catMeta?.emoji || "📍"}</span>
                                <span>{catMeta?.label || loc.category}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-800">
                                {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                              </span>
                            </div>

                            <p className="mt-2 text-[11px] text-charcoal/75 line-clamp-2 leading-relaxed">
                              {loc.story}
                            </p>
                            {loc.storyTe && (
                              <p className="mt-1 text-[11px] text-burgundy/90 line-clamp-1 italic">
                                {loc.storyTe}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="bg-peach-50/50 px-4 py-2.5 border-t border-warm-beige/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-soft-brown/60 truncate max-w-[140px]">
                          id: {loc.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditLocationModal(loc)}
                            className="inline-flex items-center gap-1 rounded-lg bg-champagne/70 text-charcoal border border-warm-beige px-2.5 py-1 text-[10px] font-semibold hover:bg-champagne transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3 w-3" />
                            Edit Pin
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLocation(loc.id, loc.name)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 text-[10px] font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════
          CREATE / EDIT POST MODAL
          ═══════════════════════════════════════ */}
      {isPostModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-charcoal/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="w-full max-w-3xl bg-warm-white rounded-3xl border-2 border-warm-beige shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-warm-white rounded-t-3xl border-b border-warm-beige px-6 py-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-charcoal flex items-center gap-2">
                <Camera className="h-5 w-5 text-burgundy" />
                {instagramPosts.some((p) => p.id === editingPost.id) ? "Edit Memory Post" : "Create Memory Post"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-full hover:bg-champagne/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-soft-brown" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Row 1: ID & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Post ID *
                  </label>
                  <input
                    type="text"
                    value={editingPost.id || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, id: e.target.value })}
                    placeholder="e.g. post-2025"
                    disabled={instagramPosts.some((p) => p.id === editingPost.id)}
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Year *
                  </label>
                  <input
                    type="number"
                    value={editingPost.year || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, year: Number(e.target.value) })}
                    placeholder="2001"
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 2: Title (English & Telugu) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center justify-between">
                    <span>Title (English) *</span>
                    <span className="text-[10px] text-soft-brown/60">🇬🇧 English</span>
                  </label>
                  <input
                    type="text"
                    value={editingPost.title || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    placeholder="Our Wedding Day"
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center justify-between">
                    <span>Title (Telugu / శీర్షిక)</span>
                    <span className="text-[10px] text-burgundy font-medium">🇮🇳 తెలుగు</span>
                  </label>
                  <input
                    type="text"
                    value={editingPost.titleTe || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, titleTe: e.target.value })}
                    placeholder="ఉదాహరణ: మన వివాహ మహోత్సవం"
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 3: Display Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1">
                    Display Date
                  </label>
                  <input
                    type="text"
                    value={editingPost.dateStr || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, dateStr: e.target.value })}
                    placeholder="23 November 2001"
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Location (English)
                  </label>
                  <input
                    type="text"
                    value={editingPost.location || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, location: e.target.value })}
                    placeholder="Hyderabad, India"
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Location (Telugu)</span>
                    <span className="text-[10px] text-burgundy font-medium">🇮🇳 తెలుగు</span>
                  </label>
                  <input
                    type="text"
                    value={editingPost.locationTe || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, locationTe: e.target.value })}
                    placeholder="ఉదాహరణ: హైదరాబాద్"
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 4: Category & Aspect Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setEditingPost({ ...editingPost, category: cat.value })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          editingPost.category === cat.value
                            ? "bg-burgundy text-white shadow-sm"
                            : "bg-champagne/50 text-charcoal border border-warm-beige hover:bg-champagne"
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1">
                    Aspect Ratio
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.value}
                        type="button"
                        onClick={() => setEditingPost({ ...editingPost, aspectRatio: ar.value })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          editingPost.aspectRatio === ar.value
                            ? "bg-burgundy text-white shadow-sm"
                            : "bg-champagne/50 text-charcoal border border-warm-beige hover:bg-champagne"
                        }`}
                      >
                        {ar.label} ({ar.ratio})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dual Language Captions (English & Telugu) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* English Caption */}
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Caption (English) *
                    </span>
                    <span className="text-[10px] text-soft-brown/60">🇬🇧 English</span>
                  </label>
                  <textarea
                    value={editingPost.caption || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                    placeholder="Tell the story of this memory in English..."
                    rows={4}
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden resize-none"
                  />
                </div>

                {/* Telugu Caption */}
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-burgundy" /> Caption (Telugu / తెలుగు వివరణ)
                    </span>
                    <span className="text-[10px] text-burgundy font-medium">🇮🇳 తెలుగు</span>
                  </label>
                  <textarea
                    value={editingPost.captionTe || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, captionTe: e.target.value })}
                    placeholder="ఈ జ్ఞాపకం వెనుక ఉన్న మధురమైన కథను తెలుగులో రాయండి..."
                    rows={4}
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Hashtags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingPost.hashtags || []).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(i)}
                        className="hover:text-red-600 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHashtag(); } }}
                    placeholder="#YourHashtag"
                    className="flex-1 rounded-xl border border-warm-beige bg-champagne/20 px-3 py-1.5 text-xs text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={addHashtag}
                    className="px-3 py-1.5 rounded-xl bg-champagne text-charcoal border border-warm-beige text-xs font-semibold hover:bg-warm-beige cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Images Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <label className="text-xs font-semibold text-soft-brown flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-burgundy" /> Photos ({(editingPost.images || []).length})
                  </label>
                  <span className="text-[10px] text-soft-brown/70 font-medium">
                    ⭐ Photo #1 is the Cover Photo. Use <span className="font-bold text-burgundy">↑</span> <span className="font-bold text-burgundy">↓</span> or drag <GripVertical className="inline h-3 w-3" /> to rearrange.
                  </span>
                </div>

                {/* Image Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-warm-beige rounded-xl p-6 text-center hover:border-burgundy hover:bg-champagne/20 transition-all cursor-pointer mb-4"
                >
                  <Upload className="h-8 w-8 text-soft-brown/40 mx-auto mb-2" />
                  <p className="text-xs text-soft-brown/70 font-medium">
                    {isUploadingImage ? "Uploading..." : "Click to upload images (JPEG, PNG, WebP)"}
                  </p>
                  <p className="text-[10px] text-soft-brown/40 mt-1">Max 10 MB per file</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Image List */}
                {(editingPost.images || []).length > 0 && (
                  <div className="space-y-3">
                    {(editingPost.images || []).map((img, index) => {
                      const isCover = index === 0;
                      const isDragging = draggedImageIndex === index;
                      const isDragOver = dragOverImageIndex === index;
                      const totalImages = (editingPost.images || []).length;

                      return (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => {
                            setDraggedImageIndex(index);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            if (dragOverImageIndex !== index) {
                              setDragOverImageIndex(index);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverImageIndex === index) {
                              setDragOverImageIndex(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedImageIndex !== null && draggedImageIndex !== index) {
                              moveImageToIndex(draggedImageIndex, index);
                            }
                            setDraggedImageIndex(null);
                            setDragOverImageIndex(null);
                          }}
                          onDragEnd={() => {
                            setDraggedImageIndex(null);
                            setDragOverImageIndex(null);
                          }}
                          className={`rounded-xl border transition-all p-3 ${
                            isDragOver
                              ? "border-burgundy bg-burgundy/10 shadow-md ring-2 ring-burgundy/30"
                              : isDragging
                              ? "opacity-50 border-dashed border-soft-brown/50 bg-warm-white"
                              : isCover
                              ? "border-amber-300/80 bg-gradient-to-r from-amber-50/60 to-champagne/30 shadow-xs"
                              : "border-warm-beige bg-champagne/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Drag Handle & Thumbnail */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div
                                className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-soft-brown/40 hover:text-burgundy transition-colors"
                                title="Click & drag to reorder photos"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <div className="w-16 h-16 rounded-lg bg-warm-beige/50 flex items-center justify-center overflow-hidden border border-warm-beige relative">
                                {img.src ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={resolveMediaUrl(img.src)}
                                    alt={img.alt || "preview"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.currentTarget as HTMLImageElement;
                                      if (!target.src.startsWith("http") && FRONTEND_URL) {
                                        target.src = `${FRONTEND_URL}${img.src}`;
                                      } else {
                                        target.style.display = "none";
                                      }
                                    }}
                                  />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-soft-brown/30" />
                                )}
                                {isCover && (
                                  <span className="absolute bottom-0 inset-x-0 bg-amber-600/90 text-[8px] font-bold text-white text-center py-0.5">
                                    COVER
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Image Controls & Form Fields */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                {/* Left: Badge & Quick Set as Cover */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isCover ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                      ⭐ Cover Photo
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-bold text-soft-brown/70 bg-warm-beige/50 px-2 py-0.5 rounded-md">
                                        Photo {index + 1}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setCoverImage(index)}
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200 border border-amber-300/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                        title="Move this image to #1 so it becomes the cover photo"
                                      >
                                        <Star className="h-2.5 w-2.5 text-amber-600" />
                                        Set as Cover
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Right: Reorder Up/Down & Remove Buttons */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveImage(index, "up")}
                                    disabled={index === 0}
                                    title={index === 0 ? "Already first" : "Move photo up"}
                                    className="p-1 rounded-md text-soft-brown hover:text-burgundy hover:bg-warm-beige/40 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors border border-warm-beige/60"
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveImage(index, "down")}
                                    disabled={index === totalImages - 1}
                                    title={index === totalImages - 1 ? "Already last" : "Move photo down"}
                                    className="p-1 rounded-md text-soft-brown hover:text-burgundy hover:bg-warm-beige/40 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors border border-warm-beige/60"
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    title="Remove photo"
                                    className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors border border-red-200/60 ml-0.5"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={img.src}
                                onChange={(e) => updateImageField(index, "src", e.target.value)}
                                placeholder="Image URL or /path/to/image.png"
                                className="w-full rounded-lg border border-warm-beige bg-warm-white px-2 py-1 text-[11px] text-charcoal placeholder:text-soft-brown/30 focus:border-burgundy focus:outline-hidden"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={img.alt || ""}
                                  onChange={(e) => updateImageField(index, "alt", e.target.value)}
                                  placeholder="Alt text"
                                  className="rounded-lg border border-warm-beige bg-warm-white px-2 py-1 text-[11px] text-charcoal placeholder:text-soft-brown/30 focus:border-burgundy focus:outline-hidden"
                                />
                                <input
                                  type="text"
                                  value={img.tag || ""}
                                  onChange={(e) => updateImageField(index, "tag", e.target.value)}
                                  placeholder="Tag label"
                                  className="rounded-lg border border-warm-beige bg-warm-white px-2 py-1 text-[11px] text-charcoal placeholder:text-soft-brown/30 focus:border-burgundy focus:outline-hidden"
                                />
                              </div>
                              <input
                                type="text"
                                value={img.caption || ""}
                                onChange={(e) => updateImageField(index, "caption", e.target.value)}
                                placeholder="Image caption"
                                className="w-full rounded-lg border border-warm-beige bg-warm-white px-2 py-1 text-[11px] text-charcoal placeholder:text-soft-brown/30 focus:border-burgundy focus:outline-hidden"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Image by URL */}
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...(editingPost.images || []), { src: "", alt: "", caption: "", tag: "" }];
                    setEditingPost({ ...editingPost, images: updated });
                  }}
                  className="mt-3 flex items-center gap-1.5 text-xs text-burgundy font-semibold hover:text-deep-burgundy cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add image by URL
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-warm-white rounded-b-3xl border-t border-warm-beige px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 rounded-xl border border-warm-beige text-xs font-semibold text-soft-brown hover:bg-champagne/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePost}
                disabled={isSavingPost || !editingPost.id?.trim() || !editingPost.title?.trim()}
                className="px-5 py-2 rounded-xl bg-burgundy text-warm-white text-xs font-semibold hover:bg-deep-burgundy shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSavingPost ? "Saving..." : instagramPosts.some((p) => p.id === editingPost.id) ? "Update Post" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          CREATE / EDIT MEMORY MAP LOCATION MODAL
          ═══════════════════════════════════════ */}
      {isLocationModalOpen && editingLocation && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-charcoal/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="w-full max-w-2xl bg-warm-white rounded-3xl border-2 border-warm-beige shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-warm-white rounded-t-3xl border-b border-warm-beige px-6 py-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-charcoal flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <span>
                  {editingLocation.id && locations.some((l) => l.id === editingLocation.id)
                    ? "Edit Destination Pin"
                    : "Add New Destination Pin"}
                </span>
              </h2>
              <button
                type="button"
                onClick={closeLocationModal}
                className="p-1.5 rounded-full hover:bg-champagne/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-soft-brown" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Place Name (English & Telugu) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center justify-between">
                    <span>Place Name (English) *</span>
                    <span className="text-[10px] text-soft-brown/60">🇬🇧 English</span>
                  </label>
                  <input
                    type="text"
                    value={editingLocation.name || ""}
                    onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                    placeholder="e.g. Goa — The Family Happy Place"
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center justify-between">
                    <span>Place Name (Telugu / ప్రదేశం పేరు)</span>
                    <span className="text-[10px] text-burgundy font-medium">🇮🇳 తెలుగు</span>
                  </label>
                  <input
                    type="text"
                    value={editingLocation.nameTe || ""}
                    onChange={(e) => setEditingLocation({ ...editingLocation, nameTe: e.target.value })}
                    placeholder="ఉదాహరణ: గోవా సముద్రతీరం — 2010"
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 2: Year, Category & Custom Emoji Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Year *
                  </label>
                  <input
                    type="number"
                    value={editingLocation.year || ""}
                    onChange={(e) => setEditingLocation({ ...editingLocation, year: Number(e.target.value) })}
                    placeholder="e.g. 2010"
                    min={1950}
                    max={2035}
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Category
                  </label>
                  <select
                    value={editingLocation.category || "holiday"}
                    onChange={(e) => setEditingLocation({ ...editingLocation, category: e.target.value as MapLocationCategory })}
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:outline-hidden"
                  >
                    {LOCATION_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1">
                    Emoji Pin Icon
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-1 bg-champagne/40 rounded-lg border border-warm-beige">
                      {editingLocation.icon || "📍"}
                    </span>
                    <input
                      type="text"
                      value={editingLocation.icon || ""}
                      onChange={(e) => setEditingLocation({ ...editingLocation, icon: e.target.value })}
                      placeholder="e.g. 🏖️"
                      maxLength={4}
                      className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Emoji Quick Picker Row */}
              <div>
                <span className="block text-[11px] font-semibold text-soft-brown mb-1">Quick Emoji Picker:</span>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEditingLocation({ ...editingLocation, icon: em })}
                      className={`text-lg p-1.5 rounded-lg border transition-all cursor-pointer ${
                        editingLocation.icon === em
                          ? "bg-burgundy/10 border-burgundy scale-110 shadow-xs"
                          : "bg-warm-white border-warm-beige hover:bg-champagne/40"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Interactive Map Location Picker (Search + Click Pin + Drag) */}
              <div className="space-y-2.5 rounded-2xl border border-warm-beige bg-champagne/15 p-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-burgundy flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gold" />
                    <span>Select & Pin Location on Map *</span>
                  </label>
                  <span className="text-[10px] text-soft-brown font-medium">
                    Search city/place or click on map to set pin
                  </span>
                </div>

                <AdminLocationPickerMap
                  lat={typeof editingLocation.lat === "number" && !isNaN(editingLocation.lat) ? editingLocation.lat : null}
                  lng={typeof editingLocation.lng === "number" && !isNaN(editingLocation.lng) ? editingLocation.lng : null}
                  icon={editingLocation.icon || "📍"}
                  onChange={(newLat, newLng, suggestedName) => {
                    setEditingLocation((prev) => ({
                      ...prev,
                      lat: newLat,
                      lng: newLng,
                      name: (!prev?.name || prev.name.trim() === "") && suggestedName ? suggestedName : prev?.name,
                    }));
                  }}
                />

                {/* Synchronized Exact Coordinate Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-soft-brown mb-1 flex items-center justify-between">
                      <span>Latitude (GPS North/South) *</span>
                      <span className="text-[10px] text-emerald-700 font-mono">lat</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editingLocation.lat ?? ""}
                      onChange={(e) => setEditingLocation({ ...editingLocation, lat: parseFloat(e.target.value) })}
                      placeholder="17.3850"
                      className="w-full rounded-xl border border-warm-beige bg-white px-3 py-1.5 text-xs sm:text-sm font-mono text-charcoal focus:border-burgundy focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-soft-brown mb-1 flex items-center justify-between">
                      <span>Longitude (GPS East/West) *</span>
                      <span className="text-[10px] text-emerald-700 font-mono">lng</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editingLocation.lng ?? ""}
                      onChange={(e) => setEditingLocation({ ...editingLocation, lng: parseFloat(e.target.value) })}
                      placeholder="78.4867"
                      className="w-full rounded-xl border border-warm-beige bg-white px-3 py-1.5 text-xs sm:text-sm font-mono text-charcoal focus:border-burgundy focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Stories (English & Telugu) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center justify-between">
                    <span>Memory Story (English)</span>
                    <span className="text-[10px] text-soft-brown/60">🇬🇧 English</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editingLocation.story || ""}
                    onChange={(e) => setEditingLocation({ ...editingLocation, story: e.target.value })}
                    placeholder="Tell the unforgettable memory of what happened here..."
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-soft-brown mb-1 flex items-center justify-between">
                    <span>Memory Story (Telugu / కథనం)</span>
                    <span className="text-[10px] text-burgundy font-medium">🇮🇳 తెలుగు</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editingLocation.storyTe || ""}
                    onChange={(e) => setEditingLocation({ ...editingLocation, storyTe: e.target.value })}
                    placeholder="ఈ ప్రదేశానికి సంబంధించిన మధుర జ్ఞాపకాన్ని తెలుగులో రాయండి..."
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3 py-2 text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 5: Photo Upload & URL */}
              <div className="rounded-2xl border border-warm-beige bg-champagne/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold text-charcoal flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-burgundy" />
                    <span>Destination Photo (Cloudinary Integrated)</span>
                  </label>
                  {isUploadingLocationImage && (
                    <span className="text-xs font-semibold text-burgundy flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Uploading to Cloudinary...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview */}
                  <div className="w-24 h-24 rounded-xl border border-warm-beige bg-warm-white overflow-hidden shrink-0 relative flex items-center justify-center">
                    {editingLocation.image ? (
                      <img
                        src={resolveMediaUrl(editingLocation.image)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/Golden South Indian Mandap Setting.png";
                        }}
                      />
                    ) : (
                      <div className="text-center p-2 text-soft-brown/40">
                        <Camera className="mx-auto h-6 w-6 text-soft-brown/30" />
                        <span className="text-[9px]">No photo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      ref={locationFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLocationImage(file);
                      }}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => locationFileInputRef.current?.click()}
                        disabled={isUploadingLocationImage}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-burgundy text-white text-xs font-semibold hover:bg-deep-burgundy transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Photo from Device</span>
                      </button>

                      {editingLocation.image && (
                        <button
                          type="button"
                          onClick={() => setEditingLocation({ ...editingLocation, image: "" })}
                          className="px-2.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={editingLocation.image || ""}
                      onChange={(e) => setEditingLocation({ ...editingLocation, image: e.target.value })}
                      placeholder="Or paste an image URL directly..."
                      className="w-full rounded-xl border border-warm-beige bg-warm-white px-3 py-1.5 text-xs text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-warm-white rounded-b-3xl border-t border-warm-beige px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeLocationModal}
                className="px-5 py-2 rounded-xl border border-warm-beige text-xs font-semibold text-soft-brown hover:bg-champagne/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={isSavingLocation || !editingLocation.name?.trim() || !editingLocation.year}
                className="px-5 py-2 rounded-xl bg-burgundy text-warm-white text-xs font-semibold hover:bg-deep-burgundy shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSavingLocation
                  ? "Saving Pin..."
                  : editingLocation.id && locations.some((l) => l.id === editingLocation.id)
                  ? "Update Destination Pin"
                  : "Save Destination Pin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
