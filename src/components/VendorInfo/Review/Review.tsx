import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getAllReviews } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load reviews.</p>
      </div>
    );

  return (
    <div className="container px-6 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Reviews Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{avgRating.toFixed(1)}</div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
                <div className="mt-1 text-sm">
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
                  <div className="flex items-center gap-2 w-20">
                    <span className="text-sm">
                      {r}{" "}
                      <Star className="inline-block w-4 h-4 text-yellow-400" />
                    </span>
                  </div>
                  <div className="flex-1 bg-muted/30 h-2 rounded overflow-hidden">
                    <div
                      className="h-2 bg-primary"
                      style={{
                        width: `${
                          ((ratingDistribution[r] || 0) /
                            (stats?.totalReviews || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="w-12 text-right">
                    {ratingDistribution[r] || 0}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* <div className="mt-4 flex gap-2">
              <Button variant="ghost" className="w-full">
                Export
              </Button>
              <Button variant="outline" className="w-full">
                Filter
              </Button>
            </div> */}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">All Reviews</h2>
            <div className="text-sm text-muted-foreground">
              {reviews.length} results
            </div>
          </div>

          <div className="space-y-4">
            {reviews.length === 0 && (
              <Card>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No reviews yet.
                  </p>
                </CardContent>
              </Card>
            )}

            {reviews.map((r: any) => (
              <Card key={r._id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={r.product?.images?.[0]}
                        alt={r.product?.name}
                      />
                      <AvatarFallback>
                        {(r.product?.name || "").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{r.product?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            by {r.reviewerName || r.reviewer}
                          </div>
                        </div>
                        <div className="text-sm text-right">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">{r.rating}</span>
                            <Star className="w-4 h-4 text-yellow-400" />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(r.createdAt)}
                          </div>
                        </div>
                      </div>

                      {r.title && (
                        <div className="mt-2 font-semibold">{r.title}</div>
                      )}
                      {r.comment && (
                        <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                          {String(r.comment)}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        {r.verified && <Badge>Verified</Badge>}
                        <Badge variant="outline">{r.reviewerType}</Badge>
                        <div className="text-sm text-muted-foreground">
                          Helpful: {r.helpful ?? 0}
                        </div>
                      </div>

                      {r.vendorReply?.isPublic && (
                        <div className="mt-3 p-3 bg-muted/40 rounded">
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-medium">
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
                          className="w-24 h-24 object-cover rounded"
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
  );
};

export default Review;
