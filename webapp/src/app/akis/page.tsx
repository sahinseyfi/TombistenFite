"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { t } from "@/lib/i18n";

type FeedPost = {
  id: string;
  content: string | null;
  created_at: string;
  image_url?: string | null;
  likes: number;
  comments: number;
};

type FeedComment = {
  id: string;
  content: string;
  created_at: string;
};

type FetchState = "loading" | "ready" | "error";

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
  return {
    id,
    content: typeof contentRaw === "string" ? contentRaw : null,
    created_at: createdAt,
    image_url: typeof imageRaw === "string" ? imageRaw : null,
    likes: typeof likesRaw === "number" ? likesRaw : 0,
    comments: typeof commentsRaw === "number" ? commentsRaw : 0,
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
        .select('id, content, created_at, image_url, post_likes(count), post_comments(count)')
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

        const nextPost: FeedPost = preserveCounts && existing

          ? { ...incoming, likes: existing.likes, comments: existing.comments }

          : incoming;

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
    });
    setComments([]);
    setCommentContent('');
    setCommentError(null);
    setCommentsLoading(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, content, created_at')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setCommentsLoading(false);
    if (error) {
      setCommentError(error.message);
      return;
    }
    const typed = (data ?? []).map((row) => ({
      id: String(row.id),
      content: String(row.content ?? ''),
      created_at: String(row.created_at),
    }));
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
      .select('id, content, created_at')
      .single();
    setCommentPosting(false);
    if (error) {
      setCommentError(error.message);
      return;
    }
    if (data) {
      const newComment: FeedComment = {
        id: String(data.id),
        content: String(data.content ?? ''),
        created_at: String(data.created_at),
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t("feed.title")}</h1>
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
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            <textarea
              className="textarea textarea-bordered"
              placeholder={t("feed.placeholder")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className="btn btn-outline btn-xs sm:btn-sm w-fit" htmlFor="feed-image-input">
                {t("feed.attach")}
              </label>
              <input id="feed-image-input" type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              {imagePreview && (
                <div className="relative w-full overflow-hidden rounded-lg border border-base-200">
                  <Image
                    src={imagePreview}
                    alt={t("feed.image_preview_alt")}
                    width={1024}
                    height={1024}
                    className="h-auto w-full object-cover"
                    unoptimized
                  />
                  <div className="absolute right-2 top-2">
                    <button type="button" className="btn btn-xs" onClick={clearImage}>
                      {t("feed.remove_image")}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              className={`btn btn-primary btn-sm self-end ${sending ? "btn-disabled" : ""}`}
              onClick={onPost}
              disabled={sending}
            >
              {sending ? t("feed.posting") : t("feed.post")}
            </button>
          </div>
        </div>
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
              className={`card bg-base-100 shadow border border-base-200 transition-all ${isHighlighted ? 'ring-2 ring-primary/60' : ''}`}
            >
              <div className="card-body gap-3">
                {isHighlighted && (
                  <span className="badge badge-primary badge-xs w-fit">{t('feed.realtime.new')}</span>
                )}
                {post.image_url && (
                  <div className="overflow-hidden rounded-lg border border-base-200">
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
                {post.content && <p className="whitespace-pre-wrap text-sm">{post.content}</p>}
                <p className="text-[11px] text-base-content/50">{post.createdLabel}</p>
                <div className="flex items-center gap-3 pt-1 text-sm">
                  <button
                    type="button"
                    className={`btn btn-ghost btn-xs gap-1 ${post.liked ? 'text-primary' : ''}`}
                    onClick={() => handleToggleLike(post.id)}
                    disabled={likeBusy === post.id}
                  >
                    <span aria-hidden>{post.liked ? '❤' : '♡'}</span>
                    <span>{post.likes}</span>
                    <span className="sr-only">
                      {post.liked ? t('feed.unlike') : t('feed.like')}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs gap-1"
                    onClick={() => openComments(post)}
                  >
                    <span aria-hidden>💬</span>
                    <span>{post.comments}</span>
                    <span className="sr-only">{t('feed.comments.open')}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {commentTarget && (
        <div className="fixed inset-0 z-50 flex flex-col bg-base-100/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-base-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t('feed.comments.title')}</p>
              <p className="text-xs text-base-content/70">
                {t('feed.comments.count').replace('{count}', String(commentTarget.comments))}
              </p>
            </div>
            <button type="button" className="btn btn-sm btn-ghost" onClick={closeComments}>
              {t('feed.comments.close')}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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
              <div key={comment.id} className="rounded-lg border border-base-200 p-3 text-sm">
                <p className="whitespace-pre-wrap">{comment.content}</p>
                <p className="mt-1 text-[11px] text-base-content/50">
                  {commentFormatter.format(new Date(comment.created_at))}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-base-200 bg-base-100 px-4 py-3">
            {authed ? (
              <form
                className="flex items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitComment();
                }}
              >
                <div className="flex-1">
                  <label className="sr-only" htmlFor="comment-input">{t('feed.comments.placeholder')}</label>
                  <textarea
                    id="comment-input"
                    className="textarea textarea-bordered textarea-sm w-full"
                    rows={2}
                    placeholder={t('feed.comments.placeholder')}
                    value={commentContent}
                    onChange={(event) => {
                      setCommentContent(event.target.value);
                      if (commentError) setCommentError(null);
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary btn-sm ${commentPosting ? 'btn-disabled' : ''}`}
                  disabled={commentPosting}
                >
                  {commentPosting ? t('feed.comments.sending') : t('feed.comments.send')}
                </button>
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
