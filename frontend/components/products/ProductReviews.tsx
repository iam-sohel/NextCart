"use client";

import {
  Avatar,
  Box,
  Divider,
  LinearProgress,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";

import type { Review, ReviewSummary } from "@/types/product";

interface ProductReviewsProps {
  reviews: Review[];
  summary: ReviewSummary;
}

/**
 * NEXTCART — ProductReviews
 *
 * A reusable review block backed by the backend-shaped Review and
 * ReviewSummary types. Renders:
 *   - Overall rating (numeric, with star icon)
 *   - Rating distribution bars (5★ … 1★)
 *   - Up to N reviews with avatar, name, rating, date, comment
 *
 * Design notes:
 *   - The data shape is the contract. When the backend starts sending
 *     richer review data (verified-buyer badge, helpful count, etc.) we
 *     extend Review and update this component.
 *   - The "Write a review" CTA is intentionally a stub — review
 *     submission belongs to the authenticated user flow we haven't built
 *     yet. Marked clearly as unavailable so designers/devs notice.
 *   - Empty-state copy is centralized so the empty branch is meaningful.
 */
export default function ProductReviews({
  reviews,
  summary,
}: ProductReviewsProps) {
  const roundedAverage = Number.isFinite(summary.average)
    ? summary.average.toFixed(1)
    : "—";
  const totalCount = Math.max(0, summary.count);
  const visibleReviews = reviews.slice(0, 6);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        mt: 4,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Customer reviews
      </Typography>

      {totalCount === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            No reviews yet
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, mb: 3 }}
          >
            Be the first to review this product once you receive it.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "240px 1fr" },
            gap: { xs: 3, md: 6 },
            alignItems: "flex-start",
          }}
        >
          {/* Summary column */}
          <Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, lineHeight: 1 }}
              >
                {roundedAverage}
              </Typography>
              <Box>
                <Rating
                  value={summary.average}
                  precision={0.5}
                  readOnly
                  size="medium"
                />
                <Typography variant="body2" color="text.secondary">
                  {totalCount.toLocaleString("en-IN")} ratings
                </Typography>
              </Box>
            </Stack>

            {summary.distribution && (
              <Box sx={{ mt: 3 }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    summary.distribution?.[
                      star as keyof typeof summary.distribution
                    ] ?? 0;
                  const pct =
                    totalCount === 0
                      ? 0
                      : Math.round((count / totalCount) * 100);
                  return (
                    <Stack
                      key={star}
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", mb: 0.75 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ width: 14, fontWeight: 600 }}
                      >
                        {star}★
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "action.hover",
                          "& .MuiLinearProgress-bar": {
                            bgcolor:
                              star >= 4
                                ? "success.main"
                                : star === 3
                                  ? "warning.main"
                                  : "error.main",
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ width: 28, textAlign: "right" }}
                      >
                        {pct}%
                      </Typography>
                    </Stack>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Reviews list */}
          <Box>
            {visibleReviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No customer reviews available yet.
              </Typography>
            ) : (
              <Stack spacing={3}>
                {visibleReviews.map((review, index) => (
                  <Box key={review.id}>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                        }}
                      >
                        {(review.authorName ?? "?").charAt(0).toUpperCase()}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {review.authorName ?? "Anonymous"}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: "center", mt: 0.5 }}
                        >
                          <Rating
                            value={review.rating}
                            readOnly
                            size="small"
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatReviewDate(review.createdAt)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    <Typography sx={{ mt: 2 }}>{review.comment}</Typography>

                    {index < visibleReviews.length - 1 && (
                      <Divider sx={{ mt: 3 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            )}

            {/* Submission CTA — left as an explicit stub. */}
            <Box sx={{ mt: 4, pt: 3, borderTop: "1px dashed" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Share your thoughts
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Review submission will be enabled after your first purchase.
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

/**
 * Format an ISO timestamp as a human-readable date. Falls back to a blank
 * string when the input is invalid so a missing field doesn't crash the row.
 */
function formatReviewDate(input: string | undefined): string {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
