import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type PostPayload = {
  id: string;
  likes: number;
  comments: number;
};

type CommentPayload = {
  id: string;
  post_id: string;
  created_at: string;
  content: string | null;
};

type UseRealtimeOptions = {
  onPostChange?: (payload: PostPayload) => void;
  onPostDelete?: (postId: string) => void;
  onLikeToggle?: (postId: string, delta: number) => void;
  onCommentInsert?: (comment: CommentPayload) => void;
  onCommentDelete?: (commentId: string, postId: string) => void;
};

export function useFeedRealtime({
  onPostChange,
  onPostDelete,
  onLikeToggle,
  onCommentInsert,
  onCommentDelete,
}: UseRealtimeOptions) {
  useEffect(() => {
    let active = true;
    const channelId = `feed-realtime-${Date.now()}`;

    const channel: RealtimeChannel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
        if (!active) return;
        const record = payload.new as Record<string, unknown>;
        const id = typeof record.id === 'string' ? record.id : null;
        const likes = typeof record.likes === 'number' ? record.likes : null;
        const comments = typeof record.comments === 'number' ? record.comments : null;
        if (!id) return;
        onPostChange?.({ id, likes: likes ?? 0, comments: comments ?? 0 });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
        if (!active) return;
        const record = payload.old as Record<string, unknown>;
        const id = typeof record.id === 'string' ? record.id : null;
        if (!id) return;
        onPostDelete?.(id);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_likes' }, (payload) => {
        if (!active) return;
        const record = payload.new as Record<string, unknown>;
        const postId = typeof record.post_id === 'string' ? record.post_id : null;
        if (!postId) return;
        onLikeToggle?.(postId, 1);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_likes' }, (payload) => {
        if (!active) return;
        const record = payload.old as Record<string, unknown>;
        const postId = typeof record.post_id === 'string' ? record.post_id : null;
        if (!postId) return;
        onLikeToggle?.(postId, -1);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, (payload) => {
        if (!active) return;
        const record = payload.new as Record<string, unknown>;
        const postId = typeof record.post_id === 'string' ? record.post_id : null;
        const commentId = typeof record.id === 'string' ? record.id : null;
        const content = typeof record.content === 'string' ? record.content : null;
        const createdAt = typeof record.created_at === 'string' ? record.created_at : new Date().toISOString();
        if (!postId || !commentId) return;
        onCommentInsert?.({ id: commentId, post_id: postId, content, created_at: createdAt });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_comments' }, (payload) => {
        if (!active) return;
        const record = payload.old as Record<string, unknown>;
        const postId = typeof record.post_id === 'string' ? record.post_id : null;
        const commentId = typeof record.id === 'string' ? record.id : null;
        if (!postId || !commentId) return;
        onCommentDelete?.(commentId, postId);
      })
      .subscribe((status) => {
        if (!active) return;
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.warn('Realtime channel status:', status);
        }
      });

    return () => {
      active = false;
      void channel.unsubscribe();
    };
  }, [onPostChange, onPostDelete, onLikeToggle, onCommentInsert, onCommentDelete]);
}
