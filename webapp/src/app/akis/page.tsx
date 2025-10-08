"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { t } from "@/lib/i18n";
import { useFeedRealtime } from "@/hooks/useFeedRealtime";

type FeedPost = {
  id: string;
  content: string | null;
  created_at: string;
  image_url?: string | null;
  likes: number;
  comments: number;
  author: { id: string; display_name: string | null; avatar_url: string | null } | null;
};

type FeedComment = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author: { id: string; display_name: string | null; avatar_url: string | null } | null;
};

type FetchState = "loading" | "ready" | "error";

type ProfileRecord = { id?: unknown; display_name?: unknown; avatar_url?: unknown };

function extractProfile(payload: unknown): { id: string; display_name: string | null; avatar_url: string | null } | null {
  const source = Array.isArray(payload) ? payload[0] : payload;
  if (!source || typeof source !== "object") {
    return null;
  }
  const record = source as ProfileRecord;
  const id = record.id;
  if (typeof id !== "string") {
    return null;
  }
  const displayName = typeof record.display_name === "string" ? record.display_name : null;
  const avatarUrl = typeof record.avatar_url === "string" ? record.avatar_url : null;
  return { id, display_name: displayName, avatar_url: avatarUrl };
}

function mapRecordToPost(record: Record<string, unknown>): FeedPost | null {
  const id = record["id"];
  const createdAt = record["created_at"];
  if (typeof id !== "string" || typeof createdAt !== "string") {
    return null;
  }
  const contentRaw = record["content"];
  const imageRaw = record["image_url"];
  const likesRaw = record["likes"];
  const commentsRaw = record["comments"];
  const authorIdRaw = record["author_id"];
  const profile = extractProfile(record["profiles"]);
  let author: FeedPost["author"] = profile ?? null;
  if (typeof authorIdRaw === "string") {
    if (!author) {
      author = {
        id: authorIdRaw,
        display_name: null,
        avatar_url: null,
      };
    }
  }
  return {
    id,
    content: typeof contentRaw === "string" ? contentRaw : null,
    created_at: createdAt,
    image_url: typeof imageRaw === "string" ? imageRaw : null,
    likes: typeof likesRaw === "number" ? likesRaw : 0,
    comments: typeof commentsRaw === "number" ? commentsRaw : 0,
    author,
  };
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_POSTS = 20;
const HIGHLIGHT_DURATION = 4000;

type RealtimeStatus = "connecting" | "connected" | "error";

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Dosya okunamadi"));
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(original: File): Promise<File> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return original;
  }
  if (!original.type.startsWith("image/")) {
    return original;
  }
  try {
    const dataUrl = await readFileAsDataURL(original);
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Gorsel yuklenemedi"));
      img.src = dataUrl;
    });

    const maxDimension = 1280;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return original;
    }
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("Gorsel sikistirma basarisiz"));
      }, "image/jpeg", 0.7);
    });

    const baseName = original.name.includes(".")
      ? original.name.slice(0, original.name.lastIndexOf("."))
      : original.name;
    const fileName = `${baseName || "gorsel"}-compressed.jpg`;
    return new File([blob], fileName, { type: "image/jpeg", lastModified: Date.now() });
  } catch (error) {
    console.error("Gorsel sikistirma basarisiz", error);
    return original;
  }
}

function getInitials(name: string | null): string {
  if (!name) return 'TF';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TF';
  const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
  return initials || 'TF';
}

function HeartIcon({ filled = false, className = "h-4 w-4" }: { filled?: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.995 21.25c-.327 0-.652-.098-.929-.287C8.23 19.078 4.5 15.962 4.5 11.56c0-2.582 1.974-4.56 4.5-4.56 1.51 0 2.87.757 3.7 1.954.83-1.197 2.19-1.954 3.7-1.954 2.526 0 4.5 1.978 4.5 4.56 0 4.403-3.73 7.519-6.566 9.404-.277.189-.602.287-.929.287Z"
      />
    </svg>
  );
}

function ChatBubbleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h8M8 14h4m8 0c0 4-4 7-8 7a8.91 8.91 0 0 1-3.66-.77L4 21l.77-4.34A7.87 7.87 0 0 1 3 13c0-4 4-7 9-7s9 3 9 7Z"
      />
    </svg>
  );
}

function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export default function AkisPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting');
  const [realtimeNonce, setRealtimeNonce] = useState(0);
  const highlightTimers = useRef<Map<string, number>>(new Map());
  const [highlights, setHighlights] = useState<Record<string, boolean>>({});

  const [userId, setUserId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likeBusy, setLikeBusy] = useState<string | null>(null);

  const [commentTarget, setCommentTarget] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentPosting, setCommentPosting] = useState(false);

  const markReady = useCallback(() => {
    setState((prev) => (prev === "ready" ? prev : "ready"));
  }, []);

  const normalizePosts = useCallback((list: FeedPost[]) => {
    return list
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, MAX_POSTS);
  }, []);

  const addHighlight = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    setHighlights((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
    const timers = highlightTimers.current;
    const existing = timers.get(id);
    if (existing) {
      window.clearTimeout(existing);
    }
    const timeout = window.setTimeout(() => {
      timers.delete(id);
      setHighlights((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, HIGHLIGHT_DURATION);
    timers.set(id, timeout);
  }, []);

  const load = useCallback(async () => {
    setState("loading");
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          content,
          created_at,
          image_url,
          post_likes(count),
          post_comments(count),
          profiles:author_id ( id, display_name, avatar_url )
        `)
        .order('created_at', { ascending: false })
        .limit(MAX_POSTS);
      if (error) {
        setState("error");
        return;
      }
      const rows = (data ?? []) as Array<Record<string, unknown> & { post_likes?: { count: number }[]; post_comments?: { count: number }[] }>;
      const mapped = rows.map((row) => ({
        id: String(row.id),
        content: typeof row.content === 'string' ? (row.content as string) : null,
        created_at: String(row.created_at),
        image_url: typeof row.image_url === 'string' ? (row.image_url as string) : null,
        likes: Number(row.post_likes?.[0]?.count ?? 0),
        comments: Number(row.post_comments?.[0]?.count ?? 0),
        author: (() => {
          const profile = extractProfile((row as { profiles?: unknown }).profiles);
          if (profile) {
            return profile;
          }
          const authorId = (row as { author_id?: unknown }).author_id;
          return typeof authorId === 'string'
            ? { id: authorId, display_name: null, avatar_url: null }
            : null;
        })(),
      }));
      setPosts(normalizePosts(mapped));

      if (userId && mapped.length > 0) {
        const postIds = mapped.map((item) => item.id);
        const { data: likedData, error: likedError } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds);
        if (!likedError && likedData) {
          setLikedPosts(new Set(likedData.map((item) => String(item.post_id))));
        } else {
          setLikedPosts(new Set());
        }
      } else {
        setLikedPosts(new Set());
      }

      markReady();
    } catch (error) {
      console.error('AkÃ„Â±Ã…Å¸ verisi yÃƒÂ¼klenemedi', error);
      setState("error");
    }
  }, [normalizePosts, markReady, userId]);

  const upsertPost = useCallback(
    (incoming: FeedPost, options?: { highlight?: boolean; preserveCounts?: boolean }) => {
      setPosts((prev) => {
        const existing = prev.find((post) => post.id === incoming.id);
        const preserveCounts = options?.preserveCounts ?? true;
        const nextPost: FeedPost = (() => {
          if (preserveCounts && existing) {
            return {
              ...incoming,
              likes: existing.likes,
              comments: existing.comments,
              author: incoming.author ?? existing.author,
            };
          }
          return {
            ...incoming,
            author: incoming.author ?? existing?.author ?? null,
          };
        })();
        const filtered = prev.filter((post) => post.id !== incoming.id);
        return normalizePosts([nextPost, ...filtered]);
      });
      if (options?.highlight) {
        addHighlight(incoming.id);
      }
      markReady();
    },
    [normalizePosts, markReady, addHighlight],
  );



  const removePost = useCallback(
    (id: string) => {
      setPosts((prev) => prev.filter((post) => post.id !== id));
      setHighlights((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (typeof window !== 'undefined') {
        const existing = highlightTimers.current.get(id);
        if (existing) {
          window.clearTimeout(existing);
          highlightTimers.current.delete(id);
        }
      }
      markReady();
    },
    [markReady],
  );

  const reconnectRealtime = useCallback(() => {
    setRealtimeStatus('connecting');
    setRealtimeNonce((prev) => prev + 1);
    load();
  }, [load]);

  const handlePostUpdate = useCallback((payload: { id: string; likes: number; comments: number }) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === payload.id
          ? { ...post, likes: payload.likes, comments: payload.comments }
          : post,
      ),
    );
  }, []);

  const handleLikeToggleRealtime = useCallback((postId: string, delta: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likes: Math.max(0, post.likes + delta) }
          : post,
      ),
    );
  }, []);

  const handleCommentInsertRealtime = useCallback(async (comment: { id: string; post_id: string; content: string | null; created_at: string }) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === comment.post_id
          ? { ...post, comments: post.comments + 1 }
          : post,
      ),
    );
    setCommentTarget((current) =>
      current && current.id === comment.post_id
        ? { ...current, comments: current.comments + 1 }
        : current,
    );
    const currentTargetId = commentTarget?.id;
    if (!currentTargetId || currentTargetId !== comment.post_id) {
      return;
    }
    const { data } = await supabase
      .from('post_comments')
      .select(`
        id,
        post_id,
        author_id,
        content,
        created_at,
        profiles:author_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('id', comment.id)
      .single();
    if (!data) {
      const fallback: FeedComment = {
        id: comment.id,
        post_id: comment.post_id,
        content: comment.content ?? '',
        created_at: comment.created_at,
        author: null,
      };
      setComments((prev) => [fallback, ...prev]);
      return;
    }
    const profile = extractProfile((data as { profiles?: unknown }).profiles);
    const authorId = (data as { author_id?: unknown }).author_id;
    const mapped: FeedComment = {
      id: String(data.id),
      post_id: String(data.post_id),
      content: String(data.content ?? ''),
      created_at: String(data.created_at),
      author: profile
        ? profile
        : typeof authorId === 'string'
            ? { id: authorId, display_name: null, avatar_url: null }
            : null,
    };
    setComments((prev) => [mapped, ...prev]);
  }, [commentTarget]);

  const handleCommentDeleteRealtime = useCallback((commentId: string, postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: Math.max(0, post.comments - 1) }
          : post,
      ),
    );
    setCommentTarget((current) =>
      current && current.id === postId
        ? { ...current, comments: Math.max(0, current.comments - 1) }
        : current,
    );
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  }, []);

  useFeedRealtime({
    onPostChange: handlePostUpdate,
    onPostDelete: removePost,
    onLikeToggle: handleLikeToggleRealtime,
    onCommentInsert: handleCommentInsertRealtime,
    onCommentDelete: handleCommentDeleteRealtime,
  });

  const handleToggleLike = useCallback(async (postId: string) => {
    if (!userId) {
      setErrorMsg(t('feed.like.auth'));
      return;
    }
    if (likeBusy === postId) return;
    const isLiked = likedPosts.has(postId);
    setLikeBusy(postId);
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (isLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: Math.max(0, post.likes + (isLiked ? -1 : 1)) } : post,
      ),
    );
    try {
      if (isLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      }
    } catch (error) {
      console.error('Beğeni güncellenemedi', error);
      setErrorMsg(t('feed.like.error'));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: Math.max(0, post.likes + (isLiked ? 1 : -1)) } : post,
        ),
      );
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (isLiked) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });
    } finally {
      setLikeBusy(null);
    }
  }, [likedPosts, likeBusy, userId]);

  const openComments = useCallback(async (post: FeedPost) => {
    setCommentTarget({
      id: post.id,
      content: post.content,
      created_at: post.created_at,
      image_url: post.image_url,
      likes: post.likes,
      comments: post.comments,
      author: post.author ?? null,
    });
    setComments([]);
    setCommentContent('');
    setCommentError(null);
    setCommentsLoading(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        id,
        post_id,
        author_id,
        content,
        created_at,
        profiles:author_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setCommentsLoading(false);
    if (error) {
      setCommentError(error.message);
      return;
    }
    const typed = (data ?? []).map((row) => {
      const profile = extractProfile((row as { profiles?: unknown }).profiles);
      const authorId = (row as { author_id?: unknown }).author_id;
      return {
        id: String(row.id),
        post_id: String(row.post_id),
        content: String(row.content ?? ''),
        created_at: String(row.created_at),
        author: profile
          ? profile
          : typeof authorId === 'string'
              ? { id: authorId, display_name: null, avatar_url: null }
              : null,
      } satisfies FeedComment;
    });
    setComments(typed);
  }, []);

  const closeComments = useCallback(() => {
    setCommentTarget(null);
    setComments([]);
    setCommentContent('');
    setCommentError(null);
  }, []);

  const submitComment = useCallback(async () => {
    if (!commentTarget) return;
    const trimmed = commentContent.trim();
    if (!trimmed) {
      setCommentError(t('feed.comments.error_empty'));
      return;
    }
    if (!userId) {
      setCommentError(t('auth.error.no_session'));
      return;
    }
    setCommentPosting(true);
    setCommentError(null);
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: commentTarget.id, author_id: userId, content: trimmed })
      .select(`
        id,
        post_id,
        author_id,
        content,
        created_at,
        profiles:author_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .single();
    setCommentPosting(false);
    if (error) {
      setCommentError(error.message);
      return;
    }
    if (data) {
      const profile = extractProfile((data as { profiles?: unknown }).profiles);
      const authorId = (data as { author_id?: unknown }).author_id;
      const newComment: FeedComment = {
        id: String(data.id),
        post_id: String(data.post_id),
        content: String(data.content ?? ''),
        created_at: String(data.created_at),
        author: profile
          ? profile
          : typeof authorId === 'string'
              ? { id: authorId, display_name: null, avatar_url: null }
              : null,
      };
      setComments((prev) => [newComment, ...prev]);
      setCommentContent('');
      setPosts((prev) =>
        prev.map((post) =>
          post.id === commentTarget.id ? { ...post, comments: post.comments + 1 } : post,
        ),
      );
      setCommentTarget((prev) => (prev ? { ...prev, comments: prev.comments + 1 } : prev));
    }
  }, [commentContent, commentTarget, userId]);

  useEffect(() => {
    let active = true;

    load();

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const session = data.session;
      setAuthed(Boolean(session));
      setUserId(session?.user?.id ?? null);
      if (session) {
        load();
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthed(Boolean(session));
      setUserId(session?.user?.id ?? null);
      load();
    });

    return () => {
      active = false;
      subscription?.subscription.unsubscribe();
    };
  }, [load]);

  useEffect(() => {
    let active = true;
    setRealtimeStatus('connecting');

    const channel = supabase
      .channel(`posts-realtime-${realtimeNonce}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          if (!active) return;
          const next = mapRecordToPost(payload.new as Record<string, unknown>);
          if (!next) return;
          upsertPost(next, { highlight: true, preserveCounts: false });
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          if (!active) return;
          const next = mapRecordToPost(payload.new as Record<string, unknown>);
          if (!next) return;
          upsertPost(next, { preserveCounts: true });
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          if (!active) return;
          const record = payload.old as Record<string, unknown>;
          const id = typeof record?.['id'] === 'string' ? (record['id'] as string) : null;
          if (!id) return;
          removePost(id);
        },
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setRealtimeStatus('error');
        }
      });

    return () => {
      active = false;
      void channel.unsubscribe();
    };
  }, [upsertPost, removePost, realtimeNonce]);

  useEffect(() => {
    const timers = highlightTimers.current;
    return () => {
      if (typeof window === 'undefined') return;
      timers.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timers.clear();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const formattedPosts = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    return posts.map((post) => ({
      ...post,
      createdLabel: formatter.format(new Date(post.created_at)),
      liked: likedPosts.has(post.id),
    }));
  }, [posts, likedPosts]);

  const commentFormatter = useMemo(() => new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }), []);

  useEffect(() => {
    if (!commentTarget) return;
    const fresh = posts.find((post) => post.id === commentTarget.id);
    if (fresh && (fresh.likes !== commentTarget.likes || fresh.comments !== commentTarget.comments || fresh.content !== commentTarget.content || fresh.image_url !== commentTarget.image_url)) {
      setCommentTarget({ ...fresh });
    }
  }, [commentTarget, posts]);

  const showRealtimeWarning = realtimeStatus === 'error';
  const realtimeStatusLabel = t(
    realtimeStatus === 'connected'
      ? 'feed.realtime.status.connected'
      : realtimeStatus === 'connecting'
        ? 'feed.realtime.status.connecting'
        : 'feed.realtime.status.error',
  );
  const realtimeStatusTone =
    realtimeStatus === 'connected'
      ? 'badge-success'
      : realtimeStatus === 'connecting'
        ? 'badge-warning'
        : 'badge-error';

  function resetFileInput() {
    const input = document.getElementById("feed-image-input") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    resetFileInput();
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMsg(null);
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      clearImage();
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMsg(t("feed.image_limit"));
      resetFileInput();
      return;
    }
    const preview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
  }

  async function uploadImage(uid: string): Promise<string | null> {

    if (!imageFile) return null;

    const processedFile = await compressImageFile(imageFile);

    const fileExt = processedFile.name.split('.').pop()?.toLowerCase() || (processedFile.type === 'image/jpeg' ? 'jpg' : 'png');

    const baseName = processedFile.name.includes('.') ? processedFile.name.slice(0, processedFile.name.lastIndexOf('.')) : processedFile.name;

    const sanitizedBase = baseName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/^-+|-+$/g, '');

    const filePath = `${uid}/${Date.now()}-${sanitizedBase || 'gorsel'}.${fileExt}`;

    const { error: uploadError } = await supabase.storage

      .from('post-images')

      .upload(filePath, processedFile, {

        cacheControl: '3600',

        upsert: false,

      });

    if (uploadError) {

      throw new Error(uploadError.message);

    }

    const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);

    return data.publicUrl ?? null;

  }



  async function onPost() {
    setErrorMsg(null);
    if (!content.trim() && !imageFile) {
      return;
    }
    setSending(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setSending(false);
      setErrorMsg(t("auth.error.no_session"));
      return;
    }

    let imageUrl: string | null = null;
    try {
      imageUrl = await uploadImage(uid);
    } catch (error) {
      console.error("GÃƒÂ¶nderi gÃƒÂ¶rsel yÃƒÂ¼kleme hatasÃ„Â±", error);
      setErrorMsg(t("feed.image_error"));
      setSending(false);
      return;
    }

    const { error } = await supabase
      .from("posts")
      .insert({ author_id: uid, content: content.trim() || null, image_url: imageUrl });
    setSending(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setContent("");
    clearImage();
    load();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-24 pt-2 sm:px-0">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-base-content">{t("feed.title")}</h1>
        <span className={`badge badge-sm ${realtimeStatusTone}`}>
          {realtimeStatusLabel}
        </span>
      </div>
      {showRealtimeWarning && (
        <div className="alert alert-warning text-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>{t("feed.realtime.error")}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={reconnectRealtime}>
            {t("feed.realtime.retry")}
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-error text-sm">
          <span>{errorMsg}</span>
        </div>
      )}
      {authed && (
        <form
          className="card border border-base-200 bg-base-100/95 shadow-md backdrop-blur supports-backdrop:bg-base-100/80"
          onSubmit={(event) => {
            event.preventDefault();
            void onPost();
          }}
        >
          <div className="card-body gap-4 p-4 sm:p-6">
            <textarea
              className="textarea textarea-bordered textarea-sm min-h-[120px] w-full resize-none rounded-xl border-base-200 bg-base-100 text-sm leading-relaxed sm:text-base"
              placeholder={t("feed.placeholder")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label
                  className="btn btn-outline btn-xs sm:btn-sm"
                  htmlFor="feed-image-input"
                >
                  {t("feed.attach")}
                </label>
                <input
                  id="feed-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
                {imagePreview && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs sm:btn-sm text-error"
                    onClick={clearImage}
                  >
                    {t("feed.remove_image")}
                  </button>
                )}
              </div>
              <button
                type="submit"
                className={`btn btn-primary btn-sm sm:btn-md min-w-[96px] justify-center ${sending ? "btn-disabled loading" : ""}`}
                disabled={sending}
              >
                {sending ? t("feed.posting") : t("feed.post")}
              </button>
            </div>
            {imagePreview && (
              <div className="relative w-full overflow-hidden rounded-2xl border border-base-200">
                <Image
                  src={imagePreview}
                  alt={t("feed.image_preview_alt")}
                  width={1024}
                  height={1024}
                  className="h-auto w-full object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3">
        {state === "loading" && (
          <div className="flex items-center justify-center py-10">
            <span className="loading loading-spinner" aria-label={t("feed.loading")} />
          </div>
        )}
        {state === "ready" && formattedPosts.length === 0 && (
          <div className="alert text-sm">
            <span>{t("feed.empty")}</span>
          </div>
        )}
        {state === "error" && (
          <div className="alert alert-error text-sm">
            <span>{t("feed.error")}</span>
          </div>
        )}
        {formattedPosts.map((post) => {
          const isHighlighted = Boolean(highlights[post.id]);
          return (
            <article
              key={post.id}
              className={`card rounded-2xl border border-base-200 bg-base-100/95 shadow-sm transition-all ${isHighlighted ? 'ring-2 ring-primary/60' : ''}`}
            >
              <div className="card-body gap-4 p-4 sm:p-6">
                {isHighlighted && (
                  <span className="badge badge-primary badge-xs w-fit">{t('feed.realtime.new')}</span>
                )}
                <div className="flex items-center gap-3 text-sm text-base-content/70">
                  <div className="avatar">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {post.author?.avatar_url ? (
                        <Image
                          src={post.author.avatar_url}
                          alt={post.author.display_name ?? t('feed.author.unknown')}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>{getInitials(post.author?.display_name ?? null)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-base-content">
                      {post.author?.display_name ?? t('feed.author.unknown')}
                    </span>
                    <span className="text-[11px] text-base-content/60">{post.createdLabel}</span>
                  </div>
                </div>
                {post.image_url && (
                  <div className="overflow-hidden rounded-2xl border border-base-200">
                    <Image
                      src={post.image_url}
                      alt={t('feed.image_alt')}
                      width={1024}
                      height={1024}
                      className="h-auto w-full object-cover"
                      unoptimized
                    />
                  </div>
                )}
                {post.content && (
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-base-content/90">
                    {post.content}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    className={`flex items-center gap-2 rounded-full border border-base-200 px-3 py-1 text-sm font-medium transition-colors ${
                      post.liked ? 'border-primary bg-primary/10 text-primary' : 'hover:border-primary/60 hover:text-primary'
                    }`}
                    onClick={() => handleToggleLike(post.id)}
                    disabled={likeBusy === post.id}
                    aria-pressed={post.liked}
                  >
                    <HeartIcon filled={post.liked} className="h-4 w-4" />
                    <span className="font-semibold">{post.likes}</span>
                    <span className="sr-only">
                      {post.liked ? t('feed.unlike') : t('feed.like')}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-base-200 px-3 py-1 text-sm font-medium transition-colors hover:border-primary/60 hover:text-primary"
                    onClick={() => openComments(post)}
                  >
                    <ChatBubbleIcon className="h-4 w-4" />
                    <span className="font-semibold">{post.comments}</span>
                    <span className="sr-only">{t('feed.comments.open')}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}

      </div>

      {commentTarget && (
        <div className="fixed inset-0 z-50 flex flex-col bg-base-100/95 pb-4 pt-4 backdrop-blur-sm sm:inset-x-4 sm:inset-y-10 sm:rounded-3xl sm:border sm:border-base-200 sm:pb-6 sm:pt-6 sm:shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-base-200 px-4 pb-3 sm:px-6 sm:pb-4">
            <div>
              <p className="text-sm font-semibold text-base-content">{t('feed.comments.title')}</p>
              <p className="text-xs text-base-content/60">
                {t('feed.comments.count').replace('{count}', String(commentTarget.comments))}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content"
              onClick={closeComments}
              aria-label={t('feed.comments.close')}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 sm:px-6 sm:py-4">
            {commentsLoading && (
              <div className="flex justify-center py-6">
                <span className="loading loading-spinner" aria-label={t('feed.comments.loading')} />
              </div>
            )}
            {!commentsLoading && commentError && (
              <div className="alert alert-error text-sm">
                <span>{commentError}</span>
              </div>
            )}
            {!commentsLoading && !commentError && comments.length === 0 && (
              <p className="text-sm text-base-content/60">{t('feed.comments.empty')}</p>
            )}
            {!commentsLoading && comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-base-200 p-3 text-sm sm:p-4">
                <div className="flex items-center gap-3 text-sm text-base-content/70">
                  <div className="avatar">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {comment.author?.avatar_url ? (
                        <Image
                          src={comment.author.avatar_url}
                          alt={comment.author.display_name ?? t('feed.author.unknown')}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>{getInitials(comment.author?.display_name ?? null)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-base-content">
                      {comment.author?.display_name ?? t('feed.author.unknown')}
                    </span>
                    <span className="text-[11px] text-base-content/60">
                      {commentFormatter.format(new Date(comment.created_at))}
                    </span>
                  </div>
                </div>
                {comment.content && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-base-content">
                    {comment.content}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-base-200 bg-base-100 px-4 pt-3 sm:px-6 sm:pt-4">
            {authed ? (
              <form
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitComment();
                }}
              >
                <div className="flex-1">
                  <label className="sr-only" htmlFor="comment-input">{t('feed.comments.placeholder')}</label>
                  <textarea
                    id="comment-input"
                    className="textarea textarea-bordered w-full min-h-[96px] resize-none rounded-xl border-base-200 bg-base-100 text-sm leading-relaxed"
                    placeholder={t('feed.comments.placeholder')}
                    value={commentContent}
                    onChange={(event) => {
                      setCommentContent(event.target.value);
                      if (commentError) setCommentError(null);
                    }}
                  />
                </div>
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className={`btn btn-primary btn-sm min-w-[120px] ${commentPosting ? 'btn-disabled loading' : ''}`}
                    disabled={commentPosting}
                  >
                    {commentPosting ? t('feed.comments.sending') : t('feed.comments.send')}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-base-content/70">
                {t('feed.comments.login')}
                {' '}
                <Link href="/giris" className="link link-primary">
                  {t('feed.comments.login_cta')}
                </Link>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
