import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getAllReviews } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Star, MessageSquare } from "lucide-react";

const Review = () => {
  const admin = useSelector((s: RootState) => s.admin);

  const { data, isLoading, error } = useQuery({
    queryKey: ["allReviews"],
    queryFn: () => getAllReviews(admin.token),
    enabled: !!admin.token,
  });

  const stats = data?.stats;

  const reviews = data?.reviews || [];

  const avgRating = stats?.averageRating ?? 0;

  const ratingDistribution = stats?.ratingDistribution || {};

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "-";

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load reviews.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Page header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container px-6 py-4 mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Reviews</h1>
        </div>
      </header>

      <div className="container px-6 py-6 mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Summary sidebar */}
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                Reviews Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-gray-800">
                  {avgRating.toFixed(1)}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= Math.round(avgRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200 fill-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    Average Rating
                  </div>
                  <div className="mt-0.5 text-sm text-gray-700 font-medium">
                    {stats?.totalReviews ?? 0} reviews
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                {([5, 4, 3, 2, 1] as number[]).map((r) => (
                  <div
                    key={r}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm text-gray-600">{r}</span>
                      <Star className="inline-block w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-100 h-2 rounded overflow-hidden">
                      <div
                        className="h-2 bg-orange-400 rounded transition-all"
                        style={{
                          width: `${((ratingDistribution[r] || 0) /
                              (stats?.totalReviews || 1)) *
                            100
                            }%`,
                        }}
                      />
                    </div>
                    <div className="w-8 text-right text-sm text-gray-500">
                      {ratingDistribution[r] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">All Reviews</h2>
              <div className="text-sm text-gray-500">
                {reviews.length} results
              </div>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 && (
                <Card className="border-gray-200 shadow-sm bg-white">
                  <CardContent className="py-10 text-center">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-400">No reviews yet.</p>
                  </CardContent>
                </Card>
              )}

              {reviews.map((r: any) => (
                <Card key={r._id} className="border-gray-200 shadow-sm bg-white hover:border-orange-200 transition-colors">
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-orange-100">
                        <AvatarImage
                          src={r.product?.images?.[0]}
                          alt={r.product?.name}
                        />
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                          {(r.product?.name || "").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{r.product?.name}</div>
                            <div className="text-sm text-gray-500">
                              by {r.reviewerName || r.reviewer}
                            </div>
                          </div>
                          <div className="text-sm text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <span className="font-semibold text-gray-800">{r.rating}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDate(r.createdAt)}
                            </div>
                          </div>
                        </div>

                        {r.title && (
                          <div className="mt-2 font-semibold text-gray-800">{r.title}</div>
                        )}
                        {r.comment && (
                          <div className="mt-1 text-sm text-gray-500 whitespace-pre-wrap">
                            {String(r.comment)}
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          {r.verified && (
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                              Verified
                            </span>
                          )}
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            {r.reviewerType}
                          </span>
                          <div className="text-sm text-gray-400">
                            Helpful: {r.helpful ?? 0}
                          </div>
                        </div>

                        {r.vendorReply?.isPublic && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded">
                            <div className="flex items-center gap-2 text-sm">
                              <MessageSquare className="w-4 h-4 text-orange-500" />
                              <span className="font-medium text-orange-600">
                                Vendor Reply (public)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {r.images?.length > 0 && (
                      <div className="flex gap-2">
                        {r.images.map((img: string, i: number) => (
                          <img
                            key={i}
                            src={img}
                            alt={`rev-${i}`}
                            className="w-24 h-24 object-cover rounded ring-1 ring-gray-200"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
