import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI, commentAPI, likeAPI } from '@/api/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authstore';
import PostCard from '@/pages/posts/components/PostCard';
import ExpandedComments from './ExpandedComments';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const postRes = await postAPI.getById(id);
      setPost(postRes.data.data);
      setLikeCount(postRes.data.data.likeCount || 0);

      const commentsRes = await commentAPI.getByPost(id);
      setComments(commentsRes.data.data || []);

      if (authUser) {
        const likeStatus = await likeAPI.checkStatus('post', id);
        setIsLiked(likeStatus.data.data.isLiked);
      }
    };
    fetchData();
  }, [id, authUser]);

  const handleLike = async () => {
    if (!authUser) return;
    if (isLiked) {
      await likeAPI.unlike('post', id);
      setLikeCount((c) => c - 1);
      setIsLiked(false);
    } else {
      await likeAPI.like('post', id);
      setLikeCount((c) => c + 1);
      setIsLiked(true);
    }
  };

  if (!post) {
    return <div className="flex items-center justify-center min-h-screen text-[#E7E9EA]">Loading...</div>;
  }

  const userInitial = post.author?.anonymousUsername?.charAt(0).toUpperCase() || post.author?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center space-x-2 text-[#E7E9EA]">
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      {/* Post Card (reuse PostCard component) */}
      <div className="mb-6">
        <PostCard post={post} />
      </div>

      {/* Expanded Comments Section */}
      <ExpandedComments postId={post.id} />
    </div>
  );
};

export default PostDetail; 