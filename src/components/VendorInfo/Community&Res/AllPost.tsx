import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getAllCommunitysPosts } from "@/services/adminApi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  MessageSquare,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const AllPost = () => {
  const admin = useSelector((s: RootState) => s.admin);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => getAllCommunitysPosts(admin.token),
    enabled: !!admin.token,
  });

  const posts = data?.data || [];

  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "-");

  // Image viewer state
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerImages, setViewerImages] = React.useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = React.useState(0);

  // comments toggle state per post
  const [openComments, setOpenComments] = React.useState<
    Record<string, boolean>
  >({});
  const toggleComments = (id: string) =>
    setOpenComments((s) => ({ ...s, [id]: !s[id] }));

  const openViewer = (images: string[], index = 0) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);
  const prevImage = () =>
    setViewerIndex((i) => (i - 1 + viewerImages.length) % viewerImages.length);
  const nextImage = () => setViewerIndex((i) => (i + 1) % viewerImages.length);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load community posts.</p>
      </div>
    );

  return (
    <div className="container px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Community Posts</h2>
        <div className="text-sm text-muted-foreground">
          {posts.length} posts
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 && (
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  No community posts found.
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 rounded bg-primary text-white"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {posts.map((p: any) => (
          <Card key={p._id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={p.community?.community_Images || p.posts_Images?.[0]}
                    />
                    <AvatarFallback>
                      {(p.community?.name || p.poster?.storeName || "P")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium">
                      {p.community?.name || p.poster?.storeName || p.posterType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.posterType}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {fmt(p.createdTime)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-sm whitespace-pre-wrap">{p.content}</div>

              {p.posts_Images?.length > 0 &&
                (() => {
                  const imgs = p.posts_Images || [];
                  const remaining = imgs.length > 2 ? imgs.length - 2 : 0;

                  if (imgs.length === 1) {
                    return (
                      <button
                        onClick={() => openViewer(imgs, 0)}
                        className="block w-full h-80 overflow-hidden rounded"
                        aria-label={`Open image 1`}
                      >
                        <img
                          src={imgs[0]}
                          alt={`post-0`}
                          className="w-full h-80 object-cover rounded"
                        />
                      </button>
                    );
                  }

                  // show only first two thumbnails for 2+ images
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openViewer(imgs, 0)}
                        className="block w-full h-48 overflow-hidden rounded"
                        aria-label={`Open image 1`}
                      >
                        <img
                          src={imgs[0]}
                          alt={`post-0`}
                          className="w-full h-48 object-cover rounded"
                        />
                      </button>

                      <div className="relative block w-full h-48 overflow-hidden rounded">
                        <button
                          onClick={() => openViewer(imgs, 1)}
                          className="w-full h-full block"
                          aria-label={`Open image 2`}
                        >
                          <img
                            src={imgs[1]}
                            alt={`post-1`}
                            className="w-full h-48 object-cover rounded"
                          />
                        </button>

                        {remaining > 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                            <div className="text-white text-xl font-semibold">
                              +{remaining}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              {p.posts_Images?.length > 0 && <Separator />}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{(p.likes || []).length}</span>
                  </div>

                  <button
                    onClick={() => toggleComments(p._id)}
                    className="flex items-center gap-1 hover:underline hover:text-[#F87645]"
                    aria-expanded={!!openComments[p._id]}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{(p.comments || []).length}</span>
                  </button>
                </div>

                {p.community && <Badge>{p.community.name}</Badge>}
              </div>

              {/* Comments preview */}
              {p.comments && p.comments.length > 0 && openComments[p._id] && (
                <div className="mt-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="w-4 h-4" />
                    <span>Comments</span>
                  </div>

                  <div className="space-y-2">
                    {(p.comments as any[]).slice(0, 3).map((c: any) => (
                      <div
                        key={c._id || c.createdAt}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-0">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                            {(c.comment_poster || "U")
                              .toString()
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {c.comment_poster || c.user || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {c.text}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(c.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}

                    {p.comments.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{p.comments.length - 3} more comments
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center"
            onClick={closeViewer}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative z-70 max-w-5xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="fixed inset-0 bg-black/70" />

              <div className="relative flex items-center justify-center">
                {viewerImages.length > 1 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded bg-white/90 text-black z-50 shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                <div className="max-h-[85vh] w-full flex items-center justify-center">
                  <img
                    src={viewerImages[viewerIndex]}
                    alt={`preview-${viewerIndex}`}
                    className="max-h-[85vh] max-w-full object-contain rounded"
                  />
                </div>

                {viewerImages.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded bg-white/90 text-black z-50 shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

                <button
                  onClick={closeViewer}
                  className="absolute top-4 right-4 p-2 rounded bg-white/90 text-black z-50 shadow-lg"
                  aria-label="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllPost;
